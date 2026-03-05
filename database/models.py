"""
도메인 모델 정의
기존 TypeScript types.ts를 Python enum + dataclass로 변환합니다.
"""
from enum import Enum
from dataclasses import dataclass, field
from typing import Optional


# ═══════════════════════════════════════════════════
# 1. 기본 Enum 정의
# ═══════════════════════════════════════════════════

class QuestionCategory(str, Enum):
    ECONOMY = "ECONOMY"
    WELFARE = "WELFARE"
    SECURITY = "SECURITY"
    CULTURE = "CULTURE"
    ENVIRONMENT = "ENVIRONMENT"
    RIGHTS = "RIGHTS"
    TRADITION = "TRADITION"
    GOVERNANCE = "GOVERNANCE"


class PoliticalDimension(str, Enum):
    ECONOMIC = "ECONOMIC"
    SOCIAL = "SOCIAL"


class MoralFoundation(str, Enum):
    CARE = "CARE"
    FAIRNESS = "FAIRNESS"
    LOYALTY = "LOYALTY"
    AUTHORITY = "AUTHORITY"
    PURITY = "PURITY"


class Polarity(str, Enum):
    YES_IS_PROGRESSIVE = "YES_IS_PROGRESSIVE"
    YES_IS_CONSERVATIVE = "YES_IS_CONSERVATIVE"


class AnswerChoice(float, Enum):
    YES = 1.0
    UNSURE = 0.5
    NO = 0.0


class OrientationLabel(str, Enum):
    STRONG_CONSERVATIVE = "강한 보수"
    CONSERVATIVE = "보수"
    MODERATE_CONSERVATIVE = "온건 보수"
    LEAN_CONSERVATIVE = "보수 기울임"
    CENTER_RIGHT = "중도 우파"
    CENTER_LEFT = "중도 좌파"
    LEAN_PROGRESSIVE = "진보 기울임"
    MODERATE_PROGRESSIVE = "온건 진보"
    PROGRESSIVE = "진보"
    STRONG_PROGRESSIVE = "강한 진보"


class BiasType(str, Enum):
    CONFIRMATION = "확증 편향"
    STATUS_QUO = "현상 유지 편향"
    AFFECT_HEURISTIC = "감정 휴리스틱"
    ANCHORING = "정박 효과"
    BANDWAGON = "편승 효과"
    DUNNING_KRUGER = "더닝-크루거 효과"
    IN_GROUP = "내집단 편향"
    AVAILABILITY = "가용성 편향"
    FRAMING = "프레이밍 효과"
    BLIND_SPOT = "편향 사각지대"


class BiasSeverity(str, Enum):
    LOW = "LOW"
    MODERATE = "MODERATE"
    HIGH = "HIGH"


class BiasLevel(str, Enum):
    MINIMAL = "MINIMAL"
    MODERATE = "MODERATE"
    SIGNIFICANT = "SIGNIFICANT"


class MediaType(str, Enum):
    TV = "TV"
    NEWSPAPER = "NEWSPAPER"
    ONLINE = "ONLINE"
    YOUTUBE = "YOUTUBE"
    PODCAST = "PODCAST"


class DiversityLevel(str, Enum):
    VERY_BIASED = "매우 편향"
    SOMEWHAT_BIASED = "약간 편향"
    BALANCED = "균형 잡힘"
    SOMEWHAT_DIVERSE = "약간 다양"
    VERY_DIVERSE = "매우 다양"


class DebateChoice(str, Enum):
    AGREE = "AGREE"
    UNSURE = "UNSURE"
    DISAGREE = "DISAGREE"


class CompatibilityLevel(str, Enum):
    SOULMATE = "정치적 소울메이트"
    HARMONIOUS = "조화로운 관계"
    COMPLEMENTARY = "보완적 관계"
    CHALLENGING = "도전적 관계"
    OPPOSITE = "극과 극"


class GapLevel(str, Enum):
    SIMILAR = "비교적 유사"
    MODERATE = "약간의 차이"
    LARGE = "큰 차이"


