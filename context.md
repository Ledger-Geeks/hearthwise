# Context: LedgerGeeks portfolio build (project 17 of 17)

Local working notes. Excluded from git through `.git/info/exclude`. Never commit or push this file.

## This project

| # | Project | Category | What it is | Original repo |
|---|---|---|---|---|
| 17 | NutriAI | AI | AI nutrition and diet planning assistant | https://github.com/Youssefx64/NutriAI |

Local path: `Desktop\Development\NutriAI`

### Status

- [x] Cloned
- [ ] Stage 1: run the original as-is
- [ ] Stage 2: understand it
- [ ] Stage 3: rebrand
- [ ] Stage 4: test everything
- [ ] Stage 5: business requirements document
- [ ] Stage 6: demo video
- [ ] Stage 7: submit

### Facts found so far

- Stack: FastAPI with a RAG backend (`src/`), React 18 + Vite 5 + Tailwind (`frontend/`), and PostgreSQL with pgvector (Qdrant is an alternative).
- LLM backends: `COHERE` and `OPENAI` only. Ollama is not supported by name, but the OpenAI provider passes `OPENAI_API_URL` as `base_url`, so Ollama's OpenAI-compatible endpoint (`http://localhost:11434/v1`) should work. Not tested yet.
- Embedding size is set by `EMBEDDING_MODEL_SIZE`, and it must match the embedding model in use (Cohere v3 = 1024, nomic-embed-text = 768).
- The repo contains both `README.MD` and `README.md`. On Windows only one can exist, so git shows `README.MD` as modified. Do not `git add .` in this clone.
- `Commands.txt` contains docker cleanup commands that delete everything (`docker system prune --all`, `rmi` on all images). Do not run them.
- Machine: Python 3.14 and 3.11 (uv), Node 24, Docker, PostgreSQL 18. Ollama is not installed. The README targets Python 3.12. `pydantic==2.3.0` probably has no wheels for 3.14, so use a 3.11 venv.

### Setup log (for the new README)

| Error | Fix |
|---|---|
| Python 3.14: old pinned `pydantic==2.3.0` | `uv venv --python 3.11 .venv`, then `uv pip install -r src/requirements.txt` |
| `SettingsError: FILE_ALLOWED_TYPES` (empty in `.env.example`) | `FILE_ALLOWED_TYPES=["text/plain","application/pdf"]` |
| `GENERATION_MODEL_ID_LITERAL` / `VECTOR_DB_BACKEND_LITERAL` required but missing from `src/.env.example` | Added both as JSON lists in `.env` (they exist in `docker/env/.env.example.app`) |
| `VECTOR_DB_PGVEC_INDEX_THRESHOLD=` empty | Set to `100` |
| Local PG18 already on 5432 | pgvector container on 5433 |

Decision: OpenAI for both generation and embeddings (`gpt-4o-mini`, `text-embedding-3-small`, size 1536). Note: the original's `docker/env/.env.example.app` lists Ollama models (`llama3`, `qwen3`), so the original author ran Ollama through the OpenAI path.

---

# Team Build Guide

## Purpose

The team takes 17 open-source projects and turns each one into a fully rebranded, fully working product with its own business documentation and demo video. When a project is done, it must look, run and read like an original product built by our team.

Every project is delivered as four things:

1. A fresh repository in the company GitHub with the rebranded code
2. The product running locally with every main feature working
3. A complete business requirements document
4. A 2 to 4 minute demo video

## Workflow

Every project goes through the same 7 stages, in this order. Do not skip ahead.

1. **Clone and run the original as-is.** Confirm it works before changing anything. If it does not run, note exactly what failed.
2. **Understand it.** Click through every screen, read the folder structure, and list every feature.
3. **Rebrand.** New name, colors, logo and text, following the rules below.
4. **Test everything.** Every main feature must work end to end, not just load.
5. **Write the business documentation.** Full business requirements document for the new product.
6. **Record the demo video.** Only after stages 3 to 5 are complete.
7. **Submit.** Push to the company GitHub and fill in the submission checklist.

## Rules for every project

