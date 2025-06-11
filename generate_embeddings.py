import json
from sentence_transformers import SentenceTransformer
from tqdm import tqdm

# Load data from backup.json
with open('backup.json', 'r') as file:
    data = json.load(file)

# Extract text data
text_data = [item['text'] for item in data]
print(f'Retrieved {len(text_data)} items from backup.json, now generating embeddings')

# Generate embeddings
model = SentenceTransformer("pritamdeka/BioBERT-mnli-snli-scinli-scitail-mednli-stsb")
embeddings = model.encode(text_data, batch_size=32, show_progress_bar=True)

# Add embeddings to the data
for index, embedding in enumerate(tqdm(embeddings)):
    data[index]['embedding'] = embedding.tolist()

# Save the updated data back to backup.json
with open('backup2.json', 'w') as file:
    json.dump(data, file)

print(f'Saved updated data with embeddings to backup.json')
