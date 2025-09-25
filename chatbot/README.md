
# Assistente Inteligente com FAISS e Embeddings

Este projeto implementa um **chatbot inteligente** para governança da administração pública, utilizando **matching semântico com FAISS**, **Sentence Transformers** para embeddings de texto, e suporte a respostas baseadas em documentos PDF (RAG) com integração ao modelo LLaMA3 via Ollama. O sistema organiza perguntas e respostas por categorias, suporta multilinguagem (Português e Inglês) e oferece uma interface de administração para gerenciamento de chatbots e FAQs.

## Funcionalidades

- **Respostas baseadas em FAQs**: Matching de perguntas com base em regras (FAQ) ou busca semântica (FAISS).
- **Integração com RAG**: Suporte a respostas geradas a partir de documentos PDF utilizando o modelo LLaMA3 via Ollama.
- **Multilinguagem**: Suporte para Português (pt) e Inglês (en).
- **Gerenciamento de Chatbots**: Criação, edição e exclusão de chatbots com categorias associadas.
- **Upload de Documentos**: Suporte para upload de arquivos .docx (FAQs) e .pdf (RAG).
- **Interface Web**: Interface de utilizador para interação com o chatbot e backoffice para administração.
- **Sugestões de Perguntas**: Exibição de perguntas relacionadas e sugestivas com base na categoria e idioma.

## Tecnologias Utilizadas

- **Backend**: Flask (Python), PostgreSQL, FAISS, Sentence Transformers, PyPDF2, python-docx.
- **Frontend**: HTML, CSS, JavaScript.
- **Integração com IA**: Ollama (LLaMA3) para respostas baseadas em documentos.
- **Banco de Dados**: PostgreSQL com tabelas para chatbots, FAQs, categorias, documentos e logs.

## Pré-requisitos

- Python 3.8+
- PostgreSQL
- Ollama (para suporte a RAG com LLaMA3)
- Dependências listadas em `requirements.txt`

## Como executar

### 1. Configurar o ambiente

```bash
# Clonar o repositório
git clone <URL_DO_REPOSITORIO>
cd <NOME_DO_REPOSITORIO>

# Criar e ativar um ambiente virtual
python -m venv venv
source venv/bin/activate    # Linux/Mac
venv\Scripts\activate     # Windows
```

### 2. Instalar dependências

```bash
pip install -r requirements.txt
```

### 3. Configurar o banco de dados

1. Instale o PostgreSQL e crie um banco de dados chamado **AI4Governance**.
2. Atualize as credenciais de conexão no arquivo `app.py` (host, port, dbname, user, password).
3. Execute o script SQL para criar as tabelas e inserir dados iniciais:

```bash
psql -U postgres -d AI4Governance -f init.sql
```

### 4. Configurar o Ollama (para RAG)

```bash
ollama pull llama3
ollama serve
```

### 5. Iniciar o servidor Flask

```bash
python app.py
```

### 6. Acessar a interface

- Página inicial: http://localhost:5000/landing.html
- Backoffice: http://localhost:5000/recursos.html

## Estrutura do Projeto

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

## Endpoints da API

- **GET /chatbots**: Lista todos os chatbots.
- **POST /chatbots**: Cria um novo chatbot.
- **PUT /chatbots/**: Atualiza um chatbot existente.
- **DELETE /chatbots/**: Exclui um chatbot.
- **GET /categorias**: Lista todas as categorias.
- **GET /faqs**: Lista todas as FAQs.
- **GET /faqs/**: Obtém detalhes de uma FAQ específica.
- **POST /faqs**: Adiciona uma nova FAQ.
- **PUT /faqs/**: Atualiza uma FAQ existente.
- **DELETE /faqs/**: Exclui uma FAQ.
- **POST /upload-pdf**: Faz upload de arquivos PDF para RAG.
- **POST /upload-faq-docx**: Faz upload de arquivos .docx para FAQs.
- **POST /obter-resposta**: Obtém resposta para uma pergunta (suporta FAQ, FAISS e RAG).
- **POST /perguntas-semelhantes**: Retorna perguntas semelhantes com base na categoria.
- **POST /faqs-aleatorias**: Retorna FAQs aleatórias para sugestões.