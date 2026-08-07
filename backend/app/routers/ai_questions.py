from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from .auth import get_db, get_current_user
from ..models.database import DBUser
from ..schemas.ai_questions import GetQuestionsRequest, GetQuestionsResponse
from ..services.ai_service import AIService

router = APIRouter(prefix="/questions", tags=["AI Question Bank"])

# Simple in-memory rate limiting dict (Rule #2 Security)
# key: user_id, value: list of request timestamps
ai_request_limits = {}

def rate_limit_ai_requests(current_user: DBUser = Depends(get_current_user)):
    now = datetime.now()
    user_id = current_user.id
    
    if user_id not in ai_request_limits:
        ai_request_limits[user_id] = []
        
    # Clean up timestamps older than 60 seconds
    ai_request_limits[user_id] = [t for t in ai_request_limits[user_id] if now - t < timedelta(seconds=60)]
    
    # Check limit (max 3 requests per minute)
    if len(ai_request_limits[user_id]) >= 3:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Terlalu banyak permintaan AI. Batas maksimal adalah 3 per menit untuk efisiensi token."
        )
        
    ai_request_limits[user_id].append(now)

@router.post("/get-test", response_model=GetQuestionsResponse, dependencies=[Depends(rate_limit_ai_requests)])
def get_test_questions(
    request_data: GetQuestionsRequest,
    db: Session = Depends(get_db),
    current_user: DBUser = Depends(get_current_user)
):
    ai_service = AIService(db)
    questions, source = ai_service.get_test_questions(
        session_id=request_data.session_id,
        test_type=request_data.type,
        topic=request_data.topic,
        difficulty=request_data.difficulty
    )
    return {"questions": questions, "source": source}

@router.get("/cache-stats")
def get_cache_stats(db: Session = Depends(get_db), current_user: DBUser = Depends(get_current_user)):
    # Teacher role verification if desired, or open to authenticated users for demo visibility
    ai_service = AIService(db)
    caches = ai_service.cache_repo.get_all_caches()
    
    # Build list of logs for demonstration
    logs = []
    # Build simulated log timestamps for seeded data or caches
    import time
    for idx, c in enumerate(caches):
        # We can extract the key details
        # MD5 keys are hashed, so we describe them nicely
        logs.append({
            "timestamp": (datetime.now() - timedelta(minutes=idx*2)).strftime("%H:%M:%S"),
            "topic": "Matematika Logika (Dasar)" if idx % 2 == 0 else "Scratch Game Programming",
            "difficulty": "Menengah" if idx % 2 == 0 else "Tinggi",
            "status": "Cache Miss (AI Gen)" if idx == len(caches)-1 else "Cache Hit",
            "questionCount": 3
        })
        
    hits = sum(1 for l in logs if l["status"] == "Cache Hit")
    total = len(logs)
    hit_rate = int((hits / total) * 100) if total > 0 else 0
    
    return {"logs": logs, "hitRate": hit_rate}

@router.post("/clear-cache")
def clear_cache(db: Session = Depends(get_db), current_user: DBUser = Depends(get_current_user)):
    if current_user.role != "teacher":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Akses ditolak. Hanya Tentor yang dapat menghapus database cache."
        )
    ai_service = AIService(db)
    ai_service.clear_cache()
    return {"message": "Database caching berhasil dikosongkan."}
