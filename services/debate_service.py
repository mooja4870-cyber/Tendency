"""
토론 투표 서비스
주간 토론 주제 관리, 투표 제출/집계, 성향별 분석을 수행합니다.
"""
from datetime import datetime, timedelta, timezone
from typing import Optional
from database.connection import get_supabase
from utils.helpers import generate_session_hash, get_label_korean

# 성향 그룹 매핑
CONSERVATIVE_LABELS = {
    "STRONG_CONSERVATIVE", "CONSERVATIVE",
    "MODERATE_CONSERVATIVE", "LEAN_CONSERVATIVE"
}
CENTER_LABELS = {"CENTER_RIGHT", "CENTER_LEFT"}
PROGRESSIVE_LABELS = {
    "LEAN_PROGRESSIVE", "MODERATE_PROGRESSIVE",
    "PROGRESSIVE", "STRONG_PROGRESSIVE"
}


def _get_group(label: str) -> str:
    """성향 라벨을 3개 그룹으로 분류합니다."""
    if label in CONSERVATIVE_LABELS:
        return "보수 성향"
    elif label in CENTER_LABELS:
        return "중도 성향"
    elif label in PROGRESSIVE_LABELS:
        return "진보 성향"
    return "기타"


def get_current_topic() -> Optional[dict]:
    """
    현재 활성화된 토론 주제를 조회합니다.
    총 투표수도 함께 반환합니다.
    """
    supabase = get_supabase()
    try:
        response = (
            supabase.table("debate_topics")
            .select("*")
            .eq("is_active", True)
            .limit(1)
            .execute()
        )
        if not response.data:
            return None

        topic = response.data[0]

        # 총 투표수 조회
        vote_count = (
            supabase.table("votes")
            .select("id", count="exact")
            .eq("topic_id", topic["id"])
            .execute()
        )
        topic["total_votes"] = vote_count.count or 0

        return topic
    except Exception as e:
        print(f"⚠️ 토론 주제 조회 실패: {e}")
        return None


def get_topic_by_id(topic_id: int) -> Optional[dict]:
    """특정 토론 주제를 조회합니다."""
    supabase = get_supabase()
    try:
        response = (
            supabase.table("debate_topics")
            .select("*")
            .eq("id", topic_id)
            .execute()
        )
        return response.data[0] if response.data else None
    except Exception:
        return None


def submit_vote(
    topic_id: int,
    choice: str,
    voter_label: str,
    session_id: str,
) -> dict:
    """
    투표를 제출합니다.

    Args:
        topic_id: 토론 주제 ID
        choice: "AGREE" | "UNSURE" | "DISAGREE"
        voter_label: 투표자의 성향 라벨 (영문)
        session_id: 브라우저 세션 ID

    Returns:
        {"accepted": bool, "message": str}
    """
    supabase = get_supabase()

    # 세션 해시 생성 (중복 투표 방지)
    session_hash = generate_session_hash(session_id, str(topic_id))

    record = {
        "topic_id": topic_id,
        "voter_label": voter_label,
        "choice": choice,
        "session_hash": session_hash,
    }

    try:
        supabase.table("votes").insert(record).execute()
        return {"accepted": True, "message": "투표 완료! 🗳️"}
    except Exception as e:
        error_msg = str(e).lower()
        if "duplicate" in error_msg or "unique" in error_msg or "conflict" in error_msg:
            return {"accepted": False, "message": "이미 투표하셨습니다 ✅"}
        raise RuntimeError(f"투표 실패: {e}")


def has_user_voted(topic_id: int, session_id: str) -> bool:
    """세션 ID로 이미 투표했는지 확인합니다."""
    supabase = get_supabase()
    session_hash = generate_session_hash(session_id, str(topic_id))

    try:
        response = (
            supabase.table("votes")
            .select("id")
            .eq("topic_id", topic_id)
            .eq("session_hash", session_hash)
            .execute()
        )
        return bool(response.data)
    except Exception:
        return False


