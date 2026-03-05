import { DiagnosisResult, FigureMatch, MoralFoundation, HistoricalFigure, MoralProfile } from '../model/types';

const HISTORICAL_FIGURES: HistoricalFigure[] = [
  {
    id: 1,
    name: "Abraham Lincoln",
    nameKorean: "링컨",
    era: "19C",
    country: "미국",
    flagEmoji: "🇺🇸",
    imageRes: "https://picsum.photos/seed/lincoln/200/200",
    economicPosition: 0.55,
    socialPosition: 0.70,
    dominantMoral: [MoralFoundation.FAIRNESS, MoralFoundation.CARE],
    shortDescription: "노예 해방과 연방 유지를 이끈 미국의 제16대 대통령",
    famousQuote: "국민의, 국민에 의한, 국민을 위한 정부는 지상에서 사라지지 않을 것입니다."
  },
  {
    id: 2,
    name: "Winston Churchill",
    nameKorean: "처칠",
    era: "20C",
    country: "영국",
    flagEmoji: "🇬🇧",
    imageRes: "https://picsum.photos/seed/churchill/200/200",
    economicPosition: 0.35,
    socialPosition: 0.30,
    dominantMoral: [MoralFoundation.LOYALTY, MoralFoundation.AUTHORITY],
    shortDescription: "제2차 세계대전을 승리로 이끈 영국의 수상",
    famousQuote: "결코 굴복하지 마십시오. 결코, 결코, 결코!"
  },
  {
    id: 3,
    name: "Mahatma Gandhi",
    nameKorean: "간디",
    era: "20C",
    country: "인도",
    flagEmoji: "🇮🇳",
    imageRes: "https://picsum.photos/seed/gandhi/200/200",
    economicPosition: 0.65,
    socialPosition: 0.85,
    dominantMoral: [MoralFoundation.CARE, MoralFoundation.FAIRNESS],
    shortDescription: "비폭력 불복종 운동을 이끈 인도의 독립 운동가",
    famousQuote: "세상에서 보고 싶은 변화가 있다면 스스로 그 변화가 되어야 합니다."
  },
  {
    id: 4,
    name: "Margaret Thatcher",
    nameKorean: "마거릿 대처",
    era: "20C",
    country: "영국",
    flagEmoji: "🇬🇧",
    imageRes: "https://picsum.photos/seed/thatcher/200/200",
    economicPosition: 0.15,
    socialPosition: 0.25,
    dominantMoral: [MoralFoundation.AUTHORITY, MoralFoundation.LOYALTY],
    shortDescription: "영국의 첫 여성 총리, '철의 여인'",
    famousQuote: "사회라는 것은 없습니다. 개별 남성과 여성, 그리고 가족이 있을 뿐입니다."
  },
  {
    id: 5,
    name: "Nelson Mandela",
    nameKorean: "넬슨 만델라",
    era: "20C",
    country: "남아공",
    flagEmoji: "🇿🇦",
    imageRes: "https://picsum.photos/seed/mandela/200/200",
    economicPosition: 0.70,
    socialPosition: 0.90,
    dominantMoral: [MoralFoundation.CARE, MoralFoundation.FAIRNESS],
    shortDescription: "아파르트헤이트 철폐를 이끈 남아공의 첫 흑인 대통령",
    famousQuote: "가장 큰 영광은 한 번도 넘어지지 않는 것이 아니라, 넘어질 때마다 다시 일어나는 데 있습니다."
  },
  {
    id: 6,
    name: "Kim Dae-jung",
    nameKorean: "김대중",
    era: "20C",
    country: "한국",
    flagEmoji: "🇰🇷",
    imageRes: "https://picsum.photos/seed/kdj/200/200",
    economicPosition: 0.65,
    socialPosition: 0.80,
    dominantMoral: [MoralFoundation.CARE, MoralFoundation.FAIRNESS],
    shortDescription: "민주화 운동가이자 대한민국의 제15대 대통령",
    famousQuote: "행동하지 않는 양심은 악의 편입니다."
  },
  {
    id: 7,
    name: "Park Chung-hee",
    nameKorean: "박정희",
    era: "20C",
    country: "한국",
    flagEmoji: "🇰🇷",
    imageRes: "https://picsum.photos/seed/pjh/200/200",
    economicPosition: 0.30,
    socialPosition: 0.15,
    dominantMoral: [MoralFoundation.AUTHORITY, MoralFoundation.LOYALTY],
    shortDescription: "경제 개발을 이끈 대한민국의 제5~9대 대통령",
    famousQuote: "우리 세대가 조금 더 고생해서 후손들에게 잘 사는 나라를 물려줍시다."
  },
  {
    id: 8,
    name: "King Sejong",
    nameKorean: "세종대왕",
    era: "15C",
    country: "한국",
    flagEmoji: "🇰🇷",
    imageRes: "https://picsum.photos/seed/sejong/200/200",
    economicPosition: 0.55,
    socialPosition: 0.60,
    dominantMoral: [MoralFoundation.CARE, MoralFoundation.AUTHORITY],
    shortDescription: "한글을 창제한 조선의 제4대 국왕",
    famousQuote: "백성이 나를 비판한다면, 그것은 내가 정치를 잘못하고 있다는 증거다."
  },
  {
    id: 9,
    name: "Angela Merkel",
    nameKorean: "메르켈",
    era: "21C",
    country: "독일",
    flagEmoji: "🇩🇪",
    imageRes: "https://picsum.photos/seed/merkel/200/200",
    economicPosition: 0.45,
    socialPosition: 0.55,
    dominantMoral: [MoralFoundation.CARE, MoralFoundation.FAIRNESS, MoralFoundation.AUTHORITY],
    shortDescription: "독일의 첫 여성 총리, '무티(엄마)'",
    famousQuote: "우리는 할 수 있습니다(Wir schaffen das)."
  },
  {
    id: 10,
    name: "Barack Obama",
    nameKorean: "오바마",
    era: "21C",
    country: "미국",
    flagEmoji: "🇺🇸",
    imageRes: "https://picsum.photos/seed/obama/200/200",
    economicPosition: 0.60,
    socialPosition: 0.65,
    dominantMoral: [MoralFoundation.CARE, MoralFoundation.FAIRNESS],
    shortDescription: "미국의 첫 흑인 대통령",
    famousQuote: "우리는 할 수 있습니다(Yes We Can)."
  },
  {
    id: 11,
    name: "Ronald Reagan",
    nameKorean: "레이건",
    era: "20C",
    country: "미국",
    flagEmoji: "🇺🇸",
    imageRes: "https://picsum.photos/seed/reagan/200/200",
    economicPosition: 0.15,
    socialPosition: 0.30,
    dominantMoral: [MoralFoundation.LOYALTY, MoralFoundation.AUTHORITY],
    shortDescription: "신자유주의 경제 정책을 이끈 미국의 제40대 대통령",
    famousQuote: "정부는 문제의 해결책이 아닙니다. 정부가 바로 문제입니다."
  },
  {
    id: 12,
    name: "Yi Sun-sin",
    nameKorean: "이순신",
    era: "16C",
    country: "한국",
    flagEmoji: "🇰🇷",
    imageRes: "https://picsum.photos/seed/yisunsin/200/200",
    economicPosition: 0.50,
    socialPosition: 0.35,
    dominantMoral: [MoralFoundation.LOYALTY, MoralFoundation.AUTHORITY, MoralFoundation.CARE],
    shortDescription: "임진왜란을 승리로 이끈 조선의 명장",
    famousQuote: "신에게는 아직 12척의 배가 남아있사옵니다."
  },
  {
    id: 13,
    name: "Martin Luther King Jr.",
    nameKorean: "마틴루터킹",
    era: "20C",
    country: "미국",
    flagEmoji: "🇺🇸",
    imageRes: "https://picsum.photos/seed/mlk/200/200",
    economicPosition: 0.70,
    socialPosition: 0.95,
    dominantMoral: [MoralFoundation.CARE, MoralFoundation.FAIRNESS],
    shortDescription: "미국의 흑인 민권 운동가",
    famousQuote: "나에게는 꿈이 있습니다."
  },
  {
    id: 14,
    name: "Ahn Chang-ho",
    nameKorean: "안창호",
    era: "20C",
    country: "한국",
    flagEmoji: "🇰🇷",
    imageRes: "https://picsum.photos/seed/dosan/200/200",
    economicPosition: 0.60,
    socialPosition: 0.70,
    dominantMoral: [MoralFoundation.CARE, MoralFoundation.LOYALTY],
    shortDescription: "독립운동가이자 교육자, 도산 안창호",
    famousQuote: "진실은 반드시 따르는 자가 있고, 정의는 반드시 이루는 날이 있다."
  },
  {
    id: 15,
    name: "Otto von Bismarck",
    nameKorean: "비스마르크",
    era: "19C",
    country: "독일",
    flagEmoji: "🇩🇪",
    imageRes: "https://picsum.photos/seed/bismarck/200/200",
    economicPosition: 0.25,
    socialPosition: 0.20,
    dominantMoral: [MoralFoundation.AUTHORITY, MoralFoundation.LOYALTY],
    shortDescription: "독일 제국을 통일한 '철혈 재상'",
    famousQuote: "오늘날의 큰 문제들은 연설이나 다수결이 아니라 철과 혈에 의해 결정될 것입니다."
  }
];

