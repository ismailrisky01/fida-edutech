import json
import hashlib
from sqlalchemy.orm import Session
from ..repositories.question_cache_repository import QuestionCacheRepository
from ..models.database import DBQuestion

class AIService:
    def __init__(self, db: Session):
        self.db = db
        self.cache_repo = QuestionCacheRepository(db)

    def generate_cache_key(self, topic: str, difficulty: str) -> str:
        normalized = f"{topic.strip().lower()}_{difficulty.strip().lower()}"
        return hashlib.md5(normalized.encode('utf-8')).hexdigest()

    def get_test_questions(self, session_id: int, test_type: str, topic: str, difficulty: str) -> tuple[list[dict], str]:
        # 1. Ambil soal manual dari database (Prioritas Utama)
        # Kita gunakan filter sederhana (bisa diperluas ke ILIKE jika perlu)
        manual_qs_db = self.db.query(DBQuestion).all() # Ambil semua, filter di Python for flexibility if topics differ slightly
        
        # Simple match for topic
        matching_manual = [
            q for q in manual_qs_db 
            if q.topic.lower() == topic.lower() or q.topic.lower() in topic.lower() or topic.lower() in q.topic.lower()
        ]
        
        # Format manual questions
        manual_questions = []
        option_map = {'A': 0, 'B': 1, 'C': 2, 'D': 3}
        for idx, q in enumerate(matching_manual):
            manual_questions.append({
                "id": f"manual_{q.id}",
                "questionText": q.question_text,
                "options": [q.option_a, q.option_b, q.option_c, q.option_d],
                "correctOptionIndex": option_map.get(q.correct_option.upper(), 0),
                "explanation": q.explanation or ""
            })
            
        target_count = 25
        if len(manual_questions) >= target_count:
            return manual_questions[:target_count], "manual"
            
        needed = target_count - len(manual_questions)
        
        # 2. Jika kurang, generate sisanya pakai AI (dan Cache AI part)
        cache_key = self.generate_cache_key(topic, difficulty)
        ai_questions = []
        
        cached = self.cache_repo.get_cache(cache_key)
        if cached:
            try:
                ai_questions = json.loads(cached.question_json)
            except Exception:
                pass
                
        if not ai_questions:
            # Generate exactly `needed` amount (in real app, we'd prompt AI to generate `needed` items)
            ai_questions = self._mock_ai_generate(topic, difficulty, needed)
            self.cache_repo.set_cache(cache_key, json.dumps(ai_questions))
            
        # Combine
        # ai_questions might be more than needed if it was cached before, so we slice it
        final_questions = manual_questions + ai_questions[:needed]
        
        # Fix IDs so they don't overlap in React key
        for i, q in enumerate(final_questions):
            q["id"] = i + 1
            
        return final_questions, "mixed"

    def clear_cache(self):
        self.cache_repo.clear_all()

    def get_cache_logs(self) -> list[dict]:
        return []

    def _mock_ai_generate(self, topic: str, difficulty: str, count: int) -> list[dict]:
        if any(kw in topic.lower() for kw in ["scratch", "code", "game", "prog"]):
            base_questions = [
                {
                  "questionText": f"[AI Generated] Pada materi '{topic}' ({difficulty}), jika Sprite menyentuh tepi layar, blok manakah yang paling efisien untuk memantulkannya?",
                  "options": ["go to x: 0 y: 0", "if on edge, bounce", "turn 180 degrees", "hide sprite"],
                  "correctOptionIndex": 1,
                  "explanation": "Blok 'if on edge, bounce' di bawah Motion dirancang khusus untuk memantulkan Sprite saat menyentuh tepi layar."
                },
                {
                  "questionText": f"[AI Generated] Dalam game Scratch bertema '{topic}', blok apakah yang digunakan untuk mengirim pesan koordinasi antar sprite?",
                  "options": ["ask [message] and wait", "broadcast [message]", "say [message]", "think [message]"],
                  "correctOptionIndex": 1,
                  "explanation": "Blok 'broadcast' digunakan untuk memicu event secara asinkron di sprite-sprite lain."
                }
            ]
        else:
            base_questions = [
                {
                  "questionText": f"[AI Generated] Dalam topik matematika '{topic}' ({difficulty}), jika 3x + 9 = 24, berapakah nilai x?",
                  "options": ["3", "5", "7", "9"],
                  "correctOptionIndex": 1,
                  "explanation": "Kurangi kedua sisi dengan 9: 3x = 15. Lalu bagi dengan 3: x = 5."
                },
                {
                  "questionText": f"[AI Generated] Manakah dari barisan berikut yang menunjukkan deret Fibonacci untuk materi '{topic}'?",
                  "options": ["2, 4, 6, 8, 10...", "1, 2, 4, 8, 16...", "1, 1, 2, 3, 5, 8...", "3, 9, 27, 81..."],
                  "correctOptionIndex": 2,
                  "explanation": "Deret Fibonacci dibentuk dengan menjumlahkan dua suku sebelumnya: 1+1=2, 1+2=3, 2+3=5, 3+5=8, dst."
                }
            ]
            
        questions = []
        for i in range(count):
            base_q = base_questions[i % len(base_questions)]
            questions.append({
                "id": i + 1,
                "questionText": f"Soal #{i + 1}: {base_q['questionText']}",
                "options": base_q["options"],
                "correctOptionIndex": base_q["correctOptionIndex"],
                "explanation": base_q["explanation"]
            })
            
        return questions
