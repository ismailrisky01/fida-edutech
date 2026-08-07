from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from ..repositories.class_repository import ClassRepository
from ..models.database import DBSessionScore, DBZoomClass

class ClassService:
    def __init__(self, db: Session):
        self.class_repo = ClassRepository(db)

    def get_zoom_classes(self) -> list[DBZoomClass]:
        return self.class_repo.get_all_zoom_classes()

    def get_secured_zoom_link(self, class_id: int, user_role: str) -> str | None:
        """
        Rule #2: Protect Zoom links. Link is only returned if time check allows, 
        unless they are a teacher (role == 'teacher') who can access it anytime for scheduling!
        """
        zoom_class = self.class_repo.get_zoom_class_by_id(class_id)
        if not zoom_class:
            raise ValueError("Kelas tidak ditemukan.")

        if user_role == "teacher":
            return zoom_class.zoom_link_protected

        # Students must satisfy the time constraint: <= 15 minutes before start
        now = datetime.now()
        start_time = zoom_class.start_time
        time_difference = start_time - now
        
        # If class has already started but still active, allow joining
        # Allow joining 15 minutes before the start time
        if time_difference > timedelta(minutes=15):
            minutes_to_wait = int(time_difference.total_seconds() / 60)
            raise PermissionError(
                f"Kelas belum dimulai. Anda baru bisa bergabung 15 menit sebelum waktu mulai. "
                f"Silakan tunggu {minutes_to_wait} menit lagi."
            )

        return zoom_class.zoom_link_protected

    def record_score(self, student_id: int, course_id: str, session_id: int, test_type: str, score: int) -> DBSessionScore:
        new_score = DBSessionScore(
            student_id=student_id,
            course_id=course_id,
            session_id=session_id,
            type=test_type,
            score=score
        )
        return self.class_repo.save_session_score(new_score)

    def get_student_progress_report(self, student_id: int, student_name: str, student_email: str) -> dict:
        scores = self.class_repo.get_scores_by_student_id(student_id)
        
        # Calculate averages
        pre_scores = [s.score for s in scores if s.type == "pre"]
        post_scores = [s.score for s in scores if s.type == "post"]
        
        avg_pre = sum(pre_scores) // len(pre_scores) if pre_scores else 0
        avg_post = sum(post_scores) // len(post_scores) if post_scores else 0
        
        # Build session-by-session quiz details
        quiz_scores = []
        # Support 8 sessions
        for i in range(1, 9):
            pre_score = next((s.score for s in scores if s.session_id == i and s.type == "pre"), None)
            post_score = next((s.score for s in scores if s.session_id == i and s.type == "post"), None)
            quiz_scores.append({
                "sessionId": i,
                "sessionTitle": f"Sesi {i}",
                "preScore": pre_score,
                "postScore": post_score
            })
            
        return {
            "studentId": student_id,
            "studentName": student_name,
            "studentEmail": student_email,
            "courseName": "Scratch Game Programming",  # Seed default or dynamic
            "sessionsCompleted": len([q for q in quiz_scores if q["preScore"] is not None and q["postScore"] is not None]),
            "totalSessions": 8,
            "averagePreScore": avg_pre,
            "averagePostScore": avg_post,
            "quizScores": quiz_scores
        }
