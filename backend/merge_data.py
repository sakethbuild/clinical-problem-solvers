import json

# Load the source data (url_dx_topics.json)
with open('url_dx_topicss.json', 'r', encoding='utf-8') as f:
    url_dx_topics = json.load(f)

# Load the target data (public.json)
with open('public.json', 'r', encoding='utf-8') as f:
    public_data = json.load(f)

# Merge the data
for url_key in public_data.keys():
    if url_key in url_dx_topics:
        # Add Topics field if it exists
        if 'Topics' in url_dx_topics[url_key]:
            public_data[url_key]['Topics'] = url_dx_topics[url_key]['Topics']
        else:
            public_data[url_key]['Topics'] = None
            
        # Add Chief Complaint field if it exists
        if 'Chief Complaint' in url_dx_topics[url_key]:
            public_data[url_key]['Chief Complaint'] = url_dx_topics[url_key]['Chief Complaint']
        else:
            public_data[url_key]['Chief Complaint'] = None
    else:
        # If URL not found in source data, add None values
        public_data[url_key]['Topics'] = None
        public_data[url_key]['Chief Complaint'] = None

# Save the merged data to new.json
with open('new.json', 'w', encoding='utf-8') as f:
    json.dump(public_data, f, ensure_ascii=False, indent=2)

print(f"Merged data saved to new.json")
print(f"Processed {len(public_data)} entries from public.json")
print(f"Found matching data for {sum(1 for key in public_data.keys() if key in url_dx_topics)} entries")