def get_vote_results(
    topic_id: int,
    my_label: str = None,
    my_choice: str = None,
) -> dict:
    """
    투표 결과를 성향별로 집계하여 반환합니다.

    Args:
        topic_id: 토론 주제 ID
        my_label: (선택) 사용자의 성향 라벨
        my_choice: (선택) 사용자의 투표 선택

    Returns:
        전체/성향별 집계 + 교차 합의 분석 + 사용자 인사이트
    """
    supabase = get_supabase()

    try:
        response = (
            supabase.table("votes")
            .select("voter_label, choice")
            .eq("topic_id", topic_id)
            .execute()
        )
        votes = response.data or []
    except Exception as e:
        print(f"⚠️ 투표 결과 조회 실패: {e}")
        votes = []

    total = len(votes)
    if total == 0:
        return {
            "topic_id": topic_id,
            "total_votes": 0,
            "overall": {"agree": 0, "disagree": 0, "unsure": 0},
            "by_orientation": {},
            "cross_party": {"exists": False, "message": ""},
            "user_insight": None,
        }

    # 전체 집계
    overall_agree = sum(1 for v in votes if v["choice"] == "AGREE")
    overall_disagree = sum(1 for v in votes if v["choice"] == "DISAGREE")
    overall_unsure = total - overall_agree - overall_disagree

    overall = {
        "agree": round(overall_agree * 100 / total),
        "disagree": round(overall_disagree * 100 / total),
        "unsure": round(overall_unsure * 100 / total),
    }

    # 성향별 집계
    groups = {"보수 성향": [], "중도 성향": [], "진보 성향": []}
    for v in votes:
        g = _get_group(v["voter_label"])
        if g in groups:
            groups[g].append(v["choice"])

    by_orientation = {}
    for group_name, choices in groups.items():
        cnt = len(choices)
        if cnt == 0:
            by_orientation[group_name] = {
                "count": 0, "agree": 0, "disagree": 0, "unsure": 0
            }
        else:
            by_orientation[group_name] = {
                "count": cnt,
                "agree": round(sum(1 for c in choices if c == "AGREE") * 100 / cnt),
                "disagree": round(sum(1 for c in choices if c == "DISAGREE") * 100 / cnt),
                "unsure": round(sum(1 for c in choices if c == "UNSURE") * 100 / cnt),
            }

    # 교차 성향 합의 분석
    cross_party = {"exists": False, "message": ""}
    cons = by_orientation.get("보수 성향", {})
    prog = by_orientation.get("진보 성향", {})

    for choice_key, choice_kr in [("agree", "찬성"), ("disagree", "반대")]:
        c_pct = cons.get(choice_key, 0)
        p_pct = prog.get(choice_key, 0)
        if c_pct >= 30 and p_pct >= 30:
            cross_party = {
                "exists": True,
                "message": f"보수와 진보 모두 30% 이상이 {choice_kr}했습니다. 성향을 넘어선 공감이 존재합니다. 🤝",
            }
            break

    # 사용자 인사이트
    user_insight = None
    if my_label and my_choice:
        user_group = _get_group(my_label)
        group_stats = by_orientation.get(user_group, {})

        # 그룹 다수 선택
        majority_choice = max(
            ["agree", "disagree", "unsure"],
            key=lambda c: group_stats.get(c, 0),
        )
        majority_map = {"agree": "AGREE", "disagree": "DISAGREE", "unsure": "UNSURE"}
        aligned = my_choice == majority_map[majority_choice]

        group_pct = group_stats.get(my_choice.lower(), 0)

        if aligned:
            msg = f"당신은 자신의 성향 그룹({user_group})과 같은 선택을 했습니다. ✅"
        else:
            msg = (
                f"당신은 자신의 성향 그룹({user_group})과 다른 선택을 했습니다. "
                f"독립적인 사고를 가지고 있네요! 🤔"
            )

        user_insight = {
            "user_group": user_group,
            "user_choice": my_choice,
            "group_majority": majority_map[majority_choice],
            "group_pct": group_pct,
            "aligned": aligned,
            "message": msg,
        }

    return {
        "topic_id": topic_id,
        "total_votes": total,
        "overall": overall,
        "by_orientation": by_orientation,
        "cross_party": cross_party,
        "user_insight": user_insight,
    }


def get_archived_topics() -> list[dict]:
    """과거 토론 주제 목록을 최신순으로 반환합니다."""
    supabase = get_supabase()
    try:
        response = (
            supabase.table("debate_topics")
            .select("*")
            .eq("is_active", False)
            .order("created_at", desc=True)
            .limit(20)
            .execute()
        )
        return response.data or []
    except Exception:
        return []


def create_topic(
    title: str,
    description: str,
    pro_args: list[str],
    con_args: list[str],
    related_category: str,
    duration_days: int = 7,
) -> dict:
    """관리자용: 새 토론 주제를 생성합니다."""
    supabase = get_supabase()
    now = datetime.now(timezone.utc)

    # 기존 최대 week_number 조회
    try:
        resp = (
            supabase.table("debate_topics")
            .select("week_number")
            .order("week_number", desc=True)
            .limit(1)
            .execute()
        )
        max_week = resp.data[0]["week_number"] if resp.data else 0
    except Exception:
        max_week = 0

    record = {
        "week_number": max_week + 1,
        "title": title,
        "description": description,
        "pro_arguments": pro_args,
        "con_arguments": con_args,
        "related_category": related_category,
        "is_active": False,
        "starts_at": now.isoformat(),
        "ends_at": (now + timedelta(days=duration_days)).isoformat(),
    }

    try:
        response = supabase.table("debate_topics").insert(record).execute()
        return response.data[0] if response.data else {}
    except Exception as e:
        raise RuntimeError(f"토론 주제 생성 실패: {e}")


def activate_topic(topic_id: int) -> bool:
    """관리자용: 주제를 활성화하고 기존 활성 주제를 비활성화합니다."""
    supabase = get_supabase()
    try:
        # 모든 주제 비활성화
        supabase.table("debate_topics").update(
            {"is_active": False}
        ).eq("is_active", True).execute()

        # 선택한 주제 활성화
        supabase.table("debate_topics").update(
            {"is_active": True}
        ).eq("id", topic_id).execute()

        return True
    except Exception as e:
        print(f"⚠️ 주제 활성화 실패: {e}")
        return False
