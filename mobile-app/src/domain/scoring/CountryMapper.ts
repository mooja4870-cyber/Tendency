import { DiagnosisResult, CountryMatch } from '../model/types';

interface CountrySpectrum {
  code: string;
  displayName: string;
  windowStart: number;
  windowEnd: number;
  center: number;
}

export class CountryMapper {
  private static FLAG_MAP: Record<string, string> = {
    'KR': '🇰🇷', 'US': '🇺🇸', 'SE': '🇸🇪', 'JP': '🇯🇵',
    'DE': '🇩🇪', 'FR': '🇫🇷', 'GB': '🇬🇧'
  };

  private countrySpectrums: CountrySpectrum[] = [
    { code: "KR_NOW", displayName: "🇰🇷 한국 (현재)", windowStart: 0.25, windowEnd: 0.75, center: 0.50 },
    { code: "KR_1980", displayName: "🇰🇷 한국 (1980)", windowStart: 0.10, windowEnd: 0.50, center: 0.30 },
    { code: "US_NOW", displayName: "🇺🇸 미국 (현재)", windowStart: 0.20, windowEnd: 0.65, center: 0.42 },
    { code: "SE_NOW", displayName: "🇸🇪 스웨덴 (현재)", windowStart: 0.55, windowEnd: 0.95, center: 0.75 },
    { code: "JP_NOW", displayName: "🇯🇵 일본 (현재)", windowStart: 0.15, windowEnd: 0.55, center: 0.35 },
    { code: "DE_NOW", displayName: "🇩🇪 독일 (현재)", windowStart: 0.40, windowEnd: 0.80, center: 0.60 },
    { code: "FR_NOW", displayName: "🇫🇷 프랑스 (현재)", windowStart: 0.35, windowEnd: 0.80, center: 0.55 },
    { code: "GB_NOW", displayName: "🇬🇧 영국 (현재)", windowStart: 0.30, windowEnd: 0.70, center: 0.50 }
  ];

  match(result: DiagnosisResult): CountryMatch[] {
    const userPosition = result.overallPosition;

    return this.countrySpectrums.map(spectrum => {
      const relativePosition = this.mapPosition(userPosition, spectrum);
      const localLabel = this.positionToLocalLabel(relativePosition);
      const isSurprising = this.isSurprisingResult(userPosition, relativePosition);
      const countryCode = spectrum.code.split('_')[0];

      return {
        countryCode: spectrum.code,
        countryName: spectrum.displayName.split(' ').slice(1).join(' ').replace(/[()]/g, ''),
        flagEmoji: CountryMapper.FLAG_MAP[countryCode] || '🌍',
        era: spectrum.code.includes("1980") ? "1980년대" : "현재",
        equivalentLabel: localLabel,
        surprise: isSurprising ? this.generateSurprise(spectrum, userPosition, relativePosition) : "",
        explanation: this.generateExplanation(spectrum)
      };
    }).sort((a, b) => (b.surprise !== "" ? 1 : 0) - (a.surprise !== "" ? 1 : 0));
  }

  private mapPosition(userPos: number, spectrum: CountrySpectrum): number {
    const range = spectrum.windowEnd - spectrum.windowStart;
    const relPos = (userPos - spectrum.windowStart) / range;
    return Math.max(0, Math.min(1, relPos));
  }

  private positionToLocalLabel(localPos: number): string {
    if (localPos < 0.15) return "극보수";
    if (localPos < 0.30) return "보수";
    if (localPos < 0.45) return "중도보수";
    if (localPos < 0.55) return "중도";
    if (localPos < 0.70) return "중도진보";
    if (localPos < 0.85) return "진보";
    return "극진보";
  }

  private isSurprisingResult(userPos: number, localPos: number): boolean {
    const userSide = userPos > 0.5 ? "진보" : "보수";
    const localSide = localPos > 0.5 ? "진보" : "보수";
    return userSide !== localSide;
  }

  private generateSurprise(spectrum: CountrySpectrum, userPos: number, localPos: number): string {
    const userSide = userPos > 0.5 ? "진보" : "보수";
    const localSide = localPos > 0.5 ? "진보" : "보수";
    return `${spectrum.displayName}에서 당신은 '${localSide}'에 해당합니다! 한국에서는 ${userSide}인데 말이죠 😮`;
  }

  private generateExplanation(spectrum: CountrySpectrum): string {
    switch (spectrum.code) {
      case "KR_1980":
        return "1980년 한국은 전체적으로 보수 성향이 강했습니다. 지금의 당신이라면 민주화 운동에 공감했을 가능성이 높습니다.";
      case "SE_NOW":
        return "스웨덴은 전체 정치 스펙트럼이 한국보다 훨씬 좌측에 위치합니다. 한국의 진보도 스웨덴 기준으로는 중도~보수일 수 있습니다.";
      case "JP_NOW":
        return "일본은 전체적으로 보수 성향이 강한 사회입니다. 한국의 중도 성향도 일본에서는 진보적으로 분류될 수 있습니다.";
      case "US_NOW":
        return "미국은 양극화가 심하고, 오버턴 윈도우가 한국보다 우측에 있습니다.";
      default:
        return "각 나라마다 '중도'의 기준이 다릅니다. 진보와 보수는 절대적이지 않습니다.";
    }
  }
}
