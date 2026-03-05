"""
데이터베이스 마이그레이션 모듈
Supabase PostgreSQL에 테이블을 생성하고 초기 데이터를 시딩합니다.

사용법:
    from database.migrations import run_migrations, seed_initial_data
    run_migrations()       # 테이블 생성
    seed_initial_data()    # 초기 데이터 삽입
"""
import json
import os
from pathlib import Path
from database.connection import get_supabase


# ═══════════════════════════════════════════════════
# CREATE TABLE SQL 정의
# ═══════════════════════════════════════════════════

TABLES_SQL = {
    "users": """
        CREATE TABLE IF NOT EXISTS users (
            id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            display_name    VARCHAR(50),
            provider        VARCHAR(20) DEFAULT 'anonymous',
            created_at      TIMESTAMPTZ DEFAULT now()
        );
    """,

    "questions": """
        CREATE TABLE IF NOT EXISTS questions (
            id                  SERIAL PRIMARY KEY,
            order_index         SMALLINT NOT NULL UNIQUE,
            text_ko             TEXT NOT NULL,
            category            VARCHAR(20) NOT NULL
                                CHECK (category IN (
                                    'ECONOMY','WELFARE','SECURITY','CULTURE',
                                    'ENVIRONMENT','RIGHTS','TRADITION','GOVERNANCE'
                                )),
            dimension           VARCHAR(10) NOT NULL
                                CHECK (dimension IN ('ECONOMIC','SOCIAL')),
            moral_foundation    VARCHAR(12)
                                CHECK (moral_foundation IN (
                                    'CARE','FAIRNESS','LOYALTY','AUTHORITY','PURITY'
                                )),
            polarity            VARCHAR(25) NOT NULL
                                CHECK (polarity IN (
                                    'YES_IS_PROGRESSIVE','YES_IS_CONSERVATIVE'
                                )),
            contradicts_with    SMALLINT,
            is_active           BOOLEAN DEFAULT true,
            created_at          TIMESTAMPTZ DEFAULT now()
        );
    """,

    "diagnosis_results": """
        CREATE TABLE IF NOT EXISTS diagnosis_results (
            id                  SERIAL PRIMARY KEY,
            user_id             UUID REFERENCES users(id) ON DELETE SET NULL,
            short_id            VARCHAR(8) NOT NULL UNIQUE,

            overall_position    DECIMAL(4,3) NOT NULL,
            economic_position   DECIMAL(4,3) NOT NULL,
            social_position     DECIMAL(4,3) NOT NULL,
            overall_label       VARCHAR(20) NOT NULL,

            score_economy       DECIMAL(4,3),
            score_welfare       DECIMAL(4,3),
            score_security      DECIMAL(4,3),
            score_culture       DECIMAL(4,3),
            score_environment   DECIMAL(4,3),
            score_rights        DECIMAL(4,3),
            score_tradition     DECIMAL(4,3),
            score_governance    DECIMAL(4,3),

            moral_care          DECIMAL(4,3),
            moral_fairness      DECIMAL(4,3),
            moral_loyalty       DECIMAL(4,3),
            moral_authority     DECIMAL(4,3),
            moral_purity        DECIMAL(4,3),

            bias_count          SMALLINT DEFAULT 0,
            bias_types          JSONB DEFAULT '[]',
            figure_match_ids    INTEGER[] DEFAULT '{}',
            personality_insight TEXT,
            raw_answers         JSONB NOT NULL DEFAULT '[]',

            created_at          TIMESTAMPTZ DEFAULT now()
        );
    """,

    "invite_links": """
        CREATE TABLE IF NOT EXISTS invite_links (
            id                  SERIAL PRIMARY KEY,
            short_code          VARCHAR(8) NOT NULL UNIQUE,
            inviter_result_id   INTEGER NOT NULL
                                REFERENCES diagnosis_results(id) ON DELETE CASCADE,
            invitee_result_id   INTEGER
                                REFERENCES diagnosis_results(id) ON DELETE SET NULL,
            status              VARCHAR(10) DEFAULT 'pending'
                                CHECK (status IN ('pending','completed','expired')),
            expires_at          TIMESTAMPTZ NOT NULL,
            created_at          TIMESTAMPTZ DEFAULT now()
        );
    """,

    "debate_topics": """
        CREATE TABLE IF NOT EXISTS debate_topics (
            id                  SERIAL PRIMARY KEY,
            week_number         SMALLINT NOT NULL,
            title               VARCHAR(100) NOT NULL,
            description         TEXT,
            pro_arguments       JSONB DEFAULT '[]',
            con_arguments       JSONB DEFAULT '[]',
            related_category    VARCHAR(20)
                                CHECK (related_category IN (
                                    'ECONOMY','WELFARE','SECURITY','CULTURE',
                                    'ENVIRONMENT','RIGHTS','TRADITION','GOVERNANCE'
                                )),
            is_active           BOOLEAN DEFAULT false,
            starts_at           TIMESTAMPTZ,
            ends_at             TIMESTAMPTZ,
            created_at          TIMESTAMPTZ DEFAULT now()
        );
    """,

    "votes": """
        CREATE TABLE IF NOT EXISTS votes (
            id              SERIAL PRIMARY KEY,
            topic_id        INTEGER NOT NULL
                            REFERENCES debate_topics(id) ON DELETE CASCADE,
            voter_label     VARCHAR(20) NOT NULL,
            choice          VARCHAR(10) NOT NULL
                            CHECK (choice IN ('AGREE','UNSURE','DISAGREE')),
            session_hash    VARCHAR(64) NOT NULL,
            created_at      TIMESTAMPTZ DEFAULT now(),
            UNIQUE (topic_id, session_hash)
        );
    """,

    "media_sources": """
        CREATE TABLE IF NOT EXISTS media_sources (
            id              SERIAL PRIMARY KEY,
            name            VARCHAR(30) NOT NULL,
            type            VARCHAR(15) NOT NULL
                            CHECK (type IN ('TV','NEWSPAPER','ONLINE','YOUTUBE','PODCAST')),
            orientation     DECIMAL(3,2) NOT NULL,
            logo_emoji      VARCHAR(4),
            is_active       BOOLEAN DEFAULT true,
            created_at      TIMESTAMPTZ DEFAULT now()
        );
    """,

    "historical_figures": """
        CREATE TABLE IF NOT EXISTS historical_figures (
            id                  SERIAL PRIMARY KEY,
            name_ko             VARCHAR(30) NOT NULL,
            name_en             VARCHAR(50) NOT NULL,
            era                 VARCHAR(10) NOT NULL,
            country             VARCHAR(20) NOT NULL,
            flag_emoji          VARCHAR(4),
            economic_position   DECIMAL(3,2) NOT NULL,
            social_position     DECIMAL(3,2) NOT NULL,
            dominant_morals     JSONB NOT NULL DEFAULT '[]',
            short_description   TEXT,
            famous_quote        TEXT,
            image_url           TEXT,
            is_active           BOOLEAN DEFAULT true,
            created_at          TIMESTAMPTZ DEFAULT now()
        );
    """,

    "country_spectrums": """
        CREATE TABLE IF NOT EXISTS country_spectrums (
            id                  SERIAL PRIMARY KEY,
            country_code        VARCHAR(10) NOT NULL UNIQUE,
            country_name        VARCHAR(30) NOT NULL,
            flag_emoji          VARCHAR(4),
            era                 VARCHAR(10) DEFAULT '현재',
            window_start        DECIMAL(3,2) NOT NULL,
            window_end          DECIMAL(3,2) NOT NULL,
            center_position     DECIMAL(3,2) NOT NULL,
            explanation         TEXT,
            is_active           BOOLEAN DEFAULT true,
            created_at          TIMESTAMPTZ DEFAULT now()
        );
    """,
}

