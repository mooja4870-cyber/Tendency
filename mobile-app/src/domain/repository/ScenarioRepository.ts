import { EmpathyScenario, DiagnosisResult } from '../model/types';

export class ScenarioRepository {
  getScenarios(result: DiagnosisResult): EmpathyScenario[] {
    const isProgressive = result.overallPosition > 0.5;

    const templates = [
      {
        id: 1,
        newsHeadline: "최저임금 인상 확정",
        newsDescription: "정부가 내년도 최저임금을 올해 대비 대폭 인상하기로 결정했다.",
        progressivePerspective: {
          orientationLabel: "진보 시각",
          emoji: "🟠",
          reaction: "노동자의 삶이 나아지겠구나",
          reasoning: "최소한의 생활을 보장받는 것은 인간의 기본 권리입니다. 저임금 노동자들의 구매력이 높아지면 내수 경제도 살아납니다.",
          coreValue: "배려 (Care) — 약자 보호"
        },
        conservativePerspective: {
          orientationLabel: "보수 시각",
          emoji: "🔵",
          reaction: "자영업자들은 어떡하지?",
          reasoning: "인건비 부담으로 소상공인이 직원을 줄이면 오히려 일자리가 사라집니다. 시장 원리에 맡기는 것이 더 효율적입니다.",
          coreValue: "공정성 (Fairness) — 시장 질서"
        },
        insight: "같은 정책을 보고도 '누구를 먼저 걱정하는가'가 다릅니다. 진보는 노동자를, 보수는 고용주를 먼저 생각합니다. 어느 쪽이 틀린 게 아니라, 우선순위가 다른 것입니다."
      },
      {
        id: 2,
        newsHeadline: "난민 수용 정책 확대 발표",
        newsDescription: "정부가 국제 난민 수용 규모를 확대하겠다고 발표했다.",
        progressivePerspective: {
          orientationLabel: "진보 시각",
          emoji: "🟠",
          reaction: "인도주의적으로 당연한 조치다",
          reasoning: "고통받는 사람을 돕는 것은 인류 보편적 가치입니다. 다양성이 사회를 더 풍요롭게 합니다.",
          coreValue: "배려 (Care) — 보편적 인류애"
        },
        conservativePerspective: {
          orientationLabel: "보수 시각",
          emoji: "🔵",
          reaction: "우리 국민 먼저 돌봐야 하는 거 아닌가?",
          reasoning: "국내에도 도움이 필요한 사람이 많습니다. 문화적 충돌과 안전 문제도 고려해야 합니다.",
          coreValue: "충성 (Loyalty) — 공동체 보호"
        },
        insight: "진보는 '인류' 단위로 배려하고, 보수는 '우리 공동체' 단위로 배려합니다. 배려의 범위가 다를 뿐, 둘 다 '배려'라는 가치를 실천하고 있습니다."
      },
      {
        id: 3,
        newsHeadline: "학교 역사 교과서 개정 논란",
        newsDescription: "정부가 역사 교과서의 근현대사 서술 방향을 변경하겠다고 밝혔다.",
        progressivePerspective: {
          orientationLabel: "진보 시각",
          emoji: "🟠",
          reaction: "역사를 있는 그대로 가르쳐야 한다",
          reasoning: "과거의 잘못을 직시해야 같은 실수를 반복하지 않습니다. 비판적 역사 인식이 중요합니다.",
          coreValue: "공정성 (Fairness) — 진실 추구"
        },
        conservativePerspective: {
          orientationLabel: "보수 시각",
          emoji: "🔵",
          reaction: "국가에 대한 자긍심도 가르쳐야 한다",
          reasoning: "발전의 역사도 함께 가르쳐야 합니다. 부정적 측면만 강조하면 국민 정체성이 훼손됩니다.",
          coreValue: "충성 (Loyalty) — 국가 정체성"
        },
        insight: "역사 교육의 '목적'에 대한 관점 차이입니다. '비판적 성찰'과 '긍정적 정체성' 모두 교육에 필요하지만, 어디에 무게를 두느냐가 다릅니다."
      },
      {
        id: 4,
        newsHeadline: "대기업 법인세 인상안 발의",
        newsDescription: "여당이 대기업 법인세를 인상하는 법안을 국회에 제출했다.",
        progressivePerspective: {
          orientationLabel: "진보 시각",
          emoji: "🟠",
          reaction: "부의 재분배를 위해 당연하다",
          reasoning: "대기업은 사회 인프라를 이용해 성장했으니 그만큼 사회에 환원해야 합니다.",
          coreValue: "공정성 (Fairness) — 분배 정의"
        },
        conservativePerspective: {
          orientationLabel: "보수 시각",
          emoji: "🔵",
          reaction: "기업 경쟁력이 떨어지면 모두가 손해다",
          reasoning: "세금 부담이 커지면 투자가 줄고, 해외로 이전하면 일자리가 사라집니다.",
          coreValue: "공정성 (Fairness) — 경제적 자유"
        },
        insight: "'공정성'이라는 같은 가치를 추구하면서도, 진보는 '결과의 공정'을, 보수는 '기회의 공정'을 더 중시합니다."
      },
      {
        id: 5,
        newsHeadline: "군 의무복무 기간 단축 검토",
        newsDescription: "국방부가 군 복무 기간을 현행보다 단축하는 방안을 검토 중이다.",
        progressivePerspective: {
          orientationLabel: "진보 시각",
          emoji: "🟠",
          reaction: "청년들의 시간을 돌려줘야 한다",
          reasoning: "개인의 자유와 경력 개발 기회를 위해 복무 기간을 최소화하고 직업군인제를 확대해야 합니다.",
          coreValue: "배려 (Care) — 개인의 권리"
        },
        conservativePerspective: {
          orientationLabel: "보수 시각",
          emoji: "🔵",
          reaction: "안보를 가볍게 보면 안 된다",
          reasoning: "분단국가에서 군 전력 약화는 위험합니다. 국방은 모든 국민의 신성한 의무입니다.",
          coreValue: "충성 (Loyalty) + 권위 (Authority)"
        },
        insight: "안보 이슈에서 진보는 '개인의 희생 최소화'를, 보수는 '공동체의 안전 최대화'를 우선합니다. 두 관점 모두 '사람을 지키려는 마음'에서 출발합니다."
      }
    ];

    return templates.map(t => ({
      id: t.id,
      newsHeadline: t.newsHeadline,
      newsDescription: t.newsDescription,
      userPerspective: isProgressive ? t.progressivePerspective : t.conservativePerspective,
      oppositePerspective: isProgressive ? t.conservativePerspective : t.progressivePerspective,
      insight: t.insight
    }));
  }
}
