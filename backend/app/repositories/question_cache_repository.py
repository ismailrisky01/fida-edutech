from sqlalchemy.orm import Session
from ..models.database import DBQuestionCache

class QuestionCacheRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_cache(self, cache_key: str) -> DBQuestionCache | None:
        return self.db.query(DBQuestionCache).filter(DBQuestionCache.cache_key == cache_key).first()

    def set_cache(self, cache_key: str, question_json: str) -> DBQuestionCache:
        existing = self.get_cache(cache_key)
        if existing:
            existing.question_json = question_json
            self.db.commit()
            self.db.refresh(existing)
            return existing
        else:
            new_cache = DBQuestionCache(cache_key=cache_key, question_json=question_json)
            self.db.add(new_cache)
            self.db.commit()
            self.db.refresh(new_cache)
            return new_cache

    def clear_all(self):
        self.db.query(DBQuestionCache).delete()
        self.db.commit()
        
    def get_all_caches(self) -> list[DBQuestionCache]:
        return self.db.query(DBQuestionCache).all()
