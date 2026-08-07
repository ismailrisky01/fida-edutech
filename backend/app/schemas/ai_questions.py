from pydantic import BaseModel

class GetQuestionsRequest(BaseModel):
    session_id: int
    type: str # 'pre' | 'post'
    topic: str
    difficulty: str

class QuestionSchema(BaseModel):
    id: int
    questionText: str
    options: list[str]
    correctOptionIndex: int
    explanation: str

class GetQuestionsResponse(BaseModel):
    questions: list[QuestionSchema]
    source: str # 'cache' | 'ai'
