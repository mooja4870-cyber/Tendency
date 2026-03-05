import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft } from 'lucide-react';
import { BiasReport, BiasType } from '../domain/model/types';

const BIAS_DEEP_INFO: Record<string, { why: string; tip: string }> = {
  [BiasType.CONFIRMATION]: {
    why: "심리학자 피터 웨이슨(1960)이 발견한 현상으로, 인간은 자신의 기존 믿음을 확인하는 정보는 적극 수용하고 반대 정보는 무시하거나 과소평가합니다. SNS 알고리즘이 이를 더욱 강화합니다.",
    tip: "일주일에 한 번, 자신과 반대되는 입장의 글을 의도적으로 찾아 읽어보세요."
  },
  [BiasType.STATUS_QUO]: {
    why: "대니얼 카너먼과 아모스 트버스키의 전망 이론(1979)에 따르면, 인간은 동일한 크기의 이득보다 손실을 약 2배 크게 느낍니다. 이 때문에 변화의 잠재적 이득보다 현재를 잃을 위험을 더 두려워합니다.",
    tip: "'만약 지금 이 상태가 아니었다면, 현재 상태를 선택했을까?'라고 스스로에게 물어보세요."
  },
  [BiasType.AFFECT_HEURISTIC]: {
    why: "폴 슬로빅(2000)이 명명한 이 편향은, 복잡한 판단을 할 때 논리적 분석 대신 '지금 느끼는 감정'을 기준으로 빠르게 결론을 내리는 경향입니다. 특히 안보·범죄 이슈에서 두드러집니다.",
    tip: "강한 감정이 느껴지는 이슈일수록 24시간 뒤에 다시 생각해 보세요."
  },
  [BiasType.IN_GROUP]: {
    why: "헨리 타지펠의 사회 정체성 이론(1979)에 따르면, 인간은 '우리 편'을 과대평가하고 '그들'을 과소평가하는 자동적 경향이 있습니다. 이는 정치적 양극화의 핵심 동인입니다.",
    tip: "상대 진영의 주장을 '가장 합리적인 버전'으로 재구성해 보세요 (스틸맨 기법)."
  },
  [BiasType.BLIND_SPOT]: {
    why: "에밀리 프로닌(프린스턴, 2002)의 연구에서, 대부분의 사람들은 '다른 사람은 편향되어 있지만 나는 객관적'이라고 믿습니다. 이 메타 편향이 자기 성찰을 방해합니다.",
    tip: "'나도 편향될 수 있다'는 전제를 항상 유지하는 것이 지적 겸손의 시작입니다."
  }
};

interface BiasReportScreenProps {
  biasReport: BiasReport;
  onBack: () => void;
}