### Naming
- Pick a new product name that does not resemble the original name.
- Replace it everywhere: page titles, navbar, footer, package.json (or Cargo.toml / pyproject.toml), app metadata, emails and notification text, README, and code comments that mention the old name.
- Search the whole codebase for the old name (case-insensitive) before calling it done. Zero results is the target.

### Visual identity
- Create a new full color palette: primary, secondary, background, surface, text and accent colors. Changing one color is not enough.
- Update both light and dark themes if the project has them.
- Change fonts if the original uses custom fonts.
- Create a new logo, favicon and social preview image.
- No original images, illustrations or screenshots left anywhere in the project.

### Content cleanup
- Remove every trace of the original author: names, social links, contact emails, "made by" credits in the UI, analytics IDs and deployed URLs.
- Remove their API keys, project URLs, contract addresses and wallet addresses from config files.
- Replace demo or sample data that mentions the original product.
- Rewrite all landing page and marketing text in your own words for the new product.

### Code
- Create a fresh repository in the company GitHub. Do not fork.
- Never commit `.env`. Add a `.env.example` with placeholder values for every variable.
- The project must build and pass lint with no errors.
- Use clear commit messages, for example `feat: rebrand navbar` or `fix: checkout verification`.
- Write a new README for the new product: what it is, features, tech stack, setup steps and screenshots.

### Running
- Every main feature must work locally, end to end.
- Blockchain projects run on testnets only (Solana devnet, Sepolia, Polygon Amoy, Starknet Sepolia) with test wallets. Never use real funds or a personal wallet.
- AI projects run with a local model through Ollama wherever the project supports it.
- If something is broken in the original, fix it and record the fix in the business document under "Assumptions and constraints".
- Keep a short setup log while you work: every error you hit and how you fixed it. It goes into the new README.

## Business requirements document

Written for the new product name as if we designed it. Create it as a shared doc and link it in the submission checklist. Write it after the product runs, using what was actually seen and tested. Every functional requirement must match a feature that works in the local build.

| # | Section | What goes in it |
|---|---|---|
| 1 | Product overview | What the product is, in 3 to 4 lines |
| 2 | Problem statement | The real-world problem it solves and who has that problem |
| 3 | Target users | 2 to 3 user personas: role, goal, pain point |
| 4 | Value proposition | Why someone would choose this product over alternatives |
| 5 | Goals and success metrics | Measurable targets, for example "payment confirmed in under 30 seconds" |
| 6 | Scope | What is included in this version and what is not |
| 7 | Functional requirements | Numbered list (FR-1, FR-2, and so on) of everything the product does |
| 8 | User stories and flows | "As a [user], I want to [action] so that [result]", plus step-by-step main flows |
| 9 | Non-functional requirements | Security, performance, reliability, usability |
| 10 | System architecture | A diagram plus a short explanation of how the parts connect |
| 11 | Tech stack | Frontend, backend, database, blockchain and AI parts, with versions |
| 12 | Integrations | External services and APIs, and what each is used for |
| 13 | Data model | Main entities, their fields and how they relate |
| 14 | Assumptions and constraints | What the product assumes, plus any fixes made to the original |
| 15 | Risks and mitigations | What could go wrong and how the product handles it |
| 16 | Future roadmap | 5 to 10 realistic next features |
| 17 | Glossary | Technical terms explained in plain language |

## Demo video

Recorded last, only after rebranding, testing and documentation are complete. Length: 2 to 4 minutes.

**Structure**
1. Intro (15 to 20 s): product name, logo and the problem it solves.
2. Main flow walkthrough: the core user journey from start to finish, using realistic data.
3. Key features: each major feature shown working.
4. Under the hood (20 to 30 s): the architecture diagram and tech stack from the business document.
5. Closing: product name, logo and our company branding.

**Rules**
- 1080p resolution, clear voiceover or captions.
- No original branding visible anywhere on screen, including browser tabs and URLs.
- No keys, passwords, seed phrases or private wallet info visible.
- Clean browser: no bookmarks bar, no unrelated tabs, notifications turned off.
- Show real actions, not static screens.
- Export as MP4, named `ProductName_Demo.mp4`, and upload it to the shared drive.

## Appendix
- Colors: coolors.co or realtimecolors.com
- Recording: OBS Studio or Loom
- Ollama: install from ollama.com, then `ollama pull llama3.2` and `ollama serve`
