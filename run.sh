#!/bin/bash

echo "==========================================="
echo "   Menjalankan Sistem Fida-Education LMS   "
echo "==========================================="
echo ""

# Fungsi untuk mematikan server saat script dihentikan (Ctrl+C)
cleanup() {
    echo ""
    echo "Menghentikan server..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    exit
}

# Tangkap sinyal interrupt (Ctrl+C)
trap cleanup INT TERM

# Jalankan Backend (FastAPI)
echo "[1/2] Menjalankan Backend (FastAPI di port 8000)..."
cd backend
./venv/bin/uvicorn app.main:app --reload --port 8000 &
BACKEND_PID=$!
cd ..

# Jalankan Frontend (Vite)
echo "[2/2] Menjalankan Frontend (Vite di port 5173)..."
cd frontend
npm run dev -- --port 5173 &
FRONTEND_PID=$!
cd ..

echo ""
echo "✅ Sistem berhasil dijalankan!"
echo "➡️ Frontend: http://localhost:5173"
echo "➡️ Backend API: http://localhost:8000"
echo ""
echo "Tekan [Ctrl+C] untuk menghentikan kedua server."

# Tunggu proses berjalan selamanya sampai diinterupsi
wait
