import type { User, Course, Session, Question, StudentProgress, ZoomMeeting, ManualQuestion, Topic, Subtopic } from '../types';

// Make API_BASE dynamic based on the current hostname (useful if accessed via local IP)
const API_BASE = `http://${window.location.hostname}:8000/api`;

// Pre-seeded questions for caching demo and fallback
export const DEFAULT_QUESTIONS: Record<string, Question[]> = {
  "math-logic-1": [
    {
      id: 1,
      questionText: "Jika semua segitiga sama sisi memiliki sudut 60 derajat, dan segitiga ABC memiliki sudut 60 derajat pada semua sudutnya, apakah segitiga ABC segitiga sama sisi?",
      options: ["Ya, pasti", "Tidak, belum tentu", "Hanya jika panjang sisinya sama", "Tidak ada jawaban benar"],
      correctOptionIndex: 0,
      explanation: "Ya, segitiga dengan ketiga sudut masing-masing 60 derajat secara geometris harus merupakan segitiga sama sisi."
    },
    {
      id: 2,
      questionText: "Budi berumur 10 tahun sekarang. Kakaknya berumur dua kali lipat umur Budi. Berapakah umur Kakak Budi ketika Budi berumur 25 tahun?",
      options: ["50 tahun", "35 tahun", "40 tahun", "30 tahun"],
      correctOptionIndex: 1,
      explanation: "Selisih umur mereka selalu 10 tahun (karena sekarang Budi 10 tahun dan kakak 20 tahun). Jadi, saat Budi 25 tahun, kakaknya berumur 25 + 10 = 35 tahun."
    },
    {
      id: 3,
      questionText: "Pola angka: 2, 6, 12, 20, ... Angka berikutnya adalah?",
      options: ["28", "30", "32", "36"],
      correctOptionIndex: 1,
      explanation: "Polanya adalah penambahan bilangan genap berurutan: +4, +6, +8, +10. Jadi 20 + 10 = 30."
    }
  ],
  "scratch-coding-1": [
    {
      id: 1,
      questionText: "Manakah blok Scratch yang digunakan untuk mengulangi instruksi selamanya?",
      options: ["repeat 10", "repeat until", "forever", "if-then"],
      correctOptionIndex: 2,
      explanation: "Blok 'forever' digunakan untuk mengulangi kode di dalamnya tanpa henti sepanjang game berjalan."
    },
    {
      id: 2,
      questionText: "Apa fungsi dari blok 'broadcast [message1]' di Scratch?",
      options: ["Mengirim pesan ke sprite lain agar mereka menjalankan perintah tertentu", "Mengubah kostum sprite secara acak", "Membuat suara baru", "Menghapus sprite"],
      correctOptionIndex: 0,
      explanation: "Blok 'broadcast' mengirim sinyal ke semua sprite. Sprite yang memiliki blok 'when I receive [message1]' akan merespon."
    },
    {
      id: 3,
      questionText: "Di Scratch, blok warna apakah yang mengontrol gerakan sprite (seperti move 10 steps)?",
      options: ["Kuning (Events)", "Biru (Motion)", "Ungu (Looks)", "Hijau (Operators)"],
      correctOptionIndex: 1,
      explanation: "Blok Motion berwarna biru digunakan untuk menggerakkan sprite (posisi, rotasi, dll)."
    }
  ]
};

// Helper for local storage mock DB
const getMockStorage = (key: string, defaultValue: any) => {
  const data = localStorage.getItem(`fida_${key}`);
  if (!data) {
    localStorage.setItem(`fida_${key}`, JSON.stringify(defaultValue));
    return defaultValue;
  }
  return JSON.parse(data);
};

const setMockStorage = (key: string, value: any) => {
  localStorage.setItem(`fida_${key}`, JSON.stringify(value));
};

// Seed Mock Data
const mockUsers = [
  { id: 1, name: "Budi Santoso", email: "student@fida.com", password: "password", role: "student" },
  { id: 2, name: "Kak Fida (Tentor)", email: "teacher@fida.com", password: "password", role: "teacher" }
];

