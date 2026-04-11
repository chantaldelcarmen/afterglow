# Afterglow

Afterglow is a web app for capturing and reliving meaningful experiences.  
Instead of just storing photos or videos, the goal is to help users reflect on a moment and revisit the emotional highlights later.

This project is being built as part of **SENG 513 – Web Systems** at the University of Calgary.

Team: PG-7

---

## Team

- Chantal del Carmen
- Stephanie Sevilla
- Taiwu Chen
- Jessica Thomas
- Jericho Lyle Huelar
- Jacob Situ

---

## Tech Stack

Frontend
- React
- TypeScript
- Vite

Backend
- NestJS

Database
- Supabase / PostgreSQL

DevOps
- Docker
- GitLab

---

## Project Structure

frontend/
React UI and interaction flows

backend/
NestJS API and business logic

tools/
project tooling (GitLab issue automation)

---

## Running the project

### Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running — Docker Desktop must be open before running any `docker` commands, but you don't need to do anything in the UI
- Windows users: WSL2 must be enabled (Docker Desktop will prompt you if it isn't)

### Setup

1. Clone the repository:
```
git clone https://csgit.ucalgary.ca/chantal.delcarmen/seng513-202601-pg7.git
cd seng513-202601-pg7
```

2. Get the `.env` file from the team (shared via D2L or secure channel) and place it in the project root.

3. Build and start all services:
```
docker compose up --build
```

4. Access the app:
- Frontend: http://localhost:3000
- Backend: http://localhost:3001

5. Stop the app:
```
docker compose down
```

Optional frontend-only notes, including ngrok and viewport presets for browser testing, are in [frontend/README.md](frontend/README.md).

If using ngrok with Docker, set `VITE_ALLOWED_HOSTS` in your root `.env` to the ngrok host (or comma-separated hosts), then restart:

```
docker compose up --build -d
```

### Common commands

```
docker compose up -d            # run in background (detached)
docker compose logs -f          # follow logs from all services
docker compose logs -f backend  # follow logs from a specific service
docker compose restart          # restart all services
docker compose down -v          # stop and remove volumes (fresh start)
```

### Viewport testing in Chrome DevTools

Use these steps to test responsive layouts consistently.

1. Open the app in Google Chrome.
2. Open DevTools (`F12` or `Ctrl+Shift+I`).
3. Toggle device toolbar (`Ctrl+Shift+M`).
4. In the top device bar, choose a preset or enter custom width/height.
5. Set the device pixel ratio (DPR) value if needed.

Recommended presets for this project:

- iPhone 16: width `393`, height `852`, DPR `3`
- Desktop balanced: width `1440`, height `900`, DPR `1`

---

## Database setup

The database is hosted on [Supabase](https://supabase.com). Schema and seed scripts are in `backend/supabase/`.

### Environment setup

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **Project Settings > API** and copy:
   - Project URL -> `SUPABASE_URL`
   - Service Role Key -> `SUPABASE_SERVICE_KEY`
   - Anon/Public Key -> `SUPABASE_PUBLISHABLE_DEFAULT_KEY` and `VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY`
3. Copy `.env.example` to `.env` and fill in those values

### Schema

`backend/supabase/schema.sql` defines all tables, enums, constraints, triggers, and RLS policies.

To apply it to a fresh Supabase project:

1. Open your project in the Supabase dashboard
2. Go to **SQL Editor**
3. Paste the contents of `backend/supabase/schema.sql` and run it

This only needs to be done once per environment. Do not re-run on an existing database - it will fail on duplicate objects.

### Seeding

`backend/supabase/seed.ts` creates the four test accounts and seeds sample experiences, fragments, reflections, and a system flag for demo purposes.

**Prerequisites:** Node.js and a `.env` file in the project root with at minimum `SUPABASE_URL` and `SUPABASE_SERVICE_KEY` set (see Environment setup above).

Run from the `backend/api` directory so that `node_modules` are resolved correctly:

```
cd backend/api
npx tsx ../supabase/seed.ts
```

The script is safe to run multiple times - it upserts accounts and clears sample data before re-seeding.

**Test accounts created by the seed:**

| Email | Password | Role |
|---|---|---|
| user@afterglow.dev | Afterglow1234! | user |
| user2@afterglow.dev | Afterglow1234! | user |
| reviewer@afterglow.dev | Afterglow1234! | platform_reviewer |
| admin@afterglow.dev | Afterglow1234! | admin |

---

## Git workflow

We are using a simple feature branch workflow.

Typical workflow:

```
git pull
git switch -c feature/your-feature
git commit -m "message"
git push origin HEAD
```

Changes are merged through merge requests and reviewed before being added to `main`.

---

## Project board

The GitLab issue board is used to track tasks and progress.

Labels are organized by:

- area (frontend, backend, database, devops)
- priority (high, medium, low)
- status (backlog, in-progress, review, done)

Initial issues were generated from the project timeline using a small automation script in `tools/gitlab-automation`.

---

## Development Notes

This project leverages Claude Code (Anthropic's Claude) for development assistance, including:
- **Debugging and troubleshooting** — identifying root causes, testing fixes, and validating solutions
- **Code review and feedback** — reviewing PRs, identifying patterns, and suggesting improvements
- **Documentation writing and refinement** — creating and refining technical docs, comments, and guides

### Example Use Cases

**Code Review Prompts:**
```
"review this branch and only call out things that are major red flags or blockers"
"check if there are any merge conflicts and help resolve them"
```

**Debugging Prompts:**
```
"how to reproduce the issue to double check the fixes"
"why is the nav disappearing randomly after a period of time"
```

All code and documentation changes are reviewed and verified by the development team. Claude Code is used as a development tool to accelerate feedback cycles and improve code quality, not as a replacement for human judgment and review.

---
