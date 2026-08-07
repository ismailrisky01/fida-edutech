import React, { useState, useEffect, useMemo, useRef } from 'react';
import { api } from '../services/api';
import type { StudentProgress, User, Topic, Subtopic, ActiveClass, ActiveSession } from '../types';

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
  const [activeTab, setActiveTab] = useState<'students' | 'classes' | 'question-bank' | 'curriculum'>('students');
  const [students, setStudents] = useState<StudentProgress[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<StudentProgress | null>(null);

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

  // Database Soal state
          
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
      await api.getManualQuestions();
      
    } else if (activeTab === 'curriculum') {
      const cur = await api.getCurriculum();
      setCurriculumTopics(cur);
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
    if (confirm(`Hapus topik "${topic.name}" beserta semua submateri di dalamnya?`)) {
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
    <div className="bg-slate-50 min-h-screen flex flex-col font-body-md relative">
      {/* DECORATIVE BANNER DENGAN OPACITY RENDAH */}
      <div className="absolute top-0 left-0 w-full h-[400px] bg-gradient-to-b from-primary/10 via-blue-500/5 to-transparent pointer-events-none z-0"></div>
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-blue-400/20 rounded-full blur-[120px] pointer-events-none z-0"></div>
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-400/10 rounded-full blur-[100px] pointer-events-none z-0"></div>

      {/* HEADER */}
      <header className="bg-white/70 backdrop-blur-xl border-b border-white/50 sticky top-0 z-30 shadow-sm px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <button onClick={onGoToLanding} className="text-text-muted hover:text-secondary transition-colors">
            <span className="material-symbols-outlined text-[28px]">home</span>
          </button>
          <div className="font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary via-blue-600 to-indigo-600 text-xl flex items-center gap-2 tracking-tight">
            LMS TENTOR & ADMIN
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <div className="text-sm font-bold text-slate-700">{currentUser.name}</div>
            <div className="text-xs text-slate-500">{currentUser.email}</div>
          </div>
          <button onClick={onLogout} className="text-slate-400 hover:text-red-500 transition-colors p-2 hover:bg-red-50 rounded-full">
            <span className="material-symbols-outlined text-[24px]">logout</span>
          </button>
        </div>
      </header>

      <div className="flex flex-col lg:flex-row max-w-container-max w-full mx-auto p-4 md:p-6 gap-6 relative z-10">
        {/* SIDEBAR */}
        <aside className="w-full lg:w-64 shrink-0 flex flex-col">
          <div className="bg-white/60 backdrop-blur-xl p-5 rounded-3xl border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col gap-2 h-full">
            <button onClick={() => { setActiveTab('students'); setSelectedStudent(null); }} className={`p-3 rounded-xl text-left flex items-center gap-3 ${activeTab === 'students' ? 'bg-gradient-to-r from-secondary/20 to-secondary/5 text-secondary font-extrabold shadow-sm translate-x-1' : 'hover:bg-slate-100 hover:translate-x-1 transition-all duration-300 font-semibold text-text-body'}`}><span className="material-symbols-outlined">group</span> Data Siswa</button>
            <button onClick={() => { setActiveTab('classes'); setSelectedClass(null); }} className={`p-3 rounded-xl text-left flex items-center gap-3 ${activeTab === 'classes' ? 'bg-gradient-to-r from-blue-600/20 to-blue-600/5 text-blue-700 font-extrabold shadow-sm translate-x-1' : 'hover:bg-slate-100 hover:translate-x-1 transition-all duration-300 font-semibold text-text-body'}`}><span className="material-symbols-outlined">class</span> Manajemen Kelas</button>
            <button onClick={() => setActiveTab('curriculum')} className={`p-3 rounded-xl text-left flex items-center gap-3 ${activeTab === 'curriculum' ? 'bg-gradient-to-r from-green-600/20 to-green-600/5 text-green-700 font-extrabold shadow-sm translate-x-1' : 'hover:bg-slate-100 hover:translate-x-1 transition-all duration-300 font-semibold text-text-body'}`}><span className="material-symbols-outlined">menu_book</span> Manajemen Kurikulum</button>
            <button onClick={() => setActiveTab('question-bank')} className={`p-3 rounded-xl text-left flex items-center gap-3 ${activeTab === 'question-bank' ? 'bg-primary/10 text-primary font-bold' : 'hover:bg-slate-100 hover:translate-x-1 transition-all duration-300 font-semibold text-text-body'}`}><span className="material-symbols-outlined">library_books</span> Database Soal</button>
          </div>
        </aside>

        {/* MAIN */}
        <main className="grow flex flex-col gap-6">
          {/* TAB SISWA */}
          {activeTab === 'students' && !selectedStudent && (
            <div className="bg-white rounded-3xl border border-border-subtle shadow-sm flex flex-col">
              <div className="px-6 py-5 border-b border-border-subtle flex justify-between items-center">
                <h2 className="font-bold text-xl">Daftar Siswa</h2>
              </div>
              <div className="divide-y divide-border-subtle">
                {groupedStudents.map(gs => {
                  const allPreScores = gs.courses.filter(c => c.averagePreScore > 0).map(c => c.averagePreScore);
                  const allPostScores = gs.courses.filter(c => c.averagePostScore > 0).map(c => c.averagePostScore);
                  const avgPre = allPreScores.length > 0 ? Math.round(allPreScores.reduce((a, b) => a + b, 0) / allPreScores.length) : 0;
                  const avgPost = allPostScores.length > 0 ? Math.round(allPostScores.reduce((a, b) => a + b, 0) / allPostScores.length) : 0;
                  
                  return (
                    <div key={gs.studentId} className="px-6 py-5 flex flex-col gap-3 hover:bg-slate-50/50 transition-colors group">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-blue-600 text-white flex justify-center items-center font-extrabold shadow-md transform group-hover:scale-110 transition-transform">{gs.studentName.charAt(0)}</div>
                        <div className="w-48 flex-shrink-0">
                          <div className="font-bold text-sm truncate">{gs.studentName}</div>
                          <div className="text-xs text-text-muted truncate">{gs.studentEmail}</div>
                        </div>
                        <div className="flex gap-4 ml-auto items-center">
                          <div className="text-center w-14"><span className="text-[10px] text-text-muted block">Kelas</span><span className="font-bold text-sm">{gs.courses.length}</span></div>
                          <div className="text-center w-14"><span className="text-[10px] text-text-muted block">Pre-Test</span><span className="font-bold text-orange-500 text-sm">{avgPre}</span></div>
                          <div className="text-center w-14"><span className="text-[10px] text-text-muted block">Post-Test</span><span className="font-bold text-green-600 text-sm">{avgPost}</span></div>
                          
                          {assigningStudentId === gs.studentId ? (
                            <div className="flex items-center gap-2">
                              <select value={assignCourseId} onChange={e => setAssignCourseId(Number(e.target.value) || '')} className="p-1 text-xs border rounded">
                                <option value="" disabled>Pilih Kelas</option>
                                {activeClasses.filter(c => !gs.courses.some(gc => gc.courseId === c.id)).map(c => (
                                  <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                              </select>
                              <button onClick={handleAssignCourse} className="px-2 py-1 bg-green-600 text-white text-xs rounded">OK</button>
                              <button onClick={() => setAssigningStudentId(null)} className="px-2 py-1 bg-red-100 text-red-600 text-xs rounded">X</button>
                            </div>
                          ) : (
                            <button onClick={() => setAssigningStudentId(gs.studentId)} className="px-3 py-1 bg-amber-500 text-white text-xs rounded-lg font-bold">Assign Kelas</button>
                          )}
                          <button onClick={() => setSelectedStudent(students.find(s => s.studentId === gs.studentId) || null)} className="px-3 py-1 bg-secondary text-white text-xs rounded-lg font-bold">Detail</button>
                        </div>
                      </div>
                      <div className="flex gap-1.5 ml-14">
                        {gs.courses.map(c => <span key={c.courseId} className="px-2 py-0.5 bg-slate-100 border text-[10px] rounded-full">{c.courseName}</span>)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB DETAIL SISWA (HANYA RAPOR NILAI) */}
          {activeTab === 'students' && selectedStudent && (
            <div className="flex flex-col gap-4">
              <button onClick={() => setSelectedStudent(null)} className="text-sm font-bold flex items-center gap-1"><span className="material-symbols-outlined">arrow_back</span> Kembali</button>
              <div className="bg-white p-6 rounded-3xl border">
                <h2 className="text-xl font-bold">{selectedStudent.studentName}</h2>
                <button onClick={handleDeleteStudent} className="text-xs text-red-500 mt-2">Hapus Siswa</button>
                <div className="mt-4">
                  <h3 className="font-bold">Rapor Nilai - {selectedStudent.courseName}</h3>
                  <div className="grid grid-cols-2 gap-4 mt-2">
                    {allSessions.map(s => (
                      <div key={s.sessionId} className="p-3 border rounded-xl bg-slate-50">
                        <div className="font-bold text-xs">{s.sessionTitle}</div>
                        <div className="flex justify-between mt-2 text-sm">
                          <span>Pre: <b className="text-orange-500">{s.preScore ?? '-'}</b></span>
                          <span>Post: <b className="text-green-600">{s.postScore ?? '-'}</b></span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB MANAJEMEN KELAS */}
          {activeTab === 'classes' && !selectedClass && (
            <div className="flex flex-col gap-6">
              <div className="bg-white p-6 rounded-3xl border shadow-sm flex flex-col gap-4">
                <h3 className="font-bold text-lg flex items-center gap-2"><span className="material-symbols-outlined">add_box</span> Buat Kelas Baru</h3>
                <form onSubmit={handleCreateClass} className="flex gap-4">
                  <input type="text" placeholder="Nama Kelas (Misal: Matematika Batch 1)" value={classForm.name} onChange={e => setClassForm({ ...classForm, name: e.target.value })} required className="flex-grow p-2 border rounded-xl text-sm" />
                  <select value={classForm.topicId} onChange={e => setClassForm({ ...classForm, topicId: e.target.value })} required className="p-2 border rounded-xl text-sm">
                    <option value="" disabled>Pilih Kurikulum Master</option>
                    {curriculumTopics.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                  <button type="submit" disabled={isCreatingClass} className="bg-primary text-white font-bold px-4 rounded-xl text-sm">{isCreatingClass ? 'Membuat...' : 'Buat Kelas'}</button>
                </form>
              </div>

              <div className="bg-white/80 backdrop-blur-md rounded-3xl border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                <div className="px-6 py-4 border-b"><h3 className="font-bold text-lg">Daftar Kelas Aktif</h3></div>
                <div className="p-4 grid gap-4 md:grid-cols-2">
                  {activeClasses.map(c => (
                    <div key={c.id} className="p-5 border border-border-subtle rounded-3xl bg-white hover:border-secondary hover:shadow-xl hover:-translate-y-1 cursor-pointer transition-all duration-300 flex flex-col gap-2 group" onClick={() => setSelectedClass(c)}>
                      <h4 className="font-extrabold text-xl text-primary group-hover:text-secondary transition-colors tracking-tight">{c.name}</h4>
                      <p className="text-xs text-text-muted">Kurikulum: {c.topicName}</p>
                      <div className="mt-auto flex justify-between items-center border-t border-slate-100 pt-3 mt-3">
                        <span className="text-[11px] font-extrabold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-full">{c.sessions.length} Sesi</span>
                        <span className="text-secondary font-bold text-xs">Kelola <span className="material-symbols-outlined text-[14px]">arrow_forward</span></span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB DETAIL KELAS */}
          {activeTab === 'classes' && selectedClass && (
            <div className="flex flex-col gap-4">
              <button onClick={() => setSelectedClass(null)} className="text-sm font-bold flex items-center gap-1"><span className="material-symbols-outlined">arrow_back</span> Daftar Kelas</button>
              
              <div className="bg-white rounded-3xl border shadow-sm overflow-hidden">
                <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-primary p-8 text-white relative overflow-hidden">
                  <h2 className="font-extrabold text-3xl mb-1 drop-shadow-md">{selectedClass.name}</h2>
                  <p className="text-white/80 text-sm">Kurikulum Induk: {selectedClass.topicName}</p>
                  <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -translate-y-1/2 translate-x-1/4 blur-2xl"></div>
                </div>
                
                <div className="p-6 flex flex-col gap-4">
                  <h3 className="font-bold text-lg">Kelola Sesi & Materi</h3>
                  <div className="grid gap-4">
                    {selectedClass.sessions.map((s, idx) => {
                      const form = sessionForms[s.id] || { zoomLink: s.zoomLink || '', zoomTime: s.zoomTime || '', videoLink: s.videoLink || '', isCompleted: s.isCompleted || false };
                      return (
                        <div key={s.id} className="border border-border-subtle p-5 rounded-3xl bg-white shadow-sm hover:shadow-md transition-shadow flex flex-col gap-4">
                          <div className="flex justify-between items-center">
                            <h4 className="font-extrabold text-lg text-text-heading">Sesi {idx + 1}</h4>
                            {s.isCompleted && <span className="text-[10px] bg-green-100 text-green-700 px-2 py-1 rounded-full font-bold">SELESAI</span>}
                          </div>
                          
                          <div className="grid grid-cols-2 gap-3 text-sm">
                            <label className="flex flex-col gap-1.5 text-xs font-bold text-text-muted uppercase tracking-wider">Link Zoom
                              <input type="text" value={form.zoomLink} onChange={e => setSessionForms({...sessionForms, [s.id]: {...form, zoomLink: e.target.value}})} className="p-2.5 border border-border-subtle rounded-xl font-normal bg-slate-50 focus:bg-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" placeholder="https://zoom.us/..." />
                            </label>
                            <label className="flex flex-col gap-1.5 text-xs font-bold text-text-muted uppercase tracking-wider">Waktu Kelas
                              <input type="datetime-local" value={form.zoomTime} onChange={e => setSessionForms({...sessionForms, [s.id]: {...form, zoomTime: e.target.value}})} className="p-2.5 border border-border-subtle rounded-xl font-normal bg-slate-50 focus:bg-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" />
                            </label>
                            <label className="flex flex-col gap-1.5 text-xs font-bold text-text-muted uppercase tracking-wider">Link Rekaman Video
                              <input type="text" value={form.videoLink} onChange={e => setSessionForms({...sessionForms, [s.id]: {...form, videoLink: e.target.value}})} className="p-2.5 border border-border-subtle rounded-xl font-normal bg-slate-50 focus:bg-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" placeholder="Youtube / GDrive link" />
                            </label>
                            <label className="flex flex-col gap-1.5 text-xs font-bold text-text-muted uppercase tracking-wider">Materi HTML
                              <input type="file" accept=".html" ref={el => { fileInputRefs.current[s.id] = el; }} className="p-1 border rounded font-normal bg-white text-xs" />
                              {s.materialFilePath && <span className="text-[10px] text-green-600">Terunggah: {s.materialFilePath.split('/').pop()}</span>}
                            </label>
                          </div>
                          
                          <div className="flex justify-between items-center mt-2 border-t pt-3">
                            <label className="flex items-center gap-2 cursor-pointer font-bold text-sm">
                              <input type="checkbox" checked={form.isCompleted} onChange={e => setSessionForms({...sessionForms, [s.id]: {...form, isCompleted: e.target.checked}})} className="w-4 h-4 rounded text-primary" />
                              Tandai Selesai
                            </label>
                            <button onClick={() => handleSessionUpdate(selectedClass.id, s.id)} disabled={savingSession === s.id} className="bg-secondary hover:bg-secondary/90 text-white font-bold px-5 py-2 rounded-xl text-sm shadow-md hover:shadow-lg transition-all active:scale-95">
                              {savingSession === s.id ? 'Menyimpan...' : 'Simpan'}
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

          {/* TAB KURIKULUM */}
          {activeTab === 'curriculum' && (
            <div className="bg-white rounded-3xl border shadow-sm p-6 flex flex-col gap-4">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-xl">Manajemen Kurikulum Master</h3>
                <button onClick={() => { setEditingTopic(null); setTopicForm({ name: '', description: '', level: '' }); setTopicModalOpen(true); }} className="bg-green-600 text-white font-bold px-4 py-2 rounded-xl text-sm flex items-center gap-1">
                  <span className="material-symbols-outlined text-[18px]">add</span> Tambah Topik
                </button>
              </div>

              {topicModalOpen && (
                <div className="p-4 border border-green-200 bg-green-50 rounded-xl">
                  <h4 className="font-bold mb-2">{editingTopic ? 'Edit Topik' : 'Tambah Topik Baru'}</h4>
                  <form onSubmit={handleSaveTopic} className="flex flex-col gap-3">
                    <input type="text" placeholder="Nama Topik (misal: Matematika 1 SD)" value={topicForm.name} onChange={e => setTopicForm({...topicForm, name: e.target.value})} className="p-2 border rounded text-sm" required />
                    <input type="text" placeholder="Deskripsi Singkat" value={topicForm.description} onChange={e => setTopicForm({...topicForm, description: e.target.value})} className="p-2 border rounded text-sm" />
                    <div className="flex gap-2">
                      <button type="submit" className="bg-green-600 text-white font-bold px-4 py-1.5 rounded">Simpan</button>
                      <button type="button" onClick={() => setTopicModalOpen(false)} className="bg-slate-200 px-4 py-1.5 rounded font-bold">Batal</button>
                    </div>
                  </form>
                </div>
              )}

              {subtopicModalOpen && editingSubtopic && (
                <div className="p-4 border border-blue-200 bg-blue-50 rounded-xl">
                  <h4 className="font-bold mb-2">{editingSubtopic.subtopic ? 'Edit Submateri' : 'Tambah Submateri'}</h4>
                  <form onSubmit={handleSaveSubtopic} className="flex flex-col gap-3">
                    <input type="text" placeholder="Judul Submateri" value={subtopicForm.title} onChange={e => setSubtopicForm({...subtopicForm, title: e.target.value})} className="p-2 border rounded text-sm" required />
                    <input type="number" placeholder="Urutan (opsional)" value={subtopicForm.order_index} onChange={e => setSubtopicForm({...subtopicForm, order_index: Number(e.target.value)})} className="p-2 border rounded text-sm" />
                    <div className="flex gap-2">
                      <button type="submit" className="bg-blue-600 text-white font-bold px-4 py-1.5 rounded">Simpan</button>
                      <button type="button" onClick={() => setSubtopicModalOpen(false)} className="bg-slate-200 px-4 py-1.5 rounded font-bold">Batal</button>
                    </div>
                  </form>
                </div>
              )}

              <div className="flex flex-col gap-3">
                {curriculumTopics.map(t => (
                  <div key={t.id} className="border rounded-xl overflow-hidden">
                    <div className="bg-slate-50 px-4 py-3 flex justify-between items-center cursor-pointer" onClick={() => toggleTopicExpand(t.id)}>
                      <div>
                        <h4 className="font-bold text-primary">{t.name}</h4>
                        <p className="text-xs text-text-muted">{t.description}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={(e) => { e.stopPropagation(); setEditingTopic(t); setTopicForm({ name: t.name, description: t.description || '', level: t.level || '' }); setTopicModalOpen(true); }} className="text-xs text-blue-600 font-bold">Edit</button>
                        <button onClick={(e) => { e.stopPropagation(); handleDeleteTopic(t); }} className="text-xs text-red-600 font-bold">Hapus</button>
                        <span className="material-symbols-outlined">{expandedTopics.includes(t.id) ? 'expand_less' : 'expand_more'}</span>
                      </div>
                    </div>
                    {expandedTopics.includes(t.id) && (
                      <div className="p-4 border-t flex flex-col gap-2">
                        <div className="flex justify-between items-center mb-2">
                          <h5 className="font-bold text-sm">Daftar Submateri (Sesi)</h5>
                          <button onClick={() => { setEditingSubtopic({ topicId: t.id, subtopic: null }); setSubtopicForm({ title: '', description: '', order_index: 0 }); setSubtopicModalOpen(true); }} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded font-bold">+ Tambah</button>
                        </div>
                        {t.subtopics.map((s, idx) => (
                          <div key={s.id} className="flex justify-between items-center text-sm p-2 bg-slate-50 rounded border">
                            <span><strong className="text-text-muted mr-2">#{idx+1}</strong> {s.title}</span>
                            <div className="flex gap-2">
                              <button onClick={() => { setEditingSubtopic({ topicId: t.id, subtopic: s }); setSubtopicForm({ title: s.title, description: s.description || '', order_index: s.order_index }); setSubtopicModalOpen(true); }} className="text-blue-600">Edit</button>
                              <button onClick={() => handleDeleteSubtopic(s)} className="text-red-600">Hapus</button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB QUESTION BANK */}
          {activeTab === 'question-bank' && (
            <div className="bg-white rounded-3xl border shadow-sm p-6 text-center text-text-muted">
              Fitur Bank Soal manual tersedia pada pembaruan mendatang (UI di-sederhanakan untuk preview fitur Kelas).
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
