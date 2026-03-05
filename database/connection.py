"""
Supabase 연결 모듈
Streamlit secrets에서 인증 정보를 읽어 Supabase 클라이언트를 생성합니다.
"""
from typing import Optional
import streamlit as st

try:
    from supabase import create_client, Client
except ModuleNotFoundError:
    create_client = None
    Client = object


@st.cache_resource
def get_supabase() -> Optional[Client]:
    """
    Supabase 클라이언트 싱글턴.
    커넥션 불가 시 None을 반환하여 서비스의 폴백 로직이 동작하게 합니다.
    """
    try:
        if create_client is None:
            return None

        url = st.secrets.get("SUPABASE_URL")
        key = st.secrets.get("SUPABASE_KEY")

        if not url or not key:
            # st.stop() 대신 None 반환
            return None

        return create_client(url, key)

    except Exception as e:
        print(f"⚠️ Supabase 연결 실패: {e}")
        return None
