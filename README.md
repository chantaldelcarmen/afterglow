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

### Common commands

```
docker compose up -d            # run in background (detached)
docker compose logs -f          # follow logs from all services
docker compose logs -f backend  # follow logs from a specific service
docker compose restart          # restart all services
docker compose down -v          # stop and remove volumes (fresh start)
```

---

## Database setup

The database is hosted on [Supabase](https://supabase.com). Schema and seed scripts are in `backend/supabase/`.

### Schema

`backend/supabase/schema.sql` defines all tables, enums, constraints, triggers, and RLS policies.

To apply it to a fresh Supabase project:

1. Open your project in the Supabase dashboard
2. Go to **SQL Editor**
3. Paste the contents of `backend/supabase/schema.sql` and run it

This only needs to be done once per environment. Do not re-run on an existing database - it will fail on duplicate objects.

### Seeding

`backend/supabase/seed.ts` creates the three test accounts and seeds sample experiences, fragments, reflections, and a system flag for demo purposes.

**Prerequisites:** Node.js and the project `.env` file in the project root (with `SUPABASE_URL` and `SUPABASE_SERVICE_KEY`).

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

> This project uses AI assistance (Claude, Anthropic, claude-sonnet-4-6) for development support including debugging, code review, and documentation. All AI-generated or AI-assisted content has been reviewed by the team.
