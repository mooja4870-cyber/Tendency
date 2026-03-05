import json
import os
import secrets
import string
import sys
import threading
import time
from pathlib import Path

from fastapi import HTTPException

from schemas import QuizSubmitRequest


PROJECT_ROOT = Path(__file__).resolve().parents[1]
PRISM_APP_DIR = PROJECT_ROOT / "prism-app"
if str(PRISM_APP_DIR) not in sys.path:
    sys.path.insert(0, str(PRISM_APP_DIR))

from database.models import (  # noqa: E402
    AnswerChoice,
    MoralFoundation,
    PoliticalDimension,
    Polarity,
    Question,
    QuestionCategory,
    UserAnswer,
)
from utils.bias_detector import BiasDetector  # noqa: E402
from utils.scoring_engine import ScoringEngine  # noqa: E402


QUESTIONS_PATH = PRISM_APP_DIR / "data" / "questions.json"
RESULTS_PATH = PROJECT_ROOT / "api" / "data" / "results.json"
_RESULT_STORE: dict[str, dict] = {}
_STORE_LOCK = threading.Lock()

_ALPHABET = string.ascii_letters + string.digits

try:
    from supabase import Client, create_client
except ModuleNotFoundError:
    Client = object
    create_client = None

_SUPABASE_CLIENT: Client | None = None


def _new_result_id(length: int = 8) -> str:
    return "".join(secrets.choice(_ALPHABET) for _ in range(length))


def _get_supabase_client() -> Client | None:
    global _SUPABASE_CLIENT
    if _SUPABASE_CLIENT is not None:
        return _SUPABASE_CLIENT

    if create_client is None:
        return None

    url = os.getenv("SUPABASE_URL", "").strip()
    key = os.getenv("SUPABASE_KEY", "").strip()
    if not url or not key:
        return None

    try:
        _SUPABASE_CLIENT = create_client(url, key)
        return _SUPABASE_CLIENT
    except Exception:
        return None


def _ensure_store_loaded() -> None:
    if _RESULT_STORE:
        return
    if not RESULTS_PATH.exists():
        return
    try:
        with RESULTS_PATH.open("r", encoding="utf-8") as f:
            data = json.load(f)
        if isinstance(data, dict):
            _RESULT_STORE.update(data)
    except Exception:
        pass


def _flush_store() -> None:
    try:
        RESULTS_PATH.parent.mkdir(parents=True, exist_ok=True)
        with RESULTS_PATH.open("w", encoding="utf-8") as f:
            json.dump(_RESULT_STORE, f, ensure_ascii=False)
    except Exception:
        pass


def _build_db_record(result_id: str, result: dict) -> dict:
    cats = result.get("category_results", {})
    moral = result.get("moral_profile", {})
    bias = result.get("bias_report", {})
    return {
        "short_id": result_id,
        "overall_position": result["overall_position"],
        "economic_position": result["economic_position"],
        "social_position": result["social_position"],
        "overall_label": result["overall_label"],
        "score_economy": cats.get("ECONOMY"),
        "score_welfare": cats.get("WELFARE"),
        "score_security": cats.get("SECURITY"),
        "score_culture": cats.get("CULTURE"),
        "score_environment": cats.get("ENVIRONMENT"),
        "score_rights": cats.get("RIGHTS"),
        "score_tradition": cats.get("TRADITION"),
        "score_governance": cats.get("GOVERNANCE"),
        "moral_care": moral.get("care"),
        "moral_fairness": moral.get("fairness"),
        "moral_loyalty": moral.get("loyalty"),
        "moral_authority": moral.get("authority"),
        "moral_purity": moral.get("purity"),
        "bias_count": bias.get("bias_count", 0),
        "bias_types": bias.get("detected_biases", []),
        "figure_match_ids": result.get("figure_matches", []),
        "personality_insight": result.get("personality_insight", ""),
        "raw_answers": result.get("raw_answers", []),
    }


def _db_save_result(result_id: str, result: dict) -> bool:
    client = _get_supabase_client()
    if client is None:
        return False
    try:
        record = _build_db_record(result_id, result)
        client.table("diagnosis_results").insert(record).execute()
        return True
    except Exception:
        return False


