# Panduan Pengembangan Sistem Web Les Privat & LMS (`rule.md`)

Dokumen ini berisi aturan dasar dan standar pengembangan untuk memastikan arsitektur yang tangguh, keamanan tingkat tinggi, dan konsistensi desain pada platform les privat dan LMS.

## 1. Rekomendasi Teknologi & Arsitektur
Untuk membangun sistem yang modern, terstruktur, dan siap diintegrasikan dengan AI, berikut adalah rekomendasi stack teknologi:

*   **Frontend (Landing Page & LMS):** Menggunakan **React** dengan **Vite** dan **TSX** (TypeScript). Pendekatan ini memastikan performa pengembangan yang cepat dan _type-safety_ yang ketat, sangat cocok untuk membangun arsitektur modular berbasis komponen.
*   **Backend:** **Python** (misalnya FastAPI atau Django). Python sangat ideal untuk menangani integrasi AI (untuk generate soal) dan ekosistem keamanannya sangat matang. Filosofi Python ("antigravity") membuat pengembangan berjalan efisien.
*   **Arsitektur Pendekatan:** 
    *   Gunakan **Modular Architecture** pada backend, memisahkan _Controller_ (Routing), _Service_ (Business Logic), dan _Repository_ (Database Access). Transisi dari pola seperti MVVM ke struktur web modular ini akan membuat kode lebih mudah di-maintain.
    *   **API-First Design:** Frontend dan Backend berkomunikasi murni melalui RESTful API atau GraphQL.

## 2. Standar Keamanan (Security Guidelines)
Keamanan adalah prioritas utama, terutama pada sistem yang menyimpan data siswa dan berinteraksi dengan API eksternal (AI).
*   **Pencegahan Injeksi & Pemindaian Kerentanan:** Semua input dari pengguna harus melalui sanitasi ketat dan validasi ORM untuk mencegah SQL Injection dan XSS. 
*   **Keamanan Jaringan & Endpoint:** Pastikan hanya port yang diperlukan yang terbuka untuk publik. Endpoint yang berinteraksi dengan API AI harus memiliki **Rate Limiting** untuk mencegah eksploitasi yang bisa menguras token AI.
*   **Manajemen Autentikasi:** Gunakan JWT (JSON Web Tokens) yang disimpan di HTTP-Only Cookies, bukan di LocalStorage, untuk menghindari serangan token theft.
*   **Proteksi Link Zoom:** Link Zoom tidak boleh di-ekspos ke publik atau diakses tanpa autentikasi JWT yang valid.

## 3. Konsistensi Desain UI/UX
*   **Component-Driven Development:** Setiap elemen UI (tombol, form input, kartu kelas) harus dibuat sebagai komponen React (TSX) yang *reusable*.
*   **Styling Strategy:** Gunakan framework CSS seperti Tailwind CSS untuk memastikan utility-first styling yang konsisten di seluruh Landing Page dan LMS. 
*   **Token Desain:** Tetapkan variabel standar untuk warna (Primary, Secondary, Error, Success), tipografi, dan *spacing* agar desain dari tahap mockup/prototyping selaras saat diimplementasikan.

## 4. Manajemen AI dan Penyimpanan Token
Fitur unggulan platform ini adalah _AI Question Generation_ dengan efisiensi token.
*   **Database Caching:** Setiap kali AI men-generate set soal untuk sebuah topik, sistem wajib menyimpan JSON *response* tersebut ke dalam database (contoh: PostgreSQL) dengan tag materi, tingkat kesulitan, dan *hash* parameter yang relevan.
*   **Alur Logika Request Soal:**
    1. Siswa meminta latihan soal untuk Topik X.
    2. Backend mengecek di Database: _"Apakah sudah ada soal untuk Topik X dengan kriteria ini?"_
    3. Jika **ADA**, ambil dari database (Token AI terselamatkan).
    4. Jika **TIDAK**, *trigger* prompt ke AI, dapatkan soal, sajikan ke siswa, dan **SIMPAN** ke database secara asinkron.
*   **Prompting terstruktur (Vibe Coding Friendly):** Strukturkan prompt AI agar selalu mengembalikan format JSON yang baku (contoh: pertanyaan, opsi A-D, jawaban benar, pembahasan) agar mudah di-*parsing* oleh sistem.

## 5. Workflow Pengembangan
*   Terapkan *Clean Code Principles*: Penamaan variabel yang representatif dan fungsi yang memiliki *Single Responsibility*.
*   Manfaatkan asisten AI secara optimal dalam penulisan logika *boilerplate* atau *styling* komponen, namun pastikan untuk selalu mereview *security flow*-nya secara manual.
