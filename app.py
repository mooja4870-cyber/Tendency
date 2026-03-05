"""
🔮 프리즘 (Prism) — 정치 성향 진단 앱
메인 진입점: Streamlit 앱 설정 + 홈 페이지
"""
import streamlit as st
import uuid
import sys
import os
import traceback

try:
    # ═══ 앱 경로 보정 (Streamlit Cloud 환경 대응) ═══
    current_dir = os.path.dirname(os.path.abspath(__file__))
    if current_dir not in sys.path:
        sys.path.append(current_dir)

    # ═══ 페이지 설정 ═══
    st.set_page_config(
        page_title="프리즘 Prism - 정치 성향 진단",
        page_icon="🔮",
        layout="wide",
        initial_sidebar_state="collapsed",
    )

    from database.connection import get_supabase

    # ═══ 웹에서의 모바일 뷰 스타일 (CSS 빌드) ═══
    st.markdown("""
    <style>
        [data-testid="stAppViewContainer"] {
            background-color: #F8F9FD;
        }
        @media (min-width: 768px) {
            section.main > div {
                max-width: 450px !important;
                margin: 0 auto !important;
                background-color: white !important;
                padding: 30px 20px !important;
                min-height: 100vh !important;
                box-shadow: 0 10px 30px rgba(0,0,0,0.05) !important;
                border-left: 1px solid #F0F0F0;
                border-right: 1px solid #F0F0F0;
            }
        }
    </style>
    """, unsafe_allow_html=True)

    # ═══ 세션 초기화 ═══
    if "session_id" not in st.session_state:
        st.session_state.session_id = str(uuid.uuid4())

    if "quiz_completed" not in st.session_state:
        st.session_state.quiz_completed = False

    # ═══ URL 파라미터 라우팅 ═══
    try:
        q = st.query_params
        if "result" in q:
            st.switch_page("pages/2_result.py")
        elif "invite" in q:
            st.switch_page("pages/4_compatibility.py")
    except:
        pass

    # ═══ 홈 페이지 ═══
    st.markdown("""
    <div style="text-align: center; padding: 20px 0;">
        <span style="font-size: 4em;">🔮</span>
        <h1 style="font-size: 2.2em; margin-top: 10px; margin-bottom: 0;">프리즘 <span style="color: #6C5CE7;">Prism</span></h1>
        <p style="font-size: 1.1em; color: #666; font-weight: 500;">
            당신의 정치 성향을 <strong>다각도</strong>로 분석합니다
        </p>
    </div>
    """, unsafe_allow_html=True)

    st.markdown("<div style='height: 20px'></div>", unsafe_allow_html=True)

    if st.button("✨ 진단 시작하기 (1분 소요)", type="primary", use_container_width=True):
        st.switch_page("pages/1_quiz.py")

    col1, col2 = st.columns(2)
    with col1:
        if st.button("🗳️ 주간 토론", use_container_width=True):
            st.switch_page("pages/3_debate.py")
    with col2:
        if st.button("🤝 궁합 비교", use_container_width=True):
            st.switch_page("pages/4_compatibility.py")

    if st.button("🔍 전역 통계 및 탐색", use_container_width=True):
        st.switch_page("pages/5_explore.py")

    st.markdown("<div style='height: 40px'></div>", unsafe_allow_html=True)
    st.caption("© 2025 Prism Project. 모든 데이터는 익명으로 처리됩니다.")

except Exception as e:
    st.error("🚀 배포 중 오류가 발생했습니다!")
    st.exception(e)
    st.code(traceback.format_exc())

# 전역 통계 미리보기 (카드 스타일)
st.markdown("<div style='height: 30px'></div>", unsafe_allow_html=True)
try:
    from services.stats_service import get_orientation_distribution
    stats = get_orientation_distribution()
    if stats and stats.get("total_users", 0) > 0:
        st.markdown(f"""
        <div style="background-color: #F0F2F6; border-radius: 12px; padding: 15px; text-align: center;">
            <p style="margin: 0; color: #555; font-size: 0.9em;">현재까지</p>
            <h2 style="margin: 5px 0; color: #6C5CE7;">{stats['total_users']:,}명 참여</h2>
            <p style="margin: 0; color: #555; font-size: 0.8em;">다양한 관점이 모여 완성됩니다.</p>
        </div>
        """, unsafe_allow_html=True)
except Exception:
    pass

# 하단
st.markdown("<div style='height: 40px'></div>", unsafe_allow_html=True)
st.caption(
    "프리즘은 심리학 연구와 도덕 기반 이론에 근거하여 정치 성향을 분석합니다. "
    "모든 데이터는 익명으로 처리됩니다."
)
