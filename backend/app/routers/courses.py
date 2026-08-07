from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List
from ..models.database import SessionLocal, DBUser, DBStudentCourse, DBSessionScore, DBCourse, DBCourseSession, DBTopic, DBSubtopic
from .auth import get_current_user, get_db

router = APIRouter(prefix="/courses", tags=["Courses"])

@router.get("")
def get_courses(db: Session = Depends(get_db), current_user: DBUser = Depends(get_current_user)):
    courses = db.query(DBCourse).all()
    topics = db.query(DBTopic).all()
    topic_map = {t.id: t for t in topics}

    # If student, only return courses they are enrolled in
    if current_user.role == "student":
        enrolled_courses = db.query(DBStudentCourse).filter(DBStudentCourse.student_id == current_user.id).all()
        enrolled_ids = [ec.course_id for ec in enrolled_courses]
        courses = [c for c in courses if c.id in enrolled_ids]

    result = []
    for c in courses:
        topic = topic_map.get(c.topic_id)
        sessions_count = db.query(DBCourseSession).filter(DBCourseSession.course_id == c.id).count()
        
        result.append({
            "id": c.id,
            "name": c.name,
            "topicName": topic.name if topic else "",
            "icon": "calculate", # Default icon
            "description": topic.description if topic else "",
            "level": topic.level if topic else "",
            "sessionsCount": sessions_count,
            "colorClass": "text-secondary",
            "borderColorClass": "border-secondary/20",
            "bgColorClass": "bg-secondary/10"
        })
    return result

@router.get("/{course_id}/sessions")
def get_course_sessions(course_id: int, db: Session = Depends(get_db), current_user: DBUser = Depends(get_current_user)):
    course = db.query(DBCourse).filter(DBCourse.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Kelas tidak ditemukan.")
    
    c_sessions = db.query(DBCourseSession).filter(DBCourseSession.course_id == course_id).all()
    subtopics = db.query(DBSubtopic).filter(DBSubtopic.topic_id == course.topic_id).all()
    subtopic_map = {s.id: s for s in subtopics}
    
    # Sort by order_index
    c_sessions.sort(key=lambda x: subtopic_map[x.subtopic_id].order_index if x.subtopic_id in subtopic_map else 0)

    # Fetch scores if student
    scores = []
    if current_user.role == "student":
        scores = db.query(DBSessionScore).filter(
            DBSessionScore.student_id == current_user.id,
            DBSessionScore.course_id == course_id
        ).all()
        
    sessions_with_progress = []
    
    for s in c_sessions:
        subtopic = subtopic_map.get(s.subtopic_id)
        
        pre_score = next((sc.score for sc in scores if sc.session_id == s.id and sc.type == "pre"), None)
        post_score = next((sc.score for sc in scores if sc.session_id == s.id and sc.type == "post"), None)
        
        sessions_with_progress.append({
            "id": s.id,
            "title": subtopic.title if subtopic else f"Sesi {s.id}",
            "description": subtopic.description if subtopic else "",
            "hasPreTest": True,
            "hasPostTest": True,
            "preTestScore": pre_score,
            "postTestScore": post_score,
            "zoomLink": s.zoom_link or "",
            "zoomTime": s.zoom_time or "Belum dijadwalkan",
            "videoLink": s.video_link or "",
            "materialFilePath": s.material_file_path or "",
            "isCompleted": s.is_completed
        })
        
    return sessions_with_progress

@router.get("/{course_id}/sessions/{session_id}/zoom-link")
def get_protected_session_zoom_link(course_id: int, session_id: int, db: Session = Depends(get_db), current_user: DBUser = Depends(get_current_user)):
    session = db.query(DBCourseSession).filter(
        DBCourseSession.course_id == course_id,
        DBCourseSession.id == session_id
    ).first()

    if not session or not session.zoom_link:
        raise HTTPException(status_code=404, detail="Link Zoom belum dijadwalkan oleh tutor.")

    if session.zoom_time:
        try:
            from datetime import datetime, timedelta
            start_time = datetime.fromisoformat(session.zoom_time)
            now = datetime.now()
            time_difference = start_time - now
            
            if time_difference > timedelta(minutes=15):
                minutes_to_wait = int(time_difference.total_seconds() / 60)
                raise HTTPException(
                    status_code=403,
                    detail=f"Kelas belum dimulai. Anda baru bisa bergabung 15 menit sebelum waktu mulai. Silakan tunggu {minutes_to_wait} menit lagi."
                )
        except ValueError:
            pass

    return {"zoomLink": session.zoom_link}

class SubmitScoreRequest(BaseModel):
    type: str # pre or post
    score: int

@router.post("/{course_id}/sessions/{session_id}/score")
def submit_session_score(course_id: int, session_id: int, req: SubmitScoreRequest, db: Session = Depends(get_db), current_user: DBUser = Depends(get_current_user)):
    if current_user.role != "student":
        raise HTTPException(status_code=403, detail="Hanya siswa yang dapat mengirimkan nilai kuis.")
        
    existing = db.query(DBSessionScore).filter(
        DBSessionScore.student_id == current_user.id,
        DBSessionScore.course_id == course_id,
        DBSessionScore.session_id == session_id,
        DBSessionScore.type == req.type
    ).first()
    
    if existing:
        existing.score = req.score
    else:
        new_score = DBSessionScore(
            student_id=current_user.id,
            course_id=course_id,
            session_id=session_id,
            type=req.type,
            score=req.score
        )
        db.add(new_score)
        
    db.commit()
    return {"message": "Nilai berhasil disimpan."}