const mockCourses: Course[] = [
  {
    id: 1,
    name: "Matematika Logika & Olympiad",
    topicName: "Matematika",
    icon: "calculate",
    description: "SD & SMP. Melatih penalaran logis, pemecahan masalah olimpiade, dan pola berpikir kritis.",
    level: "SD & SMP",
    sessionsCount: 8,
    colorClass: "text-secondary",
    borderColorClass: "border-secondary/20",
    bgColorClass: "bg-secondary/10"
  },
  {
    id: 2,
    name: "Scratch Game Programming",
    topicName: "Pemrograman",
    icon: "code_blocks",
    description: "Membuat 8+ Game interaktif, melatih dasar logika pemrograman visual sejak dini.",
    level: "Usia 7-15 Tahun",
    sessionsCount: 8,
    colorClass: "text-purple-600",
    borderColorClass: "border-purple-600/20",
    bgColorClass: "bg-purple-600/10"
  },
  {
    id: 3,
    name: "Combo Master",
    topicName: "Combo",
    icon: "stars",
    description: "Math + Scratch Program. Total 16x sesi interaktif dengan mentoring 1-on-1 bulanan.",
    level: "Premium Combo",
    sessionsCount: 16,
    colorClass: "text-primary-container",
    borderColorClass: "border-primary-container/20",
    bgColorClass: "bg-primary-container/10"
  }
];

const mockSessions: Record<string, Session[]> = {
  "math": [
    { id: 1, title: "Sesi 1: Dasar Logika & Penalaran Kuantitatif", description: "Pengenalan logika proposisi dan penalaran berbasis angka.", zoomTime: "Hari ini pukul 16:00 WIB", zoomLink: "https://zoom.us/j/1234567890?pwd=mathsession1", hasPreTest: true, hasPostTest: true, preTestScore: 85, postTestScore: 100 },
    { id: 2, title: "Sesi 2: Pola Bilangan & Barisan Kreatif", description: "Menemukan pola angka tersembunyi dengan cara yang menyenangkan.", zoomTime: "Besok pukul 16:00 WIB", zoomLink: "https://zoom.us/j/1234567890?pwd=mathsession2", hasPreTest: true, hasPostTest: true, preTestScore: null, postTestScore: null },
    { id: 3, title: "Sesi 3: Geometri Kreatif & Sudut Pandang Spasial", description: "Melatih logika visual-spasial melalui bangun datar dan ruang.", zoomTime: "Minggu depan", zoomLink: "", hasPreTest: true, hasPostTest: true, preTestScore: null, postTestScore: null },
    { id: 4, title: "Sesi 4: Teori Himpunan & Diagram Venn", description: "Menyelesaikan soal cerita dengan himpunan dan diagram Venn.", zoomTime: "Minggu depan", zoomLink: "", hasPreTest: true, hasPostTest: true, preTestScore: null, postTestScore: null },
    { id: 5, title: "Sesi 5: Kombinatorika & Peluang Dasar", description: "Belajar permutasi, kombinasi, dan kemungkinan kejadian.", zoomTime: "Dua minggu lagi", zoomLink: "", hasPreTest: true, hasPostTest: true, preTestScore: null, postTestScore: null },
    { id: 6, title: "Sesi 6: Aljabar Logika & Persamaan Seru", description: "Memahami variabel dan pemecahan persamaan dengan logika.", zoomTime: "Dua minggu lagi", zoomLink: "", hasPreTest: true, hasPostTest: true, preTestScore: null, postTestScore: null },
    { id: 7, title: "Sesi 7: Strategi Game & Teori Graf", description: "Memikirkan langkah kemenangan dalam game matematis.", zoomTime: "Tiga minggu lagi", zoomLink: "", hasPreTest: true, hasPostTest: true, preTestScore: null, postTestScore: null },
    { id: 8, title: "Sesi 8: Review & Simulasi Olimpiade Fida", description: "Uji kemampuan akhir dan evaluasi menyeluruh.", zoomTime: "Tiga minggu lagi", zoomLink: "", hasPreTest: true, hasPostTest: true, preTestScore: null, postTestScore: null }
  ],
  "scratch": [
    { id: 1, title: "Sesi 1: Pengenalan Interface & Gerakan Sprite", description: "Belajar interface Scratch dan menggerakkan Sprite pertama.", zoomTime: "Hari ini pukul 19:00 WIB", zoomLink: "https://zoom.us/j/9876543210?pwd=scratchsession1", hasPreTest: true, hasPostTest: true, preTestScore: 90, postTestScore: 95 },
    { id: 2, title: "Sesi 2: Kontrol, Loop, dan Animasi Sederhana", description: "Membuat karakter berjalan dan mengulangi gerakan menggunakan Loop.", zoomTime: "Besok pukul 19:00 WIB", zoomLink: "https://zoom.us/j/9876543210?pwd=scratchsession2", hasPreTest: true, hasPostTest: true, preTestScore: null, postTestScore: null },
    { id: 3, title: "Sesi 3: Event Handler & Logika Input (Keyboard & Mouse)", description: "Membuat Sprite merespon tombol keyboard untuk bergerak.", zoomTime: "Minggu depan", zoomLink: "", hasPreTest: true, hasPostTest: true, preTestScore: null, postTestScore: null },
    { id: 4, title: "Sesi 4: Sensing & Collision Detection (Game Tag)", description: "Mendeteksi sentuhan antar Sprite untuk membuat game kejar-kejaran.", zoomTime: "Minggu depan", zoomLink: "", hasPreTest: true, hasPostTest: true, preTestScore: null, postTestScore: null },
    { id: 5, title: "Sesi 5: Variabel & Skor (Game Catch the Falling Apples)", description: "Membuat variabel skor dan mendeteksi apel jatuh.", zoomTime: "Dua minggu lagi", zoomLink: "", hasPreTest: true, hasPostTest: true, preTestScore: null, postTestScore: null },
    { id: 6, title: "Sesi 6: Siaran (Broadcast Messages) & Multi-Sprite", description: "Mengirim sinyal antar Sprite untuk merancang dialog & transisi.", zoomTime: "Dua minggu lagi", zoomLink: "", hasPreTest: true, hasPostTest: true, preTestScore: null, postTestScore: null },
    { id: 7, title: "Sesi 7: Kloning Sprite (Game Space Invaders Dasar)", description: "Belajar membuat klon Sprite peluru secara berulang.", zoomTime: "Tiga minggu lagi", zoomLink: "", hasPreTest: true, hasPostTest: true, preTestScore: null, postTestScore: null },
    { id: 8, title: "Sesi 8: Showcase Proyek & Sertifikasi Kelulusan", description: "Mempresentasikan game pertama buatan sendiri.", zoomTime: "Tiga minggu lagi", zoomLink: "", hasPreTest: true, hasPostTest: true, preTestScore: null, postTestScore: null }
  ],
  "combo": []
};
// Build combo sessions dynamically by combining math and scratch
mockSessions["combo"] = [
  ...mockSessions["math"].map(s => ({ ...s, id: s.id, title: `Math - ${s.title}` })),
  ...mockSessions["scratch"].map(s => ({ ...s, id: s.id + 8, title: `Scratch - ${s.title}` }))
];

