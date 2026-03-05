"""
전역 통계 서비스
전체 사용자 성향 분포, 인기 인물, 편향 통계 등을 제공합니다.
"""
import streamlit as st
from collections import Counter
from services.result_service import get_all_results_for_stats
from utils.helpers import LABEL_MAP


@st.cache_data(ttl=600)  # 10분 캐싱
def get_orientation_distribution() -> dict:
    """
    전체 사용자 성향 분포를 계산합니다.

    Returns:
        {
            "total_users": int,
            "distribution": {"STRONG_CONSERVATIVE": float%, ...},
            "average_position": {"overall": float, "economic": float, "social": float},
            "top_figures": [{"id": int, "count": int}, ...]
        }
    """
    results = get_all_results_for_stats()

    if not results:
        return {
            "total_users": 0,
            "distribution": {},
            "average_position": {"overall": 0.5, "economic": 0.5, "social": 0.5},
            "top_figures": [],
        }

    total = len(results)

    # 성향 분포 (%)
    label_counts = Counter(r.get("overall_label", "") for r in results)
    distribution = {}
    for label_en in LABEL_MAP.keys():
        count = label_counts.get(label_en, 0)
        distribution[label_en] = round(count * 100 / total, 1)

    # 평균 위치
    avg_overall = sum(
        float(r.get("overall_position", 0.5)) for r in results
    ) / total
    avg_economic = sum(
        float(r.get("economic_position", 0.5)) for r in results
    ) / total
    avg_social = sum(
        float(r.get("social_position", 0.5)) for r in results
    ) / total

    # 인기 인물
    figure_counter: Counter = Counter()
    for r in results:
        fig_ids = r.get("figure_match_ids")
        if fig_ids:
            for fid in (fig_ids if isinstance(fig_ids, list) else []):
                figure_counter[fid] += 1

    top_figures = [
        {"id": fid, "count": cnt}
        for fid, cnt in figure_counter.most_common(5)
    ]

    return {
        "total_users": total,
        "distribution": distribution,
        "average_position": {
            "overall": round(avg_overall, 3),
            "economic": round(avg_economic, 3),
            "social": round(avg_social, 3),
        },
        "top_figures": top_figures,
    }


@st.cache_data(ttl=600)
def get_bias_statistics() -> dict:
    """
    전역 편향 통계를 계산합니다.

    Returns:
        {"avg_bias_count": float, "most_common_bias": str}
    """
    from database.connection import get_supabase
    supabase = get_supabase()

    try:
        response = (
            supabase.table("diagnosis_results")
            .select("bias_count, bias_types")
            .execute()
        )
        data = response.data or []
    except Exception:
        data = []

    if not data:
        return {"avg_bias_count": 0, "most_common_bias": "N/A"}

    total_bias = sum(r.get("bias_count", 0) for r in data)
    avg_bias = round(total_bias / len(data), 2)

    # 가장 흔한 편향 유형
    bias_type_counter: Counter = Counter()
    for r in data:
        biases = r.get("bias_types", [])
        if isinstance(biases, list):
            for b in biases:
                if isinstance(b, dict):
                    bias_type_counter[b.get("type", "")] += 1

    most_common = bias_type_counter.most_common(1)
    most_common_bias = most_common[0][0] if most_common else "N/A"

    return {
        "avg_bias_count": avg_bias,
        "most_common_bias": most_common_bias,
    }
