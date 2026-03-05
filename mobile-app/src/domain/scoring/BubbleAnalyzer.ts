import { BubbleReport, DiversityLevel, MediaType, MediaSource } from '../model/types';

const MEDIA_SOURCES: MediaSource[] = [
  { id: 1, name: "조선일보", type: MediaType.NEWSPAPER, orientation: 0.20, logoEmoji: "📰" },
  { id: 2, name: "중앙일보", type: MediaType.NEWSPAPER, orientation: 0.30, logoEmoji: "📰" },
  { id: 3, name: "동아일보", type: MediaType.NEWSPAPER, orientation: 0.25, logoEmoji: "📰" },
  { id: 4, name: "한겨레", type: MediaType.NEWSPAPER, orientation: 0.80, logoEmoji: "📰" },
  { id: 5, name: "경향신문", type: MediaType.NEWSPAPER, orientation: 0.75, logoEmoji: "📰" },
  { id: 6, name: "한국일보", type: MediaType.NEWSPAPER, orientation: 0.55, logoEmoji: "📰" },
  { id: 7, name: "KBS", type: MediaType.TV, orientation: 0.50, logoEmoji: "📺" },
  { id: 8, name: "MBC", type: MediaType.TV, orientation: 0.60, logoEmoji: "📺" },
  { id: 9, name: "SBS", type: MediaType.TV, orientation: 0.50, logoEmoji: "📺" },
  { id: 10, name: "JTBC", type: MediaType.TV, orientation: 0.60, logoEmoji: "📺" },
  { id: 11, name: "TV조선", type: MediaType.TV, orientation: 0.20, logoEmoji: "📺" },
  { id: 12, name: "채널A", type: MediaType.TV, orientation: 0.25, logoEmoji: "📺" },
  { id: 13, name: "MBN", type: MediaType.TV, orientation: 0.30, logoEmoji: "📺" },
  { id: 14, name: "오마이뉴스", type: MediaType.ONLINE, orientation: 0.85, logoEmoji: "🌐" },
  { id: 15, name: "프레시안", type: MediaType.ONLINE, orientation: 0.85, logoEmoji: "🌐" },
  { id: 16, name: "펜앤마이크", type: MediaType.ONLINE, orientation: 0.10, logoEmoji: "🌐" },
  { id: 17, name: "뉴데일리", type: MediaType.ONLINE, orientation: 0.15, logoEmoji: "🌐" }
];

export class BubbleAnalyzer {
  analyze(selectedIds: number[]): BubbleReport {
    const selectedMedia = MEDIA_SOURCES.filter(m => selectedIds.includes(m.id));
    
    if (selectedMedia.length === 0) {
      return this.getEmptyReport();
    }

    const avgOrientation = selectedMedia.reduce((acc, m) => acc + m.orientation, 0) / selectedMedia.length;
    const progressiveCount = selectedMedia.filter(m => m.orientation > 0.6).length;
    const conservativeCount = selectedMedia.filter(m => m.orientation < 0.4).length;
    const totalCount = selectedMedia.length;

    const progressiveRatio = progressiveCount / totalCount;
    const conservativeRatio = conservativeCount / totalCount;

    // 다양성 지수: 표준편차 기반
    const variance = selectedMedia.reduce((acc, m) => {
      const diff = m.orientation - avgOrientation;
      return acc + (diff * diff);
    }, 0) / selectedMedia.length;
    const stdDev = Math.sqrt(variance);

    // 표준편차가 클수록 다양, 작을수록 편향
    let diversityLevel = DiversityLevel.BALANCED;
    if (stdDev > 0.25) diversityLevel = DiversityLevel.VERY_DIVERSE;
    else if (stdDev > 0.18) diversityLevel = DiversityLevel.SOMEWHAT_DIVERSE;
    else if (stdDev > 0.12) diversityLevel = DiversityLevel.BALANCED;
    else if (stdDev > 0.06) diversityLevel = DiversityLevel.SOMEWHAT_BIASED;
    else diversityLevel = DiversityLevel.VERY_BIASED;

    const biasDirection = avgOrientation > 0.6 
      ? "진보 매체에 편중되어 있습니다" 
      : (avgOrientation < 0.4 ? "보수 매체에 편중되어 있습니다" : "비교적 균형 잡힌 매체를 소비하고 있습니다");

    // 처방전
    let prescription = "";
    if (diversityLevel === DiversityLevel.VERY_BIASED || diversityLevel === DiversityLevel.SOMEWHAT_BIASED) {
      const opposite = avgOrientation > 0.5 ? "보수" : "진보";
      prescription = `반대 성향(${opposite}) 매체 1~2개를 추가로 구독해 보세요. 동의할 필요는 없지만, 왜 그렇게 생각하는지 이해하면 당신의 판단력이 더 강해집니다.`;
    } else if (diversityLevel === DiversityLevel.BALANCED) {
      prescription = "균형 잡힌 미디어 소비를 하고 계십니다! 다양한 시각을 접하는 것은 건강한 민주주의의 기본입니다.";
    } else {
      prescription = "매우 다양한 매체를 소비하고 계십니다. 다만, 정보 과부하에 주의하세요.";
    }

    // 추천 매체: 현재 편향과 반대되는 매체 추천
    const recommendedMedia = MEDIA_SOURCES
      .filter(m => !selectedIds.includes(m.id) && Math.abs(m.orientation - avgOrientation) > 0.3)
      .slice(0, 3);

    return {
      selectedMedia,
      diversityPosition: stdDev,
      diversityLevel,
      biasDirection,
      progressiveRatio,
      conservativeRatio,
      prescription,
      recommendedMedia
    };
  }

  private getEmptyReport(): BubbleReport {
    return {
      selectedMedia: [],
      diversityPosition: 0.5,
      diversityLevel: DiversityLevel.BALANCED,
      biasDirection: "데이터 없음",
      progressiveRatio: 0,
      conservativeRatio: 0,
      prescription: "매체를 선택하여 필터 버블을 진단해보세요.",
      recommendedMedia: []
    };
  }

  getAllMedia(): MediaSource[] {
    return MEDIA_SOURCES;
  }
}
