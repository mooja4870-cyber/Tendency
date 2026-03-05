from typing import Literal, Optional

from pydantic import BaseModel, Field


ChoiceLiteral = Literal["YES", "UNSURE", "NO"]


class AnswerIn(BaseModel):
    question_id: int
    choice: ChoiceLiteral
    response_time_ms: float = Field(default=0.0, ge=0.0)


class QuizSubmitRequest(BaseModel):
    answers: list[AnswerIn]
    session_id: Optional[str] = None


class HealthResponse(BaseModel):
    status: str


class QuizSubmitResponse(BaseModel):
    result_id: str
    result: dict


class QuestionOut(BaseModel):
    id: int
    order_index: int
    text_ko: str
    category: str
    dimension: str
    moral_foundation: Optional[str] = None
    polarity: str
