"""
인지편향 탐지 모듈
기존 TypeScript BiasDetector를 Python으로 포팅.
사용자 답변 패턴에서 확증 편향, 현상 유지 편향 등을 감지합니다.
"""
from database.models import (
    UserAnswer, BiasType, BiasSeverity, BiasLevel,
    Question, Polarity, QuestionCategory, MoralFoundation, AnswerChoice,
)


# 모순 쌍 정의 (질문 order_index 기준)
CONTRADICTION_PAIRS = [
    {
        "q1": 1, "q2": 14,
        "desc": "정부 규제 찬성과 시장 자유 경쟁 찬성은 모순됩니다"
    },
    {
        "q1": 3, "q2": 4,
        "desc": "전통 가족 보호와 차별금지법 지지는 충돌할 수 있습니다"
    },
    {
        "q1": 8, "q2": 15,
        "desc": "외국인 엄격 관리와 역사적 과오 사과는 배타성 면에서 모순됩니다"
    },
    {
        "q1": 10, "q2": 13,
        "desc": "종교 가치 법제화와 성평등 교육 강화는 가치 충돌이 있습니다"
    },
    {
        "q1": 2, "q2": 14,
        "desc": "복지 확대와 시장 자유 경쟁 최선론은 논리적으로 상충합니다"
    },
]


