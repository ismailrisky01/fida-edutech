from fastapi import APIRouter, Depends, HTTPException, status, File, UploadFile
import os
import shutil
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional
from ..models.database import SessionLocal, DBUser, DBStudentCourse, DBSessionScore, DBTopic, DBSubtopic, DBCourse, DBCourseSession
from .auth import get_current_user, get_db

router = APIRouter(prefix="/teacher", tags=["Teacher"])

# Helper function to ensure user is a teacher
def get_current_teacher(current_user: DBUser = Depends(get_current_user)):
    if current_user.role != "teacher":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Akses ditolak. Hanya tutor yang dapat mengakses."
        )
    return current_user

class StudentProgressResponse(BaseModel):
    studentId: int
    studentName: str
    studentEmail: str
    courseName: str
    courseId: int
    sessionsCompleted: int
    totalSessions: int
    averagePreScore: int
    averagePostScore: int
    quizScores: list

class AssignCourseRequest(BaseModel):
    course_id: int

class CreateClassRequest(BaseModel):
    name: str
    topic_id: int

class UpdateSessionRequest(BaseModel):
    zoom_link: Optional[str] = None
    zoom_time: Optional[str] = None
    video_link: Optional[str] = None
    is_completed: Optional[bool] = None

@router.get("/progress", response_model=List[StudentProgressResponse])
def get_all_student_progress(db: Session = Depends(get_db), _: DBUser = Depends(get_current_teacher)):
    students = db.query(DBUser).filter(DBUser.role == "student").all()
    student_courses = db.query(DBStudentCourse).all()
    scores = db.query(DBSessionScore).all()
    courses = db.query(DBCourse).all()
    sessions = db.query(DBCourseSession).all()
    subtopics = db.query(DBSubtopic).all()
    
    course_map = {c.id: c for c in courses}
    session_map = {s.id: s for s in sessions}
    subtopic_map = {s.id: s for s in subtopics}

    progress_list = []

    for student in students:
        enrolled = [sc for sc in student_courses if sc.student_id == student.id]
        
        if not enrolled:
            progress_list.append({
                "studentId": student.id,
                "studentName": student.name,
                "studentEmail": student.email,
                "courseName": "Belum ada kelas",
                "courseId": 0,
                "sessionsCompleted": 0,
                "totalSessions": 0,
                "averagePreScore": 0,
                "averagePostScore": 0,
                "quizScores": []
            })
            continue

        for sc in enrolled:
            course = course_map.get(sc.course_id)
            if not course: continue
            
            c_sessions = [s for s in sessions if s.course_id == course.id]
            c_sessions.sort(key=lambda x: subtopic_map[x.subtopic_id].order_index if x.subtopic_id in subtopic_map else 0)
            
            c_scores = [s for s in scores if s.student_id == student.id and s.course_id == course.id]
            
            quiz_scores = []
            for s in c_sessions:
                subtopic = subtopic_map.get(s.subtopic_id)
                session_title = subtopic.title if subtopic else f"Sesi {s.id}"
                
                pre_score = next((sc.score for sc in c_scores if sc.session_id == s.id and sc.type == "pre"), None)
                post_score = next((sc.score for sc in c_scores if sc.session_id == s.id and sc.type == "post"), None)
                
                quiz_scores.append({
                    "sessionId": s.id,
                    "sessionTitle": session_title,
                    "preScore": pre_score,
                    "postScore": post_score,
                    "isCompleted": s.is_completed
                })
            
            pre_scores = [q["preScore"] for q in quiz_scores if q["preScore"] is not None]
            post_scores = [q["postScore"] for q in quiz_scores if q["postScore"] is not None]
            
            avg_pre = sum(pre_scores) // len(pre_scores) if pre_scores else 0
            avg_post = sum(post_scores) // len(post_scores) if post_scores else 0
            completed = len([q for q in quiz_scores if q["isCompleted"]])

            progress_list.append({
                "studentId": student.id,
                "studentName": student.name,
                "studentEmail": student.email,
                "courseName": course.name,
                "courseId": course.id,
                "sessionsCompleted": completed,
                "totalSessions": len(c_sessions),
                "averagePreScore": avg_pre,
                "averagePostScore": avg_post,
                "quizScores": quiz_scores
            })

    return progress_list

@router.post("/students/{student_id}/courses", status_code=status.HTTP_201_CREATED)
def assign_course_to_student(student_id: int, req: AssignCourseRequest, db: Session = Depends(get_db), _: DBUser = Depends(get_current_teacher)):
    student = db.query(DBUser).filter(DBUser.id == student_id, DBUser.role == "student").first()
    if not student:
        raise HTTPException(status_code=404, detail="Siswa tidak ditemukan.")
    
    existing = db.query(DBStudentCourse).filter(DBStudentCourse.student_id == student_id, DBStudentCourse.course_id == req.course_id).first()
    if existing:
        raise HTTPException(status_code=400, detail="Siswa sudah terdaftar di kelas ini.")
    
    new_course = DBStudentCourse(student_id=student_id, course_id=req.course_id)
    db.add(new_course)
    db.commit()
    
    return {"message": "Kelas berhasil ditambahkan untuk siswa."}

