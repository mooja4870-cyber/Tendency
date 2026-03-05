"""
🔮 프리즘 (Prism) — 정치 성향 진단 앱
메인 진입점: Streamlit 앱 설정 + 홈 페이지
"""
import streamlit as st
import uuid
import sys
import os

# ═══ 앱 경로 보정 (Streamlit Cloud 환경 대응) ═══
current_dir = os.path.dirname(os.path.abspath(__file__))
if current_dir not in sys.path:
    sys.path.append(current_dir)

from database.connection import get_supabase

# ═══ 페이지 설정 ═══
st.set_page_config(
    page_title="프리즘 Prism - 정치 성향 진단",
    page_icon="🔮",
    layout="wide",
    initial_sidebar_state="collapsed",
)

# ═══ 웹에서의 모바일 뷰 스타일 (CSS 빌드) ═══
st.markdown("""
<style>
    /* 전체 배경 설정 */
    [data-testid="stAppViewContainer"] {
        background-color: #F8F9FD;
    }
    
    /* 데스크탑에서 모바일 컨테이너처럼 보이게 설정 */
    @media (min-width: 768px) {
        /* 메인 컨텐츠 영역을 모바일 크기로 고정하고 중앙 정렬 */
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
        
        /* 사이드바 너비 조정 */
        [data-testid="stSidebar"] {
            min-width: 250px !important;
            max-width: 250px !important;
        }
    }

    /* 트렌디한 폰트 및 요소 스타일 */
    h1, h2, h3 {
        font-family: 'Pretendard', sans-serif;
        font-weight: 800;
    }
    
    .stButton > button {
        border-radius: 12px;
        padding: 10px 20px;
        font-weight: 600;
        transition: all 0.2s;
    }
    
    .stButton > button:hover {
        transform: translateY(-2px);
        box-shadow: 0 5px 15px rgba(0,0,0,0.1);
    }
</style>
""", unsafe_allow_html=True)

# ═══ 세션 초기화 ═══
if "session_id" not in st.session_state:
    st.session_state.session_id = str(uuid.uuid4())

if "quiz_completed" not in st.session_state:
    st.session_state.quiz_completed = False

if "my_result" not in st.session_state:
    st.session_state.my_result = None

# ═══ URL 파라미터 라우팅 ═══
try:
    query_params = st.query_params
    if "result" in query_params:
        st.switch_page("pages/2_result.py")
    elif "invite" in query_params:
        st.switch_page("pages/4_compatibility.py")
except Exception:
    pass

# ═══ 사이드바 ═══
with st.sidebar:
    st.markdown("# 🔮 프리즘")
    st.caption("정치 성향 다각도 분석")
    st.markdown("---")

    if st.session_state.get("quiz_completed") and st.session_state.get("my_result"):
        try:
            from utils.helpers import get_label_korean, get_label_emoji
            label_en = st.session_state.my_result.get("overall_label", "")
            label_kr = get_label_korean(label_en)
            emoji = get_label_emoji(label_en)
            st.success(f"{emoji} 내 성향: **{label_kr}**")
        except Exception:
            pass
    else:
        st.info("아직 진단을 완료하지 않았습니다")

    st.markdown("---")
    # DB 상태 표시
    try:
        if get_supabase() is not None:
            st.sidebar.caption("🟢 Database Connected")
        else:
            st.sidebar.caption("🟡 Offline Mode (JSON Fallback)")
    except Exception:
        st.sidebar.caption("🟡 Offline Mode (Fallback)")

    st.caption("© 2025 Prism Project")

# ═══ 홈 페이지 (모바일 뷰 최적화) ═══
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

# 주요 기능 버튼 (모바일 앱 스타일)
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
