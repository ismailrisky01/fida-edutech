import { useState, useEffect } from 'react';
import { LandingPage } from './components/LandingPage';
import { StudentDashboard } from './components/StudentDashboard';
import { TeacherDashboard } from './components/TeacherDashboard';
import { QuizView } from './components/QuizView';
import { AuthModal } from './components/AuthModal';
import { api } from './services/api';
import type { User, Course } from './types';

function App() {
  const [view, setView] = useState<'landing' | 'dashboard'>('landing');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
  const [authOpen, setAuthOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Quiz launcher config
  const [quizConfig, setQuizConfig] = useState<{
    sessionId: number;
    type: 'pre' | 'post' | 'practice';
    topic: string;
    difficulty: string;
  } | null>(null);

  // Heartbeat backend state for debug / indicator
  const [backendActive, setBackendActive] = useState(false);

  useEffect(() => {
    const initApp = async () => {
      // Check auth
      const user = await api.getCurrentUser();
      setCurrentUser(user);

      // Check backend status
      const active = await api.checkBackend();
      setBackendActive(active);

      // Get courses
      const courseData = await api.getCourses();
      setCourses(courseData);

      setLoading(false);
    };
    initApp();
  }, []);

  const handleAuthSuccess = async (user: User) => {
    setCurrentUser(user);
    // Refetch courses for the logged-in user to avoid stale mock data
    const courseData = await api.getCourses();
    setCourses(courseData);
    // Redirect to dashboard automatically
    setView('dashboard');
  };

  const handleLogout = async () => {
    try {
      await api.logout();
    } catch (e) {
      console.error('Logout error:', e);
    }
    setCurrentUser(null);
    setView('landing');
    setSelectedCourseId(null);
    window.location.href = '/';
  };

  const handleSelectCourse = (courseId: string) => {
    setSelectedCourseId(Number(courseId));
    setView('dashboard');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-4 border-slate-100"></div>
          <div className="absolute inset-0 rounded-full border-4 border-secondary border-t-transparent animate-spin"></div>
        </div>
        <h3 className="font-headline-md font-bold text-text-heading text-lg mt-4">Memuat Fida-Education...</h3>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Backend connection indicator (Sleek status bubble in bottom corner) */}
      <div className="fixed bottom-4 right-4 z-40">
        <div className={`px-3 py-1.5 rounded-full text-[10px] font-bold shadow-md flex items-center gap-1.5 border ${
          backendActive 
            ? 'bg-green-50 border-green-200 text-green-700' 
            : 'bg-orange-50 border-orange-200 text-orange-700'
        }`}>
          <span className={`w-2 h-2 rounded-full ${backendActive ? 'bg-green-500 animate-pulse' : 'bg-orange-500'}`}></span>
          <span>{backendActive ? 'Backend Terhubung (Live)' : 'Simulasi Database Aktif'}</span>
        </div>
      </div>

      {view === 'landing' ? (
        <LandingPage
          courses={courses}
          currentUser={currentUser}
          onSelectCourse={handleSelectCourse}
          onOpenAuth={() => setAuthOpen(true)}
          onGoToDashboard={() => setView('dashboard')}
          onLogout={handleLogout}
        />
      ) : currentUser?.role === 'teacher' ? (
        <TeacherDashboard
          currentUser={currentUser}
          onLogout={handleLogout}
          onGoToLanding={() => setView('landing')}
        />
      ) : (
        <StudentDashboard
          currentUser={currentUser!}
          courses={courses}
          selectedCourseId={selectedCourseId}
          onLogout={handleLogout}
          onGoToLanding={() => setView('landing')}
          onStartQuiz={(sessionId, type, topic, difficulty) => {
            setQuizConfig({ sessionId, type, topic, difficulty });
          }}
        />
      )}

      {/* Auth Modal */}
      <AuthModal
        isOpen={authOpen}
        onClose={() => setAuthOpen(false)}
        onAuthSuccess={handleAuthSuccess}
      />

      {/* Quiz Modal view */}
      {quizConfig && currentUser && (
        <QuizView
          sessionId={quizConfig.sessionId}
          type={quizConfig.type}
          topic={quizConfig.topic}
          difficulty={quizConfig.difficulty}
          courseId={Number(selectedCourseId) || 0}
          onClose={async (scoreUpdated) => {
            setQuizConfig(null);
            if (scoreUpdated) {
              // Reload user session state to update progress report card
              // Force local triggers by re-fetching sessions in active view
              // React state will handle auto-update via child props
              window.location.reload(); // Simple reload ensures all localstorage values sync up perfectly!
            }
          }}
        />
      )}
    </div>
  );
}

export default App;
