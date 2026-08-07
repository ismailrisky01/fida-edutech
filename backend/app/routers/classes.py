from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from .auth import get_db, get_current_user
from ..models.database import DBUser, DBZoomClass, DBQuestion
from ..schemas.classes import (
    ZoomClassResponse, ScoreSubmission, 
    ManualQuestionInput, ManualQuestionResponse
)
from ..services.class_service import ClassService
from ..services.auth_service import AuthService

router = APIRouter(tags=["Classes & Progress"])

@router.get("/classes", response_model=list[ZoomClassResponse])
def get_classes(db: Session = Depends(get_db), current_user: DBUser = Depends(get_current_user)):
    class_service = ClassService(db)
    return class_service.get_zoom_classes()

@router.get("/classes/{class_id}/zoom-link")
def get_zoom_link(class_id: int, db: Session = Depends(get_db), current_user: DBUser = Depends(get_current_user)):
    class_service = ClassService(db)
    try:
        zoom_link = class_service.get_secured_zoom_link(class_id, current_user.role)
        return {"zoomLink": zoom_link}
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except PermissionError as e:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(e))

@router.post("/courses/{course_id}/sessions/{session_id}/score")
def submit_score(
    course_id: str,
    session_id: int,
    score_data: ScoreSubmission,
    db: Session = Depends(get_db),
    current_user: DBUser = Depends(get_current_user)
):
    if current_user.role != "student":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Hanya siswa yang dapat mengumpulkan nilai latihan."
        )
    
    class_service = ClassService(db)
    class_service.record_score(
        student_id=current_user.id,
        course_id=course_id,
        session_id=session_id,
        test_type=score_data.type,
        score=score_data.score
    )
    return {"message": "Nilai berhasil terekam."}


# ============================================================
# DATABASE SOAL MANUAL - CRUD Endpoints
# ============================================================

@router.post("/questions/manual", response_model=ManualQuestionResponse)
def create_manual_question(
    data: ManualQuestionInput,
    db: Session = Depends(get_db),
    current_user: DBUser = Depends(get_current_user)
):
    """Guru membuat soal manual beserta kunci jawaban."""
    if current_user.role != "teacher":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Akses khusus untuk Guru/Tentor.")
    
    new_q = DBQuestion(
        topic=data.topic,
        subtopic=data.subtopic,
        difficulty=data.difficulty,
        question_text=data.question_text,
        option_a=data.option_a,
        option_b=data.option_b,
        option_c=data.option_c,
        option_d=data.option_d,
        correct_option=data.correct_option.upper(),
        explanation=data.explanation,
        created_by=current_user.id
    )
    db.add(new_q)
    db.commit()
    db.refresh(new_q)
    return new_q

@router.get("/questions/manual", response_model=list[ManualQuestionResponse])
def get_manual_questions(
    db: Session = Depends(get_db),
    current_user: DBUser = Depends(get_current_user)
):
    """Mengambil semua soal manual."""
    questions = db.query(DBQuestion).order_by(DBQuestion.created_at.desc()).all()
    return questions

@router.delete("/questions/manual/{question_id}")
def delete_manual_question(
    question_id: int,
    db: Session = Depends(get_db),
    current_user: DBUser = Depends(get_current_user)
):
    """Guru menghapus soal manual."""
    if current_user.role != "teacher":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Akses khusus untuk Guru/Tentor.")
    
    q = db.query(DBQuestion).filter(DBQuestion.id == question_id).first()
    if not q:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Soal tidak ditemukan.")
    
    db.delete(q)
    db.commit()
    return {"message": "Soal berhasil dihapus."}

