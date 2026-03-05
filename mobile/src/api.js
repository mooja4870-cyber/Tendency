const API_BASE_URL = "http://localhost:8000";

export async function fetchQuestions() {
  const res = await fetch(`${API_BASE_URL}/questions`);
  if (!res.ok) throw new Error(`questions fetch failed: ${res.status}`);
  return res.json();
}

export async function submitQuiz(answers, sessionId) {
  const res = await fetch(`${API_BASE_URL}/quiz/submit`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      session_id: sessionId,
      answers,
    }),
  });
  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`submit failed: ${res.status} ${detail}`);
  }
  return res.json();
}

export async function getResult(resultId) {
  const res = await fetch(`${API_BASE_URL}/result/${resultId}`);
  if (!res.ok) throw new Error(`result fetch failed: ${res.status}`);
  return res.json();
}
