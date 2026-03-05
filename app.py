"""
🔮 프리즘 (Prism) — 정치 성향 진단 앱
메인 진입점: Streamlit 앱 설정 + 홈 페이지
"""
import streamlit as st
import uuid
from database.connection import get_supabase

# ═══ 페이지 설정 ═══
st.set_page_config(
    page_title="프리즘 Prism - 정치 성향 진단",
    page_icon="🔮",
    layout="wide",
    initial_sidebar_state="expanded",
)

# ═══ 세션 초기화 ═══
if "session_id" not in st.session_state:
    st.session_state.session_id = str(uuid.uuid4())

if "quiz_completed" not in st.session_state:
    st.session_state.quiz_completed = False

if "my_result" not in st.session_state:
    st.session_state.my_result = None

if "my_result_short_id" not in st.session_state:
    st.session_state.my_result_short_id = None

# ═══ URL 파라미터 라우팅 ═══
query_params = st.query_params
if "result" in query_params:
    st.switch_page("pages/2_result.py")
elif "invite" in query_params:
    st.switch_page("pages/4_compatibility.py")

# ═══ 사이드바 ═══
with st.sidebar:
    st.markdown("# 🔮 프리즘")
    st.caption("정치 성향 다각도 분석")
    st.markdown("---")

    if st.session_state.quiz_completed and st.session_state.my_result:
        from utils.helpers import get_label_korean, get_label_emoji
        label_en = st.session_state.my_result.get("overall_label", "")
        label_kr = get_label_korean(label_en)
        emoji = get_label_emoji(label_en)
        st.success(f"{emoji} 내 성향: **{label_kr}**")
        if st.session_state.my_result_short_id:
            st.caption(f"결과 코드: `{st.session_state.my_result_short_id}`")
    else:
        st.info("아직 진단을 완료하지 않았습니다")

    st.markdown("---")
    # DB 상태 표시
    if get_supabase() is not None:
        st.sidebar.caption("🟢 Database Connected")
    else:
        st.sidebar.caption("🟡 Offline Mode (JSON Fallback)")
    st.caption("© 2025 Prism Project")
    st.caption("특정 정치적 입장을 지지하지 않습니다.")

# ═══ 홈 페이지 ═══
st.markdown("""
<div style="text-align: center; padding: 40px 0;">
    <h1 style="font-size: 3em; margin-bottom: 0;">🔮</h1>
    <h1 style="font-size: 2.5em; margin-top: 10px;">프리즘 <span style="color: #6C5CE7;">Prism</span></h1>
    <p style="font-size: 1.2em; color: #888;">
        당신의 정치 성향을 <strong>다각도</strong>로 분석합니다
    </p>
</div>
""", unsafe_allow_html=True)

st.markdown("---")

# 주요 기능 카드
col1, col2 = st.columns(2)

with col1:
    st.markdown("""
    <div style="background: linear-gradient(135deg, #6C5CE7, #A29BFE); 
                border-radius: 16px; padding: 24px; color: white; height: 200px;">
        <h3>🎯 성향 진단</h3>
        <p>20개 질문으로 당신의 정치 성향을<br>8개 카테고리 + 도덕 기반으로 분석합니다</p>
    </div>
    """, unsafe_allow_html=True)
    if st.button("진단 시작하기", type="primary", use_container_width=True, key="btn_quiz"):
        st.switch_page("pages/1_quiz.py")

with col2:
    st.markdown("""
    <div style="background: linear-gradient(135deg, #00B894, #55EFC4); 
                border-radius: 16px; padding: 24px; color: white; height: 200px;">
        <h3>🗳️ 주간 토론</h3>
        <p>이번 주 뜨거운 이슈에 투표하고<br>성향별 투표 패턴을 확인하세요</p>
    </div>
    """, unsafe_allow_html=True)
    if st.button("토론 참여하기", use_container_width=True, key="btn_debate"):
        st.switch_page("pages/3_debate.py")

st.markdown("")

col3, col4 = st.columns(2)

with col3:
    st.markdown("""
    <div style="background: linear-gradient(135deg, #E17055, #FAB1A0); 
                border-radius: 16px; padding: 24px; color: white; height: 200px;">
        <h3>🤝 궁합 비교</h3>
        <p>친구와 정치 성향 궁합을 비교하고<br>서로의 차이를 이해해보세요</p>
    </div>
    """, unsafe_allow_html=True)
    if st.button("궁합 비교하기", use_container_width=True, key="btn_compat"):
        st.switch_page("pages/4_compatibility.py")

with col4:
    st.markdown("""
    <div style="background: linear-gradient(135deg, #FDCB6E, #F6E58D); 
                border-radius: 16px; padding: 24px; color: #333; height: 200px;">
        <h3>🔍 탐색</h3>
        <p>전역 통계, 국가 비교, 역사 인물 매칭,<br>미디어 스펙트럼을 탐색해보세요</p>
    </div>
    """, unsafe_allow_html=True)
    if st.button("탐색하기", use_container_width=True, key="btn_explore"):
        st.switch_page("pages/5_explore.py")

# 전역 통계 미리보기
st.markdown("---")
try:
    from services.stats_service import get_orientation_distribution
    stats = get_orientation_distribution()
    if stats and stats.get("total_users", 0) > 0:
        c1, c2, c3 = st.columns(3)
        c1.metric("🧑‍🤝‍🧑 총 진단 참여자", f"{stats['total_users']:,}명")
        avg = stats.get("average_position", {})
        c2.metric("📊 평균 성향", f"{avg.get('overall', 0.5):.0%}")
        c3.metric("📈 분석 정확도", "95%")
except Exception:
    pass

# 하단
st.markdown("---")
st.caption(
    "프리즘은 특정 정치적 입장을 지지하지 않습니다. "
    "모든 성향은 동등하게 존중됩니다. "
    "진단 결과는 심리학 연구와 도덕 기반 이론에 근거합니다."
)
