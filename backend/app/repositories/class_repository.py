from sqlalchemy.orm import Session
from ..models.database import DBZoomClass, DBSessionScore

class ClassRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_zoom_class_by_id(self, class_id: int) -> DBZoomClass | None:
        return self.db.query(DBZoomClass).filter(DBZoomClass.id == class_id).first()

    def get_zoom_class_by_title_course(self, session_title: str, course_name: str) -> DBZoomClass | None:
        return self.db.query(DBZoomClass).filter(
            DBZoomClass.session_title == session_title,
            DBZoomClass.course_name == course_name
        ).first()

    def get_all_zoom_classes(self) -> list[DBZoomClass]:
        return self.db.query(DBZoomClass).all()

    def create_zoom_class(self, zoom_class: DBZoomClass) -> DBZoomClass:
        self.db.add(zoom_class)
        self.db.commit()
        self.db.refresh(zoom_class)
        return zoom_class

    def get_scores_by_student_id(self, student_id: int) -> list[DBSessionScore]:
        return self.db.query(DBSessionScore).filter(DBSessionScore.student_id == student_id).all()

    def save_session_score(self, session_score: DBSessionScore) -> DBSessionScore:
        # Check if already exists, then update, else insert
        existing = self.db.query(DBSessionScore).filter(
            DBSessionScore.student_id == session_score.student_id,
            DBSessionScore.course_id == session_score.course_id,
            DBSessionScore.session_id == session_score.session_id,
            DBSessionScore.type == session_score.type
        ).first()

        if existing:
            existing.score = session_score.score
            self.db.commit()
            self.db.refresh(existing)
            return existing
        else:
            self.db.add(session_score)
            self.db.commit()
            self.db.refresh(session_score)
            return session_score
            
    def get_all_session_scores(self) -> list[DBSessionScore]:
        return self.db.query(DBSessionScore).all()
