import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play } from 'lucide-react';

interface OnboardingScreenProps {
  onStart: () => void;
}

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onStart }) => {
  const [onboardingIndex, setOnboardingIndex] = useState(0);

  return (
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -100 }}
      className="max-w-md mx-auto px-6 flex flex-col h-full bg-[#FAFAFA]"
      style={{ paddingTop: 'max(env(safe-area-inset-top, 0px), 1.5rem)', paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 1rem)' }}
    >
      {/* 스크롤 가능한 콘텐츠 영역 */}
      <div className="flex-1 flex flex-col justify-center overflow-y-auto min-h-0 py-4">
        <div className="space-y-6 flex flex-col justify-center">
          <div>
            <motion.p
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
              className="text-center text-[54px] font-black text-cta mb-3 tracking-tight"
            >
              "1분 완성"
            </motion.p>
            <div className="flex gap-1">
              {[0, 1, 2].map(i => (
                <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i === onboardingIndex ? 'bg-cta' : 'bg-black/5'}`} />
              ))}
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={onboardingIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center flex flex-col items-center"
            >
              {onboardingIndex === 0 && (
                <>
                  <div className="inline-flex flex-col items-center bg-[#A41034]/10 border border-[#A41034]/20 rounded-2xl px-5 py-2.5 mb-5">
                    <span className="text-5xl mb-0.5">🎓</span>
                    <span className="text-[17px] font-black text-[#A41034] tracking-tight">Harvard University</span>
                    <span className="text-[17px] font-black text-[#A41034] tracking-tight">연구 기반</span>
                  </div>
                  <h2 className="text-6xl font-display font-extrabold leading-tight mb-4 tracking-tight">
                    나도 몰랐던 <br />
                    나의 <span className="gradient-text-warm">관점·성향</span>을 <br />
                    발견하세요 !
                  </h2>
                  <p className="text-3xl text-[#666666] leading-relaxed mb-3" style={{ textWrap: 'balance' }}>
                    30개의 질문을 통해 당신의 관점·성향을 정밀하게 분석합니다.
                  </p>
                  <p className="text-xl text-[#999999] leading-relaxed" style={{ textWrap: 'balance' }}>
                    본 진단은 미국 하버드 대학교 Jonathan Haidt 교수의
                    <span className="font-bold text-[#777777]"> Moral Foundations Theory</span>(도덕적 기반 이론)
                    연구 결과를 근거로 설계되었습니다.
                  </p>
                </>
              )}
              {onboardingIndex === 1 && (
                <>
                  <h2 className="text-6xl font-display font-extrabold leading-tight mb-4 tracking-tight" style={{ textWrap: 'balance' }}>
                    <span className="gradient-text-cool">도덕적 기반</span> <br />
                    이론에 근거한 <br />
                    심층 분석
                  </h2>
                  <p className="text-3xl text-center-deep leading-relaxed" style={{ textWrap: 'balance' }}>
                    단순한 보수/진보를 넘어 5가지 도덕적 가치를 측정합니다.
                  </p>
                </>
              )}
              {onboardingIndex === 2 && (
                <>
                  <h2 className="text-6xl font-display font-extrabold leading-tight mb-4 tracking-tight" style={{ textWrap: 'balance' }}>
                    나와 닮은 <br />
                    <span className="gradient-text-sunset">캐릭터</span>와 <br />
                    함께 확인하세요
                  </h2>
                  <p className="text-3xl text-center-deep leading-relaxed" style={{ textWrap: 'balance' }}>
                    분석 결과에 따른 맞춤형 캐릭터와 피드백을 제공합니다.
                  </p>
                </>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* 하단 버튼 - 항상 보이도록 shrink-0 */}
      <div className="shrink-0 pb-2 pt-3 flex gap-3">
        {onboardingIndex > 0 && (
          <button
            onClick={() => setOnboardingIndex(prev => prev - 1)}
            className="flex-1 bg-black/5 text-black/60 rounded-full py-4 flex items-center justify-center gap-1 font-bold active:scale-95 transition-transform"
          >
            ⬅️ 이전
          </button>
        )}

        {onboardingIndex < 2 ? (
          <button
            onClick={() => setOnboardingIndex(prev => prev + 1)}
            className="flex-[2] bg-cta text-white rounded-full py-4 flex items-center justify-center gap-2 font-bold shadow-lg shadow-cta/20 active:scale-95 transition-transform"
          >
            다음으로
          </button>
        ) : (
          <button
            onClick={onStart}
            className="flex-[2] bg-cta text-white rounded-full py-4 flex items-center justify-center gap-2 font-bold shadow-lg shadow-cta/20 active:scale-95 transition-transform"
          >
            진단 시작하기 🚀
          </button>
        )}
      </div>
    </motion.div>
  );
};
