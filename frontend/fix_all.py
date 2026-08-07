import re

with open('src/components/StudentDashboard.tsx', 'r') as f:
    student = f.read()

student = student.replace("api.getSessions(practiceCourseId)", "api.getSessions(practiceCourseId as number)")
student = student.replace("api.getSessions(activeCourseId)", "api.getSessions(activeCourseId as number)")
student = student.replace("api.getProtectedZoomLink(activeCourseId, sessionId)", "api.getProtectedZoomLink(activeCourseId as number, sessionId)")
student = student.replace("value={practiceCourseId}", "value={practiceCourseId || ''}")

with open('src/components/StudentDashboard.tsx', 'w') as f:
    f.write(student)

with open('src/App.tsx', 'r') as f:
    app_ts = f.read()

app_ts = app_ts.replace("setSelectedCourseId(courseId)", "setSelectedCourseId(Number(courseId))")
app_ts = app_ts.replace("courseId={selectedCourseId || ''}", "courseId={selectedCourseId as number}")
app_ts = app_ts.replace("courseId={selectedCourseId}", "courseId={selectedCourseId as number}")

with open('src/App.tsx', 'w') as f:
    f.write(app_ts)

with open('src/components/TeacherDashboard.tsx', 'r') as f:
    teacher = f.read()

teacher = teacher.replace("import type { StudentProgress, User, ManualQuestion, Topic, Subtopic, ActiveClass, ActiveSession } from '../types';", "import type { StudentProgress, User, Topic, Subtopic, ActiveClass, ActiveSession } from '../types';")
teacher = teacher.replace("const data = await api.getStudentProgress();", "const res = await api.getStudentProgress();")
teacher = teacher.replace("setStudents(data);", "setStudents(res);")

with open('src/components/TeacherDashboard.tsx', 'w') as f:
    f.write(teacher)