export const BiasReportScreen: React.FC<BiasReportScreenProps> = ({ biasReport, onBack }) => {
  const [showDeepInfo, setShowDeepInfo] = useState(false);
  const [shareToast, setShareToast] = useState<string | null>(null);

  const handleShare = async () => {
    const biasNames = biasReport.detectedBiases.map(b => b.title).join(', ');
    const level = biasReport.overallBiasLevel;
    const consistency = biasReport.consistencyScore >= 0.8 ? '높음' : biasReport.consistencyScore >= 0.5 ? '보통' : '낮음';

    const shareText = `🪞 나의 인지편향 거울 결과\n\n` +
      `📊 편향 수준: ${level}\n` +
      `🔍 발견된 편향: ${biasNames || '없음'}\n` +
      `📈 답변 일관성: ${consistency}\n\n` +
      `나도 테스트해 보기 👉 ${window.location.origin}`;

    if (navigator.share) {
      try {
        await navigator.share({ title: 'PoliTest 인지편향 결과', text: shareText });
        return;
      } catch (e) {
        // 사용자가 공유 취소 시 무시
        if ((e as Error).name === 'AbortError') return;
      }
    }

    // 공유 API 미지원 시 클립보드 복사
    try {
      await navigator.clipboard.writeText(shareText);
      setShareToast('클립보드에 복사되었습니다!');
    } catch {
      setShareToast('공유 텍스트를 복사할 수 없습니다.');
    }
    setTimeout(() => setShareToast(null), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="min-h-full bg-[#FAFAFA] pb-20"
    >
      <div className="max-w-md mx-auto px-4 pt-8 space-y-6">
        <div className="flex items-center gap-4 mb-4">
          <button onClick={onBack} className="p-2 hover:bg-black/5 rounded-full transition-colors">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h2 className="text-6xl font-display font-extrabold tracking-tight">인지편향 거울</h2>
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-black/5">
            <h3 className="text-4xl font-display font-extrabold mb-4 flex items-center gap-2 tracking-tight">
              <span className="text-6xl">🪞</span> 발견된 인지 편향
            </h3>
            <div className="mb-6">
              <div className="text-[15px] font-bold text-black/30 uppercase mb-1">편향 수준</div>
              <div className="inline-block px-2 py-1 rounded bg-red-50 text-red-600 text-[15px] font-bold">
                {biasReport.overallBiasLevel}
              </div>
            </div>
            {biasReport.detectedBiases.length > 0 ? (
              biasReport.detectedBiases.map((bias, i) => (
                <div key={i} className="bg-red-50/50 p-4 rounded-xl mb-3 border border-red-100">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-4xl">🔍</span>
                    <span className="font-bold text-red-900">{bias.title}</span>
                  </div>
                  <p className="text-xl text-red-800/70 leading-relaxed mb-2">
                    {bias.description}
                  </p>
                  {bias.evidence && (
                    <div className="space-y-2 mb-3">
                      {bias.evidence.split('\n\n').map((ev: string, j: number) => (
                        <p key={j} className="text-[17px] text-red-900/80 leading-relaxed bg-white/60 p-2.5 rounded-lg border border-red-100/50">
                          📌 {ev}
                        </p>
                      ))}
                    </div>
                  )}
                  <div className="bg-white/50 p-3 rounded-lg text-[17px] italic text-red-900/60">
                    "{bias.quote}"
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-10 text-black/40 text-2xl">
                탐지된 주요 편향이 없습니다. 매우 객관적인 답변 패턴을 보이셨습니다!
              </div>
            )}

            <div className="mt-8 pt-6 border-t border-black/10">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xl font-bold text-black/60">답변 일관성</span>
                <span className="text-xl font-bold text-black/60">
                  {biasReport.consistencyScore >= 0.8 ? '높음' : biasReport.consistencyScore >= 0.5 ? '보통' : '낮음'}
                </span>
              </div>
              <div className="h-3 w-full bg-black/10 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${biasReport.consistencyScore * 100}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                  className={`h-full rounded-full ${biasReport.consistencyScore >= 0.8 ? 'bg-emerald-500' :
                    biasReport.consistencyScore >= 0.5 ? 'bg-amber-400' : 'bg-red-400'
                    }`}
                />
              </div>
            </div>
          </div>

          {/* 더 알아보기 펼침 영역 */}
          <AnimatePresence>
            {showDeepInfo && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-black/5 space-y-5">
                  <h3 className="text-4xl font-display font-extrabold flex items-center gap-2 tracking-tight">
                    <span className="text-6xl">🧠</span> 편향의 심리학적 배경
                  </h3>
                  {biasReport.detectedBiases.map((bias, i) => {
                    const info = BIAS_DEEP_INFO[bias.biasType];
                    if (!info) return null;
                    return (
                      <div key={i} className="bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                        <div className="font-bold text-2xl text-blue-900 mb-2">
                          📖 {bias.title}
                        </div>
                        <p className="text-xl text-blue-900/70 leading-relaxed mb-3">
                          {info.why}
                        </p>
                        <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-100">
                          <div className="text-[15px] font-bold text-emerald-700 mb-1">💡 실천 팁</div>
                          <p className="text-xl text-emerald-800/80 leading-relaxed">
                            {info.tip}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex gap-3">
            <button
              onClick={handleShare}
              className="flex-1 bg-white border border-black/10 h-12 rounded-xl text-2xl font-bold shadow-sm active:scale-95 transition-transform"
            >
              공유 카드 생성
            </button>
            <button
              onClick={() => setShowDeepInfo(prev => !prev)}
              className={`flex-1 h-12 rounded-xl text-2xl font-bold shadow-sm active:scale-95 transition-all ${showDeepInfo
                ? 'bg-gray-600 text-white'
                : 'bg-black text-white'
                }`}
            >
              {showDeepInfo ? '접기' : '더 알아보기'}
            </button>
          </div>
        </div>
      </div>

      {/* 공유 토스트 */}
      <AnimatePresence>
        {shareToast && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-black/80 text-white text-2xl font-medium px-5 py-3 rounded-full shadow-lg z-50"
          >
            {shareToast}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

