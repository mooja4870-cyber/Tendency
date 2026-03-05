"""
AI 프록시 서비스
Google Gemini API를 통해 성향 분석 인사이트와 공감 시나리오를 생성합니다.
비용 제어: 세션당 최대 3회 호출.
"""
import json
import hashlib
import streamlit as st

# Gemini API 초기화 (lazy)
_genai = None


def _get_genai():
    """google-generativeai 모듈을 lazy import + 설정합니다."""
    global _genai
    if _genai is None:
        try:
            import google.generativeai as genai
            genai.configure(api_key=st.secrets["GEMINI_API_KEY"])
            _genai = genai
        except Exception as e:
            st.warning(f"⚠️ Gemini API 설정 실패: {e}")
            return None
    return _genai


def analyze_personality(result_data: dict) -> str:
    """
    Gemini API를 통해 성향 분석 인사이트를 생성합니다.

    Args:
        result_data: 진단 결과 딕셔너리

    Returns:
        분석 텍스트 (실패 시 폴백 메시지)
    """
    # 세션당 호출 횟수 제한
    if "ai_call_count" not in st.session_state:
        st.session_state.ai_call_count = 0
    if st.session_state.ai_call_count >= 3:
        return result_data.get("personality_insight", _fallback_insight(result_data))

    # 캐시 확인 (같은 결과에 대해 재호출 방지)
    cache_key = hashlib.md5(
        json.dumps(result_data, sort_keys=True, default=str).encode()
    ).hexdigest()
    if f"ai_cache_{cache_key}" in st.session_state:
        return st.session_state[f"ai_cache_{cache_key}"]

    genai = _get_genai()
    if genai is None:
        return _fallback_insight(result_data)

    prompt = f"""당신은 정치 심리학 전문가입니다. 아래 진단 결과를 바탕으로 
이 사용자의 성향에 대한 통찰을 제공해주세요.

[규칙]
- 특정 정당이나 정치인 이름을 절대 언급하지 마세요
- 어떤 성향이 더 낫다는 우열 판단을 하지 마세요
- 심리학 연구와 도덕 기반 이론에 근거하세요
- 한국어로 작성하세요
- 3문단 이내로 작성하세요
- 따뜻하고 존중하는 어조를 유지하세요

[진단 결과]
- 전체 성향: {result_data.get('overall_label', '')} (위치: {result_data.get('overall_position', 0.5)})
- 경제 축: {result_data.get('economic_position', 0.5)}
- 사회 축: {result_data.get('social_position', 0.5)}
- 도덕 프로필: {json.dumps(result_data.get('moral_profile', {}), ensure_ascii=False)}
- 감지된 편향: {result_data.get('bias_report', {}).get('bias_count', 0)}개
"""

    try:
        model = genai.GenerativeModel("gemini-1.5-flash")
        response = model.generate_content(
            prompt,
            generation_config={
                "temperature": 0.7,
                "max_output_tokens": 500,
            },
        )
        result_text = response.text
        st.session_state.ai_call_count += 1
        st.session_state[f"ai_cache_{cache_key}"] = result_text
        return result_text

    except Exception as e:
        print(f"⚠️ Gemini API 호출 실패: {e}")
        return _fallback_insight(result_data)


def generate_empathy_scenario(user_label: str, user_position: float) -> list[dict]:
    """
    반대편의 눈 — AI 기반 공감 시나리오를 생성합니다.

    Args:
        user_label: 사용자 성향 라벨
        user_position: 사용자 위치 (0~1)

    Returns:
        시나리오 리스트 (실패 시 하드코딩된 기본 시나리오)
    """
    if "ai_call_count" not in st.session_state:
        st.session_state.ai_call_count = 0
    if st.session_state.ai_call_count >= 3:
        return _fallback_scenarios(user_position)

    genai = _get_genai()
    if genai is None:
        return _fallback_scenarios(user_position)

    orientation = "진보" if user_position > 0.5 else "보수"
    opposite = "보수" if user_position > 0.5 else "진보"

    prompt = f"""당신은 정치 심리학 전문가입니다.
사용자의 성향은 [{orientation}]입니다.

반대 성향[{opposite}]의 시각을 이해할 수 있는 뉴스 시나리오 3개를 만들어주세요.

[규칙]
- 특정 정당/정치인 언급 금지
- JSON 배열 형식으로만 출력
- 각 시나리오는 아래 구조를 따릅니다

[출력 형식 (JSON만, 다른 텍스트 없이)]
[
  {{
    "headline": "뉴스 헤드라인",
    "progressive_view": {{"reaction": "진보 시각 반응", "core_value": "핵심 가치"}},
    "conservative_view": {{"reaction": "보수 시각 반응", "core_value": "핵심 가치"}},
    "insight": "이 이슈에서 두 시각의 차이에 대한 통찰"
  }}
]"""

    try:
        model = genai.GenerativeModel("gemini-1.5-flash")
        response = model.generate_content(
            prompt,
            generation_config={
                "temperature": 0.8,
                "max_output_tokens": 800,
            },
        )

        text = response.text.strip()
        # JSON 추출 (마크다운 코드블록 제거)
        if "```json" in text:
            text = text.split("```json")[1].split("```")[0]
        elif "```" in text:
            text = text.split("```")[1].split("```")[0]

        scenarios = json.loads(text)
        st.session_state.ai_call_count += 1
        return scenarios

    except Exception as e:
        print(f"⚠️ 시나리오 생성 실패: {e}")
        return _fallback_scenarios(user_position)


def _fallback_insight(result_data: dict) -> str:
    """AI 호출 실패 시 기본 인사이트를 반환합니다."""
    return result_data.get(
        "personality_insight",
        "당신의 성향은 다양한 가치관이 복합적으로 작용한 결과입니다. "
        "어떤 성향이든 그 안에는 사회를 더 나은 곳으로 만들려는 "
        "선한 의도가 담겨 있습니다."
    )


def _fallback_scenarios(user_position: float) -> list[dict]:
    """AI 호출 실패 시 하드코딩된 기본 시나리오를 반환합니다."""
    return [
        {
            "headline": "최저임금 인상 확정",
            "progressive_view": {
                "reaction": "노동자의 삶이 나아지겠구나",
                "core_value": "배려 — 약자 보호",
            },
            "conservative_view": {
                "reaction": "자영업자들은 어떡하지?",
                "core_value": "공정성 — 시장 질서",
            },
            "insight": "'누구를 먼저 걱정하는가'가 다를 뿐, 둘 다 사회를 걱정합니다.",
        },
        {
            "headline": "대기업 법인세 인상안 발의",
            "progressive_view": {
                "reaction": "부의 재분배를 위해 당연하다",
                "core_value": "공정성 — 분배 정의",
            },
            "conservative_view": {
                "reaction": "기업 경쟁력이 떨어지면 모두가 손해다",
                "core_value": "공정성 — 경제적 자유",
            },
            "insight": "'공정성'이라는 같은 가치 안에서 '결과의 공정'과 '기회의 공정'이 갈립니다.",
        },
        {
            "headline": "난민 수용 정책 확대 발표",
            "progressive_view": {
                "reaction": "인도주의적으로 당연한 조치다",
                "core_value": "배려 — 보편적 인류애",
            },
            "conservative_view": {
                "reaction": "우리 국민 먼저 돌봐야 하는 거 아닌가?",
                "core_value": "충성 — 공동체 보호",
            },
            "insight": "배려의 범위가 다를 뿐, 둘 다 '배려'라는 가치를 실천합니다.",
        },
    ]
