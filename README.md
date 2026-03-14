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

Requires Docker Desktop installed and running.

1. Get the `.env` file from the team (shared via D2L or secure channel) and place it in the project root.

2. Build and start all services:
```
docker compose up --build
```

3. Access the app:
- Frontend: http://localhost:3000
- Backend: http://localhost:3001

4. Stop the app:
```
docker compose down
```

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