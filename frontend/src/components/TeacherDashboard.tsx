import React, { useState, useEffect, useMemo, useRef } from 'react';
import { api } from '../services/api';
import type { StudentProgress, User, Topic, Subtopic, ActiveClass, ActiveSession, ManualQuestion } from '../types';

interface TeacherDashboardProps {
  currentUser: User;
  onLogout: () => void;
  onGoToLanding: () => void;
}

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({
  currentUser,
  onLogout,
  onGoToLanding
}) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'students' | 'classes' | 'question-bank' | 'curriculum'>('dashboard');
  const [students, setStudents] = useState<StudentProgress[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<StudentProgress | null>(null);
  const [isAddStudentModalOpen, setIsAddStudentModalOpen] = useState(false);
  const [addStudentForm, setAddStudentForm] = useState({ name: '', email: '', password: '' });

  // Active Classes state
  const [activeClasses, setActiveClasses] = useState<ActiveClass[]>([]);
  const [selectedClass, setSelectedClass] = useState<ActiveClass | null>(null);
  const [classForm, setClassForm] = useState({ name: '', topicId: '' });
  const [isCreatingClass, setIsCreatingClass] = useState(false);

  // Assign Course state
  const [assigningStudentId, setAssigningStudentId] = useState<number | null>(null);
  const [assignCourseId, setAssignCourseId] = useState<number | ''>('');
      
  // Session forms state
  const [sessionForms, setSessionForms] = useState<Record<number, Partial<ActiveSession>>>({});
  const [savingSession, setSavingSession] = useState<number | null>(null);
  const fileInputRefs = useRef<Record<number, HTMLInputElement | null>>({});
  const importJsonRef = useRef<HTMLInputElement>(null);

  // Database Soal state
  const [questions, setQuestions] = useState<ManualQuestion[]>([]);
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<ManualQuestion | null>(null);
  const [filterSubtopic, setFilterSubtopic] = useState<string>('');
  const [questionForm, setQuestionForm] = useState<Omit<ManualQuestion, 'id' | 'created_at'>>({
    topic: '', subtopic: '', difficulty: 'Mudah', question_text: '', option_a: '', option_b: '', option_c: '', option_d: '', correct_option: 'A', explanation: ''
  });
          
  const [curriculumTopics, setCurriculumTopics] = useState<Topic[]>([]);
  
  // Curriculum state
  const [editingTopic, setEditingTopic] = useState<Topic | null>(null);
  const [topicModalOpen, setTopicModalOpen] = useState(false);
  const [editingSubtopic, setEditingSubtopic] = useState<{ topicId: number; subtopic: Subtopic | null } | null>(null);
  const [subtopicModalOpen, setSubtopicModalOpen] = useState(false);
  const [expandedTopics, setExpandedTopics] = useState<number[]>([]);
  const [topicForm, setTopicForm] = useState<{name: string, description: string, level: string}>({ name: '', description: '', level: '' });
  const [subtopicForm, setSubtopicForm] = useState<{title: string, description: string, order_index: number}>({ title: '', description: '', order_index: 0 });

  const fetchData = async () => {
    if (activeTab === 'students') {
      const res = await api.getStudentProgress();
      setStudents(res);
    } else if (activeTab === 'classes') {
      const classes = await api.getActiveClasses();
      setActiveClasses(classes);
      if (selectedClass) {
        const updated = classes.find(c => c.id === selectedClass.id);
        setSelectedClass(updated || null);
      }
    } else if (activeTab === 'question-bank') {
      const qs = await api.getAllQuestions();
      setQuestions(qs);
      const cur = await api.getCurriculum();
      setCurriculumTopics(cur);
    } else if (activeTab === 'curriculum') {
      const cur = await api.getCurriculum();
      setCurriculumTopics(cur);
      const qs = await api.getAllQuestions();
      setQuestions(qs);
    }
  };

  useEffect(() => {
    const init = async () => {
      const cur = await api.getCurriculum();
      setCurriculumTopics(cur);
      const classes = await api.getActiveClasses();
      setActiveClasses(classes);
    };
    init();
  }, []);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  // Handlers for Question Bank
  const handleOpenQuestionModal = (question?: ManualQuestion) => {
    if (question) {
      setEditingQuestion(question);
      setQuestionForm({
        topic: question.topic,
        subtopic: question.subtopic || '',
        difficulty: question.difficulty,
        question_text: question.question_text,
        option_a: question.option_a,
        option_b: question.option_b,
        option_c: question.option_c,
        option_d: question.option_d,
        correct_option: question.correct_option,
        explanation: question.explanation || ''
      });
    } else {
      setEditingQuestion(null);
      setQuestionForm({
        topic: curriculumTopics.length > 0 ? curriculumTopics[0].name : '',
        subtopic: '',
        difficulty: 'Mudah',
        question_text: '',
        option_a: '',
        option_b: '',
        option_c: '',
        option_d: '',
        correct_option: 'A',
        explanation: ''
      });
    }
    setIsQuestionModalOpen(true);
  };

  const handleSaveQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingQuestion && editingQuestion.id) {
      await api.updateQuestion(editingQuestion.id, questionForm);
    } else {
      await api.createQuestion(questionForm);
    }
    setIsQuestionModalOpen(false);
    fetchData();
  };

  const handleDeleteQuestion = async (id: number) => {
    if (window.confirm('Hapus soal ini?')) {
      await api.deleteQuestion(id);
      fetchData();
    }
  };

  const handleImportJson = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const response = await api.importQuestionsJson(file);
      
      let message = `Berhasil mengimpor ${response.count} soal.`;
      if (response.skipped && response.skipped > 0) {
        message += `\nSebanyak ${response.skipped} soal diabaikan karena submaterinya tidak terdaftar di Kurikulum.`;
      }
      alert(message);
      
      fetchData();
      
      // reset file input
      if (importJsonRef.current) importJsonRef.current.value = '';
    }
  };

  const handleDownloadTemplate = () => {
    const template = [
      {
        materi: "Matematika Logika & Olympiad",
        submateri: "Sesi 1: Dasar Logika",
        difficulty: "Mudah",
        question_text: "Pertanyaan contoh di sini...",
        option_a: "Pilihan A",
        option_b: "Pilihan B",
        option_c: "Pilihan C",
        option_d: "Pilihan D",
        correct_option: "A",
        explanation: "Penjelasan mengapa A benar (opsional)"
      }
    ];
    const blob = new Blob([JSON.stringify(template, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "template_soal.json";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  type GroupedStudent = {
    studentId: number;
    studentName: string;
    studentEmail: string;
    courses: { courseId: number; courseName: string; sessionsCompleted: number; totalSessions: number; averagePreScore: number; averagePostScore: number; quizScores: StudentProgress['quizScores'] }[];
  };

  const groupedStudents = useMemo<GroupedStudent[]>(() => {
    const map = new Map<number, GroupedStudent>();
    for (const s of students) {
      if (!map.has(s.studentId)) {
        map.set(s.studentId, {
          studentId: s.studentId,
          studentName: s.studentName,
          studentEmail: s.studentEmail,
          courses: []
        });
      }
      const group = map.get(s.studentId)!;
      if (s.courseId) {
        group.courses.push({
          courseId: s.courseId,
          courseName: s.courseName,
          sessionsCompleted: s.sessionsCompleted,
          totalSessions: s.totalSessions,
          averagePreScore: s.averagePreScore,
          averagePostScore: s.averagePostScore,
          quizScores: s.quizScores
        });
      }
    }
    return Array.from(map.values());
  }, [students]);

  const handleAssignCourse = async () => {
    if (!assigningStudentId || !assignCourseId) return;
    
    
    
    const result = await api.assignCourseToStudent(assigningStudentId, assignCourseId as number);
    
    if (result.success) {
      
      setAssignCourseId('');
      setAssigningStudentId(null);
      await fetchData();
      
    } else {
      
    }
  };

  const handleDeleteStudent = async () => {
    if (!selectedStudent) return;
    if (!confirm(`Apakah Anda yakin ingin menghapus siswa "${selectedStudent.studentName}"? Semua data terkait siswa ini juga akan dihapus.`)) return;
    const result = await api.deleteStudent(selectedStudent.studentId);
    if (result.success) {
      setSelectedStudent(null);
      await fetchData();
    } else {
      alert(result.error || 'Gagal menghapus siswa.');
    }
  };

  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addStudentForm.name || !addStudentForm.email || !addStudentForm.password) return;
    
    const res = await api.register(addStudentForm.name, addStudentForm.email, addStudentForm.password, 'student');
    if (res.success) {
      setAddStudentForm({ name: '', email: '', password: '' });
      setIsAddStudentModalOpen(false);
      await fetchData();
      alert('Berhasil menambahkan siswa baru!');
    } else {
      alert(res.error || 'Gagal menambahkan siswa.');
    }
  };

  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!classForm.name || !classForm.topicId) return;
    setIsCreatingClass(true);
    const res = await api.createActiveClass(classForm.name, parseInt(classForm.topicId));
    setIsCreatingClass(false);
    if (res.success) {
      setClassForm({ name: '', topicId: '' });
      await fetchData();
    } else {
      alert(res.error || 'Gagal membuat kelas');
    }
  };

  const handleSessionUpdate = async (courseId: number, sessionId: number) => {
    const form = sessionForms[sessionId] || {};
    setSavingSession(sessionId);
    
    // First, upload file if selected
    const fileInput = fileInputRefs.current[sessionId];
    let fileUploaded = false;
    
    if (fileInput?.files?.length) {
      const file = fileInput.files[0];
      const uploadRes = await api.uploadSessionMaterial(courseId, sessionId, file);
      if (!uploadRes.success) {
        alert(uploadRes.error || "Gagal mengunggah file");
        setSavingSession(null);
        return;
      }
      fileUploaded = true;
    }
    
    // Check completion logic
    const sessionOriginal = selectedClass?.sessions.find(s => s.id === sessionId);
    const hasMaterial = fileUploaded || !!sessionOriginal?.materialFilePath;
    const hasVideo = !!form.videoLink || !!sessionOriginal?.videoLink;
    
    if (form.isCompleted && (!hasMaterial || !hasVideo)) {
        alert("Sesi tidak bisa ditandai selesai karena materi HTML atau Link Video belum diisi.");
        setSavingSession(null);
        return;
    }

    // Then update metadata
    const res = await api.updateCourseSession(courseId, sessionId, {
      zoom_link: form.zoomLink,
      zoom_time: form.zoomTime,
      video_link: form.videoLink,
      is_completed: form.isCompleted
    });
    
    if (res.success) {
      await fetchData();
    } else {
      alert(res.error || "Gagal memperbarui sesi");
    }
    setSavingSession(null);
  };

  // Student progress details
  const allSessions = useMemo(() => {
    const sessions = [];
    for (let i = 1; i <= (selectedStudent?.totalSessions || 0); i++) {
      const existing = selectedStudent?.quizScores.find((q: any) => q.sessionId === i);
      sessions.push({
        sessionId: i,
        sessionTitle: existing?.sessionTitle || `Sesi ${i}`,
        preScore: existing?.preScore ?? null,
        postScore: existing?.postScore ?? null,
        isCompleted: existing?.isCompleted ?? false
      });
    }
    return sessions;
  }, [selectedStudent]);

  // Handle Curriculums
  const handleSaveTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingTopic) {
      await api.updateTopic(editingTopic.id, topicForm);
    } else {
      await api.createTopic(topicForm);
    }
    setEditingTopic(null);
    setTopicForm({ name: '', description: '', level: '' });
    await fetchData();
  };

  const handleDeleteTopic = async (topic: Topic) => {
    if (confirm(`Hapus materi "${topic.name}" beserta semua submateri di dalamnya?`)) {
      await api.deleteTopic(topic.id);
      await fetchData();
    }
  };

  const handleSaveSubtopic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingSubtopic) {
      if (editingSubtopic.subtopic) {
        await api.updateSubtopic(editingSubtopic.subtopic.id, subtopicForm);
      } else {
        await api.createSubtopic(editingSubtopic.topicId, subtopicForm);
      }
      setEditingSubtopic(null);
      setSubtopicForm({ title: '', description: '', order_index: 0 });
      await fetchData();
    }
  };

  const handleDeleteSubtopic = async (subtopic: Subtopic) => {
    if (confirm(`Hapus submateri "${subtopic.title}"?`)) {
      await api.deleteSubtopic(subtopic.id);
      await fetchData();
    }
  };

  const toggleTopicExpand = (id: number) => {
    setExpandedTopics(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  return (
    <div className="bg-background text-text-body font-body-md min-h-screen flex antialiased">
      {/* SIDEBAR - Fixed Left */}
      <aside className="fixed md:sticky top-0 left-0 h-screen w-64 bg-surface-container-lowest border-r border-border-subtle flex flex-col z-50">
        {/* Logo Area */}
        <div className="h-24 flex items-center px-6 gap-3">
          <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary">
            <span className="material-symbols-outlined text-[24px]">school</span>
          </div>
          <button onClick={onGoToLanding} className="font-headline-md text-[20px] font-extrabold text-secondary tracking-tight hover:opacity-80 transition-opacity">
            Fida-Edutech
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          <button
            onClick={() => { setActiveTab('dashboard'); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-label-md transition-colors text-left ${
              activeTab === 'dashboard'
                ? 'bg-secondary/10 text-secondary'
                : 'text-text-muted hover:bg-surface hover:text-text-heading'
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">dashboard</span>
            Dashboard
          </button>
          <button
            onClick={() => { setActiveTab('students'); setSelectedStudent(null); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-label-md transition-colors text-left ${
              activeTab === 'students'
                ? 'bg-secondary/10 text-secondary'
                : 'text-text-muted hover:bg-surface hover:text-text-heading'
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">group</span>
            Data Siswa
          </button>
          <button
            onClick={() => { setActiveTab('classes'); setSelectedClass(null); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-label-md transition-colors text-left ${
              activeTab === 'classes'
                ? 'bg-secondary/10 text-secondary'
                : 'text-text-muted hover:bg-surface hover:text-text-heading'
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">class</span>
            Manajemen Kelas
          </button>
          <button
            onClick={() => setActiveTab('curriculum')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-label-md transition-colors text-left ${
              activeTab === 'curriculum'
                ? 'bg-secondary/10 text-secondary'
                : 'text-text-muted hover:bg-surface hover:text-text-heading'
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">menu_book</span>
            Manajemen Kurikulum
          </button>
          <button
            onClick={() => setActiveTab('question-bank')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-label-md transition-colors text-left ${
              activeTab === 'question-bank'
                ? 'bg-secondary/10 text-secondary'
                : 'text-text-muted hover:bg-surface hover:text-text-heading'
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">library_books</span>
            Database Soal
          </button>
        </nav>

        {/* Footer / Logout */}
        <div className="p-4 border-t border-border-subtle mt-auto">
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-text-muted hover:bg-error-container hover:text-error font-label-md transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">logout</span>
            Keluar / Logout
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col min-w-0 bg-surface">
        <div className="flex-1 p-6 md:p-8 max-w-[1400px] w-full mx-auto space-y-6 md:space-y-8 overflow-y-auto">

          {/* ===== TAB DASHBOARD ===== */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6 md:space-y-8">
              {/* Welcome Banner */}
              <div 
                className="rounded-[1.5rem] p-6 md:p-8 border border-border-subtle shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden"
                style={{
                  backgroundImage: 'linear-gradient(rgba(239, 246, 255, 0.85), rgba(224, 231, 255, 0.85)), url("/bg_dashboard.png")',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}
              >
                <div className="absolute -right-10 -top-10 w-40 h-40 bg-secondary/5 rounded-full blur-2xl pointer-events-none"></div>
                <div className="absolute right-20 -bottom-10 w-32 h-32 bg-primary-container/10 rounded-full blur-xl pointer-events-none"></div>
                <div className="relative z-10 space-y-3">
                  <h1 className="font-headline-lg text-text-heading">
                    Selamat datang, {currentUser.name}! 👋
                  </h1>
                  <p className="text-text-muted font-body-md max-w-2xl">
                    Kelola siswa, kelas aktif, dan kurikulum pembelajaran dari panel ini.
                  </p>
                </div>
                <div className="relative z-10 shrink-0 inline-flex items-center gap-2 px-4 py-2 bg-surface-container-lowest rounded-full border border-border-subtle shadow-sm text-secondary font-label-md">
                  <span className="text-xl">🎓</span>
                  <span>{currentUser.email}</span>
                </div>
              </div>

              {/* Quick Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-surface-container-lowest rounded-2xl p-6 border border-border-subtle shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary shrink-0">
                    <span className="material-symbols-outlined text-[24px]">group</span>
                  </div>
                  <div>
                    <p className="text-text-muted font-label-sm uppercase tracking-wider mb-1">Total Siswa</p>
                    <p className="font-headline-md text-text-heading">{groupedStudents.length} Siswa</p>
                  </div>
                </div>
                <div className="bg-surface-container-lowest rounded-2xl p-6 border border-border-subtle shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary-container/10 flex items-center justify-center text-primary-container shrink-0">
                    <span className="material-symbols-outlined text-[24px]">class</span>
                  </div>
                  <div>
                    <p className="text-text-muted font-label-sm uppercase tracking-wider mb-1">Kelas Aktif</p>
                    <p className="font-headline-md text-text-heading">{activeClasses.length} Kelas</p>
                  </div>
                </div>
                <div className="bg-surface-container-lowest rounded-2xl p-6 border border-border-subtle shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-pink-500/10 flex items-center justify-center text-pink-600 shrink-0">
                    <span className="material-symbols-outlined text-[24px]">menu_book</span>
                  </div>
                  <div>
                    <p className="text-text-muted font-label-sm uppercase tracking-wider mb-1">Kurikulum Master</p>
                    <p className="font-headline-md text-text-heading">{curriculumTopics.length} Materi</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ===== TAB SISWA ===== */}
          {activeTab === 'students' && !selectedStudent && (
            <div className="bg-surface-container-lowest rounded-2xl border border-border-subtle shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300">
              <div className="h-2 bg-secondary w-full"></div>
              <div className="p-6 md:p-8">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="font-headline-md text-text-heading flex items-center gap-2">
                    <span className="material-symbols-outlined text-[20px] text-text-muted">group</span>
                    Daftar Siswa
                  </h2>
                  <button 
                    onClick={() => setIsAddStudentModalOpen(true)} 
                    className="px-4 py-2 bg-primary text-white text-sm rounded-xl font-label-md hover:scale-[1.02] transition-transform shadow-sm flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined text-[18px]">add</span> Tambah Siswa
                  </button>
                </div>
                <div className="flex flex-col divide-y divide-border-subtle">
                  {groupedStudents.map(gs => {
                    const allPreScores = gs.courses.filter(c => c.averagePreScore > 0).map(c => c.averagePreScore);
                    const allPostScores = gs.courses.filter(c => c.averagePostScore > 0).map(c => c.averagePostScore);
                    const avgPre = allPreScores.length > 0 ? Math.round(allPreScores.reduce((a, b) => a + b, 0) / allPreScores.length) : 0;
                    const avgPost = allPostScores.length > 0 ? Math.round(allPostScores.reduce((a, b) => a + b, 0) / allPostScores.length) : 0;

                    return (
                      <div key={gs.studentId} className="py-5 flex flex-col gap-3 group">
                        <div className="flex items-center gap-4">
                          <div className="w-11 h-11 rounded-full bg-gradient-to-br from-secondary to-blue-500 text-white flex justify-center items-center font-extrabold text-sm shadow-sm shrink-0 group-hover:scale-110 transition-transform">
                            {gs.studentName.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-[160px]">
                            <div className="font-label-md text-text-heading truncate">{gs.studentName}</div>
                            <div className="text-xs text-text-muted truncate">{gs.studentEmail}</div>
                          </div>
                          <div className="flex gap-5 ml-auto items-center">
                            <div className="text-center">
                              <span className="text-text-muted font-label-sm uppercase tracking-wider block text-[10px]">Kelas</span>
                              <span className="font-headline-md text-[18px] text-text-heading">{gs.courses.length}</span>
                            </div>
                            <div className="text-center">
                              <span className="text-text-muted font-label-sm uppercase tracking-wider block text-[10px]">Pre-Test</span>
                              <span className="font-headline-md text-[18px] text-primary-container">{avgPre}</span>
                            </div>
                            <div className="text-center">
                              <span className="text-text-muted font-label-sm uppercase tracking-wider block text-[10px]">Post-Test</span>
                              <span className="font-headline-md text-[18px] text-tertiary">{avgPost}</span>
                            </div>

                            {assigningStudentId === gs.studentId ? (
                              <div className="flex items-center gap-2">
                                <select value={assignCourseId} onChange={e => setAssignCourseId(Number(e.target.value) || '')} className="p-1.5 text-xs border border-border-subtle rounded-lg bg-surface">
                                  <option value="" disabled>Pilih Kelas</option>
                                  {activeClasses.filter(c => !gs.courses.some(gc => gc.courseId === c.id)).map(c => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                  ))}
                                </select>
                                <button onClick={handleAssignCourse} className="px-2.5 py-1.5 bg-tertiary text-white text-xs rounded-lg font-label-md">OK</button>
                                <button onClick={() => setAssigningStudentId(null)} className="px-2.5 py-1.5 bg-error-container text-error text-xs rounded-lg font-label-md">✕</button>
                              </div>
                            ) : (
                              <button onClick={() => setAssigningStudentId(gs.studentId)} className="px-4 py-2 bg-primary-container text-white text-xs rounded-xl font-label-md hover:scale-[1.02] transition-transform shadow-sm">
                                Assign Kelas
                              </button>
                            )}
                            <button onClick={() => setSelectedStudent(students.find(s => s.studentId === gs.studentId) || null)} className="px-4 py-2 bg-secondary text-white text-xs rounded-xl font-label-md hover:scale-[1.02] transition-transform shadow-sm">
                              Detail
                            </button>
                          </div>
                        </div>
                        <div className="flex gap-1.5 ml-[60px]">
                          {gs.courses.map(c => (
                            <span key={c.courseId} className="px-2.5 py-1 bg-surface border border-border-subtle text-[11px] rounded-full text-text-muted font-label-sm">{c.courseName}</span>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ===== TAB DETAIL SISWA ===== */}
          {activeTab === 'students' && selectedStudent && (
            <div className="space-y-4">
              <button onClick={() => setSelectedStudent(null)} className="font-label-md text-text-muted hover:text-text-heading flex items-center gap-1 transition-colors">
                <span className="material-symbols-outlined text-[18px]">arrow_back</span> Kembali ke Daftar Siswa
              </button>
              <div className="bg-surface-container-lowest rounded-2xl border border-border-subtle shadow-sm overflow-hidden">
                <div className="h-2 bg-primary-container w-full"></div>
                <div className="p-6 md:p-8">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary-container to-orange-400 text-white flex justify-center items-center font-extrabold text-lg shadow-md">
                        {selectedStudent.studentName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h2 className="font-headline-md text-text-heading">{selectedStudent.studentName}</h2>
                        <p className="text-text-muted font-label-sm">{selectedStudent.studentEmail}</p>
                      </div>
                    </div>
                    <button onClick={handleDeleteStudent} className="px-4 py-2 bg-error-container text-error rounded-xl font-label-md hover:scale-[1.02] transition-transform flex items-center gap-1">
                      <span className="material-symbols-outlined text-[16px]">delete</span> Hapus Siswa
                    </button>
                  </div>

                  <h3 className="font-label-md text-text-heading mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px] text-text-muted">assessment</span>
                    Rapor Nilai — {selectedStudent.courseName}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {allSessions.map(s => (
                      <div key={s.sessionId} className="p-4 border border-border-subtle rounded-2xl bg-surface hover:shadow-sm transition-shadow">
                        <div className="flex items-center justify-between mb-3">
                          <div className="font-label-md text-text-heading">{s.sessionTitle}</div>
                          {s.isCompleted && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-tertiary/10 text-tertiary">
                              ✓ Selesai
                            </span>
                          )}
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-text-muted">Pre-Test: <b className="text-primary-container">{s.preScore ?? '—'}</b></span>
                          <span className="text-text-muted">Post-Test: <b className="text-tertiary">{s.postScore ?? '—'}</b></span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Modal Tambah Siswa */}
          {isAddStudentModalOpen && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-surface-container-lowest rounded-3xl w-full max-w-md shadow-2xl flex flex-col">
                <div className="p-6 md:p-8 border-b border-border-subtle flex justify-between items-center bg-surface shrink-0 rounded-t-3xl">
                  <h3 className="font-headline-sm text-text-heading flex items-center gap-2">
                    <span className="material-symbols-outlined text-[20px]">person_add</span> Tambah Akun Siswa
                  </h3>
                  <button onClick={() => setIsAddStudentModalOpen(false)} className="text-text-muted hover:text-text-heading rounded-full p-2 hover:bg-surface-container-highest transition-colors">
                    <span className="material-symbols-outlined">close</span>
                  </button>
                </div>
                
                <div className="p-6 md:p-8 overflow-y-auto custom-scrollbar">
                  <form id="addStudentForm" onSubmit={handleCreateStudent} className="space-y-4">
                    <div className="space-y-2">
                      <label className="block text-text-heading font-label-md">Nama Lengkap *</label>
                      <input
                        type="text"
                        required
                        value={addStudentForm.name}
                        onChange={(e) => setAddStudentForm({...addStudentForm, name: e.target.value})}
                        className="w-full bg-surface border border-border-subtle rounded-xl px-4 py-3 font-body-md focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-secondary transition-all"
                        placeholder="Nama Siswa"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-text-heading font-label-md">Email *</label>
                      <input
                        type="email"
                        required
                        value={addStudentForm.email}
                        onChange={(e) => setAddStudentForm({...addStudentForm, email: e.target.value})}
                        className="w-full bg-surface border border-border-subtle rounded-xl px-4 py-3 font-body-md focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-secondary transition-all"
                        placeholder="siswa@email.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-text-heading font-label-md">Password *</label>
                      <input
                        type="password"
                        required
                        value={addStudentForm.password}
                        onChange={(e) => setAddStudentForm({...addStudentForm, password: e.target.value})}
                        className="w-full bg-surface border border-border-subtle rounded-xl px-4 py-3 font-body-md focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-secondary transition-all"
                        placeholder="••••••••"
                      />
                    </div>
                  </form>
                </div>
                
                <div className="p-6 md:p-8 border-t border-border-subtle flex justify-end gap-3 bg-surface shrink-0 rounded-b-3xl">
                  <button
                    type="button"
                    onClick={() => setIsAddStudentModalOpen(false)}
                    className="px-6 py-2.5 rounded-full font-label-md text-text-muted hover:bg-surface-container-highest transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    form="addStudentForm"
                    className="bg-primary hover:bg-primary-hover text-white px-8 py-2.5 rounded-full font-label-md transition-colors"
                  >
                    Tambah
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ===== TAB MANAJEMEN KELAS ===== */}
          {activeTab === 'classes' && !selectedClass && (
            <div className="space-y-6">
              {/* Form Buat Kelas */}
              <div className="bg-surface-container-lowest rounded-2xl p-6 md:p-8 border border-border-subtle shadow-sm hover:shadow-md transition-shadow">
                <h3 className="font-headline-md text-text-heading mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[20px] text-text-muted">add_box</span>
                  Buat Kelas Baru
                </h3>
                <form onSubmit={handleCreateClass} className="flex flex-col md:flex-row gap-4">
                  <input type="text" placeholder="Nama Kelas (Misal: Matematika Batch 1)" value={classForm.name} onChange={e => setClassForm({ ...classForm, name: e.target.value })} required className="flex-grow p-3 border border-border-subtle rounded-xl text-sm bg-surface focus:bg-surface-container-lowest focus:border-secondary focus:ring-1 focus:ring-secondary outline-none transition-all" />
                  <select value={classForm.topicId} onChange={e => setClassForm({ ...classForm, topicId: e.target.value })} required className="p-3 border border-border-subtle rounded-xl text-sm bg-surface focus:bg-surface-container-lowest focus:border-secondary outline-none">
                    <option value="" disabled>Pilih Kurikulum Master</option>
                    {curriculumTopics.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                  <button type="submit" disabled={isCreatingClass} className="shrink-0 px-6 py-3 bg-secondary text-white font-label-md rounded-xl hover:scale-[1.02] transition-transform shadow-sm">
                    {isCreatingClass ? 'Membuat...' : 'Buat Kelas'}
                  </button>
                </form>
              </div>

              {/* Daftar Kelas Aktif */}
              <div className="bg-surface-container-lowest rounded-2xl border border-border-subtle shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                <div className="h-2 bg-secondary w-full"></div>
                <div className="p-6 md:p-8">
                  <h3 className="font-headline-md text-text-heading mb-6 flex items-center gap-2">
                    <span className="material-symbols-outlined text-[20px] text-text-muted">class</span>
                    Daftar Kelas Aktif
                  </h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    {activeClasses.map(c => (
                      <div key={c.id} onClick={() => setSelectedClass(c)} className="p-5 border border-border-subtle rounded-2xl bg-surface hover:border-secondary hover:shadow-md hover:-translate-y-1 cursor-pointer transition-all duration-300 flex flex-col gap-2 group">
                        <h4 className="font-headline-md text-[20px] text-text-heading group-hover:text-secondary transition-colors">{c.name}</h4>
                        <p className="text-text-muted font-label-sm">Kurikulum: {c.topicName}</p>
                        <div className="mt-auto flex justify-between items-center border-t border-border-subtle pt-3 mt-3">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold bg-secondary/10 text-secondary">
                            {c.sessions.length} Sesi
                          </span>
                          <span className="text-secondary font-label-md text-sm flex items-center gap-1">
                            Kelola <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ===== TAB DETAIL KELAS ===== */}
          {activeTab === 'classes' && selectedClass && (
            <div className="space-y-4">
              <button onClick={() => setSelectedClass(null)} className="font-label-md text-text-muted hover:text-text-heading flex items-center gap-1 transition-colors">
                <span className="material-symbols-outlined text-[18px]">arrow_back</span> Daftar Kelas
              </button>

              <div className="bg-surface-container-lowest rounded-2xl border border-border-subtle shadow-sm overflow-hidden">
                {/* Hero Header */}
                <div className="bg-gradient-to-r from-secondary to-blue-500 p-8 text-white relative overflow-hidden">
                  <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/5 rounded-full blur-2xl pointer-events-none"></div>
                  <div className="absolute right-20 -bottom-10 w-32 h-32 bg-white/10 rounded-full blur-xl pointer-events-none"></div>
                  <h2 className="font-headline-lg text-white relative z-10">{selectedClass.name}</h2>
                  <p className="text-white/80 font-body-md relative z-10 mt-1">Kurikulum Induk: {selectedClass.topicName}</p>
                </div>

                <div className="p-6 md:p-8 space-y-6">
                  <h3 className="font-headline-md text-text-heading flex items-center gap-2">
                    <span className="material-symbols-outlined text-[20px] text-text-muted">edit_note</span>
                    Kelola Sesi & Materi
                  </h3>
                  <div className="grid gap-5">
                    {selectedClass.sessions.map((s, idx) => {
                      const form = sessionForms[s.id] || { zoomLink: s.zoomLink || '', zoomTime: s.zoomTime || '', videoLink: s.videoLink || '', isCompleted: s.isCompleted || false };
                      return (
                        <div key={s.id} className="border border-border-subtle p-6 rounded-2xl bg-surface hover:shadow-md transition-shadow flex flex-col gap-4">
                          <div className="flex justify-between items-center">
                            <h4 className="font-headline-md text-[18px] text-text-heading flex items-center gap-2">
                              <span className="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center text-secondary text-sm font-extrabold shrink-0">{idx + 1}</span>
                              Sesi {idx + 1}
                            </h4>
                            {s.isCompleted && (
                              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-semibold bg-tertiary/10 text-tertiary">
                                ✓ SELESAI
                              </span>
                            )}
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <label className="flex flex-col gap-1.5">
                              <span className="text-text-muted font-label-sm uppercase tracking-wider text-[11px]">Link Zoom</span>
                              <input type="text" value={form.zoomLink} onChange={e => setSessionForms({...sessionForms, [s.id]: {...form, zoomLink: e.target.value}})} className="p-3 border border-border-subtle rounded-xl bg-surface-container-lowest focus:border-secondary focus:ring-1 focus:ring-secondary outline-none transition-all" placeholder="https://zoom.us/..." />
                            </label>
                            <label className="flex flex-col gap-1.5">
                              <span className="text-text-muted font-label-sm uppercase tracking-wider text-[11px]">Waktu Kelas</span>
                              <input type="datetime-local" value={form.zoomTime} onChange={e => setSessionForms({...sessionForms, [s.id]: {...form, zoomTime: e.target.value}})} className="p-3 border border-border-subtle rounded-xl bg-surface-container-lowest focus:border-secondary focus:ring-1 focus:ring-secondary outline-none transition-all" />
                            </label>
                            <label className="flex flex-col gap-1.5">
                              <span className="text-text-muted font-label-sm uppercase tracking-wider text-[11px]">Link Rekaman Video</span>
                              <input type="text" value={form.videoLink} onChange={e => setSessionForms({...sessionForms, [s.id]: {...form, videoLink: e.target.value}})} className="p-3 border border-border-subtle rounded-xl bg-surface-container-lowest focus:border-secondary focus:ring-1 focus:ring-secondary outline-none transition-all" placeholder="Youtube / GDrive link" />
                            </label>
                            <label className="flex flex-col gap-1.5">
                              <span className="text-text-muted font-label-sm uppercase tracking-wider text-[11px]">Materi HTML</span>
                              <input type="file" accept=".html" ref={el => { fileInputRefs.current[s.id] = el; }} className="p-2.5 border border-border-subtle rounded-xl bg-surface-container-lowest text-xs file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-label-md file:bg-secondary/10 file:text-secondary" />
                              {s.materialFilePath && <span className="text-[11px] text-tertiary font-label-sm mt-1">✓ Terunggah: {s.materialFilePath.split('/').pop()}</span>}
                            </label>
                          </div>

                          <div className="flex justify-between items-center border-t border-border-subtle pt-4">
                            <label className="flex items-center gap-2 cursor-pointer font-label-md text-text-heading">
                              <input type="checkbox" checked={form.isCompleted} onChange={e => setSessionForms({...sessionForms, [s.id]: {...form, isCompleted: e.target.checked}})} className="w-4 h-4 rounded text-secondary accent-secondary" />
                              Tandai Selesai
                            </label>
                            <button onClick={() => handleSessionUpdate(selectedClass.id, s.id)} disabled={savingSession === s.id} className="px-6 py-2.5 bg-secondary text-white font-label-md rounded-xl hover:scale-[1.02] transition-transform shadow-sm disabled:opacity-50">
                              {savingSession === s.id ? 'Menyimpan...' : 'Simpan Sesi'}
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ===== TAB KURIKULUM ===== */}
          {activeTab === 'curriculum' && (
            <div className="bg-surface-container-lowest rounded-2xl border border-border-subtle shadow-sm overflow-hidden hover:shadow-md transition-shadow">
              <div className="h-2 bg-tertiary w-full"></div>
              <div className="p-6 md:p-8 space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="font-headline-md text-text-heading flex items-center gap-2">
                    <span className="material-symbols-outlined text-[20px] text-text-muted">menu_book</span>
                    Manajemen Kurikulum Master
                  </h3>
                  <button onClick={() => { setEditingTopic(null); setTopicForm({ name: '', description: '', level: '' }); setTopicModalOpen(true); }} className="px-4 py-2 bg-tertiary text-white font-label-md rounded-xl hover:scale-[1.02] transition-transform shadow-sm flex items-center gap-1">
                    <span className="material-symbols-outlined text-[18px]">add</span> Tambah Materi
                  </button>
                </div>

                {topicModalOpen && (
                  <div className="p-5 border border-tertiary/30 bg-tertiary/5 rounded-2xl">
                    <h4 className="font-label-md text-text-heading mb-3">{editingTopic ? 'Edit Materi' : 'Tambah Materi Baru'}</h4>
                    <form onSubmit={handleSaveTopic} className="flex flex-col gap-3">
                      <input type="text" placeholder="Nama Materi (misal: Matematika 1 SD)" value={topicForm.name} onChange={e => setTopicForm({...topicForm, name: e.target.value})} className="p-3 border border-border-subtle rounded-xl text-sm bg-surface-container-lowest focus:border-tertiary outline-none" required />
                      <input type="text" placeholder="Deskripsi Singkat" value={topicForm.description} onChange={e => setTopicForm({...topicForm, description: e.target.value})} className="p-3 border border-border-subtle rounded-xl text-sm bg-surface-container-lowest focus:border-tertiary outline-none" />
                      <div className="flex gap-2">
                        <button type="submit" className="px-5 py-2 bg-tertiary text-white font-label-md rounded-xl">Simpan</button>
                        <button type="button" onClick={() => setTopicModalOpen(false)} className="px-5 py-2 bg-surface-container-high text-text-body font-label-md rounded-xl">Batal</button>
                      </div>
                    </form>
                  </div>
                )}

                {subtopicModalOpen && editingSubtopic && (
                  <div className="p-5 border border-secondary/30 bg-secondary/5 rounded-2xl">
                    <h4 className="font-label-md text-text-heading mb-3">{editingSubtopic.subtopic ? 'Edit Submateri' : 'Tambah Submateri'}</h4>
                    <form onSubmit={handleSaveSubtopic} className="flex flex-col gap-3">
                      <input type="text" placeholder="Judul Submateri" value={subtopicForm.title} onChange={e => setSubtopicForm({...subtopicForm, title: e.target.value})} className="p-3 border border-border-subtle rounded-xl text-sm bg-surface-container-lowest focus:border-secondary outline-none" required />
                      <input type="number" placeholder="Urutan (opsional)" value={subtopicForm.order_index} onChange={e => setSubtopicForm({...subtopicForm, order_index: Number(e.target.value)})} className="p-3 border border-border-subtle rounded-xl text-sm bg-surface-container-lowest focus:border-secondary outline-none" />
                      <div className="flex gap-2">
                        <button type="submit" className="px-5 py-2 bg-secondary text-white font-label-md rounded-xl">Simpan</button>
                        <button type="button" onClick={() => setSubtopicModalOpen(false)} className="px-5 py-2 bg-surface-container-high text-text-body font-label-md rounded-xl">Batal</button>
                      </div>
                    </form>
                  </div>
                )}

                <div className="flex flex-col gap-4">
                  {curriculumTopics.map(t => (
                    <div key={t.id} className="border border-border-subtle rounded-2xl overflow-hidden bg-surface">
                      <div className="px-5 py-4 flex justify-between items-center cursor-pointer hover:bg-surface-container-low transition-colors" onClick={() => toggleTopicExpand(t.id)}>
                        <div>
                          <h4 className="font-label-md text-text-heading">{t.name}</h4>
                          <p className="text-text-muted font-label-sm">{t.description}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <button onClick={(e) => { e.stopPropagation(); setEditingTopic(t); setTopicForm({ name: t.name, description: t.description || '', level: t.level || '' }); setTopicModalOpen(true); }} className="text-xs text-secondary font-label-md hover:underline">Edit</button>
                          <button onClick={(e) => { e.stopPropagation(); handleDeleteTopic(t); }} className="text-xs text-error font-label-md hover:underline">Hapus</button>
                          <span className="material-symbols-outlined text-text-muted">{expandedTopics.includes(t.id) ? 'expand_less' : 'expand_more'}</span>
                        </div>
                      </div>
                      {expandedTopics.includes(t.id) && (
                        <div className="p-5 border-t border-border-subtle flex flex-col gap-3">
                          <div className="flex justify-between items-center mb-1">
                            <h5 className="font-label-md text-text-heading text-sm">Daftar Submateri (Sesi)</h5>
                            <button onClick={() => { setEditingSubtopic({ topicId: t.id, subtopic: null }); setSubtopicForm({ title: '', description: '', order_index: 0 }); setSubtopicModalOpen(true); }} className="px-3 py-1.5 bg-secondary/10 text-secondary rounded-lg font-label-sm hover:bg-secondary/20 transition-colors text-xs">
                              + Tambah
                            </button>
                          </div>
                          {t.subtopics.map((s, idx) => (
                            <div key={s.id} className="flex justify-between items-center text-sm p-3 bg-surface-container-lowest rounded-xl border border-border-subtle">
                              <span className="flex items-center gap-2">
                                <span className="w-6 h-6 rounded-md bg-secondary/10 text-secondary text-[11px] font-extrabold flex items-center justify-center">{idx+1}</span>
                                <span className="text-text-heading font-label-md">{s.title}</span>
                                <span className="ml-2 px-2 py-0.5 bg-blue-50 text-blue-600 text-[10px] font-bold rounded-full border border-blue-100">
                                  {questions.filter(q => q.topic === t.name && q.subtopic === s.title).length} Soal
                                </span>
                              </span>
                              <div className="flex gap-3">
                                <button onClick={() => { setEditingSubtopic({ topicId: t.id, subtopic: s }); setSubtopicForm({ title: s.title, description: s.description || '', order_index: s.order_index }); setSubtopicModalOpen(true); }} className="text-secondary font-label-sm hover:underline text-xs">Edit</button>
                                <button onClick={() => handleDeleteSubtopic(s)} className="text-error font-label-sm hover:underline text-xs">Hapus</button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ===== TAB QUESTION BANK ===== */}
          {activeTab === 'question-bank' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center bg-surface-container-lowest p-6 rounded-2xl border border-border-subtle shadow-sm">
                <div>
                  <h2 className="font-headline-sm text-text-heading">Bank Soal</h2>
                  <div className="flex items-center gap-3 mt-1">
                    <p className="text-text-muted font-body-sm">Kelola database soal untuk kuis dan latihan.</p>
                    <span className="text-border-subtle">|</span>
                    <button onClick={handleDownloadTemplate} className="text-secondary text-xs hover:underline font-label-md">
                      Unduh Template JSON
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <select 
                    value={filterSubtopic} 
                    onChange={e => setFilterSubtopic(e.target.value)}
                    className="bg-surface border border-border-subtle rounded-full px-4 py-2.5 text-sm font-label-md focus:outline-none focus:ring-2 focus:ring-secondary/50 text-text-heading shadow-sm"
                  >
                    <option value="">Semua Submateri</option>
                    {Array.from(new Set(questions.map(q => q.subtopic).filter(Boolean))).map(sub => (
                      <option key={sub} value={sub}>{sub}</option>
                    ))}
                  </select>
                  <input  
                    type="file" 
                    accept=".json" 
                    ref={importJsonRef}
                    style={{ display: 'none' }}
                    onChange={handleImportJson}
                  />
                  <button
                    onClick={() => importJsonRef.current?.click()}
                    className="flex items-center gap-2 bg-surface hover:bg-surface-container-low text-text-heading border border-border-subtle px-4 py-2.5 rounded-full font-label-md transition-colors"
                  >
                    <span className="material-symbols-outlined text-[20px]">upload_file</span>
                    Import JSON
                  </button>
                  <button
                    onClick={() => handleOpenQuestionModal()}
                    className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-5 py-2.5 rounded-full font-label-md transition-colors"
                  >
                    <span className="material-symbols-outlined text-[20px]">add</span>
                    Tambah Soal
                  </button>
                </div>
              </div>

              {questions.length === 0 ? (
                <div className="bg-surface-container-lowest rounded-2xl border border-border-subtle shadow-sm p-12 text-center">
                  <span className="material-symbols-outlined text-[48px] text-text-muted mb-4 block">quiz</span>
                  <h3 className="font-headline-sm text-text-heading">Belum ada soal</h3>
                  <p className="text-text-muted font-body-md mt-2">Mulai tambahkan soal ke dalam bank soal Anda.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {questions.filter(q => filterSubtopic ? q.subtopic === filterSubtopic : true).map((q) => (
                    <div key={q.id} className="bg-surface-container-lowest border border-border-subtle rounded-2xl p-6 shadow-sm flex flex-col hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-4">
                        <div className="space-y-1">
                          <span className="inline-block px-3 py-1 bg-secondary/10 text-secondary text-xs font-semibold rounded-full uppercase tracking-wide">
                            {q.topic}
                          </span>
                          <span className={`inline-block ml-2 px-3 py-1 text-xs font-semibold rounded-full uppercase tracking-wide ${
                            q.difficulty?.toLowerCase() === 'mudah' ? 'bg-green-100 text-green-700' : 
                            (q.difficulty?.toLowerCase() === 'menengah' || q.difficulty?.toLowerCase() === 'sedang') ? 'bg-yellow-100 text-yellow-700' : 
                            'bg-red-100 text-red-700'
                          }`}>
                            {q.difficulty}
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => handleOpenQuestionModal(q)} className="text-text-muted hover:text-secondary transition-colors" title="Edit">
                            <span className="material-symbols-outlined text-[20px]">edit</span>
                          </button>
                          <button onClick={() => handleDeleteQuestion(q.id!)} className="text-text-muted hover:text-red-500 transition-colors" title="Hapus">
                            <span className="material-symbols-outlined text-[20px]">delete</span>
                          </button>
                        </div>
                      </div>
                      <p className="text-text-heading font-body-md mb-4 line-clamp-3 flex-1">{q.question_text}</p>
                      
                      <div className="space-y-2 mt-auto">
                        <div className={`p-2 rounded-lg text-sm border ${q.correct_option === 'A' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-surface border-border-subtle'}`}><span className="font-bold mr-2">A.</span> {q.option_a}</div>
                        <div className={`p-2 rounded-lg text-sm border ${q.correct_option === 'B' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-surface border-border-subtle'}`}><span className="font-bold mr-2">B.</span> {q.option_b}</div>
                        <div className={`p-2 rounded-lg text-sm border ${q.correct_option === 'C' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-surface border-border-subtle'}`}><span className="font-bold mr-2">C.</span> {q.option_c}</div>
                        <div className={`p-2 rounded-lg text-sm border ${q.correct_option === 'D' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-surface border-border-subtle'}`}><span className="font-bold mr-2">D.</span> {q.option_d}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Modal Tambah/Edit Soal */}
          {isQuestionModalOpen && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-surface-container-lowest rounded-3xl w-full max-w-3xl shadow-2xl flex flex-col max-h-[90vh]">
                <div className="p-6 md:p-8 border-b border-border-subtle flex justify-between items-center bg-surface shrink-0 rounded-t-3xl">
                  <h3 className="font-headline-sm text-text-heading">
                    {editingQuestion ? 'Edit Soal' : 'Tambah Soal Baru'}
                  </h3>
                  <button onClick={() => setIsQuestionModalOpen(false)} className="text-text-muted hover:text-text-heading rounded-full p-2 hover:bg-surface-container-highest transition-colors">
                    <span className="material-symbols-outlined">close</span>
                  </button>
                </div>
                
                <div className="p-6 md:p-8 overflow-y-auto custom-scrollbar">
                  <form id="questionForm" onSubmit={handleSaveQuestion} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="block text-text-heading font-label-md">Materi *</label>
                        <select
                          required
                          value={questionForm.topic}
                          onChange={(e) => setQuestionForm({...questionForm, topic: e.target.value, subtopic: ''})}
                          className="w-full bg-surface border border-border-subtle rounded-xl px-4 py-3 font-body-md focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-secondary transition-all"
                        >
                          <option value="" disabled>Pilih Materi...</option>
                          {curriculumTopics.map(t => (
                            <option key={t.id} value={t.name}>{t.name}</option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="block text-text-heading font-label-md">Submateri (Opsional)</label>
                        <select
                          value={questionForm.subtopic}
                          onChange={(e) => setQuestionForm({...questionForm, subtopic: e.target.value})}
                          className="w-full bg-surface border border-border-subtle rounded-xl px-4 py-3 font-body-md focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-secondary transition-all"
                          disabled={!questionForm.topic}
                        >
                          <option value="">Pilih Submateri...</option>
                          {(() => {
                            const availableSubtopics = curriculumTopics.find(t => t.name === questionForm.topic)?.subtopics.map(s => s.title) || [];
                            const options = availableSubtopics.map(title => (
                              <option key={title} value={title}>{title}</option>
                            ));
                            
                            // If the question has a subtopic that isn't in the current curriculum (like from legacy data), 
                            // we show it as an option so it doesn't appear blank
                            if (questionForm.subtopic && !availableSubtopics.includes(questionForm.subtopic)) {
                              options.push(<option key={questionForm.subtopic} value={questionForm.subtopic}>{questionForm.subtopic} (Tidak Terdaftar)</option>);
                            }
                            return options;
                          })()}
                        </select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-text-heading font-label-md">Tingkat Kesulitan *</label>
                      <select
                        value={questionForm.difficulty}
                        onChange={(e) => setQuestionForm({...questionForm, difficulty: e.target.value as any})}
                        className="w-full bg-surface border border-border-subtle rounded-xl px-4 py-3 font-body-md focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-secondary transition-all"
                      >
                        <option value="Mudah">Mudah</option>
                        <option value="Menengah">Menengah</option>
                        <option value="Sulit">Sulit</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-text-heading font-label-md">Pertanyaan *</label>
                      <textarea
                        required
                        rows={4}
                        value={questionForm.question_text}
                        onChange={(e) => setQuestionForm({...questionForm, question_text: e.target.value})}
                        className="w-full bg-surface border border-border-subtle rounded-xl px-4 py-3 font-body-md focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-secondary transition-all resize-none"
                        placeholder="Tuliskan pertanyaan Anda di sini..."
                      ></textarea>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="block text-text-heading font-label-md">Opsi A *</label>
                        <input
                          type="text"
                          required
                          value={questionForm.option_a}
                          onChange={(e) => setQuestionForm({...questionForm, option_a: e.target.value})}
                          className="w-full bg-surface border border-border-subtle rounded-xl px-4 py-3 font-body-md focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-secondary transition-all"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-text-heading font-label-md">Opsi B *</label>
                        <input
                          type="text"
                          required
                          value={questionForm.option_b}
                          onChange={(e) => setQuestionForm({...questionForm, option_b: e.target.value})}
                          className="w-full bg-surface border border-border-subtle rounded-xl px-4 py-3 font-body-md focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-secondary transition-all"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-text-heading font-label-md">Opsi C *</label>
                        <input
                          type="text"
                          required
                          value={questionForm.option_c}
                          onChange={(e) => setQuestionForm({...questionForm, option_c: e.target.value})}
                          className="w-full bg-surface border border-border-subtle rounded-xl px-4 py-3 font-body-md focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-secondary transition-all"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-text-heading font-label-md">Opsi D *</label>
                        <input
                          type="text"
                          required
                          value={questionForm.option_d}
                          onChange={(e) => setQuestionForm({...questionForm, option_d: e.target.value})}
                          className="w-full bg-surface border border-border-subtle rounded-xl px-4 py-3 font-body-md focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-secondary transition-all"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-text-heading font-label-md">Kunci Jawaban *</label>
                      <select
                        value={questionForm.correct_option}
                        onChange={(e) => setQuestionForm({...questionForm, correct_option: e.target.value})}
                        className="w-full bg-surface border border-border-subtle rounded-xl px-4 py-3 font-body-md focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-secondary transition-all font-bold text-secondary"
                      >
                        <option value="A">A. {questionForm.option_a || 'Opsi A'}</option>
                        <option value="B">B. {questionForm.option_b || 'Opsi B'}</option>
                        <option value="C">C. {questionForm.option_c || 'Opsi C'}</option>
                        <option value="D">D. {questionForm.option_d || 'Opsi D'}</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-text-heading font-label-md">Pembahasan (Opsional)</label>
                      <textarea
                        rows={3}
                        value={questionForm.explanation}
                        onChange={(e) => setQuestionForm({...questionForm, explanation: e.target.value})}
                        className="w-full bg-surface border border-border-subtle rounded-xl px-4 py-3 font-body-md focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-secondary transition-all resize-none"
                        placeholder="Tuliskan pembahasan atau langkah penyelesaian..."
                      ></textarea>
                    </div>
                  </form>
                </div>
                
                <div className="p-6 md:p-8 border-t border-border-subtle flex justify-end gap-3 bg-surface shrink-0 rounded-b-3xl">
                  <button
                    type="button"
                    onClick={() => setIsQuestionModalOpen(false)}
                    className="px-6 py-2.5 rounded-full font-label-md text-text-muted hover:bg-surface-container-highest transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    form="questionForm"
                    className="bg-primary hover:bg-primary-hover text-white px-8 py-2.5 rounded-full font-label-md transition-colors"
                  >
                    Simpan Soal
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
};