const mockStudentProgress: StudentProgress[] = [
  {
    studentId: 1,
    studentName: "Budi Santoso",
    studentEmail: "student@fida.com",
    courseName: "Scratch Game Programming",
    courseId: 2,
    sessionsCompleted: 1,
    totalSessions: 8,
    averagePreScore: 90,
    averagePostScore: 95,
    quizScores: [
      { sessionId: 1, sessionTitle: "Sesi 1: Pengenalan Interface", preScore: 90, postScore: 95 },
      { sessionId: 2, sessionTitle: "Sesi 2: Kontrol, Loop, dan Animasi Sederhana", preScore: null, postScore: null }
    ]
  }
];

const mockZoomMeetings: ZoomMeeting[] = [
  {
    id: 1,
    sessionTitle: "Sesi 1: Pengenalan Interface & Gerakan Sprite",
    courseName: "Scratch Game Programming",
    startTime: new Date(Date.now() + 5 * 60 * 1000).toISOString(), // 5 mins from now
    durationMinutes: 60,
    zoomLinkProtected: "https://zoom.us/j/9876543210?pwd=scratchsession1",
    isActive: true
  },
  {
    id: 2,
    sessionTitle: "Sesi 1: Dasar Logika & Penalaran Kuantitatif",
    courseName: "Matematika Logika & Olympiad",
    startTime: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // 1 hour from now
    durationMinutes: 60,
    zoomLinkProtected: "https://zoom.us/j/1234567890?pwd=mathsession1",
    isActive: true
  }
];

