"""
결과 저장/조회 서비스
진단 결과를 DB에 저장하고, Short ID로 조회하는 핵심 서비스.
"""
from database.connection import get_supabase
from utils.short_id import create_unique_short_id
from utils.helpers import get_label_korean
from typing import Optional


def save_result(result_data: dict, session_id: str = None) -> dict:
    """
    진단 결과를 DB에 저장하고 Short ID를 발급합니다.

    Args:
        result_data: 채점 엔진의 출력 딕셔너리
        session_id: (선택) 사용자 세션 ID

    Returns:
        {"short_id": "aBc12xYz", "created_at": "...", "id": int}
    """
    supabase = get_supabase()

    # 1) Short ID 생성 (충돌 검사 포함, 최대 3회 재시도)
    short_id = create_unique_short_id(
        table="diagnosis_results",
        column="short_id"
    )

    # 2) 카테고리 점수 추출
    cats = result_data.get("category_results", {})
    moral = result_data.get("moral_profile", {})
    bias = result_data.get("bias_report", {})

    # 3) INSERT용 레코드 구성
    record = {
        "short_id": short_id,
        "overall_position": result_data["overall_position"],
        "economic_position": result_data["economic_position"],
        "social_position": result_data["social_position"],
        "overall_label": result_data["overall_label"],

        # 카테고리별 점수 (8개)
        "score_economy": cats.get("ECONOMY"),
        "score_welfare": cats.get("WELFARE"),
        "score_security": cats.get("SECURITY"),
        "score_culture": cats.get("CULTURE"),
        "score_environment": cats.get("ENVIRONMENT"),
        "score_rights": cats.get("RIGHTS"),
        "score_tradition": cats.get("TRADITION"),
        "score_governance": cats.get("GOVERNANCE"),

        # 도덕 기반 점수 (5개)
        "moral_care": moral.get("care"),
        "moral_fairness": moral.get("fairness"),
        "moral_loyalty": moral.get("loyalty"),
        "moral_authority": moral.get("authority"),
        "moral_purity": moral.get("purity"),

        # 인지편향
        "bias_count": bias.get("bias_count", 0),
        "bias_types": bias.get("detected_biases", []),

        # 인물 매칭
        "figure_match_ids": result_data.get("figure_matches", []),

        # 인사이트
        "personality_insight": result_data.get("personality_insight", ""),

        # 원본 답변
        "raw_answers": result_data.get("raw_answers", []),
    }

    try:
        response = supabase.table("diagnosis_results").insert(record).execute()
        inserted = response.data[0] if response.data else {}
        return {
            "short_id": short_id,
            "id": inserted.get("id"),
            "created_at": inserted.get("created_at"),
        }
    except Exception as e:
        raise RuntimeError(f"결과 저장 실패: {e}")


def get_result_by_short_id(short_id: str) -> Optional[dict]:
    """
    Short ID로 저장된 결과를 조회합니다.

    Args:
        short_id: 8자리 고유 식별자

    Returns:
        결과 딕셔너리 (없으면 None)
    """
    supabase = get_supabase()

    try:
        response = (
            supabase.table("diagnosis_results")
            .select("*")
            .eq("short_id", short_id)
            .execute()
        )

        if not response.data:
            return None

        row = response.data[0]

        # 한글 라벨 추가
        row["overall_label_display"] = get_label_korean(row.get("overall_label", ""))

        # 카테고리 결과를 딕셔너리로 재구성
        row["category_results"] = {
            "ECONOMY": row.get("score_economy"),
            "WELFARE": row.get("score_welfare"),
            "SECURITY": row.get("score_security"),
            "CULTURE": row.get("score_culture"),
            "ENVIRONMENT": row.get("score_environment"),
            "RIGHTS": row.get("score_rights"),
            "TRADITION": row.get("score_tradition"),
            "GOVERNANCE": row.get("score_governance"),
        }

        # 도덕 프로필을 딕셔너리로 재구성
        row["moral_profile"] = {
            "care": row.get("moral_care"),
            "fairness": row.get("moral_fairness"),
            "loyalty": row.get("moral_loyalty"),
            "authority": row.get("moral_authority"),
            "purity": row.get("moral_purity"),
        }

        return row

    except Exception as e:
        raise RuntimeError(f"결과 조회 실패: {e}")


def get_all_results_for_stats() -> list[dict]:
    """
    전역 통계 계산용 — 모든 결과의 라벨과 위치값만 반환합니다.
    개인정보(raw_answers 등)는 제외합니다.

    Returns:
        list[dict]: [{"overall_label": "...", "overall_position": 0.65, ...}]
    """
    supabase = get_supabase()

    try:
        response = (
            supabase.table("diagnosis_results")
            .select(
                "overall_label, overall_position, economic_position, "
                "social_position, figure_match_ids, created_at"
            )
            .order("created_at", desc=True)
            .limit(5000)  # Supabase 무료 티어 고려
            .execute()
        )
        return response.data or []
    except Exception as e:
        print(f"⚠️ 통계 데이터 조회 실패: {e}")
        return []


def get_result_history(user_id: str = None, limit: int = 10) -> list[dict]:
    """
    결과 이력을 조회합니다 (최신순).

    Args:
        user_id: (선택) 특정 사용자의 이력만 조회
        limit: 최대 반환 개수

    Returns:
        list[dict]: 결과 요약 리스트
    """
    supabase = get_supabase()

    try:
        query = (
            supabase.table("diagnosis_results")
            .select("short_id, overall_label, overall_position, created_at")
            .order("created_at", desc=True)
            .limit(limit)
        )

        if user_id:
            query = query.eq("user_id", user_id)

        response = query.execute()

        for row in (response.data or []):
            row["overall_label_display"] = get_label_korean(row.get("overall_label", ""))

        return response.data or []
    except Exception as e:
        print(f"⚠️ 이력 조회 실패: {e}")
        return []
