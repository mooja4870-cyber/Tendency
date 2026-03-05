import { QuestionCategory } from '../domain/model/types';
import { AppState } from '../context/AppContext';

export class ShareService {
  /**
   * 공유 타입별 카드 텍스트 생성
   * 인스타 스토리, 카카오톡 등에 최적화
   */
  static generateShareText(type: string, state: AppState): string {
    const result = state.result;
    if (!result) return '🔮 프리즘에서 나의 관점/성향을 확인해보세요! 👉 [앱 링크]';

    const appLink = window.location.origin;

    switch (type) {
      case 'result':
        return [
          '🔮 프리즘 - 나의 관점/성향 진단',
          '',
          `나의 성향: ${result.overallLabel}`,
          `📍 보수 ◄━━━━━●━━━━► 진보`,
          '',
          result.figureMatches?.[0] ? `🎭 닮은 인물: ${result.figureMatches[0].figure.nameKorean}` : '',
          result.countryMatches?.[0]?.surprise ? `🌍 ${result.countryMatches[0].surprise}` : '',
          '',
          `너도 해볼래? 👉 ${appLink}`
        ].filter(Boolean).join('\n');

      case 'bias':
        return [
          '🪞 프리즘 - 나의 인지 편향 리포트',
          '',
          `발견된 편향 ${result.biasReport.detectedBiases.length}개:`,
          ...result.biasReport.detectedBiases.map(bias => `• ${bias.title}`),
          '',
          result.biasReport.detectedBiases[0]?.quote ? `"${result.biasReport.detectedBiases[0].quote}"` : '',
          '',
          `내 편향 확인하기 👉 ${appLink}`
        ].filter(Boolean).join('\n');

      case 'country':
        return [
          '🌍 프리즘 - 시대·국가 매칭',
          '',
          `나의 성향(${result.overallLabel})으로 보면...`,
          '',
          ...result.countryMatches.slice(0, 4).map(match =>
            `${match.countryName} → ${match.equivalentLabel}${match.surprise ? ' 😮' : ''}`
          ),
          '',
          '진보와 보수는 절대적이지 않다!',
          `너는 어느 나라에서 뭐래? 👉 ${appLink}`
        ].filter(Boolean).join('\n');

      case 'figure': {
        const top = result.figureMatches?.[0];
        if (!top) return '';
        return [
          '🎭 프리즘 - 나와 닮은 역사 인물',
          '',
          `${top.figure.flagEmoji} ${top.figure.nameKorean}`,
          `"${top.figure.famousQuote}"`,
          '',
          '공통점:',
          ...top.commonTraits.map(trait => `✅ ${trait}`),
          '',
          `나는 누구일까? 👉 ${appLink}`
        ].filter(Boolean).join('\n');
      }

      case 'compatibility': {
        const compat = state.compatibility;
        if (!compat) return '';
        return [
          '💕 프리즘 - 관점/성향 궁합',
          '',
          `${compat.overallCompatibility}!`,
          '',
          `나: ${compat.myResult.overallLabel}`,
          `상대: ${compat.partnerResult.overallLabel}`,
          '',
          ...compat.categoryComparisons.slice(0, 4).map(comp =>
            `${this.getGapEmoji(comp.gapLevel)} ${this.categoryEmoji(comp.category)} ${comp.gapLevel}`
          ),
          '',
          `우리 궁합은? 👉 ${appLink}`
        ].filter(Boolean).join('\n');
      }

      case 'bubble': {
        const bubble = state.bubbleReport;
        if (!bubble) return '';
        return [
          '🫧 프리즘 - 필터 버블 진단',
          '',
          `정보 다양성: ${bubble.diversityLevel}`,
          `${bubble.biasDirection}`,
          '',
          '당신은 얼마나 편향된 정보를 소비하고 있나요?',
          `확인하기 👉 ${appLink}`
        ].filter(Boolean).join('\n');
      }

      default:
        return `🔮 프리즘에서 나의 관점/성향을 확인해보세요! 👉 ${appLink}`;
    }
  }

  private static getGapEmoji(gap: string): string {
    if (gap.includes('매우')) return '🔥';
    if (gap.includes('차이')) return '⚡';
    return '✨';
  }

  private static categoryEmoji(cat: QuestionCategory): string {
    switch (cat) {
      case QuestionCategory.ECONOMY: return '💰';
      case QuestionCategory.WELFARE: return '🏥';
      case QuestionCategory.SECURITY: return '🛡️';
      case QuestionCategory.CULTURE: return '🌍';
      case QuestionCategory.ENVIRONMENT: return '🌿';
      case QuestionCategory.RIGHTS: return '⚖️';
      case QuestionCategory.TRADITION: return '🏛️';
      case QuestionCategory.GOVERNANCE: return '🏢';
      default: return '❓';
    }
  }

  static async share(type: string, state: AppState) {
    const text = this.generateShareText(type, state);

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'PoliTest 결과 공유',
          text: text,
        });
      } catch (err) {
        console.error('Error sharing', err);
        this.copyToClipboard(text);
      }
    } else {
      this.copyToClipboard(text);
    }
  }

  private static copyToClipboard(text: string) {
    navigator.clipboard.writeText(text).then(() => {
      alert('결과가 클립보드에 복사되었습니다!');
    });
  }
}
