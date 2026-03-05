"""
Short ID 생성 모듈
nanoid 기반 8자리 영숫자 고유 식별자를 생성합니다.
결과 공유 URL, 초대 링크 등에 사용됩니다.
"""
import random

try:
    from nanoid import generate
except ModuleNotFoundError:
    generate = None

from database.connection import get_supabase


# URL-safe 영숫자 알파벳 (62자)
ALPHABET = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz"
DEFAULT_LENGTH = 8
MAX_RETRIES = 3


def create_short_id(length: int = DEFAULT_LENGTH) -> str:
    """
    8자리 영숫자 Short ID를 생성합니다.
    예: "aBc12xYz"
    """
    if generate is not None:
        return generate(ALPHABET, length)
    return "".join(random.choice(ALPHABET) for _ in range(length))


def create_unique_short_id(table: str = "diagnosis_results", column: str = "short_id") -> str:
    """
    DB 충돌 검사를 포함한 고유 Short ID를 생성합니다.
    최대 MAX_RETRIES회 재시도합니다.

    Args:
        table: 충돌 검사할 테이블명
        column: 충돌 검사할 컬럼명

    Returns:
        충돌이 없는 고유 Short ID

    Raises:
        RuntimeError: MAX_RETRIES회 시도 후에도 충돌 발생 시
    """
    supabase = get_supabase()

    # DB 미연결/오프라인 모드에서는 충돌 검사 없이 생성
    if supabase is None:
        return create_short_id()

    for attempt in range(MAX_RETRIES):
        short_id = create_short_id()

        # DB에서 중복 확인
        try:
            result = (
                supabase.table(table)
                .select("id")
                .eq(column, short_id)
                .execute()
            )
        except Exception:
            return short_id

        # 중복 없으면 반환
        if not result.data:
            return short_id

    # 모든 재시도 실패 시
    raise RuntimeError(
        f"Short ID 생성 실패: {MAX_RETRIES}회 시도 후에도 충돌 발생. "
        f"테이블 '{table}'의 '{column}' 컬럼에서 중복됨."
    )
