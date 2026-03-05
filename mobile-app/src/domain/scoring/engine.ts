import {
  DiagnosisResult,
  UserAnswer,
  Question,
  PoliticalDimension,
  MoralFoundation,
  OrientationLabel,
  QuestionCategory,
  CategoryResult,
  MoralProfile,
  Polarity,
  AnswerChoice
} from '../model/types';
import { QUESTIONS } from '../../data/questions/questions';
import { BiasDetector } from './BiasDetector';
import { CountryMapper } from './CountryMapper';
import { FigureMatcher } from './FigureMatcher';
import { ScenarioRepository } from '../repository/ScenarioRepository';

export class ScoringEngine {
  private biasDetector = new BiasDetector();
  private countryMapper = new CountryMapper();
  private figureMatcher = new FigureMatcher();
  private scenarioRepo = new ScenarioRepository();

  /**
   * 핵심 분석 엔진 구현 (Act 3)
   */
  calculateResult(answers: UserAnswer[]): DiagnosisResult {
    const answerMap = new Map(answers.map(a => [a.questionId, a]));

    // ── Step 1: 각 답변의 진보 점수 산출 ──
    const scoredAnswers = QUESTIONS.map(q => {
      const answer = answerMap.get(q.id);
      const rawScore = answer ? (
        answer.choice === AnswerChoice.YES ? 1.0 :
          answer.choice === AnswerChoice.UNSURE ? 0.5 : 0.0
      ) : 0.5;

      // 극성 반전: 보수 방향 질문은 점수 반전
      const progressiveScore = q.polarity === Polarity.YES_IS_PROGRESSIVE
        ? rawScore
        : 1.0 - rawScore;

      return { question: q, score: progressiveScore };
    });

    // ── Step 2: 전체 평균 (1차원 스펙트럼) ──
    const overallPosition = this.average(scoredAnswers.map(a => a.score));

    // ── Step 3: 경제/사회 축 분리 (사분면) ──
    const economicPosition = this.average(
      scoredAnswers
        .filter(a => a.question.dimension === PoliticalDimension.ECONOMIC)
        .map(a => a.score)
    );

    const socialPosition = this.average(
      scoredAnswers
        .filter(a => a.question.dimension === PoliticalDimension.SOCIAL)
        .map(a => a.score)
    );

    // ── Step 4: 카테고리별 결과 ──
    const categoryResults: CategoryResult[] = Object.values(QuestionCategory).map(cat => {
      const catScores = scoredAnswers.filter(a => a.question.category === cat);
      if (catScores.length === 0) return null;

      const catPosition = this.average(catScores.map(a => a.score));
      return {
        category: cat as QuestionCategory,
        position: catPosition,
        label: this.getLabel(catPosition)
      };
    }).filter((r): r is CategoryResult => r !== null);

    // ── Step 5: 도덕적 기반 프로필 ──
    const moralProfile = this.buildMoralProfile(scoredAnswers);

    // ── Step 6: 10단계 라벨 ──
    const overallLabel = this.getLabel(overallPosition);

    // ── Step 7: 맞춤형 피드백 생성 ──
    const insight = this.generateInsight(
      overallLabel,
      economicPosition,
      socialPosition,
      moralProfile
    );

    const resultWithoutFeatures: any = {
      overallPosition,
      economicPosition,
      socialPosition,
      overallLabel,
      categoryResults,
      moralProfile,
      personalityInsight: insight
    };

    // ── Step 8: 기능별 데이터 통합 ──
    const biasReport = this.biasDetector.detect(answers);
    const countryMatches = this.countryMapper.match(resultWithoutFeatures as DiagnosisResult);
    const figureMatches = this.figureMatcher.match(resultWithoutFeatures as DiagnosisResult);
    const empathyScenarios = this.scenarioRepo.getScenarios(resultWithoutFeatures as DiagnosisResult);

    return {
      ...resultWithoutFeatures,
      biasReport,
      countryMatches,
      figureMatches,
      empathyScenarios
    };
  }

  private average(arr: number[]): number {
    if (arr.length === 0) return 0.5;
    return arr.reduce((a, b) => a + b, 0) / arr.length;
  }

  public getLabel(position: number): OrientationLabel {
    if (position < 0.10) return OrientationLabel.STRONG_CONSERVATIVE;
    if (position < 0.20) return OrientationLabel.CONSERVATIVE;
    if (position < 0.30) return OrientationLabel.MODERATE_CONSERVATIVE;
    if (position < 0.40) return OrientationLabel.LEAN_CONSERVATIVE;
    if (position < 0.50) return OrientationLabel.CENTER_RIGHT;
    if (position < 0.60) return OrientationLabel.CENTER_LEFT;
    if (position < 0.70) return OrientationLabel.LEAN_PROGRESSIVE;
    if (position < 0.80) return OrientationLabel.MODERATE_PROGRESSIVE;
    if (position < 0.90) return OrientationLabel.PROGRESSIVE;
    return OrientationLabel.STRONG_PROGRESSIVE;
  }

