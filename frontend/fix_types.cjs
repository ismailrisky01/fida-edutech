const fs = require('fs');

// Fix api.ts
let apiStr = fs.readFileSync('src/services/api.ts', 'utf8');
apiStr = apiStr.replace("import type { User, Course, Session, Question, StudentProgress, ZoomMeeting, ManualQuestion, StudentZoomLink, Topic, Subtopic } from '../types';", "import type { User, Course, Session, Question, StudentProgress, ZoomMeeting, ManualQuestion, Topic, Subtopic } from '../types';");
// Change all instances where courseId is string to number
apiStr = apiStr.replace(/courseId: string/g, "courseId: number");
fs.writeFileSync('src/services/api.ts', apiStr);

// Fix QuizView.tsx
let quizStr = fs.readFileSync('src/components/QuizView.tsx', 'utf8');
quizStr = quizStr.replace(/courseId: string/g, "courseId: number");
fs.writeFileSync('src/components/QuizView.tsx', quizStr);

// Fix StudentDashboard.tsx
let stuStr = fs.readFileSync('src/components/StudentDashboard.tsx', 'utf8');
// Fix types where courseId is used as string
stuStr = stuStr.replace(/activeCourseId === courseId/g, "String(activeCourseId) === String(courseId)");
stuStr = stuStr.replace(/setActiveCourseId\(courseId\)/g, "setActiveCourseId(Number(courseId))");
stuStr = stuStr.replace(/const \[activeCourseId, setActiveCourseId\] = useState<string>\(studentCourses\[0\]\?\.courseId \|\| ''\);/g, "const [activeCourseId, setActiveCourseId] = useState<number | null>(studentCourses[0]?.courseId || null);");
// also fix the setActiveCourseId usage
stuStr = stuStr.replace(/setActiveCourseId\(''\)/g, "setActiveCourseId(null)");
stuStr = stuStr.replace(/activeCourseId === ''/g, "activeCourseId === null");
// replace other courseId as string parameters if any
fs.writeFileSync('src/components/StudentDashboard.tsx', stuStr);
