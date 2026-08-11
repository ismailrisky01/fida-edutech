from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os
from .models.database import init_db
from .routers import auth, classes, ai_questions, teacher, courses, questions

# Create uploads directory if not exists (handling read-only serverless environments)
try:
    os.makedirs("uploads/materials", exist_ok=True)
except OSError:
    pass

app = FastAPI(
    title="Fida-Education LMS API",
    description="RESTful API backend for Fida-Education Private Tutoring & LMS platform.",
    version="1.0.0"
)

# CORS configurations for local frontend and Vercel production
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict this to your frontend URL if needed
    allow_credentials=True, # Required for HTTP-Only Cookie transport
    allow_methods=["*"],
    allow_headers=["*"],
)

# Startup DB initialization and seeding
@app.on_event("startup")
def on_startup():
    init_db()

# Mount routers under /api namespace
app.include_router(auth.router, prefix="/api")
app.include_router(classes.router, prefix="/api")
app.include_router(ai_questions.router, prefix="/api")
app.include_router(teacher.router, prefix="/api")
app.include_router(courses.router, prefix="/api")
app.include_router(questions.router, prefix="/api")

app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

@app.get("/api/health", tags=["Health"])
def health_check():
    return {"status": "ok", "message": "Fida-Education Backend is running successfully."}
