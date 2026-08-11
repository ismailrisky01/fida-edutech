import React, { useState, useEffect } from 'react';
import type { Course, Session, User } from '../types';
import { api } from '../services/api';

interface StudentDashboardProps {
  currentUser: User;
  courses: Course[];
  onLogout: () => void;
  onGoToLanding: () => void;
  selectedCourseId: number | null;
  onStartQuiz: (sessionId: number, type: 'pre' | 'post' | 'practice', topic: string, difficulty: string) => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  currentUser,
  courses,
  onLogout,
  onGoToLanding,
  selectedCourseId,
  onStartQuiz
}) => {
  const [activeCourseId, setActiveCourseId] = useState<number | null>(selectedCourseId || courses[0]?.id || null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [zoomError, setZoomError] = useState<string | null>(null);
  const [zoomSuccessUrl, setZoomSuccessUrl] = useState<string | null>(null);
  const [loadingZoom, setLoadingZoom] = useState(false);
  const [activeMenu, setActiveMenu] = useState<'dashboard' | 'practice' | 'profile'>('dashboard');
  
  // State baru untuk viewMode
  const [viewMode, setViewMode] = useState<'overview' | 'learning'>('overview');

  // State untuk form latihan
  const [practiceCourseId, setPracticeCourseId] = useState<number | null>(null);
  const [practiceSessionId, setPracticeSessionId] = useState<number | null>(null);
  const [isRandomPractice, setIsRandomPractice] = useState<boolean>(false);
  const [practiceSessions, setPracticeSessions] = useState<Session[]>([]);

  useEffect(() => {
    const fetchPracticeSessions = async () => {
      if (!practiceCourseId) return;
      const data = await api.getSessions(practiceCourseId as number);
      setPracticeSessions(data);
      if (data.length > 0) {
        setPracticeSessionId(data[0].id);
      } else {
        setPracticeSessionId(null);
      }
    };
    fetchPracticeSessions();
  }, [practiceCourseId]);

  useEffect(() => {
    const fetchSessions = async () => {
      const data = await api.getSessions(activeCourseId as number);
      setSessions(data);
      if (data.length > 0) {
        setSelectedSession(data[0]);
      } else {
        setSelectedSession(null);
      }
      setZoomError(null);
      setZoomSuccessUrl(null);
    };
    fetchSessions();
  }, [activeCourseId]);

  const handleJoinZoom = async (sessionId: number) => {
    setZoomError(null);
    setZoomSuccessUrl(null);
    setLoadingZoom(true);

    // Call protected zoom endpoint
    const res = await api.getProtectedZoomLink(activeCourseId as number, sessionId);
    setLoadingZoom(false);

    if (res.zoomLink) {
      setZoomSuccessUrl(res.zoomLink);
      window.open(res.zoomLink, '_blank');
    } else {
      setZoomError(res.error || 'Gagal mengakses Zoom Link.');
    }
  };

  const activeCourse = courses.find(c => c.id === activeCourseId);

  // Statistics
  const completedPreCount = sessions.filter(s => s.preTestScore !== null && s.preTestScore !== undefined).length;
  const completedPostCount = sessions.filter(s => s.postTestScore !== null && s.postTestScore !== undefined).length;
  
  const avgPreScore = completedPreCount > 0 
    ? Math.round(sessions.reduce((sum, s) => sum + (s.preTestScore || 0), 0) / completedPreCount)
    : 0;

  const avgPostScore = completedPostCount > 0
    ? Math.round(sessions.reduce((sum, s) => sum + (s.postTestScore || 0), 0) / completedPostCount)
    : 0;

  return (
    <div className="bg-background min-h-screen flex flex-col font-body-md">
      {/* Header Dashboard */}
      <header className="bg-white border-b border-border-subtle sticky top-0 z-30 shadow-sm px-6 py-4 flex flex-wrap justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          <button 
            onClick={onGoToLanding}
            className="flex items-center gap-1.5 text-text-muted hover:text-secondary font-semibold transition-colors"
            title="Kembali ke Beranda"
          >
            <span className="material-symbols-outlined text-[28px]">home</span>
          </button>
          <span className="text-border-subtle">|</span>
          <div className="font-headline-md font-extrabold flex items-center gap-2">
            <img 
              alt="Logo" 
              className="h-7 w-auto" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDYFIFGV115SAiQMFBhhqYvT5pn0pVM_OTKzo9Vjrlj5QleL6iA1M7kJh7ZAmprRwqhTA8E4ANqwFNTH2c9n8up5w0e1QQXzD34hMOxoWy1cczUPBgSNJaB7EpYHFMDI5zTBTC9O9zxoot_yJzQmlZ5uVKi6_pc4BJr78Nqew6g_vjwjSJ_h0YlGtrwmvsJ_DxzuaG-RSV3l_EJIuANQfRD5VNWzxcvU8Zq0BVIqOv8jLhqJsmtISuiFYv_HZaLPwx_aAc"
            />
            <span className="hidden sm:inline text-xl text-blue-600 tracking-wider">LMS SISWA</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-sm font-bold text-text-heading">{currentUser.name}</div>
            <div className="text-xs text-text-muted">{currentUser.email}</div>
          </div>
          <div className="w-10 h-10 rounded-full bg-secondary-fixed text-secondary font-bold flex items-center justify-center">
            {currentUser.name.charAt(0).toUpperCase()}
          </div>
        </div>
      </header>

      <div className="flex-grow flex flex-col lg:flex-row max-w-[1400px] w-full mx-auto p-4 md:p-6 gap-6">
        
        {/* Sidebar Kiri - Main Menu Navigasi */}
        <aside className="w-full lg:w-72 flex-shrink-0 flex flex-col gap-6">
          <div className="bg-white p-5 rounded-3xl border border-border-subtle shadow-sm flex flex-col gap-2 h-full">
            <button
              onClick={() => {
                setActiveMenu('dashboard');
                setViewMode('overview');
              }}
              className={`w-full p-3 rounded-xl text-left flex items-center gap-3 transition-all ${
                activeMenu === 'dashboard'
                  ? 'bg-secondary/10 text-secondary font-bold'
                  : 'hover:bg-slate-50 text-text-body font-semibold'
              }`}
            >
              <span className="material-symbols-outlined">dashboard</span>
              Dashboard
            </button>
            <button
              onClick={() => setActiveMenu('practice')}
              className={`w-full p-3 rounded-xl text-left flex items-center gap-3 transition-all ${
                activeMenu === 'practice'
                  ? 'bg-secondary/10 text-secondary font-bold'
                  : 'hover:bg-slate-50 text-text-body font-semibold'
              }`}
            >
              <span className="material-symbols-outlined">quiz</span>
              Latihan Soal
            </button>
            <button
              onClick={() => setActiveMenu('profile')}
              className={`w-full p-3 rounded-xl text-left flex items-center gap-3 transition-all ${
                activeMenu === 'profile'
                  ? 'bg-secondary/10 text-secondary font-bold'
                  : 'hover:bg-slate-50 text-text-body font-semibold'
              }`}
            >
              <span className="material-symbols-outlined">person</span>
              Profil Siswa
            </button>
            <button
              onClick={onLogout}
              className="mt-auto w-full p-3 rounded-xl text-left flex items-center gap-3 transition-all text-error hover:bg-error/5 font-semibold"
            >
              <span className="material-symbols-outlined">logout</span>
              Keluar
            </button>
          </div>
        </aside>

        {/* Area Utama */}
        <main className="flex-grow flex flex-col gap-6 w-full min-w-0">
          
          {activeMenu === 'dashboard' && (
            <>
              {viewMode === 'overview' ? (
                /* --- TAMPILAN OVERVIEW --- */
                <div className="flex flex-col gap-6">
                  {/* Hero / Welcome Banner */}
                  <div 
                    className="rounded-3xl p-8 flex flex-col md:flex-row justify-between items-center gap-6 border border-secondary/20"
                    style={{
                      backgroundImage: 'linear-gradient(rgba(240, 244, 255, 0.85), rgba(240, 244, 255, 0.85)), url("/bg_dashboard.png")',
                      backgroundSize: 'cover',
                      backgroundPosition: 'center'
                    }}
                  >
                    <div>
                      <h2 className="text-3xl font-extrabold text-secondary mb-2">Selamat Datang, {currentUser.name}!</h2>
                      <p className="text-secondary/80 font-medium">Siap untuk melanjutkan petualangan belajarmu hari ini?</p>
                    </div>
                    {/* Stats */}
                    <div className="flex gap-4">
                      <div className="bg-white p-4 rounded-2xl shadow-sm border border-border-subtle text-center min-w-[110px]">
                        <div className="text-xs text-text-muted font-bold uppercase mb-1">Kehadiran</div>
                        <div className="text-2xl font-extrabold text-text-heading">{completedPreCount}/{sessions.length}</div>
                      </div>
                      <div className="bg-white p-4 rounded-2xl shadow-sm border border-border-subtle text-center min-w-[110px]">
                        <div className="text-xs text-text-muted font-bold uppercase mb-1">Rata-rata Nilai</div>
                        <div className="text-2xl font-extrabold text-green-600">{avgPostScore || avgPreScore || 0}</div>
                      </div>
                    </div>
                  </div>

                  {/* Daftar Kelas Saya (Grid Cards) */}
                  <div>
                    <h3 className="font-headline-md font-bold text-text-heading text-xl mb-4 flex items-center gap-2">
                      <span className="material-symbols-outlined text-secondary">class</span>
                      Kelas Saya
                    </h3>
                    {courses.length === 0 ? (
                      <div className="col-span-full py-16 text-center flex flex-col items-center gap-4">
                        <div className="w-20 h-20 rounded-full bg-amber-50 flex items-center justify-center">
                          <span className="material-symbols-outlined text-[40px] text-amber-400">school</span>
                        </div>
                        <div>
                          <h4 className="font-bold text-text-heading text-lg">Belum Ada Kelas</h4>
                          <p className="text-sm text-text-muted mt-1 max-w-sm mx-auto">
                            Tutor belum mendaftarkan kelas untuk kamu. Hubungi tutor untuk memulai perjalanan belajarmu!
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {courses.map(course => (
                          <button
                            key={course.id}
                            onClick={() => {
                              setActiveCourseId(course.id);
                              setViewMode('learning');
                            }}
                            className={`flex flex-col text-left p-6 rounded-3xl border transition-all hover:-translate-y-1 hover:shadow-md ${course.borderColorClass} ${course.bgColorClass}`}
                          >
                            <div className={`w-14 h-14 rounded-2xl mb-4 flex items-center justify-center ${course.colorClass} bg-white shadow-sm`}>
                              <span className="material-symbols-outlined text-[32px]">{course.icon}</span>
                            </div>
                            <h4 className="font-bold text-lg mb-1 text-text-heading">{course.name}</h4>
                            <p className="text-sm text-text-muted mb-6">{course.sessionsCount} Sesi Pembelajaran</p>
                            
                            <div className="mt-auto pt-4 border-t border-black/5 text-sm font-bold flex justify-between items-center text-text-heading">
                              Lanjutkan Belajar <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                /* --- TAMPILAN RUANG BELAJAR (COURSE VIEW) --- */
                <div className="flex flex-col gap-6">
                  
                  {/* Header Kelas */}
                  <div className="flex flex-wrap items-center justify-between bg-white p-4 rounded-3xl shadow-sm border border-border-subtle gap-4">
                    <div className="flex items-center gap-4">
                      <button 
                        onClick={() => setViewMode('overview')} 
                        className="w-10 h-10 rounded-full hover:bg-slate-100 text-text-muted transition-colors flex items-center justify-center border border-transparent hover:border-border-subtle"
                        title="Kembali ke Dashboard"
                      >
                        <span className="material-symbols-outlined">arrow_back</span>
                      </button>
                      <div>
                        <div className="text-xs font-bold text-secondary uppercase tracking-wider">{activeCourse?.name}</div>
                        <h2 className="text-xl font-extrabold text-text-heading">{selectedSession?.title || 'Pilih Sesi'}</h2>
                      </div>
                    </div>
                  </div>

                  {/* Layout 2 Kolom (70% Kiri, 30% Kanan) */}
                  <div className="flex flex-col lg:flex-row gap-6 items-start">
                    
                    {/* KOLOM KIRI: Detail Sesi (70%) */}
                    <div className="w-full lg:w-[70%] flex flex-col gap-6">
                      {selectedSession ? (
                        <div className="bg-white p-6 md:p-8 rounded-3xl border border-border-subtle shadow-sm flex flex-col gap-8">
                          
                          {/* Info Sesi */}
                          <div>
                            <p className="font-body-md text-text-body leading-relaxed text-lg">
                              {selectedSession.description}
                            </p>
                          </div>

                          {/* Secure Zoom Link Panel */}
                          <div className="p-6 rounded-2xl border border-border-subtle bg-slate-50/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                            <div className="flex gap-4">
                              <div className="w-12 h-12 rounded-2xl bg-secondary/15 flex items-center justify-center text-secondary-container">
                                <span className="material-symbols-outlined text-[28px]">video_chat</span>
                              </div>
                              <div>
                                <h4 className="font-bold text-text-heading text-sm uppercase tracking-wider">Kelas Live Zoom</h4>
                                <p className="text-xs text-text-muted mt-1 flex items-center gap-1">
                                  <span className="material-symbols-outlined text-[14px]">alarm</span>
                                  {(() => {
                                    if (!selectedSession.zoomTime || selectedSession.zoomTime === 'Belum dijadwalkan') {
                                      return 'Jadwal belum dikonfirmasi';
                                    }
                                    try {
                                      const d = new Date(selectedSession.zoomTime);
                                      if (!isNaN(d.getTime())) {
                                        return d.toLocaleString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }) + ' WIB';
                                      }
                                    } catch {}
                                    return selectedSession.zoomTime;
                                  })()}
                                </p>
                              </div>
                            </div>

                            <div className="w-full md:w-auto flex flex-col items-stretch md:items-end gap-2">
                              <button
                                onClick={() => handleJoinZoom(selectedSession.id)}
                                disabled={loadingZoom}
                                className="px-6 py-3 rounded-xl bg-secondary hover:bg-secondary/95 text-white font-bold text-sm shadow-md hover:scale-[1.02] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                              >
                                {loadingZoom ? 'Menghubungkan...' : 'Masuk Kelas Live'}
                                <span className="material-symbols-outlined text-[18px]">open_in_new</span>
                              </button>
                              <span className="text-[10px] text-text-muted text-center md:text-right italic">
                                *Link Zoom dilindungi JWT, aktif 15 menit sebelum kelas dimulai.
                              </span>
                            </div>
                          </div>

                          {/* Zoom Error/Success Alerts */}
                          {zoomError && (
                            <div className="p-4 bg-error-container text-on-error-container text-sm rounded-2xl flex items-start gap-2 border border-error/10">
                              <span className="material-symbols-outlined text-[20px] mt-0.5">warning</span>
                              <div>
                                <div className="font-bold">Akses Ditolak (Security Link Protection)</div>
                                <div className="text-xs mt-1 leading-relaxed">{zoomError}</div>
                              </div>
                            </div>
                          )}

                          {zoomSuccessUrl && (
                            <div className="p-4 bg-green-100 text-green-800 text-sm rounded-2xl flex items-start gap-2 border border-green-200">
                              <span className="material-symbols-outlined text-[20px] mt-0.5">check_circle</span>
                              <div>
                                <div className="font-bold">Link Berhasil Terotentikasi!</div>
                                <div className="text-xs mt-1 leading-relaxed">Membuka zoom... Jika tidak terbuka otomatis, klik: <a href={zoomSuccessUrl} target="_blank" rel="noreferrer" className="underline font-bold text-secondary">{zoomSuccessUrl}</a></div>
                              </div>
                            </div>
                          )}

                          {/* Evaluasi Pre-Test dan Post-Test */}
                          <div className="border-t border-border-subtle pt-8">
                            <h3 className="font-headline-md font-bold text-text-heading text-lg mb-6 flex items-center gap-2">
                              <span className="material-symbols-outlined text-primary">assignment_turned_in</span>
                              Kuis Evaluasi Sesi
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              {/* Card Pre-Test */}
                              <div className="p-6 rounded-2xl border border-border-subtle bg-white shadow-sm flex flex-col justify-between gap-6 hover:border-slate-300 transition-colors">
                                <div>
                                  <div className="flex justify-between items-start">
                                    <span className="text-[11px] font-bold text-orange-600 bg-orange-100 px-2 py-0.5 rounded-md uppercase">Pre-Test</span>
                                    {selectedSession.preTestScore !== null && selectedSession.preTestScore !== undefined ? (
                                      <div className="text-right">
                                        <span className="text-xs text-text-muted block">Skor</span>
                                        <span className="text-2xl font-extrabold text-orange-600">{selectedSession.preTestScore}</span>
                                      </div>
                                    ) : (
                                      <span className="text-xs text-text-muted font-semibold">Belum dikerjakan</span>
                                    )}
                                  </div>
                                  <h4 className="font-bold text-text-heading text-base mt-4">Uji Kemampuan Awal</h4>
                                  <p className="text-xs text-text-muted mt-1 leading-relaxed">
                                    Kerjakan sebelum materi dimulai untuk mengukur basis logika Anda pada topik ini.
                                  </p>
                                </div>

                                {selectedSession.preTestScore !== null && selectedSession.preTestScore !== undefined ? (
                                  <div className="flex items-center gap-2 text-xs text-green-700 bg-green-50 p-2.5 rounded-xl border border-green-100">
                                    <span className="material-symbols-outlined text-[16px]">check_circle</span>
                                    <span>Selesai. Skor terekam untuk evaluasi.</span>
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => onStartQuiz(selectedSession.id, 'pre', selectedSession.title, 'Mudah/Menengah')}
                                    className="w-full py-3 rounded-xl border border-orange-500 text-orange-500 font-bold hover:bg-orange-50 text-sm transition-all"
                                  >
                                    Mulai Pre-Test
                                  </button>
                                )}
                              </div>

                              {/* Card Post-Test */}
                              <div className="p-6 rounded-2xl border border-border-subtle bg-white shadow-sm flex flex-col justify-between gap-6 hover:border-slate-300 transition-colors">
                                <div>
                                  <div className="flex justify-between items-start">
                                    <span className="text-[11px] font-bold text-green-600 bg-green-100 px-2 py-0.5 rounded-md uppercase">Post-Test</span>
                                    {selectedSession.postTestScore !== null && selectedSession.postTestScore !== undefined ? (
                                      <div className="text-right">
                                        <span className="text-xs text-text-muted block">Skor</span>
                                        <span className="text-2xl font-extrabold text-green-600">{selectedSession.postTestScore}</span>
                                      </div>
                                    ) : (
                                      <span className="text-xs text-text-muted font-semibold">Terkunci</span>
                                    )}
                                  </div>
                                  <h4 className="font-bold text-text-heading text-base mt-4">Uji Kemampuan Akhir</h4>
                                  <p className="text-xs text-text-muted mt-1 leading-relaxed">
                                    Kerjakan setelah sesi Zoom selesai untuk mengukur penguasaan materi baru Anda.
                                  </p>
                                </div>

                                {selectedSession.postTestScore !== null && selectedSession.postTestScore !== undefined ? (
                                  <div className="flex items-center gap-2 text-xs text-green-700 bg-green-50 p-2.5 rounded-xl border border-green-100">
                                    <span className="material-symbols-outlined text-[16px]">check_circle</span>
                                    <span>Selesai. Rapor kemajuan Anda telah diperbarui.</span>
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => onStartQuiz(selectedSession.id, 'post', selectedSession.title, 'Menengah/Tinggi')}
                                    disabled={selectedSession.preTestScore === null || selectedSession.preTestScore === undefined}
                                    className="w-full py-3 rounded-xl bg-green-600 text-white font-bold hover:bg-green-700 text-sm transition-all shadow-sm disabled:bg-slate-100 disabled:text-text-muted disabled:border-border-subtle disabled:shadow-none"
                                  >
                                    Mulai Post-Test
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>

                        </div>
                      ) : (
                        <div className="bg-white p-12 rounded-3xl border border-border-subtle shadow-sm text-center flex flex-col items-center justify-center">
                          <span className="material-symbols-outlined text-[48px] text-text-muted mb-4">school</span>
                          <p className="text-text-muted">Pilih sesi kelas dari silabus di panel kanan untuk mulai belajar.</p>
                        </div>
                      )}
                    </div>

                    {/* KOLOM KANAN: Silabus (30%) */}
                    <div className="w-full lg:w-[30%] bg-white p-5 rounded-3xl border border-border-subtle shadow-sm flex flex-col sticky top-28">
                      <h3 className="font-headline-md font-bold text-text-heading text-sm uppercase tracking-wider mb-4 flex items-center gap-2">
                        <span className="material-symbols-outlined text-secondary text-[20px]">list_alt</span>
                        Silabus &amp; Sesi
                      </h3>
                      <div className="flex flex-col gap-2 overflow-y-auto max-h-[600px] pr-2 custom-scrollbar">
                        {sessions.map((session, index) => {
                          const isSelected = selectedSession?.id === session.id;
                          const preCompleted = session.preTestScore !== null && session.preTestScore !== undefined;
                          const postCompleted = session.postTestScore !== null && session.postTestScore !== undefined;

                          return (
                            <button
                              key={session.id}
                              onClick={() => {
                                setSelectedSession(session);
                                setZoomError(null);
                                setZoomSuccessUrl(null);
                              }}
                              className={`w-full p-3.5 rounded-2xl border text-left transition-all flex flex-col gap-1.5 ${
                                isSelected
                                  ? 'border-secondary bg-secondary-fixed/30 shadow-sm'
                                  : 'border-border-subtle hover:bg-slate-50'
                              }`}
                            >
                              <div className="flex items-center justify-between w-full">
                                <span className="text-[10px] font-bold text-secondary">SESI {index + 1}</span>
                                <div className="flex gap-1">
                                  {preCompleted && (
                                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-orange-100 text-orange-700 font-bold" title={`Pre-test: ${session.preTestScore}`}>PRE</span>
                                  )}
                                  {postCompleted && (
                                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-green-100 text-green-700 font-bold" title={`Post-test: ${session.postTestScore}`}>POST</span>
                                  )}
                                </div>
                              </div>
                              <div className={`text-sm font-semibold leading-snug ${isSelected ? 'text-text-heading' : 'text-text-body'}`}>
                                {session.title.replace(/Math - |Scratch - /, '')}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Menu Lainnya */}
          {activeMenu === 'practice' && (
            <div className="bg-white p-8 md:p-12 rounded-3xl border border-border-subtle shadow-sm flex flex-col gap-6 min-h-[400px]">
              <div className="text-center mb-4">
                <div className="w-16 h-16 mx-auto bg-secondary/10 text-secondary rounded-full flex items-center justify-center mb-4">
                  <span className="material-symbols-outlined text-[32px]">quiz</span>
                </div>
                <h3 className="font-headline-md font-bold text-text-heading text-2xl">Latihan Soal Bebas</h3>
                <p className="text-text-muted mt-2">Pilih materi dan tingkat kesulitan. Soal akan otomatis disiapkan oleh AI.</p>
              </div>

              <div className="max-w-xl mx-auto w-full flex flex-col gap-5">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold text-text-heading">Materi</label>
                  <select 
                    value={practiceCourseId || ''}
                    onChange={(e) => setPracticeCourseId(Number(e.target.value))}
                    className="w-full p-3.5 rounded-xl border border-border-subtle bg-slate-50 font-semibold focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary/50"
                  >
                    <option value="" disabled hidden>Pilih Materi...</option>
                    {courses.map(c => (
                      <option key={c.id} value={c.id}>{c.topicName || c.name}</option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-3 bg-slate-50 border border-border-subtle p-3.5 rounded-xl cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => setIsRandomPractice(!isRandomPractice)}>
                  <input 
                    type="checkbox" 
                    checked={isRandomPractice} 
                    onChange={() => {}} 
                    className="w-5 h-5 rounded text-secondary focus:ring-secondary/50 cursor-pointer"
                  />
                  <label className="text-sm font-semibold text-text-heading cursor-pointer select-none">
                    Acak Soal (25 Soal Random dari Materi Ini)
                  </label>
                </div>

                <div className={`flex flex-col gap-2 transition-opacity ${isRandomPractice ? 'opacity-50 pointer-events-none' : ''}`}>
                  <label className="text-sm font-bold text-text-heading">Submateri</label>
                  <select 
                    value={practiceSessionId || ''}
                    onChange={(e) => setPracticeSessionId(Number(e.target.value))}
                    disabled={practiceSessions.length === 0 || isRandomPractice}
                    className="w-full p-3.5 rounded-xl border border-border-subtle bg-slate-50 font-semibold focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary/50 disabled:opacity-50"
                  >
                    <option value="" disabled hidden>Pilih Submateri...</option>
                    {practiceSessions.map(s => (
                      <option key={s.id} value={s.id}>{s.title}</option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={() => {
                    let finalTopic = '';
                    let sessionIdToPass = practiceSessionId;
                    if (isRandomPractice) {
                      const course = courses.find(c => c.id === practiceCourseId);
                      finalTopic = course ? `random|${course.topicName || course.name}` : 'random';
                      // Pass -1 or a dummy session ID since we are randomizing across the course
                      sessionIdToPass = -1;
                    } else {
                      const selectedSessionObj = practiceSessions.find(s => s.id === practiceSessionId);
                      finalTopic = selectedSessionObj ? selectedSessionObj.title : '';
                    }
                    if (sessionIdToPass !== null && finalTopic) {
                      onStartQuiz(sessionIdToPass, 'practice', finalTopic, '');
                    }
                  }}
                  disabled={(!isRandomPractice && !practiceSessionId) || (isRandomPractice && !practiceCourseId)}
                  className="mt-6 w-full py-4 rounded-xl bg-green-600 hover:bg-green-700 text-white font-extrabold text-lg shadow-md hover:scale-[1.02] transition-all disabled:opacity-50 disabled:hover:scale-100"
                >
                  Mulai Latihan
                </button>
              </div>
            </div>
          )}

          {activeMenu === 'profile' && (
            <div className="bg-white p-12 rounded-3xl border border-border-subtle shadow-sm flex flex-col items-center justify-center gap-4 text-center h-full min-h-[400px]">
              <div className="w-20 h-20 bg-secondary-fixed text-secondary rounded-full flex items-center justify-center text-3xl font-bold">
                {currentUser.name.charAt(0).toUpperCase()}
              </div>
              <h3 className="font-headline-md font-bold text-text-heading text-xl mt-2">{currentUser.name}</h3>
              <p className="text-text-muted">{currentUser.email}</p>
              <div className="mt-6 flex flex-col gap-2 w-full max-w-sm">
                <button className="w-full py-3 border border-border-subtle rounded-xl text-sm font-semibold hover:bg-slate-50">Edit Profil</button>
                <button className="w-full py-3 border border-border-subtle rounded-xl text-sm font-semibold hover:bg-slate-50">Pengaturan Keamanan</button>
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
};
