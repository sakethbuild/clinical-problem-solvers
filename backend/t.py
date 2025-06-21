import json

with open('dx.json', 'r') as f:
    dx_data = json.load(f)

values = list(dx_data.values())
unique_final_dx = list(set([v['Final Dx'] for v in values]))
with open('result.txt', 'w',encoding='utf-8') as out:
    out.write(str(unique_final_dx))

# Add 'Final Dx' to each entry in video-data.json
with open('video-data.json', 'r', encoding='utf-8') as f:
    video_data = json.load(f)

for key, entry in video_data.items():
    if key in dx_data and 'Final Dx' in dx_data[key]:
        entry['Final Dx'] = dx_data[key]['Final Dx']
    else:
        entry['Final Dx'] = None

with open('video-dataa.json', 'w', encoding='utf-8') as f:
    json.dump(video_data, f, ensure_ascii=False, indent=2)
