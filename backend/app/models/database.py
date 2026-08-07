from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime, ForeignKey, Boolean, Text
from sqlalchemy.orm import declarative_base, sessionmaker
from datetime import datetime
from ..config import settings

connect_args = {"check_same_thread": False} if settings.DATABASE_URL.startswith("sqlite") else {}
if settings.DATABASE_URL.startswith("postgresql"):
    engine = create_engine(settings.DATABASE_URL, connect_args=connect_args, pool_pre_ping=True, pool_recycle=300, pool_size=5, max_overflow=10)
else:
    engine = create_engine(settings.DATABASE_URL, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class DBUser(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(String, nullable=False) # 'student' | 'teacher'
    created_at = Column(DateTime, default=datetime.utcnow)

class DBZoomClass(Base):
    __tablename__ = "zoom_classes"
    id = Column(Integer, primary_key=True, index=True)
    session_title = Column(String, nullable=False)
    course_name = Column(String, nullable=False)
    start_time = Column(DateTime, nullable=False)
    duration_minutes = Column(Integer, default=60)
    zoom_link_protected = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class DBSessionScore(Base):
    __tablename__ = "session_scores"
    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    course_id = Column(Integer, ForeignKey("courses.id", ondelete="CASCADE"), nullable=False)
    session_id = Column(Integer, ForeignKey("course_sessions.id", ondelete="CASCADE"), nullable=False)
    type = Column(String, nullable=False) # 'pre' | 'post'
    score = Column(Integer, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

class DBQuestionCache(Base):
    __tablename__ = "question_caches"
    id = Column(Integer, primary_key=True, index=True)
    cache_key = Column(String, unique=True, index=True, nullable=False) # topic_difficulty_hash
    question_json = Column(String, nullable=False) # string JSON
    created_at = Column(DateTime, default=datetime.utcnow)

class DBCourse(Base):
    __tablename__ = "courses"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, index=True)
    topic_id = Column(Integer, ForeignKey("topics.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

class DBCourseSession(Base):
    __tablename__ = "course_sessions"
    id = Column(Integer, primary_key=True, index=True)
    course_id = Column(Integer, ForeignKey("courses.id", ondelete="CASCADE"), nullable=False)
    subtopic_id = Column(Integer, ForeignKey("subtopics.id", ondelete="CASCADE"), nullable=False)
    zoom_link = Column(String, nullable=True)
    zoom_time = Column(String, nullable=True)
    material_file_path = Column(String, nullable=True) # URL / path file html
    video_link = Column(String, nullable=True)
    is_completed = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class DBStudentCourse(Base):
    __tablename__ = "student_courses"
    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    course_id = Column(Integer, ForeignKey("courses.id", ondelete="CASCADE"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

# Tabel baru: Soal manual yang dibuat oleh guru/tentor
class DBQuestion(Base):
    __tablename__ = "questions"
    id = Column(Integer, primary_key=True, index=True)
    topic = Column(String, nullable=False, index=True)        # Topik/modul soal
    subtopic = Column(String, nullable=True)                  # Submateri soal
    difficulty = Column(String, nullable=False)                # 'Mudah' | 'Menengah' | 'Sulit'
    question_text = Column(Text, nullable=False)               # Isi pertanyaan
    option_a = Column(String, nullable=False)
    option_b = Column(String, nullable=False)
    option_c = Column(String, nullable=False)
    option_d = Column(String, nullable=False)
    correct_option = Column(String, nullable=False)            # 'A' | 'B' | 'C' | 'D'
    explanation = Column(Text, nullable=True)                  # Pembahasan (opsional)
    created_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

# Tabel baru: Topik/Kelas (Kurikulum)
class DBTopic(Base):
    __tablename__ = "topics"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, index=True)
    description = Column(Text, nullable=True)
    level = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

# Tabel baru: Submateri dari sebuah Topik
class DBSubtopic(Base):
    __tablename__ = "subtopics"
    id = Column(Integer, primary_key=True, index=True)
    topic_id = Column(Integer, ForeignKey("topics.id"), nullable=False)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    order_index = Column(Integer, default=0) # Urutan submateri/sesi
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

def init_db():
    Base.metadata.create_all(bind=engine)
    
    # Seed default data if users table is empty
    db = SessionLocal()
    try:
        if db.query(DBUser).count() == 0:
            import bcrypt
            def get_pwd_hash(pwd: str) -> str:
                return bcrypt.hashpw(pwd.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
            
            # Seed users
            student = DBUser(
                name="Budi Santoso",
                email="student@fida.com",
                hashed_password=get_pwd_hash("password"),
                role="student"
            )
            teacher = DBUser(
                name="Kak Fida (Tentor)",
                email="teacher@fida.com",
                hashed_password=get_pwd_hash("password"),
                role="teacher"
            )
            db.add_all([student, teacher])
            db.commit()
            
            # Seed zoom classes
            import datetime as dt
            c1 = DBZoomClass(
                session_title="Sesi 1: Pengenalan Interface & Gerakan Sprite",
                course_name="Scratch Game Programming",
                start_time=datetime.now() + dt.timedelta(minutes=5), # 5 mins from now
                duration_minutes=60,
                zoom_link_protected="https://zoom.us/j/9876543210?pwd=scratchsession1",
                is_active=True
            )
            c2 = DBZoomClass(
                session_title="Sesi 1: Dasar Logika & Penalaran Kuantitatif",
                course_name="Matematika Logika & Olympiad",
                start_time=datetime.now() + dt.timedelta(hours=1), # 1 hr from now
                duration_minutes=60,
                zoom_link_protected="https://zoom.us/j/1234567890?pwd=mathsession1",
                is_active=True
            )
            db.add_all([c1, c2])
            db.commit()

            # Seed Curriculum (Topic & Subtopics)
            topic = DBTopic(name="Matematika Logika & Olympiad", description="Dasar logika", level="SD")
            db.add(topic)
            db.commit()
            
            sub1 = DBSubtopic(topic_id=topic.id, title="Sesi 1: Dasar Logika", order_index=1)
            sub2 = DBSubtopic(topic_id=topic.id, title="Sesi 2: Penalaran Kuantitatif", order_index=2)
            db.add_all([sub1, sub2])
            db.commit()

            # Seed Active Class
            course = DBCourse(name="Private Budi - Matematika", topic_id=topic.id)
            db.add(course)
            db.commit()

            # Seed Sessions
            sess1 = DBCourseSession(course_id=course.id, subtopic_id=sub1.id, zoom_link="https://zoom.us/j/123", zoom_time="Senin, 16:00")
            sess2 = DBCourseSession(course_id=course.id, subtopic_id=sub2.id, zoom_link="https://zoom.us/j/123", zoom_time="Kamis, 16:00")
            db.add_all([sess1, sess2])
            db.commit()

            # Seed Student Course
            student_course = DBStudentCourse(student_id=1, course_id=course.id)
            db.add(student_course)
            db.commit()

            # Seed a default score for student Budi Santoso (Student ID = 1) for Sesi 1
            score_pre = DBSessionScore(
                student_id=1,
                course_id=course.id,
                session_id=sess1.id,
                type="pre",
                score=90
            )
            score_post = DBSessionScore(
                student_id=1,
                course_id=course.id,
                session_id=sess1.id,
                type="post",
                score=95
            )
            db.add_all([score_pre, score_post])
            db.commit()
    finally:
        db.close()