# 인덱스 SQL (테이블 생성 후 실행)
INDEXES_SQL = [
    "CREATE INDEX IF NOT EXISTS idx_users_created ON users(created_at DESC);",
    "CREATE INDEX IF NOT EXISTS idx_results_short ON diagnosis_results(short_id);",
    "CREATE INDEX IF NOT EXISTS idx_results_user ON diagnosis_results(user_id);",
    "CREATE INDEX IF NOT EXISTS idx_results_date ON diagnosis_results(created_at DESC);",
    "CREATE INDEX IF NOT EXISTS idx_invite_code ON invite_links(short_code);",
    "CREATE INDEX IF NOT EXISTS idx_votes_topic ON votes(topic_id);",
]


def run_migrations() -> dict[str, str]:
    """
    모든 테이블과 인덱스를 생성합니다.
    이미 존재하면 스킵 (IF NOT EXISTS).

    Returns:
        dict: 각 테이블/인덱스의 실행 결과 {"테이블명": "created" | "already_exists" | "error: ..."}
    """
    supabase = get_supabase()
    results: dict[str, str] = {}

    # 테이블 생성
    for table_name, sql in TABLES_SQL.items():
        try:
            supabase.rpc("exec_sql", {"query": sql}).execute()
            results[table_name] = "created"
        except Exception as e:
            error_msg = str(e)
            if "already exists" in error_msg.lower():
                results[table_name] = "already_exists"
            else:
                results[table_name] = f"error: {error_msg}"

    # 인덱스 생성
    for idx_sql in INDEXES_SQL:
        idx_name = idx_sql.split("IF NOT EXISTS ")[1].split(" ON")[0] if "IF NOT EXISTS" in idx_sql else "unknown"
        try:
            supabase.rpc("exec_sql", {"query": idx_sql}).execute()
            results[f"index:{idx_name}"] = "created"
        except Exception as e:
            error_msg = str(e)
            if "already exists" in error_msg.lower():
                results[f"index:{idx_name}"] = "already_exists"
            else:
                results[f"index:{idx_name}"] = f"error: {error_msg}"

    return results


