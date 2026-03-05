"""
궁합 비교 서비스
초대 링크 생성, 조회, 두 사람의 결과 비교 분석을 수행합니다.
"""
import math
from datetime import datetime, timedelta, timezone
from typing import Optional
from database.connection import get_supabase
from utils.short_id import create_unique_short_id
from utils.helpers import get_label_korean, CATEGORY_DISPLAY, MORAL_DISPLAY
from services.result_service import get_result_by_short_id


# 카테고리별 조언 딕셔너리
ADVICE_MAP = {
    "ECONOMY": "경제 문제를 대화할 때는 '효율성 vs 형평성'이라는 프레임을 공유하면 서로의 입장을 이해하기 쉬워집니다.",
    "WELFARE": "복지에 대한 시각 차이는 '누가 도움받을 자격이 있는가'에 대한 다른 직관에서 옵니다. 서로의 경험을 먼저 들어보세요.",
    "SECURITY": "안보 이슈를 대화할 때는 서로의 '두려움'이 무엇인지 먼저 물어보세요.",
    "CULTURE": "문화적 가치관 차이는 가장 감정적인 영역입니다. '왜 그렇게 느끼는지'를 물어보는 것부터 시작하세요.",
    "ENVIRONMENT": "환경 문제는 '미래 세대 vs 현재 생계'의 긴장입니다. 양쪽 모두 선한 의도가 있음을 인정하세요.",
    "RIGHTS": "인권 관련 대화에서는 '자유의 범위'에 대한 서로 다른 정의를 먼저 확인하세요.",
    "TRADITION": "전통과 변화에 대한 다른 감각은 자연스러운 것입니다. '무엇을 지키고 싶은가'를 서로 물어보세요.",
    "GOVERNANCE": "거버넌스 관련 차이는 '효율 vs 견제'의 균형점 차이입니다.",
}


def create_invite_link(inviter_result_short_id: str) -> dict:
    """
    궁합 초대 링크를 생성합니다.

    Args:
        inviter_result_short_id: 초대자의 결과 Short ID

    Returns:
        {"invite_code": "...", "expires_at": "...", "share_message": "..."}
    """
    supabase = get_supabase()

    # 1) 초대자 결과 확인
    inviter = get_result_by_short_id(inviter_result_short_id)
    if not inviter:
        raise ValueError("초대자의 결과를 찾을 수 없습니다.")

    # 2) 초대 코드 생성
    invite_code = create_unique_short_id(
        table="invite_links", column="short_code"
    )

    # 3) 만료일: 7일 후
    expires_at = (datetime.now(timezone.utc) + timedelta(days=7)).isoformat()

    # 4) INSERT
    record = {
        "short_code": invite_code,
        "inviter_result_id": inviter["id"],
        "status": "pending",
        "expires_at": expires_at,
    }

    try:
        supabase.table("invite_links").insert(record).execute()
    except Exception as e:
        raise RuntimeError(f"초대 링크 생성 실패: {e}")

    label_kr = get_label_korean(inviter.get("overall_label", ""))
    share_msg = (
        f"나의 정치 성향을 진단해봤어! 나는 [{label_kr}] 성향이래 🔮\n"
        f"너도 해보고 우리 궁합 확인하자 🌈"
    )

    return {
        "invite_code": invite_code,
        "expires_at": expires_at,
        "share_message": share_msg,
    }


def get_invite(invite_code: str) -> Optional[dict]:
    """
    초대 코드로 초대 정보를 조회합니다.

    Returns:
        초대 정보 딕셔너리 (만료/미존재 시 None)
    """
    supabase = get_supabase()

    try:
        response = (
            supabase.table("invite_links")
            .select("*, diagnosis_results!inviter_result_id(short_id, overall_label, overall_position)")
            .eq("short_code", invite_code)
            .execute()
        )

        if not response.data:
            return None

        invite = response.data[0]

        # 만료 확인
        expires = datetime.fromisoformat(invite["expires_at"].replace("Z", "+00:00"))
        if datetime.now(timezone.utc) > expires:
            invite["status"] = "expired"

        # 초대자 라벨 한글화
        inviter_data = invite.get("diagnosis_results", {})
        if inviter_data:
            invite["inviter_label"] = get_label_korean(
                inviter_data.get("overall_label", "")
            )
            invite["inviter_position"] = inviter_data.get("overall_position")

        return invite

    except Exception as e:
        print(f"⚠️ 초대 조회 실패: {e}")
        return None