class BiasDetector:
    """사용자 답변 패턴에서 인지편향을 감지합니다."""

    def detect(self, answers: list[UserAnswer], questions: list[Question]) -> dict:
        """
        인지편향 분석을 실행합니다.

        Args:
            answers: 사용자 답변 리스트
            questions: 질문 리스트

        Returns:
            dict: {
                "bias_count": int,
                "bias_level": str,       # "MINIMAL" | "MODERATE" | "SIGNIFICANT"
                "detected_biases": list[dict],
                "consistency_score": float
            }
        """
        answer_map = {a.question_id: a for a in answers}
        question_map = {q.order_index: q for q in questions}
        detected: list[dict] = []

        # ═══ 편향1: 확증 편향 (모순 답변 감지) ═══
        for pair in CONTRADICTION_PAIRS:
            q1 = question_map.get(pair["q1"])
            q2 = question_map.get(pair["q2"])
            if not q1 or not q2:
                continue

            a1 = answer_map.get(q1.id)
            a2 = answer_map.get(q2.id)
            if (a1 and a2 and
                a1.choice == AnswerChoice.YES and
                a2.choice == AnswerChoice.YES):
                detected.append({
                    "type": BiasType.CONFIRMATION.name,
                    "title": "확증 편향 (Confirmation Bias)",
                    "description": "자신의 기존 신념에 맞는 정보만 선택적으로 받아들이는 경향입니다.",
                    "evidence": (
                        f'Q{pair["q1"]}. "{q1.text}"에 \'예\'를, '
                        f'Q{pair["q2"]}. "{q2.text}"에도 \'예\'를 선택하셨습니다. '
                        f'{pair["desc"]}'
                    ),
                    "quote": '"우리는 보고 싶은 것만 본다" — 율리우스 카이사르',
                    "severity": BiasSeverity.HIGH.value,
                })

        # ═══ 편향2: 현상 유지 편향 ═══
        change_questions = [q for q in questions if q.polarity == Polarity.YES_IS_PROGRESSIVE]
        change_resist = sum(
            1 for q in change_questions
            if answer_map.get(q.id) and answer_map[q.id].choice == AnswerChoice.NO
        )
        change_ratio = change_resist / max(len(change_questions), 1)

        if change_ratio > 0.7:
            detected.append({
                "type": BiasType.STATUS_QUO.name,
                "title": "현상 유지 편향 (Status Quo Bias)",
                "description": "변화보다 현재 상태를 유지하는 것을 과도하게 선호하는 경향입니다.",
                "evidence": (
                    f"변화를 제안하는 질문 {len(change_questions)}개 중 "
                    f"{change_resist}개에서 현재 상태 유지를 선택하셨습니다."
                ),
                "quote": '"익숙함이 항상 옳은 것은 아니다" — 다니엘 카너먼',
                "severity": BiasSeverity.MODERATE.value,
            })

        # ═══ 편향3: 감정 휴리스틱 ═══
        emotional_cats = {QuestionCategory.SECURITY, QuestionCategory.TRADITION}
        emotional_qs = [q for q in questions if q.category in emotional_cats]
        extreme_count = sum(
            1 for q in emotional_qs
            if answer_map.get(q.id) and answer_map[q.id].choice in (AnswerChoice.YES, AnswerChoice.NO)
        )
        emotional_ratio = extreme_count / max(len(emotional_qs), 1)

        # 응답 시간 비교
        emotional_times = [
            answer_map[q.id].response_time_ms
            for q in emotional_qs
            if answer_map.get(q.id) and answer_map[q.id].response_time_ms > 0
        ]
        all_times = [a.response_time_ms for a in answers if a.response_time_ms > 0]
        emotional_avg = sum(emotional_times) / max(len(emotional_times), 1) if emotional_times else 0
        overall_avg = sum(all_times) / max(len(all_times), 1) if all_times else 0

        if emotional_ratio > 0.8 and emotional_avg < overall_avg * 0.7:
            detected.append({
                "type": BiasType.AFFECT_HEURISTIC.name,
                "title": "감정 휴리스틱 (Affect Heuristic)",
                "description": "감정적 반응이 이성적 판단보다 먼저 작동하여 빠르고 강한 결론에 도달하는 경향입니다.",
                "evidence": "안보·전통 관련 질문에서 특히 빠르고 강경한 답변 패턴이 관찰되었습니다.",
                "quote": '"두려움은 나쁜 조언자다" — 앙겔라 메르켈',
                "severity": BiasSeverity.MODERATE.value,
            })

        # ═══ 편향4: 내집단 편향 ═══
        loyalty_qs = [q for q in questions if q.moral_foundation == MoralFoundation.LOYALTY]
        strong_loyalty = sum(
            1 for q in loyalty_qs
            if (q.polarity == Polarity.YES_IS_CONSERVATIVE and
                answer_map.get(q.id) and answer_map[q.id].choice == AnswerChoice.YES)
        )

        if strong_loyalty / max(len(loyalty_qs), 1) > 0.8:
            detected.append({
                "type": BiasType.IN_GROUP.name,
                "title": "내집단 편향 (In-group Bias)",
                "description": "자신이 속한 집단을 과도하게 우호적으로 평가하고 외부 집단에 대해 방어적으로 반응합니다.",
                "evidence": "충성·소속감 관련 질문 모두에서 강한 내집단 선호가 나타났습니다.",
                "quote": '"적을 만들지 않는 것이 아니라, 적을 이해하는 것이 지혜다" — 넬슨 만델라',
                "severity": BiasSeverity.MODERATE.value,
            })

        # ═══ 편향5: 편향 사각지대 (편향 미감지 시) ═══
        if not detected:
            detected.append({
                "type": BiasType.BLIND_SPOT.name,
                "title": "편향 사각지대 (Bias Blind Spot)",
                "description": (
                    "흥미롭게도 뚜렷한 편향 패턴이 감지되지 않았습니다. "
                    "하지만 '나는 편향이 없다'고 믿는 것 자체가 가장 흔한 편향입니다."
                ),
                "evidence": "일관된 답변 패턴을 보여주셨지만, 모든 사람은 보이지 않는 편향을 가지고 있습니다.",
                "quote": '"가장 위험한 편향은 자신에게 편향이 없다고 믿는 것이다" — 에밀리 프로닌(프린스턴)',
                "severity": BiasSeverity.LOW.value,
            })

        # 일관성 점수 계산
        high_count = sum(1 for b in detected if b["severity"] == "HIGH")
        mod_count = sum(1 for b in detected if b["severity"] == "MODERATE")
        consistency = max(0.0, min(1.0, 1.0 - (high_count * 0.3 + mod_count * 0.15)))

        if consistency <= 0.5:
            bias_level = "SIGNIFICANT"
        elif consistency <= 0.8:
            bias_level = "MODERATE"
        else:
            bias_level = "MINIMAL"

        return {
            "bias_count": len(detected),
            "bias_level": bias_level,
            "detected_biases": detected,
            "consistency_score": round(consistency, 3),
        }
