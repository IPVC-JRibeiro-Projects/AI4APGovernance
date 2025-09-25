import os
import unicodedata
from sentence_transformers import SentenceTransformer
import faiss
import numpy as np

def normalize_text(text):
    text = text.lower()
    return ''.join(c for c in unicodedata.normalize('NFD', text) if unicodedata.category(c) != 'Mn')

def load_qa_from_file(path):
    questions = []
    answers = []
    with open(path, "r", encoding="utf-8") as f:
        for line in f:
            parts = line.strip().split("\t")
            if len(parts) == 2:
                questions.append(parts[0])
                answers.append(parts[1])
    return questions, answers

def save_faiss_index(index, path):
    faiss.write_index(index, path)

def main():
    bot_folder = "bots/viana_municipio"
    language = "pt"
    suffix = f"_{language}"
    model = SentenceTransformer("paraphrase-MiniLM-L3-v2")

    for filename in os.listdir(bot_folder):
        if filename.endswith(f"_qa{suffix}.txt"):
            category = filename.replace(f"_qa{suffix}.txt", "")
            path = os.path.join(bot_folder, filename)
            questions, answers = load_qa_from_file(path)

            embeddings = model.encode(questions, convert_to_numpy=True).astype("float32")
            index = faiss.IndexFlatL2(embeddings.shape[1])
            index.add(embeddings)

            save_faiss_index(index, os.path.join(bot_folder, f"{category}_{language}.index"))
            print(f"✔ Index guardado: {category}_{language}.index")

if __name__ == "__main__":
    main()