@router.delete("/students/{student_id}", status_code=status.HTTP_200_OK)
def delete_student(student_id: int, db: Session = Depends(get_db), _: DBUser = Depends(get_current_teacher)):
    student = db.query(DBUser).filter(DBUser.id == student_id, DBUser.role == "student").first()
    if not student:
        raise HTTPException(status_code=404, detail="Siswa tidak ditemukan.")
    
    # Delete all related data
    db.query(DBStudentCourse).filter(DBStudentCourse.student_id == student_id).delete()
    db.query(DBSessionScore).filter(DBSessionScore.student_id == student_id).delete()
    
    # Delete the student user
    db.delete(student)
    db.commit()
    
    return {"message": "Siswa berhasil dihapus."}

# --- MANAJEMEN KELAS AKTIF (ACTIVE CLASSES) ---

@router.get("/classes")
def get_active_classes(db: Session = Depends(get_db), _: DBUser = Depends(get_current_teacher)):
    courses = db.query(DBCourse).all()
    topics = db.query(DBTopic).all()
    sessions = db.query(DBCourseSession).all()
    
    topic_map = {t.id: t for t in topics}
    
    result = []
    for c in courses:
        topic = topic_map.get(c.topic_id)
        c_sessions = [s for s in sessions if s.course_id == c.id]
        
        result.append({
            "id": c.id,
            "name": c.name,
            "topicName": topic.name if topic else "Unknown",
            "topicId": c.topic_id,
            "sessions": [
                {
                    "id": s.id,
                    "subtopicId": s.subtopic_id,
                    "zoomLink": s.zoom_link,
                    "zoomTime": s.zoom_time,
                    "materialFilePath": s.material_file_path,
                    "videoLink": s.video_link,
                    "isCompleted": s.is_completed
                } for s in c_sessions
            ]
        })
    return result

@router.post("/classes", status_code=status.HTTP_201_CREATED)
def create_active_class(req: CreateClassRequest, db: Session = Depends(get_db), _: DBUser = Depends(get_current_teacher)):
    topic = db.query(DBTopic).filter(DBTopic.id == req.topic_id).first()
    if not topic:
        raise HTTPException(status_code=404, detail="Topik kurikulum tidak ditemukan.")
        
    new_course = DBCourse(name=req.name, topic_id=topic.id)
    db.add(new_course)
    db.commit()
    db.refresh(new_course)
    
    # Auto-generate sessions based on subtopics
    subtopics = db.query(DBSubtopic).filter(DBSubtopic.topic_id == topic.id).order_by(DBSubtopic.order_index).all()
    sessions = []
    for sub in subtopics:
        sess = DBCourseSession(course_id=new_course.id, subtopic_id=sub.id)
        db.add(sess)
        sessions.append(sess)
        
    db.commit()
    return {"message": "Kelas berhasil dibuat beserta jadwal sesinya.", "course_id": new_course.id}

