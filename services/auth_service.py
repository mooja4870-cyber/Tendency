"""
간이 인증 서비스
관리자 비밀번호 확인 및 세션 관리.
"""
import streamlit as st


def check_admin_password(password: str) -> bool:
    """
    관리자 비밀번호를 확인합니다.

    Args:
        password: 입력된 비밀번호

    Returns:
        비밀번호 일치 여부
    """
    try:
        correct = st.secrets.get("ADMIN_PASSWORD", "")
        return password == correct and correct != ""
    except Exception:
        return False


def require_admin() -> bool:
    """
    관리자 인증을 요구합니다.
    인증 성공 시 True 반환, 실패 시 False + UI 표시.
    """
    if st.session_state.get("admin_authenticated", False):
        return True

    st.markdown("### 🔐 관리자 인증")
    password = st.text_input("관리자 비밀번호", type="password", key="admin_pw")

    if st.button("로그인", key="admin_login"):
        if check_admin_password(password):
            st.session_state.admin_authenticated = True
            st.rerun()
        else:
            st.error("비밀번호가 올바르지 않습니다.")

    return False
