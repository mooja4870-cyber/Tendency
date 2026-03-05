export enum QuestionCategory {
  ECONOMY = 'ECONOMY',
  WELFARE = 'WELFARE',
  SECURITY = 'SECURITY',
  CULTURE = 'CULTURE',
  ENVIRONMENT = 'ENVIRONMENT',
  RIGHTS = 'RIGHTS',
  TRADITION = 'TRADITION',
  GOVERNANCE = 'GOVERNANCE'
}

export enum PoliticalDimension {
  ECONOMIC = 'ECONOMIC',
  SOCIAL = 'SOCIAL'
}

export enum MoralFoundation {
  CARE = 'CARE',
  FAIRNESS = 'FAIRNESS',
  LOYALTY = 'LOYALTY',
  AUTHORITY = 'AUTHORITY',
  PURITY = 'PURITY'
}

export enum Polarity {
  YES_IS_PROGRESSIVE = 'YES_IS_PROGRESSIVE',
  YES_IS_CONSERVATIVE = 'YES_IS_CONSERVATIVE'
}

export enum AnswerChoice {
  YES = 1.0,
  UNSURE = 0.5,
  NO = 0.0
}

export enum OrientationLabel {
  STRONG_CONSERVATIVE = "강한 보수",
  CONSERVATIVE = "보수",
  MODERATE_CONSERVATIVE = "온건 보수",
  LEAN_CONSERVATIVE = "보수 기울임",
  CENTER_RIGHT = "중도 우파",
  CENTER_LEFT = "중도 좌파",
  LEAN_PROGRESSIVE = "진보 기울임",
  MODERATE_PROGRESSIVE = "온건 진보",
  PROGRESSIVE = "진보",
  STRONG_PROGRESSIVE = "강한 진보"
}

export interface Question {
  id: number;
  text: string;
  category: QuestionCategory;
  dimension: PoliticalDimension;
  moralFoundation: MoralFoundation | null;
  polarity: Polarity;
  contradictsWith?: number | null; // ← 모순 감지용 (인지편향)
}

export interface UserAnswer {
  questionId: number;
  choice: AnswerChoice;
  timestamp: number;
  responseTimeMs: number; // ← 응답 시간도 편향 분석에 활용
}

export interface CategoryResult {
  category: QuestionCategory;
  position: number; // 0.0 to 1.0
  label: OrientationLabel;
}

export interface MoralProfile {
  carePosition: number;
  fairnessPosition: number;
  loyaltyPosition: number;
  authorityPosition: number;
  purityPosition: number;
}

export interface DiagnosisResult {
  // 기본 성향
  overallPosition: number; // 0.0 (Conservative) to 1.0 (Progressive)
  economicPosition: number;
  socialPosition: number;
  overallLabel: OrientationLabel;
  categoryResults: CategoryResult[];
  moralProfile: MoralProfile;

  // 기능1: 인지 편향
  biasReport: BiasReport;

  // 기능2: 반대편의 눈
  empathyScenarios: EmpathyScenario[];

  // 기능3: 시대·국가 매칭
  countryMatches: CountryMatch[];

  // 기능7: 역사 인물 매칭
  figureMatches: FigureMatch[];

  // 맞춤형 피드백
  personalityInsight: string;
}

// ═══════════════════════════════════════════════════
// 3. 기능1: 인지 편향 거울
// ═══════════════════════════════════════════════════

export enum BiasType {
  CONFIRMATION = "확증 편향",
  STATUS_QUO = "현상 유지 편향",
  AFFECT_HEURISTIC = "감정 휴리스틱",
  ANCHORING = "정박 효과",
  BANDWAGON = "편승 효과",
  DUNNING_KRUGER = "더닝-크루거 효과",
  IN_GROUP = "내집단 편향",
  AVAILABILITY = "가용성 편향",
  FRAMING = "프레이밍 효과",
  BLIND_SPOT = "편향 사각지대"
}

export enum BiasSeverity {
  LOW = "LOW",
  MODERATE = "MODERATE",
  HIGH = "HIGH"
}

export enum BiasLevel {
  MINIMAL = "MINIMAL",
  MODERATE = "MODERATE",
  SIGNIFICANT = "SIGNIFICANT"
}

export interface DetectedBias {
  biasType: BiasType;
  title: string;
  description: string;
  evidence: string; // "Q3과 Q15의 답변이 모순됩니다"
  quote: string; // "우리는 보고 싶은 것만 본다"
  severity: BiasSeverity;
}

export interface BiasReport {
  detectedBiases: DetectedBias[];
  consistencyScore: number; // 내부용 (표시 안함)
  overallBiasLevel: BiasLevel;
}

// ═══════════════════════════════════════════════════
// 4. 기능2: 반대편의 눈
// ═══════════════════════════════════════════════════

export interface PerspectiveView {
  orientationLabel: string; // "진보 시각" / "보수 시각"
  emoji: string;
  reaction: string;
  reasoning: string;
  coreValue: string; // 이 시각의 핵심 가치
}

