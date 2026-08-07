from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class ZoomClassResponse(BaseModel):
    id: int
    session_title: str
    course_name: str
    start_time: datetime
    duration_minutes: int
    is_active: bool

    class Config:
        from_attributes = True

class ScoreSubmission(BaseModel):
    type: str # 'pre' | 'post'
    score: int

# Schema untuk input Zoom Link per siswa per sesi
class StudentZoomLinkInput(BaseModel):
    course_id: str
    session_id: int
    zoom_link: str
    zoom_time: Optional[str] = None

class StudentZoomLinkResponse(BaseModel):
    id: int
    student_id: int
    course_id: str
    session_id: int
    zoom_link: str
    zoom_time: Optional[str] = None

    class Config:
        from_attributes = True

# Schema untuk input Soal Manual oleh Guru
class ManualQuestionInput(BaseModel):
    topic: str
    subtopic: Optional[str] = None
    difficulty: str  # 'Mudah' | 'Menengah' | 'Sulit'
    question_text: str
    option_a: str
    option_b: str
    option_c: str
    option_d: str
    correct_option: str  # 'A' | 'B' | 'C' | 'D'
    explanation: Optional[str] = None

class ManualQuestionResponse(BaseModel):
    id: int
    topic: str
    subtopic: Optional[str] = None
    difficulty: str
    question_text: str
    option_a: str
    option_b: str
    option_c: str
    option_d: str
    correct_option: str
    explanation: Optional[str] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

