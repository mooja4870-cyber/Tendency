from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from schemas import HealthResponse, QuestionOut, QuizSubmitRequest, QuizSubmitResponse
from services import compute_result, get_result_by_id, list_questions


app = FastAPI(
    title="Prism API",
    version="0.1.0",
    description="Mobile app backend for Prism",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health", response_model=HealthResponse)
def health() -> HealthResponse:
    return HealthResponse(status="ok")


@app.post("/quiz/submit", response_model=QuizSubmitResponse)
def submit_quiz(payload: QuizSubmitRequest) -> QuizSubmitResponse:
    result_id, result = compute_result(payload)
    return QuizSubmitResponse(result_id=result_id, result=result)


@app.get("/questions", response_model=list[QuestionOut])
def get_questions() -> list[QuestionOut]:
    return [QuestionOut(**q) for q in list_questions()]


@app.get("/result/{result_id}")
def get_result(result_id: str) -> dict:
    result = get_result_by_id(result_id)
    if result is None:
        raise HTTPException(status_code=404, detail="Result not found")
    return {"result_id": result_id, "result": result}
