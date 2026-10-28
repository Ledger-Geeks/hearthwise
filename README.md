<div align="center">

<br />

<img src="frontend/public/favicon.svg" width="110" height="110" alt="Hearthwise logo" />

# Hearthwise

### Kitchen wisdom, grounded in your own library

<p align="center">
  Upload nutrition PDFs and notes → Hearthwise indexes them → Ask questions → Get answers sourced from <em>your</em> documents
</p>

<br />

[![Python](https://img.shields.io/badge/Python-3.11-3776AB?style=flat-square&logo=python&logoColor=white)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110-009688?style=flat-square&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-pgvector-4169E1?style=flat-square&logo=postgresql&logoColor=white)](https://github.com/pgvector/pgvector)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-22c55e?style=flat-square)](LICENSE)

![RAG](https://img.shields.io/badge/Architecture-RAG%20Pipeline-c2410c?style=flat-square)
![Auth](https://img.shields.io/badge/Auth-JWT%20%2B%20Email%20OTP-7c4a2d?style=flat-square)
![LLM](https://img.shields.io/badge/LLM-OpenAI%20%7C%20Cohere-ea580c?style=flat-square)

</div>

---

## Overview

**Hearthwise** is a full-stack RAG (Retrieval-Augmented Generation) assistant for nutrition. You upload your own PDFs and text files, and Hearthwise answers questions using only what those documents say, so answers point back to your sources instead of the model's guesses.

The name joins *hearth* (the kitchen fire at the centre of a home) and *wise*. The visual theme, **Ember & Oak**, follows from it: oak brown as the main colour, ember orange for headings and icons, on an off-white claymorphism UI.

```
┌──────────────┐    ┌──────────────┐    ┌────────────────┐    ┌──────────────┐
│  Upload PDF  │───▶│ Chunk + Embed│───▶│ pgvector Index │───▶│  LLM Answer  │
│  or TXT file │    │   (OpenAI /  │    │ Vector search  │    │ (grounded in │
│              │    │    Cohere)   │    │  (similarity)  │    │  your docs)  │
└──────────────┘    └──────────────┘    └────────────────┘    └──────────────┘
```

---

## Features

- **RAG pipeline**: Upload → Chunk → Embed → Index → Retrieve → Generate
- **Semantic search**: vector similarity search with pgvector (Qdrant also supported)
- **Swappable providers**: OpenAI or Cohere for generation and embeddings, chosen in `.env`
- **Auth with email verification**: register → 6-digit OTP by email → JWT session
- **Demo chatbot**: public, rate-limited assistant on the landing page
- **Claymorphism UI**: animated React interface (Framer Motion) with cartoon auth illustrations
- **Live progress**: per-file upload → chunk → index status on the Documents page
- **API docs**: Swagger at `/api/docs`, ReDoc at `/api/redoc`
- **Metrics**: Prometheus metrics middleware

---

## Tech Stack

### Backend
| Layer | Technology |
|---|---|
| Framework | FastAPI 0.110 + Uvicorn |
| ORM | SQLAlchemy 2.0 (async) + asyncpg |
| Vector DB | PostgreSQL 17 + pgvector · Qdrant (optional) |
| LLM / Embeddings | OpenAI (`gpt-4o-mini`, `text-embedding-3-small`) · Cohere |
| Document loading | LangChain loaders + PyMuPDF |
| Auth | python-jose (JWT) · bcrypt · email OTP over SMTP (stdlib `smtplib`) |
| Monitoring | prometheus-client |

### Frontend
| Layer | Technology |
|---|---|
| Framework | React 18 + Vite 5 |
| Routing | React Router 6 |
| Styling | Tailwind CSS 3 (CSS-variable design tokens) |
| Animations | Framer Motion 11 |
| Icons | Lucide React |
| HTTP | Axios |
| Markdown | react-markdown |
| File upload | react-dropzone |
| Notifications | react-hot-toast |

---

## Project Structure

```
hearthwise/
├── src/                              # FastAPI backend
│   ├── main.py                       # App setup, CORS, routers, DB + LLM clients
│   ├── .env.example                  # Environment variable template
│   ├── requirements.txt
│   ├── routes/
│   │   ├── auth.py                   # register, login, verify-otp, resend-otp, me
│   │   ├── data.py                   # upload, process (chunking)
│   │   ├── nlp.py                    # index push/info/search/answer
│   │   ├── demo.py                   # public landing-page chatbot
│   │   └── schema/                   # Pydantic request models
│   ├── controllers/
│   │   ├── DataController.py         # File validation & paths
│   │   ├── ProcessController.py      # Loading & chunking files
│   │   └── NLPController.py          # RAG orchestration
│   ├── models/
│   │   ├── db_schemas/nutrition_rag/ # SQLAlchemy tables (users, projects, assets,
│   │   │                             #   chunks, email_verifications)
│   │   └── *Model.py                 # Data access helpers
│   ├── stores/
│   │   ├── llm/                      # OpenAI / Cohere providers + prompt templates (en, ar)
│   │   └── vectordb/                 # PGVector / Qdrant providers
│   └── helpers/
│       ├── config.py                 # Pydantic settings (reads .env)
│       └── mailer.py                 # OTP email sender
│
├── frontend/                         # React + Vite SPA
│   └── src/
│       ├── App.jsx                   # Routes + auth / verification guards
│       ├── index.css                 # Tailwind + Ember & Oak tokens, clay styles
│       ├── context/AuthContext.jsx   # Session, OTP verify / resend
│       ├── services/api.js           # Axios client + interceptors
│       ├── components/               # Layout, AuthIllustration, DemoChatbot, WordReveal
│       └── pages/                    # Landing, Login, Register, VerifyEmail,
│                                     #   Dashboard, Chat, Documents, Profile
├── docker/                           # Docker / compose files
├── start.sh                          # Production startup script
└── dev.sh                            # Development startup (two servers)
```

---

## Quick Start

### Prerequisites

- Python 3.11+
- Node.js 18+
- Docker (for PostgreSQL + pgvector)
- An OpenAI API key (or a Cohere key)

### 1. Install

```bash
git clone https://github.com/your-username/hearthwise.git
cd hearthwise

pip install -r src/requirements.txt
cd frontend && npm install && cd ..
```

### 2. Start the database

```bash
docker run -d --name hearthwise-pgvector \
  -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=hearthwise \
  -p 5435:5432 pgvector/pgvector:0.8.0-pg17
```

Tables are created automatically when the backend starts.

### 3. Configure `src/.env`

```bash
cp src/.env.example src/.env
```

The example file defaults to Cohere. For OpenAI, set:

```env
POSTGRES_USERNAME="postgres"
POSTGRES_PASSWORD="postgres"
POSTGRES_HOST="localhost"
POSTGRES_PORT=5435
POSTGRES_MAIN_DATABASE="hearthwise"

# python -c "import secrets; print(secrets.token_hex(32))"
JWT_SECRET_KEY="<64-char random hex>"

GENERATION_BACKEND="OPENAI"
EMBEDDING_BACKEND="OPENAI"
OPENAI_API_KEY="sk-..."
GENERATION_MODEL_ID="gpt-4o-mini"
EMBEDDING_MODEL_ID="text-embedding-3-small"
EMBEDDING_MODEL_SIZE=1536

# Optional: real OTP emails. Leave SMTP_HOST empty and codes are printed in the backend log.
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USERNAME="you@gmail.com"
SMTP_PASSWORD="<gmail app password>"
SMTP_FROM="Hearthwise Support <you@gmail.com>"
```

> Gmail needs an **app password** (Google account → 2-Step Verification → App passwords), not your normal password. Gmail always sends from your authenticated address. The display name in `SMTP_FROM` can be anything.

### 4. Run

**Development** (hot reload):
```bash
bash dev.sh
# Frontend → http://localhost:5000  (Vite)
# Backend  → http://localhost:8000  (uvicorn --reload)
```

**Production** (builds React, served by FastAPI on one port):
```bash
bash start.sh
# → http://localhost:5000
```

---

## API Reference

Base URL: `/api/v1` · Docs: `/api/docs` (Swagger) · `/api/redoc`

### Auth

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `POST` | `/auth/register` | Create account, send OTP, return JWT (`verified: false`) | none |
| `POST` | `/auth/login` | Sign in, return JWT + `verified` flag | none |
| `POST` | `/auth/verify-otp` | Verify the 6-digit code (5 attempts, 10-minute expiry) | Bearer |
| `POST` | `/auth/resend-otp` | Send a new code (60 s cooldown) | Bearer |
| `GET` | `/auth/me` | Current user | Bearer |
| `PUT` | `/auth/me` | Update profile | Bearer |

### Data pipeline

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/data/upload/{project_id}` | Upload a PDF or TXT file |
| `POST` | `/data/process/{project_id}` | Split the file(s) into chunks |

```json
{ "file_id": "abc123_file.pdf", "chunk_size": 512, "overlap_size": 50, "do_reset": 0 }
```

### NLP / RAG

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/nlp/index/push/{project_id}` | Embed chunks and store them in the vector DB |
| `GET` | `/nlp/index/info/{project_id}` | Collection stats |
| `POST` | `/nlp/index/search/{project_id}` | Semantic similarity search |
| `POST` | `/nlp/index/answer/{project_id}` | RAG question answering |

```json
{ "text": "What are good plant-based protein sources?", "limit": 5 }
```

### Demo

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/demo/chat` | Public landing-page chatbot (10 requests/min per IP, short replies) |

---

## RAG Architecture

```
User question
      │
      ▼
┌─────────────────────────────────────────────────────┐
│                    NLPController                    │
│  1. Embed question  ──▶  OpenAI / Cohere embeddings │
│  2. Vector search   ──▶  pgvector (top-K chunks)    │
│  3. Build prompt    ──▶  retrieved chunks +         │
│                          question template (en/ar)  │
│  4. Generate        ──▶  gpt-4o-mini / Cohere       │
└─────────────────────────────────────────────────────┘
      │
      ▼
 Grounded answer
```

---

## Pages

| Route | Description |
|---|---|
| `/` | Landing page: features, how it works, FAQ, demo chatbot |
| `/register` | Create account |
| `/verify` | Enter the 6-digit email code |
| `/login` | Sign in |
| `/dashboard` | Stats, getting-started journey, quick actions, tips |
| `/chat` | Ask questions against your documents |
| `/documents` | Upload, process, and index files |
| `/profile` | Edit profile, account info |

Unverified users are always redirected to `/verify`. Accounts created before OTP was added count as verified.

---

## Known Limitations

Read these before deploying:

1. **The `data` and `nlp` endpoints don't check the JWT.** Login and email verification are only enforced in the frontend.
2. **All users share one knowledge base.** The frontend uses `PROJECT_ID = 1` for everyone, so one user's documents can show up in another user's answers.
3. **No migrations.** Tables are created with `create_all` on startup, which doesn't change existing tables. Alembic is installed but not wired in.
4. **Simple chunking.** Text is split on line breaks. Size-based or semantic splitting would likely improve retrieval.

---

## Production Checklist

- [ ] Add JWT auth (and the verified check) to the `data` and `nlp` routes
- [ ] Give each user their own project ID
- [ ] Set a strong `JWT_SECRET_KEY`
- [ ] Set `ALLOWED_ORIGINS` to your real domain (not `*`)
- [ ] Configure SMTP with a domain you own (e.g. Resend, Brevo)
- [ ] Keep `src/.env` out of git (already in `.gitignore`)

---

## Contributing

```bash
git checkout -b feature/your-feature
# make changes, then run locally
bash dev.sh
git commit -m "feat: describe your change"
git push origin feature/your-feature
```

---

## License

MIT. See [LICENSE](LICENSE).

---

<div align="center">

Built with FastAPI · React · pgvector · OpenAI

**[Report Bug](../../issues)** · **[Request Feature](../../issues)**

</div>