@router.put("/classes/{course_id}/sessions/{session_id}")
def update_course_session(course_id: int, session_id: int, req: UpdateSessionRequest, db: Session = Depends(get_db), _: DBUser = Depends(get_current_teacher)):
    session = db.query(DBCourseSession).filter(DBCourseSession.id == session_id, DBCourseSession.course_id == course_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Sesi tidak ditemukan.")
        
    if req.zoom_link is not None: session.zoom_link = req.zoom_link
    if req.zoom_time is not None: session.zoom_time = req.zoom_time
    if req.video_link is not None: session.video_link = req.video_link
    
    # Logic for completion
    if req.is_completed is not None:
        if req.is_completed and (not session.material_file_path or not session.video_link):
            raise HTTPException(status_code=400, detail="Materi HTML dan Link Video harus diisi sebelum menandai selesai.")
        session.is_completed = req.is_completed
        
    db.commit()
    return {"message": "Sesi berhasil diperbarui."}

@router.post("/classes/{course_id}/sessions/{session_id}/upload-material")
def upload_session_material(course_id: int, session_id: int, file: UploadFile = File(...), db: Session = Depends(get_db), _: DBUser = Depends(get_current_teacher)):
    session = db.query(DBCourseSession).filter(DBCourseSession.id == session_id, DBCourseSession.course_id == course_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Sesi tidak ditemukan.")
        
    if not file.filename.endswith('.html'):
        raise HTTPException(status_code=400, detail="File harus berformat .html")
        
    upload_dir = "uploads/materials"
    os.makedirs(upload_dir, exist_ok=True)
    
    file_path = os.path.join(upload_dir, f"session_{session_id}_{file.filename}")
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    # Construct relative URL path for the frontend to access
    session.material_file_path = f"/uploads/materials/session_{session_id}_{file.filename}"
    db.commit()
    
    return {"message": "File materi berhasil diunggah.", "path": session.material_file_path}

# --- MANAJEMEN KURIKULUM (TOPIC & SUBTOPIC) ---

class SubtopicCreateUpdate(BaseModel):
    title: str
    description: Optional[str] = None
    order_index: int = 0

class TopicCreateUpdate(BaseModel):
    name: str
    description: Optional[str] = None
    level: Optional[str] = None

@router.get("/curriculum")
def get_curriculum(db: Session = Depends(get_db), _: DBUser = Depends(get_current_teacher)):
    topics = db.query(DBTopic).all()
    subtopics = db.query(DBSubtopic).all()
    
    result = []
    for t in topics:
        t_subs = [s for s in subtopics if s.topic_id == t.id]
        # Urutkan berdasarkan order_index
        t_subs.sort(key=lambda x: x.order_index)
        
        result.append({
            "id": t.id,
            "name": t.name,
            "description": t.description,
            "level": t.level,
            "subtopics": [
                {
                    "id": s.id,
                    "title": s.title,
                    "description": s.description,
                    "order_index": s.order_index
                } for s in t_subs
            ]
        })
    return result

@router.post("/topics", status_code=status.HTTP_201_CREATED)
def create_topic(req: TopicCreateUpdate, db: Session = Depends(get_db), _: DBUser = Depends(get_current_teacher)):
    new_topic = DBTopic(**req.dict())
    db.add(new_topic)
    db.commit()
    db.refresh(new_topic)
    return new_topic

@router.put("/topics/{topic_id}")
def update_topic(topic_id: int, req: TopicCreateUpdate, db: Session = Depends(get_db), _: DBUser = Depends(get_current_teacher)):
    topic = db.query(DBTopic).filter(DBTopic.id == topic_id).first()
    if not topic:
        raise HTTPException(status_code=404, detail="Topik tidak ditemukan")
    
    topic.name = req.name
    topic.description = req.description
    topic.level = req.level
    db.commit()
    db.refresh(topic)
    return topic

@router.delete("/topics/{topic_id}")
def delete_topic(topic_id: int, db: Session = Depends(get_db), _: DBUser = Depends(get_current_teacher)):
    topic = db.query(DBTopic).filter(DBTopic.id == topic_id).first()
    if not topic:
        raise HTTPException(status_code=404, detail="Topik tidak ditemukan")
    
    # Hapus juga semua subtopics yang berelasi
    db.query(DBSubtopic).filter(DBSubtopic.topic_id == topic_id).delete()
    
    db.delete(topic)
    db.commit()
    return {"message": "Topik berhasil dihapus"}

@router.post("/topics/{topic_id}/subtopics", status_code=status.HTTP_201_CREATED)
def create_subtopic(topic_id: int, req: SubtopicCreateUpdate, db: Session = Depends(get_db), _: DBUser = Depends(get_current_teacher)):
    topic = db.query(DBTopic).filter(DBTopic.id == topic_id).first()
    if not topic:
        raise HTTPException(status_code=404, detail="Topik tidak ditemukan")
        
    new_sub = DBSubtopic(topic_id=topic_id, **req.dict())
    db.add(new_sub)
    db.commit()
    db.refresh(new_sub)
    return new_sub

@router.put("/subtopics/{subtopic_id}")
def update_subtopic(subtopic_id: int, req: SubtopicCreateUpdate, db: Session = Depends(get_db), _: DBUser = Depends(get_current_teacher)):
    sub = db.query(DBSubtopic).filter(DBSubtopic.id == subtopic_id).first()
    if not sub:
        raise HTTPException(status_code=404, detail="Submateri tidak ditemukan")
        
    sub.title = req.title
    sub.description = req.description
    sub.order_index = req.order_index
    db.commit()
    db.refresh(sub)
    return sub

@router.delete("/subtopics/{subtopic_id}")
def delete_subtopic(subtopic_id: int, db: Session = Depends(get_db), _: DBUser = Depends(get_current_teacher)):
    sub = db.query(DBSubtopic).filter(DBSubtopic.id == subtopic_id).first()
    if not sub:
        raise HTTPException(status_code=404, detail="Submateri tidak ditemukan")
        
    db.delete(sub)
    db.commit()
    return {"message": "Submateri berhasil dihapus"}
