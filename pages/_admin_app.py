"""
🔐 관리자 페이지 — 토론 관리, 콘텐츠 수정, 통계, 데이터 시딩
"""
import streamlit as st
import pandas as pd
from services.auth_service import require_admin
from services.debate_service import (
    get_current_topic, get_archived_topics,
    create_topic, activate_topic,
)
from services.content_service import get_questions, get_media_sources
from services.stats_service import get_orientation_distribution, get_bias_statistics
from database.migrations import run_migrations, seed_initial_data

st.set_page_config(page_title="프리즘 - 관리자", page_icon="🔐", layout="wide")

st.title("🔐 관리자 페이지")

# 인증 확인
if not require_admin():
    st.stop()

st.success("✅ 관리자 인증 완료")
st.markdown("---")

tab1, tab2, tab3, tab4 = st.tabs(["🗳️ 토론 관리", "📝 콘텐츠", "📊 통계", "🔧 시스템"])

# ═══ Tab 1: 토론 관리 ═══
with tab1:
    st.markdown("### 현재 활성 주제")
    current = get_current_topic()
    if current:
        st.info(f"**{current['title']}** (투표: {current.get('total_votes', 0)}명)")
    else:
        st.warning("활성 주제 없음")

    st.markdown("### 새 토론 주제 등록")
    with st.form("new_topic"):
        title = st.text_input("제목")
        desc = st.text_area("설명")
        pro = st.text_area("찬성 논거 (줄바꿈 구분)")
        con = st.text_area("반대 논거 (줄바꿈 구분)")
        cat = st.selectbox("관련 카테고리", [
            "ECONOMY", "WELFARE", "SECURITY", "CULTURE",
            "ENVIRONMENT", "RIGHTS", "TRADITION", "GOVERNANCE"
        ])
        days = st.number_input("진행 기간 (일)", 1, 30, 7)

        if st.form_submit_button("등록"):
            if title:
                try:
                    create_topic(title, desc,
                                 [a.strip() for a in pro.split("\n") if a.strip()],
                                 [a.strip() for a in con.split("\n") if a.strip()],
                                 cat, days)
                    st.success("등록 완료!")
                    st.rerun()
                except Exception as e:
                    st.error(str(e))

    st.markdown("### 주제 활성화")
    try:
        archived = get_archived_topics()
        all_topics = ([current] if current else []) + archived
        if all_topics:
            topic_options = {f"{t['id']}: {t['title']}": t['id'] for t in all_topics if t}
            selected = st.selectbox("활성화할 주제", list(topic_options.keys()))
            if st.button("활성화"):
                activate_topic(topic_options[selected])
                st.success("활성화 완료!")
                st.rerun()
    except Exception:
        st.info("등록된 주제가 없습니다.")

# ═══ Tab 2: 콘텐츠 ═══
with tab2:
    st.markdown("### 질문 목록")
    try:
        questions = get_questions()
        if questions:
            df = pd.DataFrame(questions)[["order_index", "text_ko", "category", "dimension", "polarity"]]
            st.dataframe(df, use_container_width=True)
    except Exception:
        st.info("질문 데이터 없음")

    st.markdown("### 매체 목록")
    try:
        media = get_media_sources()
        if media:
            df_m = pd.DataFrame(media)[["name", "type", "orientation", "logo_emoji"]]
            st.dataframe(df_m, use_container_width=True)
    except Exception:
        st.info("매체 데이터 없음")

# ═══ Tab 3: 통계 ═══
with tab3:
    try:
        stats = get_orientation_distribution()
        c1, c2 = st.columns(2)
        c1.metric("총 진단 수", f"{stats.get('total_users', 0):,}")

        bias_stats = get_bias_statistics()
        c2.metric("평균 편향 수", f"{bias_stats.get('avg_bias_count', 0)}")

        dist = stats.get("distribution", {})
        if dist:
            from utils.helpers import get_label_korean
            st.markdown("### 성향 분포")
            for label_en, pct in dist.items():
                st.markdown(f"- {get_label_korean(label_en)}: **{pct}%**")
    except Exception as e:
        st.error(f"통계 로드 실패: {e}")

# ═══ Tab 4: 시스템 ═══
with tab4:
    st.markdown("### 데이터베이스 마이그레이션")
    if st.button("🔨 테이블 생성 (마이그레이션)", type="primary"):
        with st.spinner("마이그레이션 실행 중..."):
            try:
                results = run_migrations()
                for name, status in results.items():
                    st.write(f"- {name}: {status}")
                st.success("마이그레이션 완료!")
            except Exception as e:
                st.error(f"마이그레이션 실패: {e}")

    st.markdown("### 초기 데이터 시딩")
    if st.button("🌱 초기 데이터 시딩"):
        with st.spinner("시딩 중..."):
            try:
                results = seed_initial_data()
                for table, stats in results.items():
                    st.write(f"- {table}: 삽입 {stats['inserted']}, 스킵 {stats['skipped']}, 오류 {stats['errors']}")
                st.success("시딩 완료!")
            except Exception as e:
                st.error(f"시딩 실패: {e}")

    st.markdown("### 캐시 초기화")
    if st.button("🗑️ 캐시 초기화"):
        st.cache_data.clear()
        st.cache_resource.clear()
        st.success("캐시가 초기화되었습니다.")
