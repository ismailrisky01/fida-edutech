from datetime import datetime, timedelta
import jwt
import bcrypt
from sqlalchemy.orm import Session
from ..config import settings
from ..models.database import DBUser
from ..repositories.user_repository import UserRepository

class AuthService:
    def __init__(self, db: Session):
        self.user_repo = UserRepository(db)

    def verify_password(self, plain_password: str, hashed_password: str) -> bool:
        try:
            pwd_bytes = plain_password.encode('utf-8')
            hashed_bytes = hashed_password.encode('utf-8')
            return bcrypt.checkpw(pwd_bytes, hashed_bytes)
        except Exception:
            return False

    def get_password_hash(self, password: str) -> str:
        pwd_bytes = password.encode('utf-8')
        salt = bcrypt.gensalt()
        hashed = bcrypt.hashpw(pwd_bytes, salt)
        return hashed.decode('utf-8')

    def create_access_token(self, data: dict, expires_delta: timedelta | None = None) -> str:
        to_encode = data.copy()
        if expires_delta:
            expire = datetime.utcnow() + expires_delta
        else:
            expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        to_encode.update({"exp": expire})
        encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
        return encoded_jwt

    def decode_access_token(self, token: str) -> dict | None:
        try:
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
            return payload
        except jwt.PyJWTError:
            return None

    def authenticate_user(self, email: str, password: str) -> DBUser | None:
        user = self.user_repo.get_by_email(email)
        if not user:
            return None
        if not self.verify_password(password, user.hashed_password):
            return None
        return user

    def register_user(self, name: str, email: str, password: str, role: str) -> DBUser | None:
        existing = self.user_repo.get_by_email(email)
        if existing:
            return None
        hashed = self.get_password_hash(password)
        new_user = DBUser(name=name, email=email, hashed_password=hashed, role=role)
        return self.user_repo.create(new_user)
        
    def get_user_by_id(self, user_id: int) -> DBUser | None:
        return self.user_repo.get_by_id(user_id)
        
    def get_all_students(self) -> list[DBUser]:
        return self.user_repo.get_all_students()
