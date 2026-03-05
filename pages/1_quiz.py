"""
🎯 퀴즈 페이지 — 20개 질문으로 정치 성향을 진단합니다.
"""
import time
import streamlit as st
from services.content_service import get_questions
from utils.scoring_engine import ScoringEngine
from utils.bias_detector import BiasDetector
from database.models import Question, UserAnswer, AnswerChoice

st.set_page_config(page_title="프리즘 - 성향 진단", page_icon="🎯", layout="centered")

st.title("🎯 성향 진단 퀴즈")
st.caption("20개 질문에 답변하면 당신의 정치 성향을 다각도로 분석합니다.")
st.markdown("---")

# 질문 로드
questions_data = get_questions()
if not questions_data:
    st.error("질문을 불러올 수 없습니다. 관리자에게 문의하세요.")
    st.stop()

# 세션 초기화
if "quiz_answers" not in st.session_state:
    st.session_state.quiz_answers = {}
if "quiz_start_times" not in st.session_state:
    st.session_state.quiz_start_times = {}
if "quiz_current" not in st.session_state:
    st.session_state.quiz_current = 0

total = len(questions_data)
idx = st.session_state.quiz_current

# 진행률 표시
progress = idx / total
st.progress(progress, text=f"질문 {min(idx + 1, total)} / {total}")

if idx < total:
    q = questions_data[idx]
    q_id = q.get("id", q.get("order_index")) # DB id가 없으면 order_index 사용
    q_text = q["text_ko"]

    # 응답 시간 측정 시작
    if q_id not in st.session_state.quiz_start_times:
        st.session_state.quiz_start_times[q_id] = time.time()

    st.markdown(f"### Q{idx + 1}. {q_text}")
    st.markdown("")

    col1, col2, col3 = st.columns(3)

    with col1:
        if st.button("👍 예", key=f"yes_{q_id}", use_container_width=True, type="primary"):
            elapsed = int((time.time() - st.session_state.quiz_start_times[q_id]) * 1000)
            st.session_state.quiz_answers[q_id] = {"choice": "YES", "time_ms": elapsed}
            st.session_state.quiz_current += 1
            st.rerun()

    with col2:
        if st.button("🤔 잘 모르겠어요", key=f"unsure_{q_id}", use_container_width=True):
            elapsed = int((time.time() - st.session_state.quiz_start_times[q_id]) * 1000)
            st.session_state.quiz_answers[q_id] = {"choice": "UNSURE", "time_ms": elapsed}
            st.session_state.quiz_current += 1
            st.rerun()

    with col3:
        if st.button("👎 아니오", key=f"no_{q_id}", use_container_width=True):
            elapsed = int((time.time() - st.session_state.quiz_start_times[q_id]) * 1000)
            st.session_state.quiz_answers[q_id] = {"choice": "NO", "time_ms": elapsed}
            st.session_state.quiz_current += 1
            st.rerun()

    # 이전 버튼
    if idx > 0:
        st.markdown("")
        if st.button("← 이전 질문", key="prev"):
            st.session_state.quiz_current -= 1
            st.rerun()

else:
    # 모든 질문 완료 → 결과 계산
    st.markdown("### ✅ 모든 질문에 답변하셨습니다!")
    st.balloons()

    with st.spinner("분석 중..."):
        # 답변을 UserAnswer 리스트로 변환
        choice_map = {"YES": AnswerChoice.YES, "UNSURE": AnswerChoice.UNSURE, "NO": AnswerChoice.NO}
        answers = []
        raw_answers = []
        for q in questions_data:
            ans = st.session_state.quiz_answers.get(q["id"])
            if ans:
                answers.append(UserAnswer(
                    question_id=q["id"],
                    choice=choice_map.get(ans["choice"], AnswerChoice.UNSURE),
                    timestamp=time.time(),
                    response_time_ms=ans.get("time_ms", 0),
                ))
                raw_answers.append({
                    "question_id": q["id"],
                    "choice": ans["choice"],
                    "response_time_ms": ans.get("time_ms", 0),
                })

        # Question 객체 변환
        q_objects = [
            Question(
                id=q["id"],
                order_index=q["order_index"],
                text=q["text_ko"],
                category=q["category"],
                dimension=q["dimension"],
                moral_foundation=q.get("moral_foundation"),
                polarity=q["polarity"],
                contradicts_with=q.get("contradicts_with"),
            )
            for q in questions_data
        ]

        # 채점
        engine = ScoringEngine()
        result = engine.calculate_result(answers, q_objects)

        # 편향 분석
        detector = BiasDetector()
        bias_report = detector.detect(answers, q_objects)
        result["bias_report"] = bias_report
        result["raw_answers"] = raw_answers

        # 세션에 결과 저장
        st.session_state.my_result = result
        st.session_state.quiz_completed = True

    st.success("진단이 완료되었습니다! 결과 페이지로 이동합니다.")

    if st.button("📊 결과 보기", type="primary", use_container_width=True):
        st.switch_page("pages/2_result.py")
