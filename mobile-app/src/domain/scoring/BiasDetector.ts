import {
  UserAnswer,
  BiasReport,
  BiasType,
  BiasSeverity,
  BiasLevel,
  AnswerChoice,
  Question,
  Polarity,
  QuestionCategory,
  MoralFoundation
} from '../model/types';
import { QUESTIONS } from '../../data/questions/questions';

interface ContradictionPair {
  questionId1: number;
  questionId2: number;
  contradictionDesc: string;
}

export class BiasDetector {
  // 모순 쌍 정의
  private contradictionPairs: ContradictionPair[] = [
    { questionId1: 1, questionId2: 14, contradictionDesc: "정부 규제 찬성과 시장 자유 경쟁 찬성은 모순됩니다" },
    { questionId1: 3, questionId2: 4, contradictionDesc: "전통 가족 보호와 차별금지법 지지는 충돌할 수 있습니다" },
    { questionId1: 8, questionId2: 15, contradictionDesc: "외국인 엄격 관리와 역사적 과오 사과는 배타성 면에서 모순됩니다" },
    { questionId1: 10, questionId2: 13, contradictionDesc: "종교 가치 법제화와 성평등 교육 강화는 가치 충돌이 있습니다" },
    { questionId1: 2, questionId2: 14, contradictionDesc: "복지 확대와 시장 자유 경쟁 최선론은 논리적으로 상충합니다" },
    // ═══ Q21~Q30 확장 모순 쌍 ═══
    { questionId1: 23, questionId2: 12, contradictionDesc: "모병제 전환 찬성과 군 복무를 국민 의무로 여기는 것은 모순됩니다" },
    { questionId1: 6, questionId2: 28, contradictionDesc: "환경 보호를 위해 경제 희생을 주장하면서 원자력 확대를 찬성하는 것은 충돌합니다" },
    { questionId1: 25, questionId2: 26, contradictionDesc: "다문화 지원 확대와 문화 정체성 보호 강화는 가치 충돌이 있습니다" }
  ];

