from fastapi import APIRouter, Depends, HTTPException, Response, Request, status
from sqlalchemy.orm import Session
from ..models.database import SessionLocal, DBUser
from ..schemas.auth import UserLogin, UserRegister, UserResponse
from ..services.auth_service import AuthService

router = APIRouter(prefix="/auth", tags=["Authentication"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_current_user(request: Request, db: Session = Depends(get_db)) -> DBUser:
    token = request.cookies.get("access_token")
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Autentikasi diperlukan. Sesi tidak ditemukan."
        )
    
    auth_service = AuthService(db)
    payload = auth_service.decode_access_token(token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token kedaluwarsa atau tidak valid."
        )
        
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Payload token tidak lengkap."
        )
        
    user = auth_service.get_user_by_id(int(user_id))
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Pengguna tidak ditemukan."
        )
    return user

@router.post("/register", status_code=status.HTTP_201_CREATED)
def register(user_data: UserRegister, db: Session = Depends(get_db)):
    auth_service = AuthService(db)
    user = auth_service.register_user(
        name=user_data.name,
        email=user_data.email,
        password=user_data.password,
        role=user_data.role
    )
    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email sudah terdaftar."
        )
    return {"message": "Registrasi berhasil."}

@router.post("/login")
def login(login_data: UserLogin, response: Response, db: Session = Depends(get_db)):
    auth_service = AuthService(db)
    user = auth_service.authenticate_user(login_data.email, login_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email atau password salah."
        )
        
    # Create JWT
    token = auth_service.create_access_token(data={"sub": str(user.id)})
    
    # Store token in HTTP-Only cookie (Rule #2 Security)
    response.set_cookie(
        key="access_token",
        value=token,
        httponly=True,
        max_age=1440 * 60, # 24 hours in seconds
        expires=1440 * 60,
        samesite="lax",
        secure=False # Set to True in HTTPS production environments
    )
    return {"message": "Login berhasil.", "user": {"id": user.id, "name": user.name, "email": user.email, "role": user.role}}

@router.post("/logout")
def logout(response: Response):
    response.delete_cookie("access_token")
    return {"message": "Logout berhasil."}

@router.get("/me", response_model=UserResponse)
def get_me(current_user: DBUser = Depends(get_current_user)):
    return current_user
