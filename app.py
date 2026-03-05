import streamlit as st
import uuid
import sys
import os
import traceback

# ═══ 앱 경로 보정 (Streamlit Cloud 환경 대응) ═══
current_dir = os.path.dirname(os.path.abspath(__file__))
if current_dir not in sys.path:
    sys.path.append(current_dir)

try:
    from database.connection import get_supabase

    # ═══ 페이지 설정 ═══
    st.set_page_config(
        page_title="프리즘 Prism - 정치 성향 진단",
        page_icon="🔮",
        layout="wide",
        initial_sidebar_state="collapsed",
    )

    # ═══ 웹에서의 모바일 뷰 스타일 (CSS 빌드) - 프리미엄 다크 모드 ═══
    st.markdown("""
    <style>
        /* 프리미엄 다크 배경 */
        [data-testid="stAppViewContainer"] {
            background: linear-gradient(180deg, #0a0e17 0%, #111827 100%);
            color: #ffffff;
        }
        
        /* 폰트 기본 설정 */
        * {
            font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, Roboto, 'Helvetica Neue', 'Segoe UI', 'Apple SD Gothic Neo', 'Noto Sans KR', 'Malgun Gothic', 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', sans-serif;
        }

        /* 데스크탑에서 모바일 컨테이너처럼 보이게 설정 (Glassmorphism 적용) */
        @media (min-width: 768px) {
            section.main > div {
                max-width: 480px !important;
                margin: 0 auto !important;
                background: rgba(17, 24, 39, 0.6) !important;
                backdrop-filter: blur(20px) !important;
                -webkit-backdrop-filter: blur(20px) !important;
                padding: 40px 24px !important;
                min-height: 100vh !important;
                box-shadow: 0 0 40px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1) !important;
                border-left: 1px solid rgba(255, 255, 255, 0.05);
                border-right: 1px solid rgba(255, 255, 255, 0.05);
                border-radius: 0;
            }
        }

        /* 투명한 상단바 덮어쓰기 */
        header {
            background-color: transparent !important;
        }

        /* 텍스트 코어 스타일 */
        h1, h2, h3, p, span, div {
            color: #f3f4f6;
        }

        /* Streamlit 기본 요소 투명화 (Glassmorphism 카드를 위해) */
        .stButton > button {
            background: rgba(255, 255, 255, 0.05) !important;
            border: 1px solid rgba(255, 255, 255, 0.1) !important;
            border-radius: 16px !important;
            color: white !important;
            padding: 16px 20px !important;
            font-weight: 600 !important;
            font-size: 1.05rem !important;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
            backdrop-filter: blur(10px) !important;
            -webkit-backdrop-filter: blur(10px) !important;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1) !important;
            height: auto !important;
            display: flex;
            justify-content: center;
            align-items: center;
        }
        
        .stButton > button:hover {
            transform: translateY(-2px) !important;
            background: rgba(255, 255, 255, 0.1) !important;
            border-color: rgba(255, 255, 255, 0.2) !important;
            box-shadow: 0 8px 15px rgba(0, 0, 0, 0.2) !important;
        }
        
        /* 메인 CTA 버튼 (Primary Button) 스타일링 */
        .stButton > button[data-baseweb="button"]:has(div:contains("진단 시작하기")) {
            background: linear-gradient(135deg, rgba(99, 102, 241, 0.9), rgba(168, 85, 247, 0.9)) !important;
            border: 1px solid rgba(255, 255, 255, 0.2) !important;
            box-shadow: 0 0 20px rgba(139, 92, 246, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2) !important;
            color: white !important;
            font-size: 1.15rem !important;
            letter-spacing: 0.5px;
            text-shadow: 0 1px 2px rgba(0,0,0,0.2) !important;
        }
        
        .stButton > button[data-baseweb="button"]:has(div:contains("진단 시작하기")):hover {
            box-shadow: 0 0 30px rgba(139, 92, 246, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.3) !important;
        }

        /* 마크다운 링크 색상 */
        a {
            color: #a78bfa !important;
            text-decoration: none !important;
        }
        
        /* 커스텀 카드 클래스 */
        .glass-card {
            background: rgba(255, 255, 255, 0.03);
            border: 1px solid rgba(255, 255, 255, 0.08);
            border-radius: 20px;
            padding: 24px;
            text-align: center;
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
            box-shadow: 0 10px 25px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.05);
            margin-bottom: 20px;
        }

        .gradient-text {
            background: linear-gradient(90deg, #a78bfa 0%, #818cf8 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            font-weight: 800;
        }
        
        .hero-title {
            font-size: 2.8em; 
            margin: 10px 0 5px 0; 
            letter-spacing: -1px;
            font-weight: 900;
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

    # ═══ 홈 페이지 (프리미엄 미학 적용) ═══
    st.markdown("""
    <div style="text-align: center; padding: 40px 0 30px 0;">
        <div style="font-size: 4.5em; filter: drop-shadow(0 0 20px rgba(139, 92, 246, 0.5)); animation: float 3s ease-in-out infinite;">🔮</div>
        <h1 class="hero-title">Prism</h1>
        <p style="font-size: 1.15em; color: #9ca3af; font-weight: 400; margin-top: 8px; letter-spacing: -0.3px;">
            <span style="color: #d1d5db;">다각도</span>로 분석하는 나의 정치 관점
        </p>
    </div>
    
    <style>
    @keyframes float {
        0% { transform: translateY(0px); }
        50% { transform: translateY(-10px); }
        100% { transform: translateY(0px); }
    }
    </style>
    """, unsafe_allow_html=True)

    st.markdown("<div style='height: 10px'></div>", unsafe_allow_html=True)

    if st.button("✨ 진단 시작하기", type="primary", use_container_width=True):
        st.switch_page("pages/1_quiz.py")
        
    st.markdown("<div style='height: 24px'></div>", unsafe_allow_html=True)

    col1, col2 = st.columns(2)
    with col1:
        if st.button("� 주간 토론", use_container_width=True):
            st.switch_page("pages/3_debate.py")
    with col2:
        if st.button("🤝 궁합 비교", use_container_width=True):
            st.switch_page("pages/4_compatibility.py")

    st.markdown("<div style='height: 8px'></div>", unsafe_allow_html=True)
    if st.button("🌍 전역 통계 및 탐색", use_container_width=True):
        st.switch_page("pages/5_explore.py")

    # 전역 통계 미리보기 (Glassmorphism 카드)
    st.markdown("<div style='height: 32px'></div>", unsafe_allow_html=True)
    try:
        from services.stats_service import get_orientation_distribution
        stats = get_orientation_distribution()
        if stats and stats.get("total_users", 0) > 0:
            st.markdown(f"""
            <div class="glass-card">
                <p style="margin: 0; color: #9ca3af; font-size: 0.85em; text-transform: uppercase; letter-spacing: 1px;">Currently Analyzing</p>
                <h2 style="margin: 8px 0; font-size: 2.2em; font-weight: 800; color: #ffffff;">
                    {stats['total_users']:,}<span style="font-size: 0.5em; color: #6b7280; font-weight: 500;">명</span>
                </h2>
                <p style="margin: 0; color: #8b5cf6; font-size: 0.9em; font-weight: 500;">새로운 관점이 모이고 있습니다</p>
            </div>
            """, unsafe_allow_html=True)
    except Exception:
        pass

    st.markdown("<div style='height: 40px'></div>", unsafe_allow_html=True)
    st.markdown("""
    <div style="text-align: center;">
        <p style="font-size: 0.75em; color: #4b5563; line-height: 1.6;">
            프리즘은 특정 정치적 입장을 지지하지 않습니다.<br>
            모든 분석은 심리학 및 도덕 기반 이론에 기초하여 익명으로 처리됩니다.
        </p>
        <p style="font-size: 0.7em; color: #374151; margin-top: 10px;">© 2025 Prism Project</p>
    </div>
    """, unsafe_allow_html=True)

except Exception as e:
    st.error("🚀 앱 실행 중 오류가 발생했습니다!")
    st.exception(e)
    st.code(traceback.format_exc())
