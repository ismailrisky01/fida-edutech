import json

transcript_path = '/Users/ismailriskyrahmansyah/.gemini/antigravity-ide/brain/22f1a58c-a8dc-47a3-b830-82267ae3918e/.system_generated/logs/transcript_full.jsonl'
output = ""

with open(transcript_path, 'r') as f:
    for line in f:
        try:
            data = json.loads(line)
            if data.get('type') == 'TOOL_RESPONSE' and 'view_file' in line and 'TeacherDashboard.tsx' in line:
                content = data.get('content', '')
                if 'Showing lines' in content:
                    output += content + "\n---\n"
        except:
            pass

with open('extracted_views.txt', 'w') as f:
    f.write(output)
