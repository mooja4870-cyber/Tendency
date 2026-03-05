import { 
  DiagnosisResult, 
  CompatibilityResult, 
  CompatibilityLevel, 
  GapLevel, 
  CategoryComparison, 
  RelationshipAdvice, 
  QuestionCategory 
} from '../model/types';

export class CompatibilityEngine {
  compare(myResult: DiagnosisResult, partnerResult: DiagnosisResult): CompatibilityResult {
    // 항목별 비교
    const comparisons: CategoryComparison[] = myResult.categoryResults.map(myCat => {
      const partnerCat = partnerResult.categoryResults.find(c => c.category === myCat.category);
      const partnerPosition = partnerCat ? partnerCat.position : 0.5;
      
      const gap = Math.abs(myCat.position - partnerPosition);
      
      return {
        category: myCat.category,
        myPosition: myCat.position,
        partnerPosition: partnerPosition,
        gapLevel: gap < 0.2 ? GapLevel.SIMILAR : (gap < 0.4 ? GapLevel.MODERATE : GapLevel.LARGE)
      };
    });

    // 전체 궁합 레벨
    const overallGap = Math.abs(myResult.overallPosition - partnerResult.overallPosition);
    let level = CompatibilityLevel.OPPOSITE;
    if (overallGap < 0.1) level = CompatibilityLevel.SOULMATE;
    else if (overallGap < 0.2) level = CompatibilityLevel.HARMONIOUS;
    else if (overallGap < 0.35) level = CompatibilityLevel.COMPLEMENTARY;
    else if (overallGap < 0.5) level = CompatibilityLevel.CHALLENGING;

    // 공통 가치
    const shared: string[] = [];
    if (Math.abs(myResult.moralProfile.carePosition - partnerResult.moralProfile.carePosition) < 0.2) {
      shared.push("배려 가치를 비슷하게 중시합니다");
    }
    if (Math.abs(myResult.moralProfile.fairnessPosition - partnerResult.moralProfile.fairnessPosition) < 0.2) {
      shared.push("공정성에 대한 감각이 유사합니다");
    }

    // 갈등 영역
    const conflicts = comparisons
      .filter(c => c.gapLevel === GapLevel.LARGE)
      .map(c => this.categoryDisplayName(c.category));

    // 대화 조언
    const advice = this.generateAdvice(comparisons, level);

    return {
      myResult,
      partnerResult,
      overallCompatibility: level,
      categoryComparisons: comparisons,
      adviceList: advice,
      sharedValues: shared,
      conflictAreas: conflicts
    };
  }

  private generateAdvice(comparisons: CategoryComparison[], level: CompatibilityLevel): RelationshipAdvice[] {
    const advice: RelationshipAdvice[] = [];

    comparisons.filter(c => c.gapLevel === GapLevel.LARGE).forEach(comp => {
      advice.push({
        area: this.categoryDisplayName(comp.category),
        advice: this.getAdviceForCategory(comp.category)
      });
    });

    if (level === CompatibilityLevel.SOULMATE) {
      advice.unshift({
        area: "전체",
        advice: "정치적 소울메이트! 하지만 같은 생각만 하면 함께 편향에 빠질 수 있어요. 가끔은 일부러 반대 의견을 나눠보는 것도 좋습니다."
      });
    }

    return advice;
  }

  private getAdviceForCategory(cat: QuestionCategory): string {
    switch (cat) {
      case QuestionCategory.SECURITY:
        return "안보 이슈를 대화할 때는 서로의 '두려움'이 무엇인지 먼저 물어보세요. 결론이 달라도 걱정의 뿌리는 같을 수 있습니다.";
      case QuestionCategory.ECONOMY:
        return "경제 문제에서 의견이 다를 때, '누구를 위한 정책인가'를 서로 말해보면 접점을 찾기 쉽습니다.";
      case QuestionCategory.TRADITION:
        return "전통·가치관 차이는 성장 배경의 차이입니다. 옳고 그름이 아닌, 서로의 경험을 이해하는 대화가 필요합니다.";
      default:
        return "이 영역에서 의견이 다를 때는, '왜 그렇게 생각해?'라고 호기심을 가지고 물어보세요.";
    }
  }

  private categoryDisplayName(cat: QuestionCategory): string {
    switch (cat) {
      case QuestionCategory.ECONOMY: return "💰 경제";
      case QuestionCategory.WELFARE: return "🏥 복지";
      case QuestionCategory.SECURITY: return "🛡️ 안보";
      case QuestionCategory.CULTURE: return "🌍 문화";
      case QuestionCategory.ENVIRONMENT: return "🌿 환경";
      case QuestionCategory.RIGHTS: return "⚖️ 인권";
      case QuestionCategory.TRADITION: return "🏛️ 전통";
      case QuestionCategory.GOVERNANCE: return "🏢 정부역할";
      default: return cat;
    }
  }
}
