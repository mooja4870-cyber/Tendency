"""
🤝 궁합 비교 페이지
모드 A) 초대 링크 생성 / 모드 B) 초대 수락 / 모드 C) 궁합 결과
"""
import streamlit as st
import plotly.graph_objects as go
import qrcode
from io import BytesIO
from services.compatibility_service import create_invite_link, get_invite, compare_results
from utils.helpers import get_label_korean, CATEGORY_DISPLAY, MORAL_DISPLAY

st.set_page_config(page_title="프리즘 - 궁합 비교", page_icon="🤝", layout="wide")

st.title("🤝 궁합 비교")
st.markdown("---")

query_params = st.query_params

# ═══ 모드 B: 초대 링크로 접근 ═══
if "invite" in query_params:
    invite_code = query_params["invite"]
    st.session_state["pending_invite"] = invite_code

    try:
        invite = get_invite(invite_code)
    except Exception as e:
        st.error(f"초대 정보 조회 실패: {e}")
        st.stop()

    if not invite:
        st.error("유효하지 않은 초대 코드입니다.")
        st.stop()

    if invite.get("status") == "expired":
        st.warning("⏰ 이 초대 링크는 만료되었습니다. 상대방에게 새 링크를 요청해주세요.")
        st.stop()

    if invite.get("status") == "completed":
        st.info("이 초대는 이미 사용되었습니다.")

    inviter_label = invite.get("inviter_label", "알 수 없음")
    st.markdown(f"### 📨 초대를 받았습니다!")
    st.markdown(f"상대방은 **{inviter_label}** 성향입니다.")
    st.markdown("당신도 진단을 완료하고 궁합을 확인해보세요!")

    if st.session_state.get("quiz_completed") and st.session_state.get("my_result_short_id"):
        if st.button("🔮 궁합 확인하기", type="primary", use_container_width=True):
            try:
                compat = compare_results(invite_code, st.session_state.my_result_short_id)
                st.session_state["compatibility_result"] = compat
                st.rerun()
            except Exception as e:
                st.error(str(e))
    else:
        if st.button("🎯 퀴즈 시작하기", type="primary", use_container_width=True):
            st.switch_page("pages/1_quiz.py")
        st.stop()

# ═══ 모드 C: 궁합 결과 표시 ═══
if st.session_state.get("compatibility_result"):
    compat = st.session_state.compatibility_result

    # 궁합 등급 카드
    st.markdown(f"## {compat['overall_display']}")
    st.metric("성향 거리", f"{compat['distance']:.0%}")

    # 두 사람 스펙트럼 비교
    st.markdown("### 🎚️ 성향 비교")
    fig = go.Figure()
    fig.add_trace(go.Scatter(
        x=[compat["inviter"]["position"]], y=[0.6],
        mode="markers+text", text=[f"상대 ({compat['inviter']['label']})"],
        marker=dict(size=18, color="#6C5CE7"), textposition="top center",
    ))
    fig.add_trace(go.Scatter(
        x=[compat["invitee"]["position"]], y=[0.4],
        mode="markers+text", text=[f"나 ({compat['invitee']['label']})"],
        marker=dict(size=18, color="#00B894"), textposition="bottom center",
    ))
    fig.add_shape(type="rect", x0=0, x1=1, y0=0.45, y1=0.55,
                  fillcolor="rgba(200,200,200,0.3)", line_width=0)
    fig.update_layout(
        xaxis=dict(range=[0, 1], title="보수 ← → 진보",
                   tickvals=[0, 0.5, 1], ticktext=["보수", "중도", "진보"]),
        yaxis=dict(visible=False, range=[0, 1]),
        height=200, margin=dict(t=30, b=30), showlegend=False,
    )
    st.plotly_chart(fig, use_container_width=True)

    # 카테고리별 비교 바 차트
    st.markdown("### 📊 카테고리별 비교")
    comps = compat.get("category_comparisons", [])
    if comps:
        cat_names = [c["display"] for c in comps]
        my_vals = [c["my_pos"] for c in comps]
        partner_vals = [c["partner_pos"] for c in comps]

        fig_bar = go.Figure()
        fig_bar.add_trace(go.Bar(name="상대", x=cat_names, y=my_vals, marker_color="#6C5CE7"))
        fig_bar.add_trace(go.Bar(name="나", x=cat_names, y=partner_vals, marker_color="#00B894"))
        fig_bar.update_layout(barmode="group", height=350, yaxis=dict(range=[0, 1]))
        st.plotly_chart(fig_bar, use_container_width=True)

    # 도덕기반 겹침 레이더
    st.markdown("### 🧭 도덕 기반 비교")
    moral_labels = list(MORAL_DISPLAY.values())
    # (간략화: inviter/invitee 도덕 프로필에서 비교)
    st.metric("도덕 유사도", f"{compat.get('moral_similarity', 0):.0%}")

    # 공유 가치
    shared = compat.get("shared_values", [])
    if shared:
        st.markdown("### ✅ 공유 가치")
        for sv in shared:
            st.success(f"• {sv}")

    # 갈등 영역
    conflicts = compat.get("conflict_areas", [])
    if conflicts:
        st.markdown("### ⚡ 갈등 영역")
        for ca in conflicts:
            st.warning(f"• {ca}")

    # 조언
    advice = compat.get("advice_list", [])
    if advice:
        st.markdown("### 💬 대화 조언")
        for a in advice:
            st.info(f"**{a['area']}**: {a['advice']}")

    st.stop()

# ═══ 모드 A: 초대 링크 생성 ═══
if not st.session_state.get("quiz_completed"):
    st.info("궁합을 비교하려면 먼저 성향 진단을 완료해주세요.")
    if st.button("🎯 진단 시작하기", type="primary"):
        st.switch_page("pages/1_quiz.py")
    st.stop()

if not st.session_state.get("my_result_short_id"):
    st.warning("결과를 먼저 저장해주세요.")
    if st.button("📊 결과 페이지로", type="primary"):
        st.switch_page("pages/2_result.py")
    st.stop()

st.markdown("### 📨 궁합 초대 링크 만들기")
st.markdown("친구에게 링크를 보내면, 친구도 진단 후 궁합 결과를 확인할 수 있습니다!")

if st.button("초대 링크 생성하기", type="primary", use_container_width=True):
    try:
        invite = create_invite_link(st.session_state.my_result_short_id)
        st.session_state["my_invite"] = invite
    except Exception as e:
        st.error(str(e))

if st.session_state.get("my_invite"):
    inv = st.session_state.my_invite
    invite_url = f"https://your-app.streamlit.app/?invite={inv['invite_code']}"

    st.success("초대 링크가 생성되었습니다!")
    st.code(invite_url, language=None)
    st.caption(f"만료일: {inv.get('expires_at', '')[:10]}")

    # QR 코드
    qr = qrcode.make(invite_url)
    buf = BytesIO()
    qr.save(buf, format="PNG")
    st.image(buf.getvalue(), width=200, caption="QR코드로 공유")

    # 공유 메시지
    st.text_area("📋 공유 메시지 (복사해서 보내세요)", inv.get("share_message", ""), height=80)
