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

def load_qas_and_indexes(bot_folder, language, model):
    suffix = f"_{language}"
    cat_to_questions = {}
    cat_to_answers = {}
    category_keywords = {}
    faiss_indexes = {}

    categories_path = os.path.join(bot_folder, f"categories{suffix}.txt")
    if os.path.exists(categories_path):
        with open(categories_path, "r", encoding="utf-8") as f:
            for line in f:
                if ":" in line:
                    cat, keys_str = line.strip().split(":", 1)
                    category_keywords[cat.strip()] = [normalize_text(k.strip()) for k in keys_str.split(",")]

    for filename in os.listdir(bot_folder):
        if filename.endswith(f"_qa{suffix}.txt"):
            category = filename.replace(f"_qa{suffix}.txt", "")
            path = os.path.join(bot_folder, filename)
            questions, answers = load_qa_from_file(path)
            cat_to_questions[category] = questions
            cat_to_answers[category] = answers

            index_path = os.path.join(bot_folder, f"{category}_{language}.index")
            if os.path.exists(index_path):
                index = faiss.read_index(index_path)
            else:
                embeddings = model.encode(questions, convert_to_numpy=True).astype("float32")
                index = faiss.IndexFlatL2(embeddings.shape[1])
                index.add(embeddings)
            faiss_indexes[category] = (index, questions, answers)

    return category_keywords, cat_to_questions, cat_to_answers, faiss_indexes

def detect_category(user_input, category_keywords):
    normalized_input = normalize_text(user_input)
    input_words = set(normalized_input.split())
    for cat, keywords in category_keywords.items():
        for keyword in keywords:
            if set(keyword.split()).issubset(input_words):
                return cat
    return None

def find_answers_ranked(user_input, questions, answers):
    user_norm = normalize_text(user_input)
    scored = []
    for q, a in zip(questions, answers):
        q_norm = normalize_text(q)
        score = sum(1 for word in q_norm.split() if word in user_norm)
        if score > 0:
            scored.append((score, a))
    scored.sort(key=lambda x: x[0], reverse=True)
    return [a for _, a in scored]

def print_welcome(bot_name):
    print(f"Olá! Está a conversar com o assistente '{bot_name}'.")
    print("Pode fazer perguntas sobre os temas disponíveis.")
    print("Escreva 'sair' para terminar a conversa.")

def list_bots(bots_folder):
    return [d for d in os.listdir(bots_folder) if os.path.isdir(os.path.join(bots_folder, d))]

if __name__ == "__main__":
    bots_folder = "bots"
    bots = list_bots(bots_folder)
    if not bots:
        print("Não foram encontrados bots na pasta 'bots'.")
        exit()

    print("Bots disponíveis:")
    for i, bot_name in enumerate(bots, 1):
        print(f"{i}. {bot_name}")

    while True:
        choice = input("Escolha um bot pelo número: ").strip()
        if choice.isdigit() and 1 <= int(choice) <= len(bots):
            selected_bot = bots[int(choice) - 1]
            break
        print("Escolha inválida.")

    bot_path = os.path.join(bots_folder, selected_bot)
    current_language = "pt"
    model = SentenceTransformer("paraphrase-MiniLM-L3-v2")
    category_keywords, cat_to_questions, cat_to_answers, faiss_indexes = load_qas_and_indexes(bot_path, current_language, model)

    print_welcome(selected_bot)

    while True:
        user_input = input("\nVocê: ").strip()
        if user_input.lower() in ["exit", "sair"]:
            print("Bot: Até à próxima!")
            break

        category = detect_category(user_input, category_keywords)

        if not category or category not in cat_to_questions:
            user_vec = model.encode([user_input], convert_to_numpy=True).astype("float32")
            best_category = None
            best_score = float("inf")
            for cat, (index, _, _) in faiss_indexes.items():
                D, _ = index.search(user_vec, 1)
                if D[0][0] < best_score:
                    best_score = D[0][0]
                    best_category = cat
            if best_category:
                category = best_category
                print(f"Bot: Não consegui identificar a categoria pelas palavras-chave, mas parece relacionada com '{category}'.")
            else:
                print("Bot: Não consegui identificar a categoria.")
                continue

        possible_answers = find_answers_ranked(user_input, cat_to_questions[category], cat_to_answers[category])
        if possible_answers:
            print(f"Bot: {possible_answers[0]}")
            print("\nTambém pode interessar:")
            all_q = cat_to_questions[category]
            suggestions = [q for q in all_q if normalize_text(q) != normalize_text(user_input)][:3]
            for s in suggestions:
                print(f"- {s}")
            continue

        index, questions, answers = faiss_indexes[category]
        user_vec = model.encode([user_input], convert_to_numpy=True).astype("float32")
        D, I = index.search(user_vec, 3)
        resposta = answers[I[0][0]]
        print(f"Bot: {resposta}")

        print("\nTambém pode interessar:")
        suggestions = [q for idx, q in enumerate(questions) if normalize_text(q) != normalize_text(user_input)][:3]
        for s in suggestions:
            print(f"- {s}")