def compare_results(invite_code: str, invitee_result_short_id: str) -> dict:
    """
    두 사람의 결과를 비교하여 궁합 분석을 반환합니다.

    Args:
        invite_code: 초대 코드
        invitee_result_short_id: 초대받은 사람의 결과 Short ID

    Returns:
        궁합 분석 결과 딕셔너리
    """
    supabase = get_supabase()

    # 1) 초대 정보 + 초대자 결과 로드
    invite = get_invite(invite_code)
    if not invite:
        raise ValueError("유효하지 않은 초대 코드입니다.")
    if invite.get("status") == "expired":
        raise ValueError("만료된 초대 링크입니다. 새 초대를 요청해주세요.")

    inviter_data = invite.get("diagnosis_results", {})
    inviter_short_id = inviter_data.get("short_id")
    inviter = get_result_by_short_id(inviter_short_id) if inviter_short_id else None
    if not inviter:
        raise ValueError("초대자의 결과를 찾을 수 없습니다.")

    # 2) 초대받은 사람 결과 로드
    invitee = get_result_by_short_id(invitee_result_short_id)
    if not invitee:
        raise ValueError("초대받은 분의 결과를 찾을 수 없습니다.")

    # 3) 자기 자신 비교 감지
    if inviter_short_id == invitee_result_short_id:
        raise ValueError("자기 자신과는 비교할 수 없습니다. 다른 사람을 초대해주세요!")

    # 4) 궁합 계산
    distance = abs(inviter["overall_position"] - invitee["overall_position"])

    if distance < 0.1:
        compat_level = "SOULMATE"
        compat_display = "정치적 소울메이트 🤝"
    elif distance < 0.25:
        compat_level = "HARMONIOUS"
        compat_display = "조화로운 관계 📐"
    elif distance < 0.4:
        compat_level = "COMPLEMENTARY"
        compat_display = "보완적 관계 🔄"
    else:
        compat_level = "OPPOSITE"
        compat_display = "다양한 시각의 조합 🌈"

    # 5) 카테고리별 비교
    inviter_cats = inviter.get("category_results", {})
    invitee_cats = invitee.get("category_results", {})
    category_comparisons = []
    conflict_areas = []
    advice_list = []

    for cat_key, display in CATEGORY_DISPLAY.items():
        my_pos = inviter_cats.get(cat_key, 0.5)
        partner_pos = invitee_cats.get(cat_key, 0.5)
        if my_pos is None:
            my_pos = 0.5
        if partner_pos is None:
            partner_pos = 0.5
        gap = abs(my_pos - partner_pos)

        if gap < 0.15:
            gap_level, gap_text = "SMALL", "일치 ✅"
        elif gap < 0.3:
            gap_level, gap_text = "MODERATE", "약간의 차이 🔸"
        else:
            gap_level, gap_text = "LARGE", "큰 차이 ⚡"
            conflict_areas.append(display)
            advice_list.append({
                "area": display,
                "advice": ADVICE_MAP.get(cat_key, "서로의 관점을 존중하며 대화해보세요."),
            })

        category_comparisons.append({
            "category": cat_key,
            "display": display,
            "my_pos": round(my_pos, 3),
            "partner_pos": round(partner_pos, 3),
            "gap": round(gap, 3),
            "gap_level": gap_level,
            "gap_text": gap_text,
        })

    # 6) 도덕 기반 유사도 (코사인 유사도)
    inviter_moral = inviter.get("moral_profile", {})
    invitee_moral = invitee.get("moral_profile", {})
    moral_keys = ["care", "fairness", "loyalty", "authority", "purity"]
    vec_a = [float(inviter_moral.get(k, 0.5) or 0.5) for k in moral_keys]
    vec_b = [float(invitee_moral.get(k, 0.5) or 0.5) for k in moral_keys]
    moral_similarity = _cosine_similarity(vec_a, vec_b)

    # 7) 공유 가치
    shared_values = []
    for k in moral_keys:
        a_val = float(inviter_moral.get(k, 0.5) or 0.5)
        b_val = float(invitee_moral.get(k, 0.5) or 0.5)
        if a_val >= 0.6 and b_val >= 0.6:
            shared_values.append(f"{MORAL_DISPLAY.get(k, k)} 가치를 비슷하게 중시합니다")

    # 8) invite_links 업데이트
    try:
        supabase.table("invite_links").update({
            "invitee_result_id": invitee["id"],
            "status": "completed",
        }).eq("short_code", invite_code).execute()
    except Exception:
        pass  # 업데이트 실패해도 비교 결과는 반환

    # 소울메이트 조언
    if compat_level == "SOULMATE":
        advice_list.insert(0, {
            "area": "전체",
            "advice": "정치적 소울메이트! 하지만 같은 생각만 하면 함께 편향에 빠질 수 있어요. 가끔은 일부러 반대 의견을 나눠보는 것도 좋습니다.",
        })

    return {
        "overall_compatibility": compat_level,
        "overall_display": compat_display,
        "distance": round(distance, 3),
        "inviter": {
            "label": get_label_korean(inviter.get("overall_label", "")),
            "position": inviter["overall_position"],
        },
        "invitee": {
            "label": get_label_korean(invitee.get("overall_label", "")),
            "position": invitee["overall_position"],
        },
        "category_comparisons": category_comparisons,
        "moral_similarity": round(moral_similarity, 3),
        "shared_values": shared_values,
        "conflict_areas": conflict_areas,
        "advice_list": advice_list,
    }


def _cosine_similarity(a: list[float], b: list[float]) -> float:
    """두 벡터의 코사인 유사도를 계산합니다."""
    dot = sum(x * y for x, y in zip(a, b))
    norm_a = math.sqrt(sum(x * x for x in a))
    norm_b = math.sqrt(sum(x * x for x in b))
    if norm_a == 0 or norm_b == 0:
        return 0.0
    return dot / (norm_a * norm_b)
