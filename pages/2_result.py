"""
📊 결과 페이지 — 진단 결과 시각화 + 저장 + 공유
모드 A) 퀴즈 완료 직후 → session_state에서 결과 로드
모드 B) URL 파라미터 → ?result=aBc12xYz
"""
import streamlit as st
import plotly.graph_objects as go
import qrcode
from io import BytesIO
from utils.helpers import (
    get_label_korean, get_label_color, get_label_emoji,
    CATEGORY_DISPLAY, MORAL_DISPLAY,
)
from services.result_service import save_result, get_result_by_short_id

st.set_page_config(page_title="프리즘 - 진단 결과", page_icon="📊", layout="wide")

# ═══ 결과 데이터 로드 ═══
result = None
short_id = None

# 모드 B: URL 파라미터
query_params = st.query_params
if "result" in query_params:
    short_id = query_params["result"]
    try:
        result = get_result_by_short_id(short_id)
    except Exception as e:
        st.error(f"결과 조회 실패: {e}")

# 모드 A: 세션에서 로드
if result is None and st.session_state.get("my_result"):
    result = st.session_state.my_result
    short_id = st.session_state.get("my_result_short_id")

if result is None:
    st.warning("표시할 결과가 없습니다. 먼저 성향 진단을 완료해주세요.")
    if st.button("🎯 진단 시작하기", type="primary"):
        st.switch_page("pages/1_quiz.py")
    st.stop()

# ═══ 결과 저장 (아직 저장 안 된 경우) ═══
if not short_id and st.session_state.get("my_result"):
    st.markdown("### 💾 결과 저장하기")
    st.info("결과를 저장하면 고유 링크를 통해 언제든 다시 볼 수 있고, 친구와 궁합을 비교할 수 있습니다.")
    if st.button("결과 저장하고 공유 링크 받기", type="primary"):
        try:
            save_resp = save_result(result)
            short_id = save_resp["short_id"]
            st.session_state.my_result_short_id = short_id
            st.success(f"저장 완료! 결과 코드: **{short_id}**")
            st.rerun()
        except Exception as e:
            st.error(f"저장 실패: {e}")

# ═══ 공유 섹션 ═══
if short_id:
    with st.expander("🔗 공유하기", expanded=False):
        share_url = f"https://your-app.streamlit.app/?result={short_id}"
        st.code(share_url, language=None)
        st.caption(f"결과 코드: **{short_id}**")

        # QR 코드 생성
        qr = qrcode.make(share_url)
        buf = BytesIO()
        qr.save(buf, format="PNG")
        st.image(buf.getvalue(), width=200, caption="QR코드로 공유")

# ═══ 결과 헤더 ═══
label_en = result.get("overall_label", "")
label_kr = get_label_korean(label_en)
position = float(result.get("overall_position", 0.5))
emoji = get_label_emoji(label_en)
color = get_label_color(position)

st.markdown(f"# {emoji} 당신의 성향: **{label_kr}**")
st.markdown("---")

# ═══ 1. 성향 게이지 바 ═══
st.markdown("### 🎚️ 전체 성향 스펙트럼")

fig_gauge = go.Figure(go.Indicator(
    mode="gauge+number",
    value=position * 100,
    number={"suffix": "%", "font": {"size": 40}},
    gauge={
        "axis": {"range": [0, 100], "tickvals": [0, 25, 50, 75, 100],
                 "ticktext": ["강한 보수", "보수", "중도", "진보", "강한 진보"]},
        "bar": {"color": color, "thickness": 0.3},
        "steps": [
            {"range": [0, 30], "color": "#FFEBEE"},
            {"range": [30, 45], "color": "#FFF3E0"},
            {"range": [45, 55], "color": "#F3E5F5"},
            {"range": [55, 70], "color": "#E8F5E9"},
            {"range": [70, 100], "color": "#E3F2FD"},
        ],
        "threshold": {"line": {"color": color, "width": 4}, "thickness": 0.75, "value": position * 100},
    },
))
fig_gauge.update_layout(height=250, margin=dict(t=20, b=20, l=30, r=30))
st.plotly_chart(fig_gauge, use_container_width=True)

# ═══ 2. 경제/사회 2축 산점도 ═══
st.markdown("### 📐 2축 성향 지도")

eco = float(result.get("economic_position", 0.5))
soc = float(result.get("social_position", 0.5))

fig_scatter = go.Figure()

# 사분면 배경
fig_scatter.add_shape(type="rect", x0=0, x1=0.5, y0=0.5, y1=1, fillcolor="rgba(76,175,80,0.05)", line_width=0)
fig_scatter.add_shape(type="rect", x0=0.5, x1=1, y0=0.5, y1=1, fillcolor="rgba(33,150,243,0.05)", line_width=0)
fig_scatter.add_shape(type="rect", x0=0, x1=0.5, y0=0, y1=0.5, fillcolor="rgba(255,152,0,0.05)", line_width=0)
fig_scatter.add_shape(type="rect", x0=0.5, x1=1, y0=0, y1=0.5, fillcolor="rgba(156,39,176,0.05)", line_width=0)

# 사분면 라벨
annotations = [
    dict(x=0.25, y=0.75, text="권위적 좌파", showarrow=False, font=dict(size=11, color="gray")),
    dict(x=0.75, y=0.75, text="자유적 좌파", showarrow=False, font=dict(size=11, color="gray")),
    dict(x=0.25, y=0.25, text="권위적 우파", showarrow=False, font=dict(size=11, color="gray")),
    dict(x=0.75, y=0.25, text="자유적 우파", showarrow=False, font=dict(size=11, color="gray")),
]

