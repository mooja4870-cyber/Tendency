# 🔮 프리즘 (Prism)

## 당신의 정치 성향을 다각도로 분석합니다

### 기능

- 🎯 **20개 질문** 기반 정치 성향 진단
- 📊 **8개 카테고리** + 도덕 기반 분석
- 🧠 **인지편향** 탐지 (확증 편향, 현상 유지 편향 등)
- 🗳️ **주간 토론** 투표 (성향별 집계)
- 🤝 **친구와 궁합** 비교 (초대 링크)
- 👤 **역사 인물** 매칭 (15명)
- 🗺️ **국가별 성향** 비교 (오버턴 윈도우)
- 📺 **미디어 스펙트럼** 분석
- 🤖 **AI 기반** 심층 분석 (Google Gemini)

### 기술 스택

| 구성 요소 | 기술 |
|-----------|------|
| Frontend & Backend | Streamlit (Python) |
| Database | Supabase (PostgreSQL) |
| AI | Google Gemini 1.5 Flash |
| Deployment | Streamlit Community Cloud |

### 프로젝트 구조

```
prism-app/
├── app.py                    # Streamlit 메인 진입점
├── admin_app.py              # Streamlit 관리자 진입점
├── requirements.txt          # Python 의존성
├── .streamlit/
│   ├── config.toml           # Streamlit 설정
│   └── secrets.toml          # 로컬 시크릿 (gitignore)
├── database/
│   ├── connection.py         # Supabase 연결
│   ├── models.py             # 데이터 모델 (14 enums, 20 dataclasses)
│   └── migrations.py         # 테이블 생성 + 시딩
├── services/
│   ├── result_service.py     # 결과 저장/조회
│   ├── compatibility_service.py  # 궁합 비교
│   ├── debate_service.py     # 토론 투표
│   ├── content_service.py    # CMS
│   ├── ai_service.py         # Gemini AI 프록시
│   ├── stats_service.py      # 통계
│   └── auth_service.py       # 관리자 인증
├── pages/
│   ├── 1_quiz.py             # 퀴즈 (20문항)
│   ├── 2_result.py           # 결과 시각화 (6개 차트)
│   ├── 3_debate.py           # 주간 토론
│   ├── 4_compatibility.py    # 궁합 비교
│   └── 5_explore.py          # 탐색 (통계/국가/인물/매체)
├── utils/
│   ├── scoring_engine.py     # 채점 엔진
│   ├── bias_detector.py      # 편향 탐지
│   ├── short_id.py           # Short ID 생성
│   └── helpers.py            # 공통 유틸리티
└── data/
    ├── questions.json        # 20개 질문
    ├── figures.json          # 15명 역사 인물
    ├── countries.json        # 8개국 스펙트럼
    ├── media_sources.json    # 17개 매체
    └── debates_seed.json     # 3개 토론 주제
```

### 배포 방법 (Streamlit Community Cloud)

#### 1. 저장소 준비

- GitHub 저장소에 `prism-app/` 폴더가 포함되어 있어야 합니다.
- Python 버전 고정을 위해 `runtime.txt`(python-3.11)를 포함했습니다.
- 시크릿 템플릿은 `.streamlit/secrets.example.toml`을 사용합니다.

#### 2. Streamlit Cloud 앱 생성 (2개)

1. [share.streamlit.io](https://share.streamlit.io) 접속
2. User 앱 생성
3. Repository: 배포할 GitHub 저장소 선택
4. Branch: `main`
5. **Main file path**: `prism-app/app.py`
6. Admin 앱 생성 (같은 저장소로 한 번 더 생성)
7. **Main file path**: `prism-app/admin_app.py`

#### 3. Secrets 설정

`prism-app/.streamlit/secrets.example.toml` 내용을 복사해
Streamlit Cloud > App settings > Secrets 에 입력합니다.

필수 키:

```toml
SUPABASE_URL = "https://xxxx.supabase.co"
SUPABASE_KEY = "your-supabase-anon-or-service-key"
GEMINI_API_KEY = "your-gemini-api-key"
ADMIN_PASSWORD = "your-admin-password"
```

#### 4. 배포 후 초기화

1. `admin_app` 배포 URL 접속
2. "테이블 생성" 실행
3. "초기 데이터 시딩" 실행
4. 토론 주제 활성화

### 로컬 개발

```bash
# 가상환경 생성
python -m venv venv
source venv/bin/activate

# 의존성 설치
pip install -r requirements.txt

# secrets.toml 설정
# .streamlit/secrets.toml에 API 키 입력

# 실행
streamlit run app.py
```

### 라이선스

이 프로젝트는 교육 및 연구 목적으로 제작되었습니다.
특정 정치적 입장을 지지하거나 반대하지 않습니다.
