"""
공통 유틸리티 모듈
세션 해시, 날짜 포맷, 성향 라벨 변환 등 앱 전반에서 사용하는 헬퍼 함수들.
"""
import hashlib
from datetime import datetime, timezone
from typing import Optional


# ═══════════════════════════════════════════════════
# 성향 라벨 한글 변환 딕셔너리
# ═══════════════════════════════════════════════════

LABEL_MAP: dict[str, str] = {
    "STRONG_CONSERVATIVE": "강한 보수",
    "CONSERVATIVE": "보수",
    "MODERATE_CONSERVATIVE": "온건 보수",
    "LEAN_CONSERVATIVE": "보수 기울임",
    "CENTER_RIGHT": "중도 우파",
    "CENTER_LEFT": "중도 좌파",
    "LEAN_PROGRESSIVE": "진보 기울임",
    "MODERATE_PROGRESSIVE": "온건 진보",
    "PROGRESSIVE": "진보",
    "STRONG_PROGRESSIVE": "강한 진보",
}

# 역방향 매핑 (한글 → 영문)
LABEL_MAP_REVERSE: dict[str, str] = {v: k for k, v in LABEL_MAP.items()}

# 성향 라벨 이모지 매핑
LABEL_EMOJI: dict[str, str] = {
    "STRONG_CONSERVATIVE": "🔴",
    "CONSERVATIVE": "🟠",
    "MODERATE_CONSERVATIVE": "🟡",
    "LEAN_CONSERVATIVE": "🟡",
    "CENTER_RIGHT": "⚪",
    "CENTER_LEFT": "⚪",
    "LEAN_PROGRESSIVE": "🟢",
    "MODERATE_PROGRESSIVE": "🟢",
    "PROGRESSIVE": "🔵",
    "STRONG_PROGRESSIVE": "🟣",
}

# 카테고리 한글 표시명
CATEGORY_DISPLAY: dict[str, str] = {
    "ECONOMY": "💰 경제",
    "WELFARE": "🏥 복지",
    "SECURITY": "🛡️ 안보",
    "CULTURE": "🌍 문화",
    "ENVIRONMENT": "🌿 환경",
    "RIGHTS": "⚖️ 인권",
    "TRADITION": "🏛️ 전통",
    "GOVERNANCE": "🏢 정부역할",
}

# 도덕 기반 한글 표시명
MORAL_DISPLAY: dict[str, str] = {
    "care": "💚 배려",
    "fairness": "⚖️ 공정성",
    "loyalty": "🤝 충성",
    "authority": "👑 권위",
    "purity": "✨ 순결",
}


# ═══════════════════════════════════════════════════
# 세션 해시 (중복 투표 방지)
# ═══════════════════════════════════════════════════

def generate_session_hash(session_id: str, extra: str = "") -> str:
    """
    브라우저 세션 기반 해시를 생성합니다.
    투표 중복 방지에 사용됩니다.

    Args:
        session_id: Streamlit 세션 ID (st.session_state의 고유 키)
        extra: 추가 솔트 (예: User-Agent, IP 등)

    Returns:
        64자 SHA-256 해시 문자열
    """
    raw = f"{session_id}:{extra}"
    return hashlib.sha256(raw.encode("utf-8")).hexdigest()


# ═══════════════════════════════════════════════════
# 날짜 포맷 유틸
# ═══════════════════════════════════════════════════

def format_datetime(dt: Optional[datetime] = None, fmt: str = "%Y년 %m월 %d일 %H:%M") -> str:
    """
    datetime 객체를 한국어 형식 문자열로 변환합니다.

    Args:
        dt: 변환할 datetime (None이면 현재 시각)
        fmt: 포맷 문자열

    Returns:
        "2025년 01월 15일 09:30" 형식 문자열
    """
    if dt is None:
        dt = datetime.now(timezone.utc)
    return dt.strftime(fmt)


def format_relative_time(dt: datetime) -> str:
    """
    상대 시간 표시 ("3분 전", "2시간 전", "어제" 등).

    Args:
        dt: 기준 datetime (UTC)

    Returns:
        한글 상대 시간 문자열
    """
    now = datetime.now(timezone.utc)
    diff = now - dt

    seconds = int(diff.total_seconds())
    if seconds < 60:
        return "방금 전"
    elif seconds < 3600:
        return f"{seconds // 60}분 전"
    elif seconds < 86400:
        return f"{seconds // 3600}시간 전"
    elif seconds < 604800:
        return f"{seconds // 86400}일 전"
    else:
        return format_datetime(dt, "%m월 %d일")


# ═══════════════════════════════════════════════════
# 라벨 변환 헬퍼
# ═══════════════════════════════════════════════════

def get_label_korean(label_en: str) -> str:
    """영문 라벨 → 한글 라벨 변환"""
    return LABEL_MAP.get(label_en, label_en)


def get_label_english(label_ko: str) -> str:
    """한글 라벨 → 영문 라벨 변환"""
    return LABEL_MAP_REVERSE.get(label_ko, label_ko)


def get_label_emoji(label_en: str) -> str:
    """영문 라벨 → 이모지 변환"""
    return LABEL_EMOJI.get(label_en, "⚪")


def get_label_color(position: float) -> str:
    """
    성향 위치(0~1)에 따른 CSS 색상을 반환합니다.
    보수(빨강) → 중도(보라) → 진보(파랑) 그라데이션.
    """
    if position < 0.3:
        return "#E74C3C"  # 빨강 (보수)
    elif position < 0.45:
        return "#F39C12"  # 주황
    elif position < 0.55:
        return "#9B59B6"  # 보라 (중도)
    elif position < 0.7:
        return "#2ECC71"  # 초록
    else:
        return "#3498DB"  # 파랑 (진보)