// Cache management utilities

export const api = {
  async checkBackend(): Promise<boolean> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      const res = await fetch(`${API_BASE}/health`, { 
        method: 'GET',
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      return res.ok;
    } catch (e) {
      console.warn("Backend health check failed:", e);
      return false;
    }
  },

  // Authentication API
  async login(email: string, password: string): Promise<{ success: boolean; user?: User; error?: string }> {
    const isBackendActive = await this.checkBackend();
    if (isBackendActive) {
      try {
        const res = await fetch(`${API_BASE}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ email, password }),
        });
        if (res.ok) {
          const data = await res.json();
          return { success: true, user: data.user };
        }
        const err = await res.json();
        return { success: false, error: err.detail || 'Login gagal' };
      } catch (e) {
        console.error(e);
      }
    }

    // Mock Fallback
    const users = getMockStorage('users', mockUsers);
    const foundUser = users.find((u: any) => u.email === email && u.password === password);
    if (foundUser) {
      const userObj: User = { id: foundUser.id, name: foundUser.name, email: foundUser.email, role: foundUser.role };
      localStorage.setItem('fida_current_user', JSON.stringify(userObj));
      return { success: true, user: userObj };
    }
    return { success: false, error: 'Email atau password salah' };
  },

  async register(name: string, email: string, password: string, role: 'student' | 'teacher'): Promise<{ success: boolean; error?: string }> {
    const isBackendActive = await this.checkBackend();
    if (isBackendActive) {
      try {
        const res = await fetch(`${API_BASE}/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ name, email, password, role }),
        });
        if (res.ok) return { success: true };
        const err = await res.json();
        return { success: false, error: err.detail || 'Registrasi gagal' };
      } catch (e) {
        console.error(e);
      }
    }

    // Mock Fallback
    const users = getMockStorage('users', mockUsers);
    if (users.find((u: any) => u.email === email)) {
      return { success: false, error: 'Email sudah terdaftar' };
    }
    const newUser = { id: users.length + 1, name, email, password, role };
    users.push(newUser);
    setMockStorage('users', users);
    return { success: true };
  },

  async getCurrentUser(): Promise<User | null> {
    const isBackendActive = await this.checkBackend();
    if (isBackendActive) {
      try {
        const res = await fetch(`${API_BASE}/auth/me`, { credentials: 'include' });
        if (res.ok) return await res.json();
        // If backend is active but returns 401 (or other error), they are not authenticated.
        localStorage.removeItem('fida_current_user');
        return null;
      } catch {
        // Suppress error, fallback to localstorage only on network failure
      }
    }
    const stored = localStorage.getItem('fida_current_user');
    return stored ? JSON.parse(stored) : null;
  },

  async logout(): Promise<void> {
    const isBackendActive = await this.checkBackend();
    if (isBackendActive) {
      try {
        await fetch(`${API_BASE}/auth/logout`, { method: 'POST', credentials: 'include' });
      } catch (e) {
        console.error(e);
      }
    }
    localStorage.removeItem('fida_current_user');
  },

  // Courses API
  async getCourses(): Promise<Course[]> {
    const isBackendActive = await this.checkBackend();
    if (isBackendActive) {
      try {
        const res = await fetch(`${API_BASE}/courses`, { credentials: 'include' });
        if (res.ok) return await res.json();
        return []; // Don't fallback to mock if backend is alive but returns 401/error
      } catch (e) {
        console.error(e);
      }
    }
    return mockCourses;
  },

  // Sessions & syllabus per course
  async getSessions(courseId: number): Promise<Session[]> {
    const isBackendActive = await this.checkBackend();
    if (isBackendActive) {
      try {
        const res = await fetch(`${API_BASE}/courses/${courseId}/sessions`, { credentials: 'include' });
        if (res.ok) return await res.json();
        return []; // Don't fallback to mock if backend is alive but returns 401/error
      } catch (e) {
        console.error(e);
      }
    }

    // Mock Fallback
    return getMockStorage(`sessions_${courseId}`, mockSessions[courseId] || []);
  },

  // Protected Zoom API (Rule #2 Security)
  async getProtectedZoomLink(courseId: number, sessionId: number): Promise<{ zoomLink?: string; error?: string }> {
    const isBackendActive = await this.checkBackend();
    if (isBackendActive) {
      try {
        const res = await fetch(`${API_BASE}/courses/${courseId}/sessions/${sessionId}/zoom-link`, { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          return { zoomLink: data.zoomLink };
        }
        const err = await res.json();
        return { error: err.detail || 'Akses ditolak' };
      } catch (e) {
        return { error: 'Koneksi backend gagal' };
      }
    }

    // Mock Fallback validation
    const user = await this.getCurrentUser();
    if (!user) {
      return { error: 'Anda harus login untuk mengakses link Zoom' };
    }

    const meetings = getMockStorage('meetings', mockZoomMeetings);
    const meeting = meetings.find((m: ZoomMeeting) => m.id === sessionId);
    if (!meeting) {
      return { error: 'Kelas tidak ditemukan' };
    }

    // Simulate scheduling check
    const now = new Date();
    const meetingTime = new Date(meeting.startTime);
    const differenceMinutes = (meetingTime.getTime() - now.getTime()) / (1000 * 60);

    if (differenceMinutes > 15) {
      return { error: `Kelas belum dimulai. Anda baru bisa bergabung 15 menit sebelum waktu mulai (${new Date(meeting.startTime).toLocaleTimeString()})` };
    }

    return { zoomLink: meeting.zoomLinkProtected };
  },

  // Question generator & cache (Rule #4 Caching)
  async getTestQuestions(sessionId: number, type: 'pre' | 'post' | 'practice', topic: string, difficulty: string): Promise<{ questions: Question[]; source: string }> {
    const isBackendActive = await this.checkBackend();
    if (isBackendActive) {
      try {
        const allQuestions = await this.getAllQuestions();
        let filtered = allQuestions.filter(q => {
          const qTopic = q.topic ? q.topic.toLowerCase() : '';
          const qSubtopic = q.subtopic ? q.subtopic.toLowerCase() : '';
          
          if (topic.startsWith('random|')) {
            const courseName = topic.split('|')[1].toLowerCase();
            return qTopic === courseName || qTopic.includes(courseName) || courseName.includes(qTopic);
          } else {
            const searchTopic = topic ? topic.toLowerCase() : '';
            return qTopic === searchTopic || qSubtopic === searchTopic || qTopic.includes(searchTopic) || qSubtopic.includes(searchTopic) || searchTopic.includes(qTopic) || searchTopic.includes(qSubtopic);
          }
        });

        if (topic.startsWith('random|')) {
          filtered = filtered.sort(() => 0.5 - Math.random()).slice(0, 25);
        }

        if (filtered.length > 0) {
          const mappedQuestions: Question[] = filtered.map(q => ({
            id: q.id!,
            questionText: q.question_text,
            options: [q.option_a, q.option_b, q.option_c, q.option_d],
            correctOptionIndex: q.correct_option === 'A' ? 0 : q.correct_option === 'B' ? 1 : q.correct_option === 'C' ? 2 : 3,
            explanation: q.explanation || ''
          }));
          
          return { questions: mappedQuestions, source: 'database' };
        }
      } catch (e) {
        console.error(e);
      }
    }

    // Fallback if no questions found or backend offline
    return { questions: [], source: 'database' };
  },

  // Save scores & update progress
  async submitQuizScore(courseId: number, sessionId: number, type: 'pre' | 'post', score: number): Promise<void> {
    const isBackendActive = await this.checkBackend();
    if (isBackendActive) {
      try {
        await fetch(`${API_BASE}/courses/${courseId}/sessions/${sessionId}/score`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ type, score }),
        });
        return;
      } catch (e) {
        console.error(e);
      }
    }

    // Mock Fallback
    const sessions = getMockStorage(`sessions_${courseId}`, mockSessions[courseId] || []);
    const updatedSessions = sessions.map((s: Session) => {
      if (s.id === sessionId) {
        if (type === 'pre') s.preTestScore = score;
        else s.postTestScore = score;
      }
      return s;
    });
    setMockStorage(`sessions_${courseId}`, updatedSessions);

    // Update student progress in mock list
    const progressList = getMockStorage('student_progress', mockStudentProgress);
    const user = await this.getCurrentUser();
    if (user) {
      let progress = progressList.find((p: StudentProgress) => p.studentId === user.id);
      if (!progress) {
        progress = {
          studentId: user.id,
          studentName: user.name,
          studentEmail: user.email,
          courseName: mockCourses.find(c => c.id === courseId)?.name || 'Matematika Logika & Olympiad',
          sessionsCompleted: 0,
          totalSessions: mockSessions[courseId]?.length || 8,
          averagePreScore: 0,
          averagePostScore: 0,
          quizScores: []
        };
        progressList.push(progress);
      }

      // Update quiz score entry
      let quizEntry = progress.quizScores.find((q: any) => q.sessionId === sessionId);
      if (!quizEntry) {
        quizEntry = {
          sessionId,
          sessionTitle: sessions.find((s: Session) => s.id === sessionId)?.title || `Sesi ${sessionId}`,
          preScore: null,
          postScore: null
        };
        progress.quizScores.push(quizEntry);
      }

      if (type === 'pre') quizEntry.preScore = score;
      else quizEntry.postScore = score;

      // Re-calculate statistics
      const preScores = progress.quizScores.map((q: any) => q.preScore).filter((s: any) => s !== null) as number[];
      const postScores = progress.quizScores.map((q: any) => q.postScore).filter((s: any) => s !== null) as number[];
      
      progress.averagePreScore = preScores.length ? Math.round(preScores.reduce((a, b) => a + b, 0) / preScores.length) : 0;
      progress.averagePostScore = postScores.length ? Math.round(postScores.reduce((a, b) => a + b, 0) / postScores.length) : 0;
      progress.sessionsCompleted = progress.quizScores.filter((q: any) => q.preScore !== null && q.postScore !== null).length;

      setMockStorage('student_progress', progressList);
    }
  },

  // Fetch list of progress reports for teacher
  async getStudentProgress(): Promise<StudentProgress[]> {
    const isBackendActive = await this.checkBackend();
    if (isBackendActive) {
      try {
        const res = await fetch(`${API_BASE}/teacher/progress`, { credentials: 'include' });
        if (res.ok) return await res.json();
      } catch (e) {
        console.error(e);
      }
    }
    return getMockStorage('student_progress', mockStudentProgress);
  },

  // ============================================================
  // MANAJEMEN KELAS AKTIF (ACTIVE CLASSES)
  // ============================================================

  async getActiveClasses(): Promise<import('../types').ActiveClass[]> {
    const isBackendActive = await this.checkBackend();
    if (isBackendActive) {
      try {
        const res = await fetch(`${API_BASE}/teacher/classes`, { credentials: 'include' });
        if (res.ok) return await res.json();
      } catch (e) {
        console.error(e);
      }
    }
    return [];
  },

  async createActiveClass(name: string, topicId: number): Promise<{ success: boolean; error?: string }> {
    const isBackendActive = await this.checkBackend();
    if (isBackendActive) {
      try {
        const res = await fetch(`${API_BASE}/teacher/classes`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ name, topic_id: topicId }),
        });
        if (res.ok) return { success: true };
        const err = await res.json();
        return { success: false, error: err.detail };
      } catch (e) {
        console.error(e);
      }
    }
    return { success: false, error: "Backend not active" };
  },

  async updateCourseSession(courseId: number, sessionId: number, data: { zoom_link?: string; zoom_time?: string; video_link?: string; is_completed?: boolean }): Promise<{ success: boolean; error?: string }> {
    const isBackendActive = await this.checkBackend();
    if (isBackendActive) {
      try {
        const res = await fetch(`${API_BASE}/teacher/classes/${courseId}/sessions/${sessionId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(data),
        });
        if (res.ok) return { success: true };
        const err = await res.json();
        return { success: false, error: err.detail };
      } catch (e) {
        console.error(e);
      }
    }
    return { success: false, error: "Backend not active" };
  },

  async uploadSessionMaterial(courseId: number, sessionId: number, file: File): Promise<{ success: boolean; path?: string; error?: string }> {
    const isBackendActive = await this.checkBackend();
    if (isBackendActive) {
      try {
        const formData = new FormData();
        formData.append('file', file);
        
        const res = await fetch(`${API_BASE}/teacher/classes/${courseId}/sessions/${sessionId}/upload-material`, {
          method: 'POST',
          credentials: 'include',
          body: formData,
        });
        if (res.ok) {
          const data = await res.json();
          return { success: true, path: data.path };
        }
        const err = await res.json();
        return { success: false, error: err.detail };
      } catch (e) {
        console.error(e);
      }
    }
    return { success: false, error: "Backend not active" };
  },

  // ============================================================
  // DATABASE SOAL MANUAL - CRUD
  // ============================================================

  async assignCourseToStudent(studentId: number, courseId: number): Promise<{success: boolean, error?: string}> {
    const isBackendActive = await this.checkBackend();
    if (isBackendActive) {
      try {
        const res = await fetch(`${API_BASE}/teacher/students/${studentId}/courses`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ course_id: courseId }),
        });
        if (res.ok) return { success: true };
        const err = await res.json();
        return { success: false, error: err.detail };
      } catch (e) {
        console.error(e);
      }
    }
    return { success: false, error: "Backend not active" };
  },

  async deleteStudent(studentId: number): Promise<{success: boolean, error?: string}> {
    const isBackendActive = await this.checkBackend();
    if (isBackendActive) {
      try {
        const res = await fetch(`${API_BASE}/teacher/students/${studentId}`, {
          method: 'DELETE',
          credentials: 'include',
        });
        if (res.ok) return { success: true };
        const err = await res.json();
        return { success: false, error: err.detail };
      } catch (e) {
        console.error(e);
      }
    }
    return { success: false, error: "Backend not active" };
  },

  async createManualQuestion(data: Omit<ManualQuestion, 'id' | 'created_at'>): Promise<ManualQuestion> {
    const isBackendActive = await this.checkBackend();
    if (isBackendActive) {
      try {
        const res = await fetch(`${API_BASE}/questions/manual`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(data),
        });
        if (res.ok) return await res.json();
      } catch (e) {
        console.error(e);
      }
    }

    // Mock Fallback
    const questions: ManualQuestion[] = getMockStorage('manual_questions', []);
    const newQ: ManualQuestion = { ...data, id: questions.length + 1, created_at: new Date().toISOString() };
    questions.unshift(newQ);
    setMockStorage('manual_questions', questions);
    return newQ;
  },

  async getManualQuestions(): Promise<ManualQuestion[]> {
    const isBackendActive = await this.checkBackend();
    if (isBackendActive) {
      try {
        const res = await fetch(`${API_BASE}/questions/manual`, { credentials: 'include' });
        if (res.ok) return await res.json();
      } catch (e) {
        console.error(e);
      }
    }
    return getMockStorage('manual_questions', []);
  },

  async deleteManualQuestion(questionId: number): Promise<void> {
    const isBackendActive = await this.checkBackend();
    if (isBackendActive) {
      try {
        await fetch(`${API_BASE}/questions/manual/${questionId}`, { method: 'DELETE', credentials: 'include' });
        return;
      } catch (e) {
        console.error(e);
      }
    }

    // Mock Fallback
    const questions: ManualQuestion[] = getMockStorage('manual_questions', []);
    const filtered = questions.filter(q => q.id !== questionId);
    setMockStorage('manual_questions', filtered);
  },

  // Cache management (kept for AI question cache compatibility)
  async clearCache(): Promise<void> {
    const isBackendActive = await this.checkBackend();
    if (isBackendActive) {
      try {
        await fetch(`${API_BASE}/questions/clear-cache`, { method: 'POST', credentials: 'include' });
        return;
      } catch (e) {
        console.error(e);
      }
    }
    localStorage.removeItem('fida_question_cache');
    localStorage.removeItem('fida_cache_logs');
  },

  // --- Curriculum Management ---
  async getCurriculum(): Promise<Topic[]> {
    const isBackendActive = await this.checkBackend();
    if (isBackendActive) {
      try {
        const res = await fetch(`${API_BASE}/teacher/curriculum`, { credentials: 'include' });
        if (res.ok) return await res.json();
      } catch (e) {
        console.error(e);
      }
    }
    return [];
  },
  
  async createTopic(data: Omit<Topic, 'id' | 'subtopics'>): Promise<Topic | null> {
    const isBackendActive = await this.checkBackend();
    if (isBackendActive) {
      try {
        const res = await fetch(`${API_BASE}/teacher/topics`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(data),
        });
        if (res.ok) return await res.json();
      } catch (e) {
        console.error(e);
      }
    }
    return null;
  },

  async updateTopic(topicId: number, data: Omit<Topic, 'id' | 'subtopics'>): Promise<Topic | null> {
    const isBackendActive = await this.checkBackend();
    if (isBackendActive) {
      try {
        const res = await fetch(`${API_BASE}/teacher/topics/${topicId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(data),
        });
        if (res.ok) return await res.json();
      } catch (e) {
        console.error(e);
      }
    }
    return null;
  },

  async deleteTopic(topicId: number): Promise<void> {
    const isBackendActive = await this.checkBackend();
    if (isBackendActive) {
      try {
        await fetch(`${API_BASE}/teacher/topics/${topicId}`, {
          method: 'DELETE',
          credentials: 'include'
        });
      } catch (e) {
        console.error(e);
      }
    }
  },

  async createSubtopic(topicId: number, data: Omit<Subtopic, 'id'>): Promise<Subtopic | null> {
    const isBackendActive = await this.checkBackend();
    if (isBackendActive) {
      try {
        const res = await fetch(`${API_BASE}/teacher/topics/${topicId}/subtopics`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(data),
        });
        if (res.ok) return await res.json();
      } catch (e) {
        console.error(e);
      }
    }
    return null;
  },

  async updateSubtopic(subtopicId: number, data: Omit<Subtopic, 'id'>): Promise<Subtopic | null> {
    const isBackendActive = await this.checkBackend();
    if (isBackendActive) {
      try {
        const res = await fetch(`${API_BASE}/teacher/subtopics/${subtopicId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(data),
        });
        if (res.ok) return await res.json();
      } catch (e) {
        console.error(e);
      }
    }
    return null;
  },

  async deleteSubtopic(subtopicId: number): Promise<void> {
    const isBackendActive = await this.checkBackend();
    if (isBackendActive) {
      try {
        await fetch(`${API_BASE}/teacher/subtopics/${subtopicId}`, {
          method: 'DELETE',
          credentials: 'include'
        });
      } catch (e) {
        console.error(e);
      }
    }
  },

  // === Question Bank (CRUD) ===
  async getAllQuestions(): Promise<ManualQuestion[]> {
    const isBackendActive = await this.checkBackend();
    if (isBackendActive) {
      try {
        const res = await fetch(`${API_BASE}/questions`, {
          credentials: 'include'
        });
        if (res.ok) {
          return await res.json();
        }
      } catch (e) {
        console.error(e);
      }
    }
    return [];
  },

  async createQuestion(data: Omit<ManualQuestion, 'id' | 'created_at'>): Promise<ManualQuestion | null> {
    const isBackendActive = await this.checkBackend();
    if (isBackendActive) {
      try {
        const res = await fetch(`${API_BASE}/questions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(data),
        });
        if (res.ok) return await res.json();
      } catch (e) {
        console.error(e);
      }
    }
    return null;
  },

  async updateQuestion(id: number, data: Partial<ManualQuestion>): Promise<ManualQuestion | null> {
    const isBackendActive = await this.checkBackend();
    if (isBackendActive) {
      try {
        const res = await fetch(`${API_BASE}/questions/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(data),
        });
        if (res.ok) return await res.json();
      } catch (e) {
        console.error(e);
      }
    }
    return null;
  },

  async deleteQuestion(id: number): Promise<void> {
    const isBackendActive = await this.checkBackend();
    if (isBackendActive) {
      try {
        await fetch(`${API_BASE}/questions/${id}`, {
          method: 'DELETE',
          credentials: 'include'
        });
      } catch (e) {
        console.error(e);
      }
    }
  },

  async importQuestionsJson(file: File): Promise<{message: string, count: number, skipped?: number} | null> {
    const isBackendActive = await this.checkBackend();
    if (isBackendActive) {
      try {
        const formData = new FormData();
        formData.append('file', file);
        const res = await fetch(`${API_BASE}/questions/import`, {
          method: 'POST',
          credentials: 'include',
          body: formData,
        });
        if (res.ok) {
          return await res.json();
        } else {
          const err = await res.json();
          alert(`Error: ${err.detail}`);
        }
      } catch (e) {
        console.error(e);
        alert('Gagal mengimport file. Pastikan server berjalan dan format JSON benar.');
      }
    }
    return null;
  }
};
