# Intelligent Assistant with FAISS and Embeddings

This project implements an **intelligent chatbot** for public administration governance, using **semantic matching with FAISS**, **Sentence Transformers** for text embeddings, and support for responses based on PDF documents (RAG) integrated with the LLaMA3 model via Ollama. The system organizes questions and answers by categories, supports multilingual functionality (Portuguese and English), and provides an administration interface for managing chatbots and FAQs.

## Features

- **FAQ-based responses**: Matching questions based on rules (FAQ) or semantic search (FAISS).
- **RAG integration**: Support for answers generated from PDF documents using the LLaMA3 model via Ollama.
- **Multilingual**: Support for Portuguese (pt) and English (en).
- **Chatbot Management**: Create, edit, and delete chatbots with associated categories.
- **Document Upload**: Support for uploading .docx (FAQs) and .pdf (RAG) files.
- **Web Interface**: User interface for chatbot interaction and backoffice for administration.
- **Question Suggestions**: Display of related and suggested questions based on category and language.

## Technologies Used

- **Backend**: Flask (Python), PostgreSQL, FAISS, Sentence Transformers, PyPDF2, python-docx.
- **Frontend**: HTML, CSS, JavaScript.
- **AI Integration**: Ollama (LLaMA3) for document-based answers.
- **Database**: PostgreSQL with tables for chatbots, FAQs, categories, documents, and logs.

## Prerequisites

- Python 3.8+
- PostgreSQL
- Ollama (for RAG support with LLaMA3)
- Dependencies listed in `requirements.txt`

## How to Run

### 1. Set up the environment

```bash
# Clone the repository
git clone <REPOSITORY_URL>
cd <REPOSITORY_NAME>

# Create and activate a virtual environment
python -m venv venv
source venv/bin/activate    # Linux/Mac
venv\Scripts\activate     # Windows
```

### 2. Install dependencies

```bash
pip install -r requirements.txt
```

### 3. Configure the database

1. Install PostgreSQL and create a database named **AI4Governance**.
2. Update the connection credentials in the `app.py` file (host, port, dbname, user, password).
3. Run the SQL script to create tables and insert initial data:

```bash
psql -U postgres -d AI4Governance -f init.sql
```

### 4. Set up Ollama (for RAG)

```bash
ollama pull llama3
ollama serve
```

### 5. Start the Flask server

```bash
python app.py
```

### 6. Access the interface

- Homepage: http://localhost:5000/landing.html
- Backoffice: http://localhost:5000/recursos.html

## Project Structure

```
├── app.py
├── init.sql
├── landing.html
├── recursos.html
├── js/
│   ├── chat.js
│   ├── faq.js
│   └── AdicionarBot.js
├── css/
├── images/
├── pdfs/
├── faiss.index
├── faq_embeddings.pkl
├── requirements.txt
└── README.md
```

## API Endpoints

- **GET /chatbots**: List all chatbots.
- **POST /chatbots**: Create a new chatbot.
- **PUT /chatbots/<id>**: Update an existing chatbot.
- **DELETE /chatbots/<id>**: Delete a chatbot.
- **GET /categories**: List all categories.
- **GET /faqs**: List all FAQs.
- **GET /faqs/<id>**: Get details of a specific FAQ.
- **POST /faqs**: Add a new FAQ.
- **PUT /faqs/<id>**: Update an existing FAQ.
- **DELETE /faqs/<id>**: Delete a FAQ.
- **POST /upload-pdf**: Upload PDF files for RAG.
- **POST /upload-faq-docx**: Upload .docx files for FAQs.
- **POST /get-answer**: Get an answer to a question (supports FAQ, FAISS, and RAG).
- **POST /similar-questions**: Return similar questions based on category.
- **POST /random-faqs**: Return random FAQs for suggestions.