export class FigureMatcher {
  match(result: DiagnosisResult): FigureMatch[] {
    const scored = HISTORICAL_FIGURES.map(figure => {
      // 2차원 거리 계산 (경제+사회)
      const posDistance = Math.sqrt(
        Math.pow(figure.economicPosition - result.economicPosition, 2) +
        Math.pow(figure.socialPosition - result.socialPosition, 2)
      );

      // 도덕적 기반 유사도
      const moralSimilarity = this.calculateMoralSimilarity(
        result.moralProfile,
        figure.dominantMoral
      );

      // 종합 점수 (거리가 작을수록 + 도덕 유사도 높을수록)
      const matchScore = (1.0 - posDistance) * 0.6 + moralSimilarity * 0.4;

      // 공통점 추출
      const traits: string[] = [];
      if (Math.abs(figure.economicPosition - result.economicPosition) < 0.15) {
        traits.push("경제적 시각이 유사");
      }
      if (Math.abs(figure.socialPosition - result.socialPosition) < 0.15) {
        traits.push("사회적 가치관이 유사");
      }

      const userTopMorals = this.getUserTopMorals(result.moralProfile);
      const sharedMorals = figure.dominantMoral.filter(m => userTopMorals.includes(m));
      sharedMorals.forEach(m => {
        traits.push(`'${this.moralDisplayName(m)}' 가치 공유`);
      });

      return { figure, matchScore, traits };
    });

    return scored
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 3)
      .map((item, index) => ({
        figure: item.figure,
        matchRank: index + 1,
        commonTraits: item.traits,
        matchReason: this.generateMatchReason(item.figure, index + 1)
      }));
  }

  private calculateMoralSimilarity(
    profile: MoralProfile,
    figureMorals: MoralFoundation[]
  ): number {
    const userScores = [
      { mf: MoralFoundation.CARE, score: profile.carePosition },
      { mf: MoralFoundation.FAIRNESS, score: profile.fairnessPosition },
      { mf: MoralFoundation.LOYALTY, score: 1.0 - profile.loyaltyPosition },
      { mf: MoralFoundation.AUTHORITY, score: 1.0 - profile.authorityPosition },
      { mf: MoralFoundation.PURITY, score: 1.0 - profile.purityPosition }
    ];

    const topUserMorals = userScores
      .sort((a, b) => b.score - a.score)
      .slice(0, 2)
      .map(it => it.mf);

    const overlap = topUserMorals.filter(m => figureMorals.includes(m)).length;
    return overlap / 2.0;
  }

  private getUserTopMorals(profile: MoralProfile): MoralFoundation[] {
    const userScores = [
      { mf: MoralFoundation.CARE, score: profile.carePosition },
      { mf: MoralFoundation.FAIRNESS, score: profile.fairnessPosition },
      { mf: MoralFoundation.LOYALTY, score: 1.0 - profile.loyaltyPosition },
      { mf: MoralFoundation.AUTHORITY, score: 1.0 - profile.authorityPosition },
      { mf: MoralFoundation.PURITY, score: 1.0 - profile.purityPosition }
    ];

    return userScores
      .sort((a, b) => b.score - a.score)
      .slice(0, 2)
      .map(it => it.mf);
  }

  private moralDisplayName(mf: MoralFoundation): string {
    switch (mf) {
      case MoralFoundation.CARE: return "배려";
      case MoralFoundation.FAIRNESS: return "공정성";
      case MoralFoundation.LOYALTY: return "충성";
      case MoralFoundation.AUTHORITY: return "권위";
      case MoralFoundation.PURITY: return "순수성";
      default: return "";
    }
  }

  private generateMatchReason(figure: HistoricalFigure, rank: number): string {
    switch (rank) {
      case 1:
        return `${figure.nameKorean}은(는) ${figure.shortDescription}. 당신과 가장 유사한 가치관과 정치적 스펙트럼을 공유합니다.`;
      case 2:
        return `2순위로 ${figure.nameKorean}과(와) 유사합니다. ${figure.era} ${figure.country}의 ${figure.shortDescription}.`;
      default:
        return `${figure.nameKorean} — ${figure.shortDescription}.`;
    }
  }
}
