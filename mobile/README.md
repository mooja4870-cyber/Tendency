# Prism Mobile MVP (Expo)

## Run

```bash
cd mobile
npm install
npm run start
```

## API Base URL

- Default is `http://localhost:8000` in `src/api.js`.
- For device testing, change it to your machine LAN IP (example: `http://192.168.0.10:8000`).

## Flow

1. Fetch questions from `GET /questions`
2. Submit answers to `POST /quiz/submit`
3. Render result
4. Re-fetch by `GET /result/{result_id}`
