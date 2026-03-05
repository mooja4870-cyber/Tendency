"""
성향 점수 계산 엔진
기존 TypeScript ScoringEngine을 Python으로 포팅.
사용자 답변 → 10단계 라벨, 카테고리별 점수, 도덕적 프로필 계산.
"""
from database.models import (
    Question, UserAnswer, DiagnosisResult, CategoryResult,
    MoralProfile, OrientationLabel, QuestionCategory,
    PoliticalDimension, MoralFoundation, Polarity, AnswerChoice,
    BiasReport, EmpathyScenario, CountryMatch, FigureMatch,
)


class ScoringEngine:
    """핵심 분석 엔진 — 답변 리스트를 받아 DiagnosisResult를 산출합니다."""

    def calculate_result(
        self,
        answers: list[UserAnswer],
        questions: list[Question],
    ) -> dict:
        """
        사용자 답변을 기반으로 진단 결과를 계산합니다.

        Args:
            answers: 사용자 답변 리스트
            questions: 질문 리스트 (DB에서 로드)

        Returns:
            dict: DiagnosisResult 형태의 딕셔너리
        """
        answer_map = {a.question_id: a for a in answers}

        # ── Step 1: 각 답변의 진보 점수 산출 ──
        scored = []
        for q in questions:
            answer = answer_map.get(q.id)
            raw_score = answer.choice.value if answer else 0.5

            # 극성 반전: 보수 방향 질문은 점수 반전
            progressive_score = (
                raw_score
                if q.polarity == Polarity.YES_IS_PROGRESSIVE
                else 1.0 - raw_score
            )
            scored.append({"question": q, "score": progressive_score})

        # ── Step 2: 전체 평균 (1차원 스펙트럼) ──
        overall_position = self._average([s["score"] for s in scored])

        # ── Step 3: 경제/사회 축 분리 ──
        economic_position = self._average([
            s["score"] for s in scored
            if s["question"].dimension == PoliticalDimension.ECONOMIC
        ])
        social_position = self._average([
            s["score"] for s in scored
            if s["question"].dimension == PoliticalDimension.SOCIAL
        ])

        # ── Step 4: 카테고리별 결과 ──
        category_results: dict[str, float] = {}
        for cat in QuestionCategory:
            cat_scores = [s["score"] for s in scored if s["question"].category == cat]
            if cat_scores:
                category_results[cat.value] = round(self._average(cat_scores), 3)

        # ── Step 5: 도덕적 기반 프로필 ──
        moral_profile = self._build_moral_profile(scored)

        # ── Step 6: 10단계 라벨 ──
        overall_label = self.get_label(overall_position)

        # ── Step 7: 맞춤형 피드백 생성 ──
        personality_insight = self._generate_insight(
            overall_label, economic_position, social_position, moral_profile
        )

        return {
            "overall_position": round(overall_position, 3),
            "economic_position": round(economic_position, 3),
            "social_position": round(social_position, 3),
            "overall_label": overall_label,
            "category_results": category_results,
            "moral_profile": moral_profile,
            "personality_insight": personality_insight,
        }

    @staticmethod
    def _average(arr: list[float]) -> float:
        """리스트의 평균을 계산합니다. 빈 리스트는 0.5를 반환."""
        if not arr:
            return 0.5
        return sum(arr) / len(arr)

    @staticmethod
    def get_label(position: float) -> str:
        """
        0.0~1.0 위치값을 10단계 성향 라벨 문자열로 변환합니다.
        """
        if position < 0.10:
            return "STRONG_CONSERVATIVE"
        elif position < 0.20:
            return "CONSERVATIVE"
        elif position < 0.30:
            return "MODERATE_CONSERVATIVE"
        elif position < 0.40:
            return "LEAN_CONSERVATIVE"
        elif position < 0.50:
            return "CENTER_RIGHT"
        elif position < 0.60:
            return "CENTER_LEFT"
        elif position < 0.70:
            return "LEAN_PROGRESSIVE"
        elif position < 0.80:
            return "MODERATE_PROGRESSIVE"
        elif position < 0.90:
            return "PROGRESSIVE"
        else:
            return "STRONG_PROGRESSIVE"

    def _build_moral_profile(self, scored: list[dict]) -> dict[str, float]:
        """도덕적 기반 프로필을 계산합니다."""
        profile = {}
        for mf in MoralFoundation:
            items = [
                s["score"] for s in scored
                if s["question"].moral_foundation == mf
            ]
            profile[mf.value.lower()] = round(self._average(items), 3)
        return profile

    def _generate_insight(
        self,
        label: str,
        eco_pos: float,
        soc_pos: float,
        moral: dict[str, float],
    ) -> str:
        """맞춤형 인사이트 텍스트를 생성합니다."""
        sb = ""

        # 전체 성향 설명
        if label in ("STRONG_CONSERVATIVE", "CONSERVATIVE"):
            sb += (
                "당신은 전통과 질서, 안정을 깊이 중시하는 성향입니다. "
                "도덕적 기반 이론에 따르면 '충성', '권위', '순결'의 "
                "가치가 강하게 작동합니다. 심리학 연구에서는 "
                "성실성(Conscientiousness)이 높고, 불확실성보다 "
                "안정을 선호하는 특성과 연결됩니다."
            )
        elif label in ("MODERATE_CONSERVATIVE", "LEAN_CONSERVATIVE"):
            sb += (
                "당신은 기존 체제의 안정성을 중시하면서도 "
                "변화의 필요성을 일부 인정하는 균형잡힌 보수입니다. "
                "'배려'와 '공정성' 가치도 어느 정도 중시하지만, "
                "'충성'과 '권위' 가치가 의사결정에 더 큰 영향을 미칩니다."
            )
        elif label in ("CENTER_RIGHT", "CENTER_LEFT"):
            sb += (
                "당신은 특정 이념에 치우치지 않는 중도적 시각입니다. "
                "이슈에 따라 유연하게 판단하며 실용적 성향이 강합니다. "
                "도덕적 기반 5가지를 비교적 균형있게 활용하는 특성을 보입니다."
            )
        elif label in ("LEAN_PROGRESSIVE", "MODERATE_PROGRESSIVE"):
            sb += (
                "당신은 사회적 변화에 열린 자세를 보이면서도 "
                "급진적 변화보다 점진적 개선을 선호합니다. "
                "'배려'와 '공정성' 가치가 의사결정의 핵심이지만, "
                "'권위'와 '충성' 가치도 완전히 무시하지 않습니다."
            )
        elif label in ("PROGRESSIVE", "STRONG_PROGRESSIVE"):
            sb += (
                "당신은 새로운 경험에 대한 개방성(Openness)이 높으며 "
                "사회적 불평등에 민감하게 반응합니다. "
                "'피해/배려'와 '공정성/호혜성' 두 가치가 "
                "도덕적 판단의 핵심 렌즈입니다."
            )

        sb += "\n\n"

        # 경제 vs 사회 괴리 분석
        gap = abs(eco_pos - soc_pos)
        if gap > 0.2:
            if eco_pos > soc_pos:
                sb += (
                    "📌 경제적으로는 진보적이나 사회적으로는 보수적인 "
                    "독특한 조합입니다."
                )
            else:
                sb += (
                    "📌 경제적으로는 보수적이나 사회적으로는 진보적인 "
                    "'리버테리언' 성향이 관찰됩니다."
                )

        return sb
