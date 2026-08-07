import re

with open('src/components/StudentDashboard.tsx', 'r') as f:
    student = f.read()

student = student.replace("selectedCourseId: string | null;", "selectedCourseId: number | null;")
student = student.replace("const [activeCourseId, setActiveCourseId] = useState<string>(selectedCourseId || courses[0]?.id || '');", "const [activeCourseId, setActiveCourseId] = useState<number | null>(selectedCourseId || courses[0]?.id || null);")
student = student.replace("const [practiceCourseId, setPracticeCourseId] = useState<string>(selectedCourseId || courses[0]?.id || '');", "const [practiceCourseId, setPracticeCourseId] = useState<number | null>(selectedCourseId || courses[0]?.id || null);")
student = student.replace("setActiveCourseId('')", "setActiveCourseId(null)")
student = student.replace("setActiveCourseId(courseId)", "setActiveCourseId(Number(courseId))")
student = student.replace("Number(activeCourseId) === Number(courseId)", "activeCourseId === courseId")
student = student.replace("activeCourseId === ''", "activeCourseId === null")
student = student.replace("activeCourseId === courseId", "activeCourseId === courseId")

with open('src/components/StudentDashboard.tsx', 'w') as f:
    f.write(student)

with open('src/App.tsx', 'r') as f:
    app_ts = f.read()

app_ts = app_ts.replace("const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);", "const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);")

with open('src/App.tsx', 'w') as f:
    f.write(app_ts)

