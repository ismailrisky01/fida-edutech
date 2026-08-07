import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    SECRET_KEY: str = os.getenv("SECRET_KEY", "fida_education_super_secure_key_12345!@#$")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440  # 24 hours
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./fida_lms.db")

settings = Settings()