class InviteStatus(str, Enum):
    PENDING = "pending"
    COMPLETED = "completed"
    EXPIRED = "expired"


# ═══════════════════════════════════════════════════
# 2. 데이터 클래스 정의
# ═══════════════════════════════════════════════════

@dataclass
class Question:
    id: int
    order_index: int
    text: str
    category: QuestionCategory
    dimension: PoliticalDimension
    moral_foundation: Optional[MoralFoundation]
    polarity: Polarity
    contradicts_with: Optional[int] = None


@dataclass
class UserAnswer:
    question_id: int
    choice: AnswerChoice
    timestamp: float
    response_time_ms: float


@dataclass
class MoralProfile:
    care_position: float
    fairness_position: float
    loyalty_position: float
    authority_position: float
    purity_position: float


@dataclass
class CategoryResult:
    category: QuestionCategory
    position: float  # 0.0 ~ 1.0
    label: OrientationLabel


@dataclass
class DetectedBias:
    bias_type: BiasType
    title: str
    description: str
    evidence: str
    quote: str
    severity: BiasSeverity


@dataclass
class BiasReport:
    detected_biases: list[DetectedBias]
    consistency_score: float
    overall_bias_level: BiasLevel


@dataclass
class CountryMatch:
    country_code: str
    country_name: str
    flag_emoji: str
    era: str
    equivalent_label: str
    surprise: str
    explanation: str


@dataclass
class HistoricalFigure:
    id: int
    name: str
    name_korean: str
    era: str
    country: str
    flag_emoji: str
    economic_position: float
    social_position: float
    dominant_morals: list[MoralFoundation]
    short_description: str
    famous_quote: str
    image_url: str = ""


@dataclass
class FigureMatch:
    figure: HistoricalFigure
    match_rank: int
    common_traits: list[str]
    match_reason: str


@dataclass
class MediaSource:
    id: int
    name: str
    type: MediaType
    orientation: float  # 0.0(보수) ~ 1.0(진보)
    logo_emoji: str


@dataclass
class PerspectiveView:
    orientation_label: str
    emoji: str
    reaction: str
    reasoning: str
    core_value: str


@dataclass
class EmpathyScenario:
    id: int
    news_headline: str
    news_description: str
    user_perspective: PerspectiveView
    opposite_perspective: PerspectiveView
    insight: str


@dataclass
class DiagnosisResult:
    overall_position: float
    economic_position: float
    social_position: float
    overall_label: OrientationLabel
    category_results: list[CategoryResult]
    moral_profile: MoralProfile
    bias_report: BiasReport
    empathy_scenarios: list[EmpathyScenario]
    country_matches: list[CountryMatch]
    figure_matches: list[FigureMatch]
    personality_insight: str


@dataclass
class BubbleReport:
    selected_media: list[MediaSource]
    diversity_position: float
    diversity_level: DiversityLevel
    bias_direction: str
    progressive_ratio: float
    conservative_ratio: float
    prescription: str
    recommended_media: list[MediaSource]


@dataclass
class DebateTopic:
    id: int
    week_number: int
    title: str
    description: str
    pro_arguments: list[str]
    con_arguments: list[str]
    related_category: QuestionCategory
    is_active: bool


@dataclass
class VoteDistribution:
    agree_percent: float
    disagree_percent: float
    unsure_percent: float


@dataclass
class DebateResult:
    topic: DebateTopic
    total_votes: int
    votes_by_orientation: dict[str, VoteDistribution]
    user_vote: DebateChoice
    user_aligned_with_group: bool
    insight_message: str


@dataclass
class CategoryComparison:
    category: QuestionCategory
    my_position: float
    partner_position: float
    gap_level: GapLevel


@dataclass
class CompatibilityResult:
    my_result: DiagnosisResult
    partner_result: DiagnosisResult
    overall_compatibility: CompatibilityLevel
    category_comparisons: list[CategoryComparison]
    advice_list: list[dict]
    shared_values: list[str]
    conflict_areas: list[str]
