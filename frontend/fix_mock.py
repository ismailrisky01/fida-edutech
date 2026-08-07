import re

with open('src/services/api.ts', 'r') as f:
    api_ts = f.read()

api_ts = api_ts.replace('name: "Matematika Logika & Olympiad",', 'name: "Matematika Logika & Olympiad",\n    topicName: "Matematika",')
api_ts = api_ts.replace('name: "Scratch Game Programming",', 'name: "Scratch Game Programming",\n    topicName: "Pemrograman",')
api_ts = api_ts.replace('name: "Combo Master",', 'name: "Combo Master",\n    topicName: "Combo",')

with open('src/services/api.ts', 'w') as f:
    f.write(api_ts)

with open('src/components/StudentDashboard.tsx', 'r') as f:
    student = f.read()
    
# Some event targets might still pass strings to activeCourseId. Let's fix that too.
student = re.sub(r'onChange=\{\(e\) => setActiveCourseId\((e\.target\.value)\)\}', r'onChange={(e) => setActiveCourseId(Number(\1))}', student)
student = re.sub(r'onChange=\{\(e\) => setPracticeCourseId\((e\.target\.value)\)\}', r'onChange={(e) => setPracticeCourseId(Number(\1))}', student)

with open('src/components/StudentDashboard.tsx', 'w') as f:
    f.write(student)
