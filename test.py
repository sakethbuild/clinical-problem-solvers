import os
import json
from pymongo import MongoClient

client=MongoClient('mongodb+srv://sakethbuild:eBt0xzwJSnk8djGX@cluster0.8rgvta7.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0')
db = client["youtube"]
collection = db["chunks"]

files = os.listdir('data')
for file in files:
    with open(f'data/{file}') as f:
        data = json.load(f)
        chunks = []
        count = 0

        while count < len(data['transcript_data']):
            obj = {
                "text": '',
                "start_time": data["transcript_data"][count]['start'],
                "duration": 0,
                "word_count": 0,
                "chunk_index": len(chunks),
                "metadata": data['metadata']
            }

            curr_words = 0 

            while curr_words < 200 and count < len(data['transcript_data']):
                segment = data['transcript_data'][count]
                text = segment['text'].strip()
                words = len(text.split())

                if text:
                    obj['text'] += ' ' + text
                    obj['duration'] += segment['duration']
                    curr_words += words

                count += 1 

            obj['word_count'] = len(obj['text'].split())
            chunks.append(obj)
            collection.insert_one(obj)
            print(f'added chunk : {obj['chunk_index']}')