export interface EmpathyScenario {
  id: number;
  newsHeadline: string;
  newsDescription: string;
  userPerspective: PerspectiveView; // 사용자 성향의 시각
  oppositePerspective: PerspectiveView; // 반대 성향의 시각
  insight: string; // 핵심 통찰
}

// ═══════════════════════════════════════════════════
// 5. 기능3: 시대·국가 매칭
// ═══════════════════════════════════════════════════

export interface CountryMatch {
  countryCode: string; // "KR", "US", "SE", "JP"
  countryName: string;
  flagEmoji: string;
  era: string; // "현재" 또는 "1980년대"
  equivalentLabel: string; // 해당 국가에서의 성향 라벨
  surprise: string; // 의외성 메시지
  explanation: string;
}

export interface CountrySpectrum {
  countryCode: string;
  overtonWindowStart: number; // 그 나라 정치의 좌측 끝
  overtonWindowEnd: number; // 그 나라 정치의 우측 끝
  centerPosition: number; // 그 나라의 중도 기준
}

// ═══════════════════════════════════════════════════
// 6. 기능4: 관계 궁합
// ═══════════════════════════════════════════════════

export enum GapLevel {
  SIMILAR = "비교적 유사",
  MODERATE = "약간의 차이",
  LARGE = "큰 차이"
}

export enum CompatibilityLevel {
  SOULMATE = "정치적 소울메이트",
  HARMONIOUS = "조화로운 관계",
  COMPLEMENTARY = "보완적 관계",
  CHALLENGING = "도전적 관계",
  OPPOSITE = "극과 극"
}

export interface CategoryComparison {
  category: QuestionCategory;
  myPosition: number;
  partnerPosition: number;
  gapLevel: GapLevel;
}

export interface RelationshipAdvice {
  area: string;
  advice: string;
}

export interface CompatibilityResult {
  myResult: DiagnosisResult;
  partnerResult: DiagnosisResult;
  overallCompatibility: CompatibilityLevel;
  categoryComparisons: CategoryComparison[];
  adviceList: RelationshipAdvice[];
  sharedValues: string[];
  conflictAreas: string[];
}

// ═══════════════════════════════════════════════════
// 7. 기능5: 필터 버블 진단
// ═══════════════════════════════════════════════════

export enum MediaType {
  TV = "TV",
  NEWSPAPER = "NEWSPAPER",
  ONLINE = "ONLINE",
  YOUTUBE = "YOUTUBE",
  PODCAST = "PODCAST"
}

export enum DiversityLevel {
  VERY_BIASED = "매우 편향",
  SOMEWHAT_BIASED = "약간 편향",
  BALANCED = "균형 잡힘",
  SOMEWHAT_DIVERSE = "약간 다양",
  VERY_DIVERSE = "매우 다양"
}

export interface MediaSource {
  id: number;
  name: string;
  type: MediaType;
  orientation: number; // 0.0(보수) ~ 1.0(진보)
  logoEmoji: string;
}

export interface BubbleReport {
  selectedMedia: MediaSource[];
  diversityPosition: number; // 내부용 (표시 안함)
  diversityLevel: DiversityLevel;
  biasDirection: string; // "진보 매체 편중" 등
  progressiveRatio: number;
  conservativeRatio: number;
  prescription: string;
  recommendedMedia: MediaSource[];
}

// ═══════════════════════════════════════════════════
// 8. 기능6: 주간 토론 카드
// ═══════════════════════════════════════════════════

export enum DebateChoice {
  AGREE = "AGREE",
  UNSURE = "UNSURE",
  DISAGREE = "DISAGREE"
}

export interface DebateTopic {
  id: number;
  weekNumber: number;
  title: string;
  description: string;
  proArguments: string[];
  conArguments: string[];
  relatedCategory: QuestionCategory;
  isActive: boolean;
}

export interface DebateVote {
  topicId: number;
  userId: string;
  userLabel: OrientationLabel;
  choice: DebateChoice;
  timestamp: number;
}

export interface VoteDistribution {
  agreePercent: number;
  disagreePercent: number;
  unsurePercent: number;
}

export interface DebateResult {
  topic: DebateTopic;
  totalVotes: number;
  votesByOrientation: Record<string, VoteDistribution>;
  userVote: DebateChoice;
  userAlignedWithGroup: boolean;
  insightMessage: string;
}

// ═══════════════════════════════════════════════════
// 9. 기능7: 역사 인물 매칭
// ═══════════════════════════════════════════════════

export interface HistoricalFigure {
  id: number;
  name: string;
  nameKorean: string;
  era: string;
  country: string;
  flagEmoji: string;
  imageRes: string; // In TS/Web, we use URL or path
  economicPosition: number;
  socialPosition: number;
  dominantMoral: MoralFoundation[];
  shortDescription: string;
  famousQuote: string;
}

export interface FigureMatch {
  figure: HistoricalFigure;
  matchRank: number; // 1위, 2위, 3위
  commonTraits: string[];
  matchReason: string;
}
