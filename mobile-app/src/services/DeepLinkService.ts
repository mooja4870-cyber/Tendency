import { DiagnosisResult, CategoryResult, MoralProfile, QuestionCategory, BiasLevel } from '../domain/model/types';
import { ScoringEngine } from '../domain/scoring/engine';

export class DeepLinkService {
  /**
   * 결과를 짧은 코드로 인코딩
   * 각 위치값을 0~9 정수로 변환하여 연결
   */
  static encodeResult(result: DiagnosisResult): string {
    const toDigit = (pos: number) => Math.min(9, Math.max(0, Math.floor(pos * 9)));
    
    const overall = toDigit(result.overallPosition);
    const economic = toDigit(result.economicPosition);
    const social = toDigit(result.socialPosition);
    
    const categories = result.categoryResults
      .map(cat => toDigit(cat.position))
      .join('');
    
    const moral = [
      result.moralProfile.carePosition,
      result.moralProfile.fairnessPosition,
      result.moralProfile.loyaltyPosition,
      result.moralProfile.authorityPosition,
      result.moralProfile.purityPosition
    ].map(toDigit).join('');
    
    return `${overall}${economic}${social}-${categories}-${moral}`;
  }

  /**
   * 인코딩된 코드를 결과 객체로 복원
   */
  static decodeResult(code: string): DiagnosisResult {
    const scoringEngine = new ScoringEngine();
    const fromDigit = (digit: string) => (parseInt(digit, 10) || 0) / 9;

    const parts = code.split('-');
    const main = parts[0] || '555';
    const cats = parts[1] || '';
    const morals = parts[2] || '55555';

    const overall = fromDigit(main[0]);
    const economic = fromDigit(main[1]);
    const social = fromDigit(main[2]);

    const categories = Object.values(QuestionCategory).map((cat, i) => {
      const pos = i < cats.length ? fromDigit(cats[i]) : 0.5;
      return {
        category: cat,
        position: pos,
        label: scoringEngine.getLabel(pos)
      } as CategoryResult;
    });

    return {
      overallPosition: overall,
      economicPosition: economic,
      socialPosition: social,
      overallLabel: scoringEngine.getLabel(overall),
      categoryResults: categories,
      moralProfile: {
        carePosition: fromDigit(morals[0]),
        fairnessPosition: fromDigit(morals[1]),
        loyaltyPosition: fromDigit(morals[2]),
        authorityPosition: fromDigit(morals[3]),
        purityPosition: fromDigit(morals[4])
      } as MoralProfile,
      biasReport: { detectedBiases: [], consistencyScore: 1, overallBiasLevel: BiasLevel.MINIMAL },
      empathyScenarios: [],
      countryMatches: [],
      figureMatches: [],
      personalityInsight: ""
    };
  }

  /**
   * 초대 링크 생성
   */
  static generateInviteLink(result: DiagnosisResult): string {
    const code = this.encodeResult(result);
    const url = new URL(window.location.origin);
    url.searchParams.set('invite', code);
    return url.toString();
  }
}
