# RAG Document Assistant — Frontend

React frontend for the RAG Document Assistant, a multilingual application for uploading PDF documents and asking context-aware questions about their contents.

The frontend connects to a FastAPI backend that performs document ingestion, semantic retrieval with PostgreSQL/pgvector, and grounded answer generation using Gemini.

## Features

- Upload PDF documents
- View indexed documents
- Ask questions across uploaded documents
- Select one or multiple documents as the retrieval scope
- Display generated answers and document summaries
- Responsive web interface
- Connects to the deployed FastAPI RAG backend

## Tech Stack

- React
- Vite
- JavaScript
- REST APIs
- Vercel

## Architecture

```text
User
  ↓
React / Vite
  ↓
FastAPI Backend
  ↓
PostgreSQL + pgvector
  ↓
Gemini
```

## Backend

The backend repository contains the retrieval pipeline, embeddings, database layer, API endpoints, tests, and Docker configuration.

[View Backend Repository](https://github.com/xuannhi-tran/rag-document-assistant)

## Running Locally

```bash
npm install
npm run dev
```

Configure the backend API URL in the appropriate environment variable before starting the application.

## Future Improvements

- Display source citations alongside generated answers
- Improve document-management UX
- Add upload and indexing progress states
- Add authentication and per-user document collections
