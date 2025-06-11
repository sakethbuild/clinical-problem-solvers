from pymongo import MongoClient
from sentence_transformers import SentenceTransformer
from tqdm import tqdm

client=MongoClient('mongodb+srv://sakethbuild:eBt0xzwJSnk8djGX@cluster0.8rgvta7.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0')
db = client["youtube"]
collection = db["chunk-data"]

chunks = list(collection.find())
text_data = [x['text'] for x in chunks]
print(f'reterived {len(text_data)} from mongodb, now generating embeddings')

model = SentenceTransformer("pritamdeka/BioBERT-mnli-snli-scinli-scitail-mednli-stsb")
embeddings = model.encode(text_data, batch_size=32, show_progress_bar=True)

for index, embedding in enumerate(embeddings):
    chunk_id = chunks[index]['_id']
    collection.update_one(
        {'_id': chunk_id},
        {'$set': {'embedding': embedding.tolist()}}
    )
    print(f'Updated embedding for chunk {index + 1}/{len(embeddings)}')