  private buildMoralProfile(scored: { question: Question, score: number }[]): MoralProfile {
    const avgFor = (mf: MoralFoundation): number => {
      const items = scored.filter(a => a.question.moralFoundation === mf);
      return items.length === 0 ? 0.5 : this.average(items.map(a => a.score));
    };

    return {
      carePosition: avgFor(MoralFoundation.CARE),
      fairnessPosition: avgFor(MoralFoundation.FAIRNESS),
      loyaltyPosition: avgFor(MoralFoundation.LOYALTY),
      authorityPosition: avgFor(MoralFoundation.AUTHORITY),
      purityPosition: avgFor(MoralFoundation.PURITY),
    };
  }

  private generateInsight(
    label: OrientationLabel,
    ecoPos: number,
    socPos: number,
    moral: MoralProfile
  ): string {
    let sb = "";

    // 전체 성향 설명 (도덕적 기반 이론 + 심리적 특성 연결)
    switch (label) {
      case OrientationLabel.STRONG_CONSERVATIVE:
      case OrientationLabel.CONSERVATIVE:
        sb += "당신은 전통과 질서, 안정을 깊이 중시하는 성향입니다. " +
          "도덕적 기반 이론에 따르면 '충성', '권위', '순수성'의 " +
          "가치가 강하게 작동합니다. 심리학 연구에서는 " +
          "성실성(Conscientiousness)이 높고, 불확실성보다 " +
          "안정을 선호하는 특성과 연결됩니다. " +
          "흥미롭게도 보수 성향일수록 평균 행복도가 " +
          "높다는 연구 결과도 있습니다.";
        break;
      case OrientationLabel.MODERATE_CONSERVATIVE:
      case OrientationLabel.LEAN_CONSERVATIVE:
        sb += "당신은 기존 체제의 안정성을 중시하면서도 " +
          "변화의 필요성을 일부 인정하는 균형잡힌 보수입니다. " +
          "'배려'와 '공정성' 가치도 어느 정도 중시하지만, " +
          "'충성'과 '권위' 가치가 의사결정에 더 큰 " +
          "영향을 미칩니다.";
        break;
      case OrientationLabel.CENTER_RIGHT:
      case OrientationLabel.CENTER_LEFT:
        sb += "당신은 특정 이념에 치우치지 않는 중도적 시각입니다. " +
          "이슈에 따라 유연하게 판단하며 실용적 성향이 강합니다. " +
          "도덕적 기반 5가지를 비교적 균형있게 활용하는 " +
          "특성을 보입니다.";
        break;
      case OrientationLabel.LEAN_PROGRESSIVE:
      case OrientationLabel.MODERATE_PROGRESSIVE:
        sb += "당신은 사회적 변화에 열린 자세를 보이면서도 " +
          "급진적 변화보다 점진적 개선을 선호합니다. " +
          "'배려'와 '공정성' 가치가 의사결정의 핵심이지만, " +
          "'권위'와 '충성' 가치도 완전히 무시하지 않습니다.";
        break;
      case OrientationLabel.PROGRESSIVE:
      case OrientationLabel.STRONG_PROGRESSIVE:
        sb += "당신은 새로운 경험에 대한 개방성(Openness)이 높으며 " +
          "사회적 불평등에 민감하게 반응합니다. " +
          "'피해/배려'와 '공정성/호혜성' 두 가치가 " +
          "도덕적 판단의 핵심 렌즈입니다. " +
          "연구에 따르면 이러한 성향은 사회 부조리에 " +
          "더 민감하기 때문에 상대적으로 더 많은 " +
          "스트레스를 느낄 수 있습니다.";
        break;
    }

    sb += "\n\n";

    // 경제 vs 사회 괴리 분석
    const gap = Math.abs(ecoPos - socPos);
    if (gap > 0.2) {
      if (ecoPos > socPos) {
        sb += "📌 경제적으로는 진보적이나 사회적으로는 보수적인 " +
          "독특한 조합입니다. 하버드 케네디 스쿨의 2차원 모델에서 " +
          "이를 명확히 구분합니다.";
      } else {
        sb += "📌 경제적으로는 보수적이나 사회적으로는 진보적인 " +
          "'리버테리언' 성향이 관찰됩니다. 개인의 자유를 " +
          "가장 중시하는 유형입니다.";
      }
    }

    return sb;
  }
}