  detect(answers: UserAnswer[]): BiasReport {
    const answerMap = new Map(answers.map(a => [a.questionId, a]));
    const detectedBiases: any[] = [];

    // ═══ 편향1: 확증 편향 (모순 답변 감지) ═══
    // 여러 모순 쌍이 감지되어도 하나의 카드로 통합
    const contradictionEvidences: string[] = [];
    this.contradictionPairs.forEach(pair => {
      const a1 = answerMap.get(pair.questionId1)?.choice;
      const a2 = answerMap.get(pair.questionId2)?.choice;

      const q1 = QUESTIONS.find(q => q.id === pair.questionId1);
      const q2 = QUESTIONS.find(q => q.id === pair.questionId2);

      if (q1 && q2 && a1 === AnswerChoice.YES && a2 === AnswerChoice.YES) {
        contradictionEvidences.push(
          `Q${pair.questionId1}. "${q1.text}"에 '예'를, Q${pair.questionId2}. "${q2.text}"에도 '예'를 선택하셨습니다. ${pair.contradictionDesc}`
        );
      }
    });

    if (contradictionEvidences.length > 0) {
      detectedBiases.push({
        biasType: BiasType.CONFIRMATION,
        title: "확증 편향 (Confirmation Bias)",
        description: "자신의 기존 신념에 맞는 정보만 선택적으로 받아들이는 경향입니다.",
        evidence: contradictionEvidences.join('\n\n'),
        quote: "\"우리는 보고 싶은 것만 본다\" — 율리우스 카이사르",
        severity: contradictionEvidences.length >= 3 ? BiasSeverity.HIGH : BiasSeverity.MODERATE
      });
    }

    // ═══ 편향2: 현상 유지 편향 ═══
    const changeQuestions = QUESTIONS.filter(q => q.polarity === Polarity.YES_IS_PROGRESSIVE);
    const changeResistCount = changeQuestions.filter(q => answerMap.get(q.id)?.choice === AnswerChoice.NO).length;
    const changeResistRatio = changeResistCount / (changeQuestions.length || 1);

    if (changeResistRatio > 0.7) {
      detectedBiases.push({
        biasType: BiasType.STATUS_QUO,
        title: "현상 유지 편향 (Status Quo Bias)",
        description: "변화보다 현재 상태를 유지하는 것을 과도하게 선호하는 경향입니다.",
        evidence: `변화를 제안하는 질문 ${changeQuestions.length}개 중 ${changeResistCount}개에서 현재 상태 유지를 선택하셨습니다.`,
        quote: "\"익숙함이 항상 옳은 것은 아니다\" — 다니엘 카너먼",
        severity: BiasSeverity.MODERATE
      });
    }

    // ═══ 편향3: 감정 휴리스틱 ═══
    const emotionalCategories = [QuestionCategory.SECURITY, QuestionCategory.TRADITION];
    const emotionalQs = QUESTIONS.filter(q => emotionalCategories.includes(q.category));
    const extremeEmotionalCount = emotionalQs.filter(q => {
      const choice = answerMap.get(q.id)?.choice;
      return choice === AnswerChoice.YES || choice === AnswerChoice.NO;
    }).length;
    const emotionalRatio = extremeEmotionalCount / (emotionalQs.length || 1);

    const emotionalTimes = emotionalQs.map(q => answerMap.get(q.id)?.responseTimeMs).filter((t): t is number => t !== undefined);
    const emotionalAvgTime = emotionalTimes.length ? emotionalTimes.reduce((a, b) => a + b, 0) / emotionalTimes.length : 0;
    const overallAvgTime = answers.length ? answers.reduce((a, b) => a + b.responseTimeMs, 0) / answers.length : 0;

    if (emotionalRatio > 0.8 && emotionalAvgTime < overallAvgTime * 0.7) {
      detectedBiases.push({
        biasType: BiasType.AFFECT_HEURISTIC,
        title: "감정 휴리스틱 (Affect Heuristic)",
        description: "감정적 반응이 이성적 판단보다 먼저 작동하여 빠르고 강한 결론에 도달하는 경향입니다.",
        evidence: "안보·전통 관련 질문에서 특히 빠르고 강경한 답변 패턴이 관찰되었습니다.",
        quote: "\"두려움은 나쁜 조언자다\" — 앙겔라 메르켈",
        severity: BiasSeverity.MODERATE
      });
    }

    // ═══ 편향4: 내집단 편향 ═══
    const loyaltyQs = QUESTIONS.filter(q => q.moralFoundation === MoralFoundation.LOYALTY);
    const strongLoyaltyCount = loyaltyQs.filter(q => {
      const choice = answerMap.get(q.id)?.choice;
      return q.polarity === Polarity.YES_IS_CONSERVATIVE && choice === AnswerChoice.YES;
    }).length;

    if (strongLoyaltyCount / (loyaltyQs.length || 1) > 0.8) {
      detectedBiases.push({
        biasType: BiasType.IN_GROUP,
        title: "내집단 편향 (In-group Bias)",
        description: "자신이 속한 집단을 과도하게 우호적으로 평가하고 외부 집단에 대해 방어적으로 반응합니다.",
        evidence: "충성·소속감 관련 질문 모두에서 강한 내집단 선호가 나타났습니다.",
        quote: "\"적을 만들지 않는 것이 아니라, 적을 이해하는 것이 지혜다\" — 넬슨 만델라",
        severity: BiasSeverity.MODERATE
      });
    }

    // ═══ 편향5: 편향 사각지대 (항상 마지막에 추가) ═══
    if (detectedBiases.length === 0) {
      detectedBiases.push({
        biasType: BiasType.BLIND_SPOT,
        title: "편향 사각지대 (Bias Blind Spot)",
        description: "흥미롭게도 뚜렷한 편향 패턴이 감지되지 않았습니다. 하지만 '나는 편향이 없다'고 믿는 것 자체가 가장 흔한 편향입니다.",
        evidence: "일관된 답변 패턴을 보여주셨지만, 모든 사람은 보이지 않는 편향을 가지고 있습니다.",
        quote: "\"가장 위험한 편향은 자신에게 편향이 없다고 믿는 것이다\" — 에밀리 프로닌(프린스턴)",
        severity: BiasSeverity.LOW
      });
    }

    // 일관성 점수 계산
    const highSeverityCount = detectedBiases.filter(b => b.severity === BiasSeverity.HIGH).length;
    const moderateSeverityCount = detectedBiases.filter(b => b.severity === BiasSeverity.MODERATE).length;
    const consistency = 1.0 - (highSeverityCount * 0.3 + moderateSeverityCount * 0.15);

    let overallLevel = BiasLevel.MINIMAL;
    if (consistency <= 0.5) overallLevel = BiasLevel.SIGNIFICANT;
    else if (consistency <= 0.8) overallLevel = BiasLevel.MODERATE;

    return {
      detectedBiases,
      consistencyScore: Math.max(0, Math.min(1, consistency)),
      overallBiasLevel: overallLevel
    };
  }
}
