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
flask --app wsgi --debug run --host 0.0.0.0 --port 5000
```

### 6. Access the interface

- Homepage: http://localhost:5000/landing.html
- Backoffice: http://localhost:5000/recursos.html

## Project Structure
```
├── wsgi.py
├── backoffice/
│ ├── app/
│ │ ├── init.py
│ │ ├── admin.py
│ │ ├── auth.py
│ │ ├── api/
│ │ │ ├── chatbots.py
│ │ │ ├── faqs.py
│ │ │ ├── categorias.py
│ │ │ ├── uploads.py
│ │ │ └── respostas.py
│ │ ├── services/
│ │ │ ├── retreival.py
│ │ │ ├── rag.py
│ │ │ └── text.py
│ │ ├── templates/
│ │ │ ├── landing.html
│ │ │ ├── landing-2.html
│ │ │ ├── recursos.html
│ │ │ ├── respostas.html
│ │ │ ├── nao-respondidas.html
│ │ │ ├── metricas.html
│ │ │ └── contexto.html
│ │ └── static/
│ │ ├── css/
│ │ ├── js/
│ │ └── images/
│ ├── db/
│ │ └── init.sql
│ ├── docker-compose.yml
│ ├── faiss.index
│ ├── faq_embeddings.pkl
│ └── requirements.txt
├── pdfs/
├── static/
├── .env
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
- **POST /obter-resposta**: Get an answer to a question (supports FAQ, FAISS, and RAG).
- **POST /perguntas-semelhantes**: Return similar questions based on category.
- **POST /faqs-aleatorias**: Return random FAQs for suggestions.
- **POST /rebuild-faiss**: Rebuild the FAISS index.
- **GET /faq-categoria/<categoria>**: List FAQs by category.
- **GET /perguntas-nao-respondidas**: List unanswered questions.
- **GET /perguntas-nao-respondidas/metricas**: Metrics for unanswered questions.
- **PUT /perguntas-nao-respondidas/<id>**: Mark an unanswered question as handled.
- **DELETE /perguntas-nao-respondidas/<id>**: Delete an unanswered question.
