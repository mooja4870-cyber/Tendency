import json
import os
import streamlit as st
from database.connection import get_supabase


def _load_json_fallback(filename: str) -> list:
    """data/ 디렉토리의 JSON 파일에서 데이터를 로드합니다."""
    path = os.path.join("data", filename)
    try:
        if os.path.exists(path):
            with open(path, "r", encoding="utf-8") as f:
                return json.load(f)
    except Exception as e:
        print(f"⚠️ JSON 폴백 로드 실패 ({filename}): {e}")
    return []


@st.cache_data(ttl=3600)  # 1시간 캐싱
def get_questions() -> list[dict]:
    """
    질문 세트를 DB에서 조회합니다.
    실패 시 data/questions.json에서 로드합니다.
    """
    supabase = get_supabase()
    try:
        if supabase:
            response = (
                supabase.table("questions")
                .select("*")
                .eq("is_active", True)
                .order("order_index")
                .execute()
            )
            if response.data:
                return response.data
    except Exception as e:
        print(f"⚠️ DB 질문 로드 실패: {e}")

    # 폴백: JSON 파일
    return _load_json_fallback("questions.json")


@st.cache_data(ttl=3600)
def get_media_sources() -> list[dict]:
    """매체 목록을 DB 또는 JSON에서 조회합니다."""
    supabase = get_supabase()
    try:
        if supabase:
            response = (
                supabase.table("media_sources")
                .select("*")
                .eq("is_active", True)
                .order("orientation")
                .execute()
            )
            if response.data:
                return response.data
    except Exception:
        pass

    return _load_json_fallback("media_sources.json")


@st.cache_data(ttl=3600)
def get_historical_figures() -> list[dict]:
    """역사 인물 목록을 DB 또는 JSON에서 조회합니다."""
    supabase = get_supabase()
    try:
        if supabase:
            response = (
                supabase.table("historical_figures")
                .select("*")
                .eq("is_active", True)
                .execute()
            )
            if response.data:
                return response.data
    except Exception:
        pass

    return _load_json_fallback("figures.json")


@st.cache_data(ttl=3600)
def get_country_spectrums() -> list[dict]:
    """국가 스펙트럼 데이터를 DB 또는 JSON에서 조회합니다."""
    supabase = get_supabase()
    try:
        if supabase:
            response = (
                supabase.table("country_spectrums")
                .select("*")
                .eq("is_active", True)
                .execute()
            )
            if response.data:
                return response.data
    except Exception:
        pass

    return _load_json_fallback("countries.json")


def update_question(question_id: int, updates: dict) -> bool:
    """관리자용: 질문 수정 (DB 연결 필수)"""
    supabase = get_supabase()
    try:
        if not supabase: return False
        supabase.table("questions").update(updates).eq("id", question_id).execute()
        get_questions.clear()
        return True
    except Exception:
        return False


def update_media_source(source_id: int, updates: dict) -> bool:
    """관리자용: 매체 수정 (DB 연결 필수)"""
    supabase = get_supabase()
    try:
        if not supabase: return False
        supabase.table("media_sources").update(updates).eq("id", source_id).execute()
        get_media_sources.clear()
        return True
    except Exception:
        return False
