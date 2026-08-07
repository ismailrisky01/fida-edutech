from sqlalchemy.orm import Session
from ..models.database import DBUser

class UserRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_email(self, email: str) -> DBUser | None:
        return self.db.query(DBUser).filter(DBUser.email == email).first()

    def get_by_id(self, user_id: int) -> DBUser | None:
        return self.db.query(DBUser).filter(DBUser.id == user_id).first()

    def create(self, user: DBUser) -> DBUser:
        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)
        return user

    def get_all_students(self) -> list[DBUser]:
        return self.db.query(DBUser).filter(DBUser.role == "student").all()
