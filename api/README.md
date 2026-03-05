# Prism API (Mobile Backend MVP)

## Run

```bash
cd api
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

## Endpoints

- `GET /health`
- `GET /questions`
- `POST /quiz/submit`
- `GET /result/{result_id}`

## Persistence

- If `SUPABASE_URL` and `SUPABASE_KEY` are set, results are saved to Supabase table `diagnosis_results`.
- If not set (or DB insert fails), API keeps JSON fallback store at `api/data/results.json`.

## Request Example

```json
{
  "session_id": "test-session",
  "answers": [
    { "question_id": 1, "choice": "YES", "response_time_ms": 1200 },
    { "question_id": 2, "choice": "NO", "response_time_ms": 980 }
  ]
}
```

## Notes

- Uses existing `prism-app` scoring and bias logic.
- Reads questions from `prism-app/data/questions.json`.
- Result storage is in-memory for MVP. Restarting server clears saved results.
