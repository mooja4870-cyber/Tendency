"""
🗳️ 주간 토론 페이지 — 투표 + 성향별 집계 + 크로스파티 분석
"""
import streamlit as st
import plotly.graph_objects as go
from services.debate_service import (
    get_current_topic, submit_vote, has_user_voted,
    get_vote_results, get_archived_topics,
)
from utils.helpers import get_label_korean

st.set_page_config(page_title="프리즘 - 주간 토론", page_icon="🗳️", layout="wide")

st.title("🗳️ 주간 토론")
st.markdown("---")

# ═══ 섹션 A: 이번 주 토론 주제 ═══
topic = None
try:
    topic = get_current_topic()
except Exception as e:
    st.error(f"토론 주제 로드 실패: {e}")

if not topic:
    st.info("현재 활성화된 토론 주제가 없습니다. 곧 새로운 주제가 올라옵니다!")
    st.stop()

st.header(topic["title"])
st.markdown(topic.get("description", ""))

# 찬반 논거
col1, col2 = st.columns(2)
with col1:
    st.markdown("#### 👍 찬성 측")
    for arg in (topic.get("pro_arguments") or []):
        st.success(f"• {arg}")
with col2:
    st.markdown("#### 👎 반대 측")
    for arg in (topic.get("con_arguments") or []):
        st.error(f"• {arg}")

st.caption(f"총 투표수: {topic.get('total_votes', 0):,}명")
st.markdown("---")

# ═══ 섹션 B: 투표하기 ═══
if not st.session_state.get("quiz_completed"):
    st.warning("투표하려면 먼저 성향 진단을 완료해주세요.")
    if st.button("🎯 진단 시작하기", type="primary"):
        st.switch_page("pages/1_quiz.py")
    st.stop()

my_label = st.session_state.get("my_result", {}).get("overall_label", "CENTER_LEFT")
topic_id = topic["id"]
session_id = st.session_state.get("session_id", "unknown")

already_voted = has_user_voted(topic_id, session_id)

if already_voted or st.session_state.get(f"voted_{topic_id}"):
    st.success("✅ 투표가 완료되었습니다!")
    user_choice = st.session_state.get(f"my_vote_{topic_id}", "")
else:
    st.markdown("### 당신의 생각은?")
    col1, col2, col3 = st.columns(3)

    with col1:
        if st.button("👍 찬성", type="primary", use_container_width=True):
            resp = submit_vote(topic_id, "AGREE", my_label, session_id)
            st.session_state[f"voted_{topic_id}"] = True
            st.session_state[f"my_vote_{topic_id}"] = "AGREE"
            if resp["accepted"]:
                st.balloons()
            st.rerun()
    with col2:
        if st.button("🤔 잘 모르겠어요", use_container_width=True):
            resp = submit_vote(topic_id, "UNSURE", my_label, session_id)
            st.session_state[f"voted_{topic_id}"] = True
            st.session_state[f"my_vote_{topic_id}"] = "UNSURE"
            st.rerun()
    with col3:
        if st.button("👎 반대", use_container_width=True):
            resp = submit_vote(topic_id, "DISAGREE", my_label, session_id)
            st.session_state[f"voted_{topic_id}"] = True
            st.session_state[f"my_vote_{topic_id}"] = "DISAGREE"
            st.rerun()

    st.markdown("---")
    st.stop()  # 투표 전에는 결과 표시하지 않음

# ═══ 섹션 C: 투표 결과 ═══
user_choice = st.session_state.get(f"my_vote_{topic_id}", "")

try:
    results = get_vote_results(topic_id, my_label, user_choice)
except Exception as e:
    st.error(f"결과 로드 실패: {e}")
    st.stop()

st.markdown("### 📊 투표 결과")

# 도넛 차트
overall = results.get("overall", {})
fig_donut = go.Figure(go.Pie(
    labels=["찬성", "반대", "보류"],
    values=[overall.get("agree", 0), overall.get("disagree", 0), overall.get("unsure", 0)],
    hole=0.5,
    marker=dict(colors=["#4CAF50", "#F44336", "#9E9E9E"]),
    textinfo="percent+label",
))
fig_donut.update_layout(
    height=350,
    annotations=[dict(text=f"{results.get('total_votes', 0)}표", x=0.5, y=0.5,
                       font_size=20, showarrow=False)],
    margin=dict(t=20, b=20),
)
st.plotly_chart(fig_donut, use_container_width=True)

# 성향별 그룹 바 차트
st.markdown("### 📊 성향별 투표 분포")
by_orient = results.get("by_orientation", {})

groups = list(by_orient.keys())
agree_vals = [by_orient[g].get("agree", 0) for g in groups]
disagree_vals = [by_orient[g].get("disagree", 0) for g in groups]
unsure_vals = [by_orient[g].get("unsure", 0) for g in groups]
counts = [by_orient[g].get("count", 0) for g in groups]
group_labels = [f"{g}\n({c}명)" for g, c in zip(groups, counts)]

fig_bar = go.Figure()
fig_bar.add_trace(go.Bar(name="찬성", x=group_labels, y=agree_vals, marker_color="#4CAF50"))
fig_bar.add_trace(go.Bar(name="반대", x=group_labels, y=disagree_vals, marker_color="#F44336"))
fig_bar.add_trace(go.Bar(name="보류", x=group_labels, y=unsure_vals, marker_color="#9E9E9E"))
fig_bar.update_layout(
    barmode="group", height=350,
    yaxis=dict(title="비율 (%)", range=[0, 100]),
    margin=dict(t=20, b=20),
)
st.plotly_chart(fig_bar, use_container_width=True)

# 사용자 인사이트
insight = results.get("user_insight")
if insight:
    if insight.get("aligned"):
        st.info(f"🎯 {insight['message']}")
    else:
        st.warning(f"🤔 {insight['message']}")

# 교차 성향 합의
cross = results.get("cross_party", {})
if cross.get("exists"):
    st.success(f"🤝 {cross['message']}")

# ═══ 섹션 D: 과거 토론 ═══
with st.expander("📚 지난 토론 보기"):
    try:
        archived = get_archived_topics()
        if archived:
            for t in archived:
                st.markdown(f"**{t.get('title', '')}** (W{t.get('week_number', '')})")
                st.caption(t.get("description", "")[:100])
                st.markdown("---")
        else:
            st.info("아직 지난 토론이 없습니다.")
    except Exception:
        st.info("과거 토론 기록을 불러올 수 없습니다.")
