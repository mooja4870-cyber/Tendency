"""
통합 테스트 유틸리티
배포 후 주요 기능이 정상 동작하는지 확인하는 테스트 모음.
관리자 페이지에서 실행하거나, CLI로 직접 실행할 수 있습니다.

사용법:
    python -c "from utils.test_integration import run_all_tests; run_all_tests()"
"""


def test_db_connection() -> dict:
    """DB 연결 테스트"""
    try:
        from database.connection import get_supabase
        client = get_supabase()
        # 간단한 쿼리로 연결 확인
        client.table("questions").select("id").limit(1).execute()
        return {"test": "DB 연결", "status": "✅ PASS"}
    except Exception as e:
        return {"test": "DB 연결", "status": f"❌ FAIL: {e}"}


def test_questions_loaded() -> dict:
    """질문 데이터 로드 테스트"""
    try:
        from services.content_service import get_questions
        qs = get_questions()
        count = len(qs)
        if count >= 20:
            return {"test": f"질문 로드 ({count}개)", "status": "✅ PASS"}
        else:
            return {"test": f"질문 로드 ({count}개)", "status": f"⚠️ WARN: 20개 미만"}
    except Exception as e:
        return {"test": "질문 로드", "status": f"❌ FAIL: {e}"}


def test_figures_loaded() -> dict:
    """역사 인물 데이터 로드 테스트"""
    try:
        from services.content_service import get_historical_figures
        figs = get_historical_figures()
        return {"test": f"인물 로드 ({len(figs)}명)", "status": "✅ PASS" if figs else "⚠️ WARN: 0명"}
    except Exception as e:
        return {"test": "인물 로드", "status": f"❌ FAIL: {e}"}


def test_countries_loaded() -> dict:
    """국가 데이터 로드 테스트"""
    try:
        from services.content_service import get_country_spectrums
        countries = get_country_spectrums()
        return {"test": f"국가 로드 ({len(countries)}개국)", "status": "✅ PASS" if countries else "⚠️ WARN: 0개"}
    except Exception as e:
        return {"test": "국가 로드", "status": f"❌ FAIL: {e}"}


def test_media_loaded() -> dict:
    """매체 데이터 로드 테스트"""
    try:
        from services.content_service import get_media_sources
        media = get_media_sources()
        return {"test": f"매체 로드 ({len(media)}개)", "status": "✅ PASS" if media else "⚠️ WARN: 0개"}
    except Exception as e:
        return {"test": "매체 로드", "status": f"❌ FAIL: {e}"}


def test_scoring_engine() -> dict:
    """채점 엔진 테스트"""
    try:
        from utils.scoring_engine import ScoringEngine
        from database.models import UserAnswer, Question, AnswerChoice

        engine = ScoringEngine()

        # 더미 질문/답변
        dummy_q = Question(
            id=1, order_index=1, text="테스트 질문",
            category="ECONOMY", dimension="ECONOMIC",
            moral_foundation="FAIRNESS", polarity="YES_IS_PROGRESSIVE",
        )
        dummy_a = UserAnswer(
            question_id=1, choice=AnswerChoice.YES,
            timestamp=0, response_time_ms=1000,
        )

        result = engine.calculate_result([dummy_a], [dummy_q])
        if "overall_position" in result and "overall_label" in result:
            return {"test": "채점 엔진", "status": "✅ PASS"}
        else:
            return {"test": "채점 엔진", "status": "❌ FAIL: 결과 키 누락"}
    except Exception as e:
        return {"test": "채점 엔진", "status": f"❌ FAIL: {e}"}


def test_bias_detector() -> dict:
    """편향 탐지 테스트"""
    try:
        from utils.bias_detector import BiasDetector
        from database.models import UserAnswer, Question, AnswerChoice

        detector = BiasDetector()
        dummy_q = Question(
            id=1, order_index=1, text="테스트",
            category="ECONOMY", dimension="ECONOMIC",
            moral_foundation="FAIRNESS", polarity="YES_IS_PROGRESSIVE",
        )
        dummy_a = UserAnswer(
            question_id=1, choice=AnswerChoice.YES,
            timestamp=0, response_time_ms=1000,
        )
        result = detector.detect([dummy_a], [dummy_q])
        if "bias_count" in result:
            return {"test": "편향 탐지", "status": "✅ PASS"}
        else:
            return {"test": "편향 탐지", "status": "❌ FAIL: 결과 키 누락"}
    except Exception as e:
        return {"test": "편향 탐지", "status": f"❌ FAIL: {e}"}


def test_short_id() -> dict:
    """Short ID 생성 테스트"""
    try:
        from utils.short_id import create_short_id
        sid = create_short_id()
        if len(sid) == 8 and sid.isalnum():
            return {"test": f"Short ID 생성 ({sid})", "status": "✅ PASS"}
        else:
            return {"test": "Short ID 생성", "status": f"❌ FAIL: 형식 오류 ({sid})"}
    except Exception as e:
        return {"test": "Short ID 생성", "status": f"❌ FAIL: {e}"}


def test_debate_topic() -> dict:
    """토론 주제 조회 테스트"""
    try:
        from services.debate_service import get_current_topic
        topic = get_current_topic()
        if topic:
            return {"test": f"토론 주제 ({topic['title'][:20]}...)", "status": "✅ PASS"}
        else:
            return {"test": "토론 주제", "status": "⚠️ WARN: 활성 주제 없음"}
    except Exception as e:
        return {"test": "토론 주제", "status": f"❌ FAIL: {e}"}


def test_stats() -> dict:
    """통계 서비스 테스트"""
    try:
        from services.stats_service import get_orientation_distribution
        stats = get_orientation_distribution()
        return {"test": f"통계 (참여자 {stats.get('total_users', 0)}명)", "status": "✅ PASS"}
    except Exception as e:
        return {"test": "통계", "status": f"❌ FAIL: {e}"}


def run_all_tests() -> list[dict]:
    """모든 통합 테스트를 실행하고 결과를 반환합니다."""
    tests = [
        test_db_connection,
        test_questions_loaded,
        test_figures_loaded,
        test_countries_loaded,
        test_media_loaded,
        test_scoring_engine,
        test_bias_detector,
        test_short_id,
        test_debate_topic,
        test_stats,
    ]

    results = []
    for test_fn in tests:
        try:
            result = test_fn()
            results.append(result)
        except Exception as e:
            results.append({"test": test_fn.__name__, "status": f"❌ ERROR: {e}"})

    # 콘솔 출력
    print("\n" + "=" * 50)
    print("🔮 프리즘 통합 테스트 결과")
    print("=" * 50)
    passed = 0
    for r in results:
        status = r["status"]
        print(f"  {status} — {r['test']}")
        if "PASS" in status:
            passed += 1
    print(f"\n  총 {len(results)}개 중 {passed}개 통과")
    print("=" * 50 + "\n")

    return results
