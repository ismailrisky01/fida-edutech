from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from ..models.database import SessionLocal, DBQuestion, DBUser
from ..schemas.question import QuestionCreate, QuestionUpdate, QuestionResponse
from ..routers.auth import get_current_user

router = APIRouter(
    prefix="/questions",
    tags=["Questions"]
)

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/", response_model=List[QuestionResponse])
def get_all_questions(db: Session = Depends(get_db)):
    """
    Get all manual questions from the question bank.
    """
    questions = db.query(DBQuestion).order_by(DBQuestion.id.desc()).all()
    return questions

@router.post("/", response_model=QuestionResponse, status_code=status.HTTP_201_CREATED)
def create_question(question: QuestionCreate, db: Session = Depends(get_db), current_user: DBUser = Depends(get_current_user)):
    """
    Create a new manual question. Only teachers should do this.
    """
    if current_user.role != "teacher":
        raise HTTPException(status_code=403, detail="Not authorized to create questions")
        
    db_question = DBQuestion(**question.model_dump(), created_by=current_user.id)
    db.add(db_question)
    db.commit()
    db.refresh(db_question)
    return db_question

@router.get("/{question_id}", response_model=QuestionResponse)
def get_question(question_id: int, db: Session = Depends(get_db)):
    """
    Get a specific question by ID.
    """
    db_question = db.query(DBQuestion).filter(DBQuestion.id == question_id).first()
    if not db_question:
        raise HTTPException(status_code=404, detail="Question not found")
    return db_question

@router.put("/{question_id}", response_model=QuestionResponse)
def update_question(question_id: int, question: QuestionUpdate, db: Session = Depends(get_db), current_user: DBUser = Depends(get_current_user)):
    """
    Update a specific question by ID.
    """
    if current_user.role != "teacher":
        raise HTTPException(status_code=403, detail="Not authorized to update questions")
        
    db_question = db.query(DBQuestion).filter(DBQuestion.id == question_id).first()
    if not db_question:
        raise HTTPException(status_code=404, detail="Question not found")
        
    update_data = question.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_question, key, value)
        
    db.commit()
    db.refresh(db_question)
    return db_question

@router.delete("/{question_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_question(question_id: int, db: Session = Depends(get_db), current_user: DBUser = Depends(get_current_user)):
    """
    Delete a specific question by ID.
    """
    if current_user.role != "teacher":
        raise HTTPException(status_code=403, detail="Not authorized to delete questions")
        
    db_question = db.query(DBQuestion).filter(DBQuestion.id == question_id).first()
    if not db_question:
        raise HTTPException(status_code=404, detail="Question not found")
        
    db.delete(db_question)
    db.commit()
    return None

import json
from fastapi import UploadFile, File

@router.post("/import", status_code=status.HTTP_201_CREATED)
async def import_questions_json(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: DBUser = Depends(get_current_user)
):
    """
    Import questions in bulk from a JSON file.
    Expected format: Array of JSON objects matching QuestionCreate schema.
    """
    if current_user.role != "teacher":
        raise HTTPException(status_code=403, detail="Not authorized to import questions")
        
    if not file.filename.endswith('.json'):
        raise HTTPException(status_code=400, detail="Only JSON files are supported")
        
    try:
        contents = await file.read()
        data = json.loads(contents)
        
        if not isinstance(data, list):
            raise HTTPException(status_code=400, detail="JSON must be an array of questions")
            
        inserted_count = 0
        for item in data:
            # Validate with Pydantic
            try:
                question_data = QuestionCreate(**item)
                db_question = DBQuestion(**question_data.model_dump(), created_by=current_user.id)
                db.add(db_question)
                inserted_count += 1
            except Exception as e:
                # If validation fails for one row, we skip or we can fail the whole batch. Let's just fail the batch.
                db.rollback()
                raise HTTPException(status_code=400, detail=f"Invalid question data in array: {str(e)}")
                
        db.commit()
        return {"message": "Import successful", "count": inserted_count}
        
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid JSON file format")
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

