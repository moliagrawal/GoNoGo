# GoNoGo

GoNoGo is an event planning assistant powered by AI.

## Architecture

```mermaid
graph TD
    A[Next.js Frontend\n(Vercel)] -->|HTTP| B[FastAPI Backend\n(Render/Railway)]
    B -->|Tool calls| C[External Services\nOpenAI API, Open-Meteo API]
    B -->|Persistence| D[PostgreSQL]
```

## Live Demo
[Insert Live Demo Link Here]

## Local Setup

```bash
docker-compose up -d --build
```
Navigate to `http://localhost:3000` to interact with the frontend.

## Rubric Mapping
| Requirement | Implementation |
| ----------- | -------------- |
| Architecture | Next.js Frontend + FastAPI Backend + PostgreSQL DB |
| GenAI Usage | OpenAI function calling for tools (`get_weather`, `calculate_event_cost`) |

## Tech Stack
- Frontend: Next.js (React), Tailwind CSS
- Backend: FastAPI (Python), SQLAlchemy, Alembic
- Database: PostgreSQL (Prod), SQLite (Local Dev)
- GenAI: OpenAI API (gpt-5.4-mini)
- Deployment: Docker, Docker Compose, GitHub Actions (CI)