# 사용자 위치
fig_scatter.add_trace(go.Scatter(
    x=[eco], y=[soc], mode="markers+text",
    marker=dict(size=20, color=color, line=dict(width=2, color="white")),
    text=[f"나 ({label_kr})"], textposition="top center",
    textfont=dict(size=12),
))

fig_scatter.update_layout(
    xaxis=dict(title="경제 축 (보수 ← → 진보)", range=[0, 1], dtick=0.25),
    yaxis=dict(title="사회 축 (권위 ← → 자유)", range=[0, 1], dtick=0.25),
    annotations=annotations,
    height=400, margin=dict(t=20, b=40),
    showlegend=False,
)
st.plotly_chart(fig_scatter, use_container_width=True)

# ═══ 3. 카테고리 레이더 차트 ═══
st.markdown("### 🕸️ 카테고리별 분석")

cats = result.get("category_results", {})
if isinstance(cats, dict) and cats:
    cat_labels = [CATEGORY_DISPLAY.get(k, k) for k in cats.keys()]
    cat_values = [float(v or 0.5) for v in cats.values()]
    cat_values_closed = cat_values + [cat_values[0]]
    cat_labels_closed = cat_labels + [cat_labels[0]]

    fig_radar = go.Figure(go.Scatterpolar(
        r=cat_values_closed, theta=cat_labels_closed,
        fill="toself", fillcolor=f"rgba(108,92,231,0.2)",
        line=dict(color="#6C5CE7", width=2),
        marker=dict(size=6),
    ))
    fig_radar.update_layout(
        polar=dict(radialaxis=dict(visible=True, range=[0, 1])),
        height=400, margin=dict(t=30, b=30),
        showlegend=False,
    )
    st.plotly_chart(fig_radar, use_container_width=True)

# ═══ 4. 도덕 기반 막대 차트 ═══
st.markdown("### 🧭 도덕 기반 프로필")

moral = result.get("moral_profile", {})
if isinstance(moral, dict) and moral:
    moral_labels = [MORAL_DISPLAY.get(k, k) for k in moral.keys()]
    moral_values = [float(v or 0.5) for v in moral.values()]
    moral_colors = ["#4CAF50", "#2196F3", "#FF9800", "#9C27B0", "#E91E63"]

    fig_moral = go.Figure(go.Bar(
        x=moral_labels, y=moral_values,
        marker_color=moral_colors[:len(moral_labels)],
        text=[f"{v:.0%}" for v in moral_values],
        textposition="auto",
    ))
    fig_moral.update_layout(
        yaxis=dict(range=[0, 1], title="점수"),
        height=300, margin=dict(t=20, b=20),
    )
    st.plotly_chart(fig_moral, use_container_width=True)

# ═══ 5. 인지편향 리포트 ═══
st.markdown("### 🧠 인지편향 리포트")

bias = result.get("bias_report", {})
if isinstance(bias, dict):
    biases = bias.get("detected_biases", [])
    level = bias.get("bias_level", bias.get("overall_bias_level", "MINIMAL"))

    level_display = {"MINIMAL": "🟢 최소", "MODERATE": "🟡 보통", "SIGNIFICANT": "🔴 주의"}
    st.markdown(f"**편향 수준:** {level_display.get(level, level)}")

    for b in biases:
        severity_icon = {"HIGH": "🔴", "MODERATE": "🟡", "LOW": "🟢"}
        icon = severity_icon.get(b.get("severity", ""), "⚪")

        with st.expander(f"{icon} {b.get('title', b.get('type', ''))}", expanded=False):
            st.markdown(b.get("description", ""))
            st.markdown(f"**근거:** {b.get('evidence', '')}")
            st.caption(b.get("quote", ""))

# ═══ 6. 닮은 역사 인물 ═══
st.markdown("### 👤 닮은 역사 인물 TOP 3")

figure_ids = result.get("figure_match_ids", result.get("figure_matches", []))
if figure_ids:
    try:
        from services.content_service import get_historical_figures
        all_figures = get_historical_figures()
        fig_map = {f["id"]: f for f in all_figures}
        matched = [fig_map[fid] for fid in figure_ids[:3] if fid in fig_map]
    except Exception:
        matched = []

    if matched:
        cols = st.columns(min(3, len(matched)))
        for i, fig in enumerate(matched):
            with cols[i]:
                st.markdown(f"### {fig.get('flag_emoji', '')} {fig.get('name_ko', '')}")
                st.caption(f"{fig.get('era', '')} · {fig.get('country', '')}")
                st.markdown(f"_{fig.get('short_description', '')}_")
                st.info(f"💬 \"{fig.get('famous_quote', '')}\"")

# ═══ 인사이트 ═══
insight = result.get("personality_insight", "")
if insight:
    st.markdown("### 💡 맞춤형 인사이트")
    st.markdown(insight)

# ═══ 하단 버튼 ═══
st.markdown("---")
col1, col2, col3 = st.columns(3)
with col1:
    if st.button("🤝 궁합 비교하기", use_container_width=True):
        st.switch_page("pages/4_compatibility.py")
with col2:
    if st.button("🗳️ 토론 참여하기", use_container_width=True):
        st.switch_page("pages/3_debate.py")
with col3:
    if st.button("🔮 홈으로", use_container_width=True):
        st.switch_page("app.py")
