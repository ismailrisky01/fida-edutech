export interface User {
  id: number;
  name: string;
  email: string;
  role: 'student' | 'teacher';
}

export interface Course {
  id: number;
  name: string;
  topicName: string;
  icon: string;
  description: string;
  level: string;
  sessionsCount: number;
  colorClass: string;
  borderColorClass: string;
  bgColorClass: string;
}

export interface Session {
  id: number;
  title: string;
  description: string;
  zoomTime?: string;
  zoomLink?: string;
  videoLink?: string;
  materialFilePath?: string;
  isCompleted?: boolean;
  hasPreTest: boolean;
  hasPostTest: boolean;
  preTestScore?: number | null;
  postTestScore?: number | null;
}

export interface Question {
  id: number;
  questionText: string;
  options: string[];
  correctOptionIndex: number;
  explanation: string;
}

export interface Quiz {
  sessionId: number;
  type: 'pre' | 'post';
  questions: Question[];
}

export interface StudentProgress {
  studentId: number;
  studentName: string;
  studentEmail: string;
  courseName: string;
  courseId: number;
  sessionsCompleted: number;
  totalSessions: number;
  averagePreScore: number;
  averagePostScore: number;
  quizScores: {
    sessionId: number;
    sessionTitle: string;
    preScore: number | null;
    postScore: number | null;
    isCompleted?: boolean;
  }[];
}

export interface ZoomMeeting {
  id: number;
  sessionTitle: string;
  courseName: string;
  startTime: string; // ISO string or format
  durationMinutes: number;
  zoomLinkProtected?: string;
  isActive: boolean;
}

export interface ActiveSession {
  id: number;
  subtopicId: number;
  zoomLink?: string;
  zoomTime?: string;
  materialFilePath?: string;
  videoLink?: string;
  isCompleted?: boolean;
}

export interface ActiveClass {
  id: number;
  name: string;
  topicName: string;
  topicId: number;
  sessions: ActiveSession[];
}

// Tipe baru: Soal Manual dari Guru
export interface ManualQuestion {
  id?: number;
  topic: string;
  subtopic?: string;
  difficulty: 'Mudah' | 'Menengah' | 'Sulit';
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_option: string; // 'A' | 'B' | 'C' | 'D'
  explanation?: string;
  created_at?: string;
}

export interface Subtopic {
  id: number;
  title: string;
  description?: string;
  order_index: number;
}

export interface Topic {
  id: number;
  name: string;
  description?: string;
  level?: string;
  subtopics: Subtopic[];
}
