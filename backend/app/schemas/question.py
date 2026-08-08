from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class QuestionBase(BaseModel):
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

class QuestionCreate(QuestionBase):
    pass

class QuestionUpdate(BaseModel):
    topic: Optional[str] = None
    subtopic: Optional[str] = None
    difficulty: Optional[str] = None
    question_text: Optional[str] = None
    option_a: Optional[str] = None
    option_b: Optional[str] = None
    option_c: Optional[str] = None
    option_d: Optional[str] = None
    correct_option: Optional[str] = None
    explanation: Optional[str] = None

class QuestionResponse(QuestionBase):
    id: int
    created_by: Optional[int] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
