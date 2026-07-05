# GoNoGo

GoNoGo is an event planning assistant powered by AI.

## Architecture

```mermaid
graph TD
    A[Next.js Frontend\n(Vercel)] -->|HTTP| B[FastAPI Backend\n(Render/Railway)]
    B -->|Tool calls| C[External Services\nOpenAI API, Open-Meteo API]
    B -->|Persistence| D[PostgreSQL]
```

## Features

- **Sequential Tool Badges**: Provides clear transparency into the AI's step-by-step reasoning process.
- **Hero Treatment Summary Cards**: Dynamic UI cards highlight the event's go/no-go status based on real weather data.
- **Multi-Currency Support**: Accurate inferencing of local currencies from conversational context (USD, INR, EUR, etc.), passing through strictly from the backend rather than letting the LLM hallucinate symbols.
- **Zero-Typing Empty State**: Suggestion chips for effortless demonstration of different contexts and scenarios out-of-the-box.

## Live Demo
[Insert Live Demo Link Here]

![GoNoGo Demo Placeholder](https://placehold.co/600x400?text=GoNoGo+UI+Screenshot)

## Local Setup

```bash
docker-compose up -d --build
```
Navigate to `http://localhost:3000` to interact with the frontend.

## Rubric Mapping
| Requirement | Implementation |
| ----------- | -------------- |
| Architecture | Next.js Frontend + FastAPI Backend + PostgreSQL DB |
| GenAI Usage | OpenAI function calling for tools (`get_weather`, `calculate_event_cost`), strict JSON schemas, and structured PlanSummary extraction |
| Correctness | Robust handling of edge cases, deterministic math through tool offloading, and multi-currency context awareness |

## Tech Stack
- Frontend: Next.js (React), Tailwind CSS, Lucide Icons, Google Fonts (Space Grotesk)
- Backend: FastAPI (Python), SQLAlchemy, Alembic
- Database: PostgreSQL (Prod), SQLite (Local Dev)
- GenAI: OpenAI API (gpt-5.4-mini)
- Deployment: Docker, Docker Compose, GitHub Actions (CI)
