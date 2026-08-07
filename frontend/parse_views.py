import re

lines_dict = {}

with open('extracted_views.txt', 'r') as f:
    for line in f:
        # Match lines like "1: import React from 'react';"
        m = re.match(r'^(\d+):\s(.*)$', line)
        if m:
            line_num = int(m.group(1))
            content = m.group(2)
            if line_num not in lines_dict:
                lines_dict[line_num] = content

# Write to reconstructed.tsx
max_line = max(lines_dict.keys()) if lines_dict else 0
with open('reconstructed_TeacherDashboard.tsx', 'w') as f:
    for i in range(1, max_line + 1):
        f.write(lines_dict.get(i, "") + "\n")

print(f"Reconstructed up to line {max_line}")