def _db_to_result(row: dict) -> dict:
    return {
        "overall_position": row.get("overall_position"),
        "economic_position": row.get("economic_position"),
        "social_position": row.get("social_position"),
        "overall_label": row.get("overall_label"),
        "category_results": {
            "ECONOMY": row.get("score_economy"),
            "WELFARE": row.get("score_welfare"),
            "SECURITY": row.get("score_security"),
            "CULTURE": row.get("score_culture"),
            "ENVIRONMENT": row.get("score_environment"),
            "RIGHTS": row.get("score_rights"),
            "TRADITION": row.get("score_tradition"),
            "GOVERNANCE": row.get("score_governance"),
        },
        "moral_profile": {
            "care": row.get("moral_care"),
            "fairness": row.get("moral_fairness"),
            "loyalty": row.get("moral_loyalty"),
            "authority": row.get("moral_authority"),
            "purity": row.get("moral_purity"),
        },
        "bias_report": {
            "bias_count": row.get("bias_count", 0),
            "detected_biases": row.get("bias_types", []),
        },
        "personality_insight": row.get("personality_insight", ""),
        "raw_answers": row.get("raw_answers", []),
    }


def _db_get_result(result_id: str) -> dict | None:
    client = _get_supabase_client()
    if client is None:
        return None
    try:
        response = (
            client.table("diagnosis_results")
            .select("*")
            .eq("short_id", result_id)
            .limit(1)
            .execute()
        )
        if not response.data:
            return None
        return _db_to_result(response.data[0])
    except Exception:
        return None


def _to_question(row: dict) -> Question:
    question_id = int(row.get("id", row["order_index"]))

    moral_value = row.get("moral_foundation")
    moral = MoralFoundation(moral_value) if moral_value else None

    return Question(
        id=question_id,
        order_index=int(row["order_index"]),
        text=row.get("text_ko", ""),
        category=QuestionCategory(row["category"]),
        dimension=PoliticalDimension(row["dimension"]),
        moral_foundation=moral,
        polarity=Polarity(row["polarity"]),
        contradicts_with=row.get("contradicts_with"),
    )


def load_questions() -> list[Question]:
    if not QUESTIONS_PATH.exists():
        raise HTTPException(status_code=500, detail="Questions file not found")

    with QUESTIONS_PATH.open("r", encoding="utf-8") as f:
        raw = json.load(f)

    try:
        return [_to_question(row) for row in raw]
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Invalid questions data: {exc}") from exc


def _choice_from_string(choice: str) -> AnswerChoice:
    mapping = {
        "YES": AnswerChoice.YES,
        "UNSURE": AnswerChoice.UNSURE,
        "NO": AnswerChoice.NO,
    }
    return mapping[choice]


def list_questions() -> list[dict]:
    questions = load_questions()
    return [
        {
            "id": q.id,
            "order_index": q.order_index,
            "text_ko": q.text,
            "category": q.category.value,
            "dimension": q.dimension.value,
            "moral_foundation": q.moral_foundation.value if q.moral_foundation else None,
            "polarity": q.polarity.value,
        }
        for q in questions
    ]


def _to_answers(payload: QuizSubmitRequest, question_ids: set[int]) -> list[UserAnswer]:
    answers: list[UserAnswer] = []

    for answer in payload.answers:
        if answer.question_id not in question_ids:
            raise HTTPException(
                status_code=400,
                detail=f"Unknown question_id: {answer.question_id}",
            )

        answers.append(
            UserAnswer(
                question_id=answer.question_id,
                choice=_choice_from_string(answer.choice),
                timestamp=time.time(),
                response_time_ms=answer.response_time_ms,
            )
        )

    return answers


def compute_result(payload: QuizSubmitRequest) -> tuple[str, dict]:
    questions = load_questions()
    question_ids = {q.id for q in questions}
    answers = _to_answers(payload, question_ids)

    if not answers:
        raise HTTPException(status_code=400, detail="answers must not be empty")

    engine = ScoringEngine()
    detector = BiasDetector()

    result = engine.calculate_result(answers, questions)
    result["bias_report"] = detector.detect(answers, questions)
    result["raw_answers"] = [
        {
            "question_id": a.question_id,
            "choice": a.choice.name,
            "response_time_ms": a.response_time_ms,
        }
        for a in answers
    ]
    result["session_id"] = payload.session_id

    with _STORE_LOCK:
        _ensure_store_loaded()
        result_id = _new_result_id()
        while result_id in _RESULT_STORE:
            result_id = _new_result_id()
        _RESULT_STORE[result_id] = result
        _flush_store()
        _db_save_result(result_id, result)

    return result_id, result


def get_result_by_id(result_id: str) -> dict | None:
    db_result = _db_get_result(result_id)
    if db_result is not None:
        return db_result

    with _STORE_LOCK:
        _ensure_store_loaded()
        return _RESULT_STORE.get(result_id)
