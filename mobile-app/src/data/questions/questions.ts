import { Question, QuestionCategory, PoliticalDimension, MoralFoundation, Polarity } from '../../domain/model/types';

export const QUESTIONS: Question[] = [
  {
    id: 1,
    text: "정부가 기업 활동을 더 강하게 규제해야 한다",
    category: QuestionCategory.ECONOMY,
    dimension: PoliticalDimension.ECONOMIC,
    moralFoundation: MoralFoundation.FAIRNESS,
    polarity: Polarity.YES_IS_PROGRESSIVE,
    contradictsWith: 14
  },
  {
    id: 2,
    text: "세금을 올려서라도 복지를 확대해야 한다",
    category: QuestionCategory.WELFARE,
    dimension: PoliticalDimension.ECONOMIC,
    moralFoundation: MoralFoundation.CARE,
    polarity: Polarity.YES_IS_PROGRESSIVE,
    contradictsWith: 14
  },
  {
    id: 3,
    text: "전통적 가족 가치를 법으로 보호해야 한다",
    category: QuestionCategory.TRADITION,
    dimension: PoliticalDimension.SOCIAL,
    moralFoundation: MoralFoundation.PURITY,
    polarity: Polarity.YES_IS_CONSERVATIVE,
    contradictsWith: 4
  },
  {
    id: 4,
    text: "소수자 인권 보호를 위해 차별금지법이 필요하다",
    category: QuestionCategory.RIGHTS,
    dimension: PoliticalDimension.SOCIAL,
    moralFoundation: MoralFoundation.FAIRNESS,
    polarity: Polarity.YES_IS_PROGRESSIVE,
    contradictsWith: 3
  },
  {
    id: 5,
    text: "국가 안보를 위해 개인의 자유가 일부 제한될 수 있다",
    category: QuestionCategory.SECURITY,
    dimension: PoliticalDimension.SOCIAL,
    moralFoundation: MoralFoundation.AUTHORITY,
    polarity: Polarity.YES_IS_CONSERVATIVE,
    contradictsWith: 20
  },
  {
    id: 6,
    text: "환경 보호를 위해 경제 성장이 다소 희생될 수 있다",
    category: QuestionCategory.ENVIRONMENT,
    dimension: PoliticalDimension.ECONOMIC,
    moralFoundation: MoralFoundation.CARE,
    polarity: Polarity.YES_IS_PROGRESSIVE
  },
  {
    id: 7,
    text: "범죄에 대한 처벌을 더 강화해야 한다",
    category: QuestionCategory.GOVERNANCE,
    dimension: PoliticalDimension.SOCIAL,
    moralFoundation: MoralFoundation.AUTHORITY,
    polarity: Polarity.YES_IS_CONSERVATIVE
  },
  {
    id: 8,
    text: "외국인 노동자의 유입을 더 엄격히 관리해야 한다",
    category: QuestionCategory.CULTURE,
    dimension: PoliticalDimension.SOCIAL,
    moralFoundation: MoralFoundation.LOYALTY,
    polarity: Polarity.YES_IS_CONSERVATIVE,
    contradictsWith: 15
  },
  {
    id: 9,
    text: "최저임금을 대폭 인상해야 한다",
    category: QuestionCategory.ECONOMY,
    dimension: PoliticalDimension.ECONOMIC,
    moralFoundation: MoralFoundation.FAIRNESS,
    polarity: Polarity.YES_IS_PROGRESSIVE
  },
  {
    id: 10,
    text: "종교적 가치가 법률 제정에 반영되어야 한다",
    category: QuestionCategory.TRADITION,
    dimension: PoliticalDimension.SOCIAL,
    moralFoundation: MoralFoundation.PURITY,
    polarity: Polarity.YES_IS_CONSERVATIVE,
    contradictsWith: 13
  },
  {
    id: 11,
    text: "대기업의 사회적 책임을 법으로 강제해야 한다",
    category: QuestionCategory.ECONOMY,
    dimension: PoliticalDimension.ECONOMIC,
    moralFoundation: MoralFoundation.FAIRNESS,
    polarity: Polarity.YES_IS_PROGRESSIVE
  },
  {
    id: 12,
    text: "군 복무는 국민의 신성한 의무이다",
    category: QuestionCategory.SECURITY,
    dimension: PoliticalDimension.SOCIAL,
    moralFoundation: MoralFoundation.LOYALTY,
    polarity: Polarity.YES_IS_CONSERVATIVE
  },
  {
    id: 13,
    text: "공교육에서 성평등 교육을 강화해야 한다",
    category: QuestionCategory.RIGHTS,
    dimension: PoliticalDimension.SOCIAL,
    moralFoundation: MoralFoundation.CARE,
    polarity: Polarity.YES_IS_PROGRESSIVE,
    contradictsWith: 10
  },
  {
    id: 14,
    text: "시장의 자유 경쟁이 최선의 경제 정책이다",
    category: QuestionCategory.ECONOMY,
    dimension: PoliticalDimension.ECONOMIC,
    moralFoundation: MoralFoundation.FAIRNESS,
    polarity: Polarity.YES_IS_CONSERVATIVE,
    contradictsWith: 1 // Q14 contradicts with Q1 and Q2, but we can only store one ID in the current interface. 
    // Actually, the interface says `contradictsWith?: number | null;`. 
    // I'll stick to the primary one or update the type if needed. 
    // Let's check the type again.
  },
  {
    id: 15,
    text: "역사적 과오에 대해 국가가 공식 사과해야 한다",
    category: QuestionCategory.CULTURE,
    dimension: PoliticalDimension.SOCIAL,
    moralFoundation: MoralFoundation.CARE,
    polarity: Polarity.YES_IS_PROGRESSIVE,
    contradictsWith: 8
  },
  {
    id: 16,
    text: "사형제도를 유지해야 한다",
    category: QuestionCategory.GOVERNANCE,
    dimension: PoliticalDimension.SOCIAL,
    moralFoundation: MoralFoundation.AUTHORITY,
    polarity: Polarity.YES_IS_CONSERVATIVE
  },
  {
    id: 17,
    text: "무상 의료·교육을 확대해야 한다",
    category: QuestionCategory.WELFARE,
    dimension: PoliticalDimension.ECONOMIC,
    moralFoundation: MoralFoundation.CARE,
    polarity: Polarity.YES_IS_PROGRESSIVE
  },
  {
    id: 18,
    text: "국기·국가에 대한 예의는 당연히 지켜야 한다",
    category: QuestionCategory.TRADITION,
    dimension: PoliticalDimension.SOCIAL,
    moralFoundation: MoralFoundation.LOYALTY,
    polarity: Polarity.YES_IS_CONSERVATIVE
  },
  {
    id: 19,
    text: "부유층에 대한 세금을 대폭 올려야 한다",
    category: QuestionCategory.ECONOMY,
    dimension: PoliticalDimension.ECONOMIC,
    moralFoundation: MoralFoundation.FAIRNESS,
    polarity: Polarity.YES_IS_PROGRESSIVE
  },
  {
    id: 20,
    text: "사회 질서를 위해 표현의 자유가 일부 제한될 수 있다",
    category: QuestionCategory.GOVERNANCE,
    dimension: PoliticalDimension.SOCIAL,
    moralFoundation: MoralFoundation.AUTHORITY,
    polarity: Polarity.YES_IS_CONSERVATIVE,
    contradictsWith: 5
  },
  // ═══ Q21~Q30: 유형별 균등 안배 확장 ═══
  {
    id: 21,
    text: "기본소득제를 도입해야 한다",
    category: QuestionCategory.WELFARE,
    dimension: PoliticalDimension.ECONOMIC,
    moralFoundation: MoralFoundation.CARE,
    polarity: Polarity.YES_IS_PROGRESSIVE
  },
  {
    id: 22,
    text: "공공 임대주택을 대폭 확대해야 한다",
    category: QuestionCategory.WELFARE,
    dimension: PoliticalDimension.ECONOMIC,
    moralFoundation: MoralFoundation.FAIRNESS,
    polarity: Polarity.YES_IS_PROGRESSIVE
  },
  {
    id: 23,
    text: "징병제보다 모병제로 전환해야 한다",
    category: QuestionCategory.SECURITY,
    dimension: PoliticalDimension.SOCIAL,
    moralFoundation: MoralFoundation.FAIRNESS,
    polarity: Polarity.YES_IS_PROGRESSIVE,
    contradictsWith: 12
  },
  {
    id: 24,
    text: "핵무장 독자 개발을 검토해야 한다",
    category: QuestionCategory.SECURITY,
    dimension: PoliticalDimension.SOCIAL,
    moralFoundation: MoralFoundation.AUTHORITY,
    polarity: Polarity.YES_IS_CONSERVATIVE
  },
  {
    id: 25,
    text: "다문화 가정을 위한 지원 정책을 확대해야 한다",
    category: QuestionCategory.CULTURE,
    dimension: PoliticalDimension.SOCIAL,
    moralFoundation: MoralFoundation.CARE,
    polarity: Polarity.YES_IS_PROGRESSIVE,
    contradictsWith: 26
  },
  {
    id: 26,
    text: "한국어 사용 의무화 등 문화 정체성 보호 정책이 필요하다",
    category: QuestionCategory.CULTURE,
    dimension: PoliticalDimension.SOCIAL,
    moralFoundation: MoralFoundation.LOYALTY,
    polarity: Polarity.YES_IS_CONSERVATIVE,
    contradictsWith: 25
  },
  {
    id: 27,
    text: "탄소세를 도입해야 한다",
    category: QuestionCategory.ENVIRONMENT,
    dimension: PoliticalDimension.ECONOMIC,
    moralFoundation: MoralFoundation.FAIRNESS,
    polarity: Polarity.YES_IS_PROGRESSIVE
  },
  {
    id: 28,
    text: "원자력 발전을 확대해야 한다",
    category: QuestionCategory.ENVIRONMENT,
    dimension: PoliticalDimension.ECONOMIC,
    moralFoundation: MoralFoundation.AUTHORITY,
    polarity: Polarity.YES_IS_CONSERVATIVE,
    contradictsWith: 6
  },
  {
    id: 29,
    text: "일회용품 사용을 법으로 금지해야 한다",
    category: QuestionCategory.ENVIRONMENT,
    dimension: PoliticalDimension.ECONOMIC,
    moralFoundation: MoralFoundation.CARE,
    polarity: Polarity.YES_IS_PROGRESSIVE
  },
  {
    id: 30,
    text: "난민 수용을 확대해야 한다",
    category: QuestionCategory.RIGHTS,
    dimension: PoliticalDimension.SOCIAL,
    moralFoundation: MoralFoundation.CARE,
    polarity: Polarity.YES_IS_PROGRESSIVE
  }
];
