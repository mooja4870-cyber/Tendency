"""
🔍 탐색 페이지 — 전역 통계, 국가 비교, 인물 갤러리, 미디어 스펙트럼
"""
import streamlit as st
import plotly.graph_objects as go
from services.stats_service import get_orientation_distribution
from services.content_service import get_country_spectrums, get_historical_figures, get_media_sources
from utils.helpers import LABEL_MAP, get_label_korean, get_label_color

st.set_page_config(page_title="프리즘 - 탐색", page_icon="🔍", layout="wide")

st.title("🔍 탐색")

my_result = st.session_state.get("my_result")
my_pos = float(my_result.get("overall_position", 0.5)) if my_result else None

tab1, tab2, tab3, tab4 = st.tabs(["📊 전역 통계", "🗺️ 국가 비교", "👤 역사 인물", "📺 미디어 스펙트럼"])

# ═══ Tab 1: 전역 통계 ═══
with tab1:
    try:
        stats = get_orientation_distribution()
    except Exception:
        stats = {"total_users": 0, "distribution": {}}

    if stats.get("total_users", 0) > 0:
        st.metric("총 참여자", f"{stats['total_users']:,}명")

        dist = stats.get("distribution", {})
        labels = [get_label_korean(k) for k in dist.keys()]
        values = list(dist.values())

        fig = go.Figure(go.Bar(
            x=labels, y=values,
            marker_color=[get_label_color(i / 10) for i in range(len(labels))],
            text=[f"{v}%" for v in values], textposition="auto",
        ))
        fig.update_layout(
            yaxis=dict(title="비율 (%)"), height=350,
            margin=dict(t=20, b=20),
        )
        st.plotly_chart(fig, use_container_width=True)

        avg = stats.get("average_position", {})
        c1, c2, c3 = st.columns(3)
        c1.metric("평균 전체", f"{avg.get('overall', 0.5):.1%}")
        c2.metric("평균 경제", f"{avg.get('economic', 0.5):.1%}")
        c3.metric("평균 사회", f"{avg.get('social', 0.5):.1%}")
    else:
        st.info("아직 통계 데이터가 충분하지 않습니다.")

# ═══ Tab 2: 국가 비교 ═══
with tab2:
    try:
        countries = get_country_spectrums()
    except Exception:
        countries = []

    if countries:
        st.markdown("당신의 성향이 다른 나라에서는 어떤 위치일까요?")

        fig = go.Figure()
        for i, c in enumerate(countries):
            ws = float(c.get("window_start", 0))
            we = float(c.get("window_end", 1))
            cp = float(c.get("center_position", 0.5))
            name = f"{c.get('flag_emoji', '')} {c.get('country_name', '')} ({c.get('era', '')})"

            # 오버턴 윈도우 범위
            fig.add_trace(go.Bar(
                y=[name], x=[we - ws], base=[ws],
                orientation="h", name="",
                marker=dict(color="rgba(108,92,231,0.2)"),
                showlegend=False, hoverinfo="skip",
            ))
            # 중앙점
            fig.add_trace(go.Scatter(
                x=[cp], y=[name], mode="markers",
                marker=dict(size=8, color="gray", symbol="diamond"),
                showlegend=False, hoverinfo="text",
                hovertext=f"중도: {cp:.2f}",
            ))

        # 사용자 위치
        if my_pos is not None:
            for c in countries:
                name = f"{c.get('flag_emoji', '')} {c.get('country_name', '')} ({c.get('era', '')})"
                fig.add_trace(go.Scatter(
                    x=[my_pos], y=[name], mode="markers",
                    marker=dict(size=14, color="#E74C3C", symbol="star"),
                    showlegend=False, hoverinfo="text",
                    hovertext=f"나: {my_pos:.2f}",
                ))

        fig.update_layout(
            xaxis=dict(range=[0, 1], title="보수 ← → 진보"),
            height=max(300, len(countries) * 50),
            margin=dict(t=20, b=40, l=150),
        )
        st.plotly_chart(fig, use_container_width=True)
    else:
        st.info("국가 데이터를 불러올 수 없습니다.")

# ═══ Tab 3: 역사 인물 갤러리 ═══
with tab3:
    try:
        figures = get_historical_figures()
    except Exception:
        figures = []

    if figures:
        # my_result와 figure_match_ids 보호 처리
        my_res_data = st.session_state.get("my_result")
        my_matches = []
        if isinstance(my_res_data, dict):
            my_matches = my_res_data.get("figure_match_ids", [])
        
        # 매칭 인물 먼저 정렬
        # 'id'가 없을 수 있으므로 .get('id') 사용
        figures_sorted = sorted(figures, key=lambda f: f.get("id") not in (my_matches or []))

        cols = st.columns(3)
        for i, fig in enumerate(figures_sorted):
            with cols[i % 3]:
                # id가 없으면 name_en을 키로 사용 (오프라인 모드)
                fig_id = fig.get("id", fig.get("name_en"))
                is_match = fig_id in (my_matches or [])
                border = "2px solid #6C5CE7" if is_match else "1px solid #eee"
                badge = " ⭐ 매칭!" if is_match else ""

                st.markdown(f"""
                <div style="border: {border}; border-radius: 12px; padding: 16px; margin-bottom: 12px;">
                    <h4>{fig.get('flag_emoji', '')} {fig.get('name_ko', '')}{badge}</h4>
                    <p style="color: gray; font-size: 0.85em;">{fig.get('era', '')} · {fig.get('country', '')}</p>
                    <p style="font-size: 0.9em;">{fig.get('short_description', '')}</p>
                    <p style="font-style: italic; color: #666;">"{fig.get('famous_quote', '')}"</p>
                </div>
                """, unsafe_allow_html=True)
    else:
        st.info("인물 데이터를 불러올 수 없습니다.")

# ═══ Tab 4: 미디어 스펙트럼 ═══
with tab4:
    try:
        media = get_media_sources()
    except Exception:
        media = []

    if media:
        st.markdown("한국 주요 매체의 정치 성향 스펙트럼")

        fig = go.Figure()
        for m in media:
            orient = float(m.get("orientation", 0.5))
            fig.add_trace(go.Scatter(
                x=[orient], y=[0.5],
                mode="markers+text",
                marker=dict(size=16),
                text=[f"{m.get('logo_emoji', '')} {m.get('name', '')}"],
                textposition="top center",
                textfont=dict(size=10),
                showlegend=False,
            ))

        if my_pos is not None:
            fig.add_vline(x=my_pos, line_dash="dash", line_color="red",
                          annotation_text="나의 위치", annotation_position="top")

        fig.update_layout(
            xaxis=dict(range=[0, 1], title="보수 ← → 진보",
                       tickvals=[0, 0.25, 0.5, 0.75, 1],
                       ticktext=["극보수", "보수", "중도", "진보", "극진보"]),
            yaxis=dict(visible=False),
            height=300, margin=dict(t=40, b=40),
        )
        st.plotly_chart(fig, use_container_width=True)
    else:
        st.info("매체 데이터를 불러올 수 없습니다.")
