import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.models.database import SessionLocal, DBQuestionCache, Base, engine, init_db

@pytest.fixture(scope="module", autouse=True)
def setup_db():
    # Setup clean sqlite database with seeding for tests
    init_db()
    yield
    # Clean up after tests
    Base.metadata.drop_all(bind=engine)

@pytest.fixture
def client():
    # Clean client with isolated cookie jar for each test
    with TestClient(app) as c:
        yield c

def test_health_check(client):
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok", "message": "Fida-Education Backend is running successfully."}

def test_auth_flow(client):
    # 1. Register a test student
    register_payload = {
        "name": "Siswa Test",
        "email": "test-student@fida.com",
        "password": "securepassword",
        "role": "student"
    }
    response = client.post("/api/auth/register", json=register_payload)
    assert response.status_code == 201
    
    # 2. Login
    login_payload = {
        "email": "test-student@fida.com",
        "password": "securepassword"
    }
    response = client.post("/api/auth/login", json=login_payload)
    assert response.status_code == 200
    assert "user" in response.json()
    assert response.cookies.get("access_token") is not None

    # 3. Get profile (/auth/me) - cookie is sent automatically by client
    profile_response = client.get("/api/auth/me")
    assert profile_response.status_code == 200
    assert profile_response.json()["email"] == "test-student@fida.com"
    assert profile_response.json()["role"] == "student"

def test_zoom_protection(client):
    # Try accessing zoom link without authentication
    response = client.get("/api/classes/1/zoom-link")
    assert response.status_code == 401 # Unauthorized

    # Try accessing with authentication
    # Login first
    login_payload = {
        "email": "student@fida.com",
        "password": "password"
    }
    login_res = client.post("/api/auth/login", json=login_payload)
    assert login_res.status_code == 200

    # Try accessing Zoom link (cookie is carried automatically)
    response = client.get("/api/classes/1/zoom-link")
    # Since class 1 was seeded with time datetime.now() + 5 mins, it is < 15 mins.
    # Therefore, it should pass the time check and return the URL!
    assert response.status_code == 200
    assert "zoomLink" in response.json()

def test_ai_question_caching(client):
    # Login
    login_payload = {
        "email": "student@fida.com",
        "password": "password"
    }
    login_res = client.post("/api/auth/login", json=login_payload)
    assert login_res.status_code == 200
    
    quiz_payload = {
        "session_id": 1,
        "type": "pre",
        "topic": "Logika Kalkulus Dasar",
        "difficulty": "Menengah"
    }

    # First request: Cache Miss (AI Gen)
    res1 = client.post("/api/questions/get-test", json=quiz_payload)
    assert res1.status_code == 200
    assert res1.json()["source"] == "ai"
    assert len(res1.json()["questions"]) > 0

    # Second request: Cache Hit
    res2 = client.post("/api/questions/get-test", json=quiz_payload)
    assert res2.status_code == 200
    assert res2.json()["source"] == "cache" # Rule #4 caching is working!
