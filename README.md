# PromptGrade AI

PromptGrade AI is an AI Prompt Governance Platform — SonarQube for prompts.

A user submits a prompt and selects a technical domain. The backend evaluates the prompt from 0 to 1 using LangGraph orchestration. If the score is below 0.8, the system rewrites and re-evaluates the prompt in a loop for up to 3 iterations. The frontend displays the final scorecard, before/after diff, radar chart, analytics dashboard, history, and governance leaderboard.

## Tech Stack

### Backend

- Python 3.11+
- FastAPI
- Uvicorn
- LangGraph
- LangChain OpenAI
- OpenAI Python SDK
- SQLite via Python stdlib `sqlite3`
- Pydantic v2
- python-dotenv

### Frontend

- React 18
- TypeScript
- Vite
- Tailwind CSS
- Recharts
- Axios
- React Router v6

## Project Structure

```text
promptgrade-ai/
├── backend/
│   ├── agents/
│   ├── graph/
│   ├── prompts/
│   ├── routes/
│   ├── db/
│   ├── models/
│   ├── main.py
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── src/
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   ├── tsconfig.node.json
│   ├── vite.config.ts
│   └── tailwind.config.js
└── README.md
```

## Setup Instructions

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate
# Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# Add OPENAI_API_KEY to .env
uvicorn main:app --reload --port 8000
```

Health check:

```bash
curl http://localhost:8000/health
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Open:

```text
http://localhost:5173
```

## Test Flow

1. Open `http://localhost:5173/evaluate`.
2. Paste: `Write a React component for a user form`.
3. Select domain: `Frontend`.
4. Click `Evaluate`.
5. Confirm the scorecard appears.
6. Confirm the rewrite loop runs automatically when the initial score is below `0.8`.
7. Confirm the final score, radar chart, diff viewer, history, and analytics pages work.

## API Endpoints

- `GET /health`
- `POST /api/evaluate`
- `GET /api/evaluate/{evaluation_id}/status`
- `GET /api/evaluations`
- `GET /api/evaluations/{evaluation_id}`
- `GET /api/analytics`

## Notes

- Backend is Python only.
- Frontend is React + TypeScript only.
- SQLite is initialized automatically on FastAPI startup.
- Seed data is idempotent and only inserted when tables are empty.
- CORS is configured for `http://localhost:5173`.
