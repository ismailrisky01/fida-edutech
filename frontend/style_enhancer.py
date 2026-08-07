import re

with open('src/components/TeacherDashboard.tsx', 'r') as f:
    code = f.read()

# Enhance Header
code = code.replace(
    'className="bg-white border-b border-border-subtle sticky top-0 z-30 shadow-sm px-6 py-4 flex justify-between items-center"',
    'className="bg-white/80 backdrop-blur-md border-b border-border-subtle sticky top-0 z-30 shadow-sm px-6 py-4 flex justify-between items-center"'
)
code = code.replace(
    'className="font-extrabold text-primary text-lg flex items-center gap-2"',
    'className="font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-600 text-xl flex items-center gap-2 tracking-tight"'
)
code = code.replace(
    'className="text-right"',
    'className="text-right hidden sm:block"'
)

# Enhance Sidebar
code = code.replace(
    'className="bg-white p-5 rounded-3xl border border-border-subtle shadow-sm flex flex-col gap-2"',
    'className="bg-white/60 backdrop-blur-xl p-5 rounded-3xl border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col gap-2 h-full"'
)
code = code.replace(
    'bg-secondary/10 text-secondary font-bold',
    'bg-gradient-to-r from-secondary/20 to-secondary/5 text-secondary font-extrabold shadow-sm translate-x-1'
)
code = code.replace(
    'bg-blue-600/10 text-blue-700 font-bold',
    'bg-gradient-to-r from-blue-600/20 to-blue-600/5 text-blue-700 font-extrabold shadow-sm translate-x-1'
)
code = code.replace(
    'bg-green-600/10 text-green-700 font-bold',
    'bg-gradient-to-r from-green-600/20 to-green-600/5 text-green-700 font-extrabold shadow-sm translate-x-1'
)
code = code.replace(
    'hover:bg-slate-50',
    'hover:bg-slate-100 hover:translate-x-1 transition-all duration-300 font-semibold text-text-body'
)

# Enhance Student List
code = code.replace(
    'className="px-6 py-4 flex flex-col gap-2"',
    'className="px-6 py-5 flex flex-col gap-3 hover:bg-slate-50/50 transition-colors group"'
)
code = code.replace(
    'className="w-10 h-10 rounded-full bg-primary text-white flex justify-center items-center font-bold"',
    'className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-blue-600 text-white flex justify-center items-center font-extrabold shadow-md transform group-hover:scale-110 transition-transform"'
)
code = code.replace(
    'className="w-48"',
    'className="w-48 flex-shrink-0"'
)

# Enhance Class Management (List of active classes)
code = code.replace(
    'className="p-4 border rounded-2xl hover:border-secondary cursor-pointer transition flex flex-col gap-2"',
    'className="p-5 border border-border-subtle rounded-3xl bg-white hover:border-secondary hover:shadow-xl hover:-translate-y-1 cursor-pointer transition-all duration-300 flex flex-col gap-2 group"'
)
code = code.replace(
    'className="font-bold text-lg text-primary"',
    'className="font-extrabold text-xl text-primary group-hover:text-secondary transition-colors tracking-tight"'
)
code = code.replace(
    'className="mt-auto flex justify-between items-center border-t pt-2 mt-2"',
    'className="mt-auto flex justify-between items-center border-t border-slate-100 pt-3 mt-3"'
)
code = code.replace(
    'className="text-xs font-bold bg-slate-100 px-2 py-1 rounded"',
    'className="text-[11px] font-extrabold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-full"'
)

# Enhance Detail Kelas (Hero banner)
code = code.replace(
    'className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white"',
    'className="bg-gradient-to-br from-blue-600 via-indigo-600 to-primary p-8 text-white relative overflow-hidden"'
)
code = code.replace(
    'className="font-bold text-2xl"',
    'className="font-extrabold text-3xl mb-1 drop-shadow-md"'
)

# Add decorative element to Hero Banner
code = code.replace(
    'Kurikulum Induk: {selectedClass.topicName}</p>',
    'Kurikulum Induk: {selectedClass.topicName}</p>\n                  <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -translate-y-1/2 translate-x-1/4 blur-2xl"></div>'
)

# Enhance Session item
code = code.replace(
    'className="border p-4 rounded-2xl bg-slate-50 flex flex-col gap-3"',
    'className="border border-border-subtle p-5 rounded-3xl bg-white shadow-sm hover:shadow-md transition-shadow flex flex-col gap-4"'
)
code = code.replace(
    'className="font-bold text-text-heading"',
    'className="font-extrabold text-lg text-text-heading"'
)
code = code.replace(
    'className="flex flex-col gap-1 text-xs font-bold text-text-muted"',
    'className="flex flex-col gap-1.5 text-xs font-bold text-text-muted uppercase tracking-wider"'
)
code = code.replace(
    'className="p-2 border rounded font-normal bg-white"',
    'className="p-2.5 border border-border-subtle rounded-xl font-normal bg-slate-50 focus:bg-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"'
)
code = code.replace(
    'className="bg-secondary text-white font-bold px-4 py-1.5 rounded-lg text-sm"',
    'className="bg-secondary hover:bg-secondary/90 text-white font-bold px-5 py-2 rounded-xl text-sm shadow-md hover:shadow-lg transition-all active:scale-95"'
)

# Enhance General Containers
code = code.replace(
    'className="bg-white rounded-3xl border shadow-sm"',
    'className="bg-white/80 backdrop-blur-md rounded-3xl border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)]"'
)

with open('src/components/TeacherDashboard.tsx', 'w') as f:
    f.write(code)