# ═══════════════════════════════════════════════════
# 초기 데이터 시딩
# ═══════════════════════════════════════════════════

DATA_DIR = Path(__file__).parent.parent / "data"


def _load_json(filename: str) -> list[dict]:
    """data/ 디렉토리에서 JSON 파일을 로드합니다."""
    filepath = DATA_DIR / filename
    if not filepath.exists():
        print(f"⚠️ 시드 데이터 파일 없음: {filepath}")
        return []
    with open(filepath, "r", encoding="utf-8") as f:
        return json.load(f)


def _seed_table(table_name: str, data: list[dict], unique_key: str = "id") -> dict[str, int]:
    """
    테이블에 초기 데이터를 삽입합니다.
    이미 존재하는 레코드는 스킵합니다 (idempotent).

    Args:
        table_name: 대상 테이블명
        data: 삽입할 레코드 목록
        unique_key: 중복 판별 키

    Returns:
        {"inserted": N, "skipped": N, "errors": N}
    """
    supabase = get_supabase()
    stats = {"inserted": 0, "skipped": 0, "errors": 0}

    for record in data:
        try:
            # upsert로 중복 시 스킵 (on_conflict에서 nothing)
            supabase.table(table_name).upsert(
                record,
                on_conflict=unique_key
            ).execute()
            stats["inserted"] += 1
        except Exception as e:
            if "duplicate" in str(e).lower() or "conflict" in str(e).lower():
                stats["skipped"] += 1
            else:
                stats["errors"] += 1
                print(f"⚠️ {table_name} 시딩 오류: {e}")

    return stats


def seed_initial_data() -> dict[str, dict[str, int]]:
    """
    모든 초기 데이터를 시딩합니다.

    data/ 디렉토리의 JSON 파일 → 대응 테이블로 삽입
    - questions.json → questions 테이블
    - figures.json → historical_figures 테이블
    - countries.json → country_spectrums 테이블
    - media_sources.json → media_sources 테이블

    Returns:
        dict: 각 테이블별 시딩 결과
    """
    seed_map = {
        "questions": ("questions.json", "order_index"),
        "historical_figures": ("figures.json", "name_en"),
        "country_spectrums": ("countries.json", "country_code"),
        "media_sources": ("media_sources.json", "name"),
    }

    results: dict[str, dict[str, int]] = {}
    for table_name, (filename, unique_key) in seed_map.items():
        data = _load_json(filename)
        if data:
            results[table_name] = _seed_table(table_name, data, unique_key)
        else:
            results[table_name] = {"inserted": 0, "skipped": 0, "errors": 0}

    return results
