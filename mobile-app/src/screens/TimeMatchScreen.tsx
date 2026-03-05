import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronDown } from 'lucide-react';
import { CountryMatch } from '../domain/model/types';

interface TimeMatchScreenProps {
  matches: CountryMatch[];
  onBack: () => void;
}

const getLabelColor = (label: string) => {
  if (label.includes('극보수')) return { bg: 'bg-blue-900', text: 'text-white' };
  if (label.includes('보수')) return { bg: 'bg-blue-500', text: 'text-white' };
  if (label.includes('중도')) return { bg: 'bg-gray-400', text: 'text-white' };
  if (label.includes('극진보')) return { bg: 'bg-orange-700', text: 'text-white' };
  if (label.includes('진보')) return { bg: 'bg-orange-500', text: 'text-white' };
  return { bg: 'bg-gray-300', text: 'text-black' };
};

const getLabelPosition = (label: string) => {
  if (label === '극보수') return 7;
  if (label === '보수') return 21;
  if (label === '중도보수') return 36;
  if (label === '중도') return 50;
  if (label === '중도진보') return 64;
  if (label === '진보') return 79;
  if (label === '극진보') return 93;
  return 50;
};

export const TimeMatchScreen: React.FC<TimeMatchScreenProps> = ({ matches, onBack }) => {
  const [showAll, setShowAll] = useState(false);
  const displayMatches = showAll ? matches : matches.slice(0, 3);

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
          <h2 className="text-2xl font-display font-extrabold tracking-tight">시대·국가 매칭</h2>
        </div>

        <div className="space-y-4">
          {/* Hero Section */}
          <div className="relative overflow-hidden rounded-2xl p-6 text-center"
            style={{ background: 'linear-gradient(135deg, #667EEA 0%, #764BA2 100%)' }}
          >
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-4 left-8 text-6xl">🌏</div>
              <div className="absolute bottom-4 right-8 text-5xl">🌍</div>
              <div className="absolute top-12 right-16 text-4xl">🌎</div>
            </div>
            <div className="relative z-10">
              <p className="text-white/60 text-xs font-bold mb-2">만약 다른 나라, 다른 시대에 태어났다면?</p>
              <h3 className="text-white text-xl font-display font-black mb-1 tracking-tight">당신의 관점/성향은</h3>
              <p className="text-white/80 text-sm">어떤 위치에 놓이게 될까요?</p>
            </div>
          </div>

          {/* Country Cards */}
          <div className="space-y-4">
            <AnimatePresence>
              {displayMatches.map((match, i) => {
                const labelStyle = getLabelColor(match.equivalentLabel);
                const position = getLabelPosition(match.equivalentLabel);

                return (
                  <motion.div
                    key={match.countryCode}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="bg-white rounded-2xl p-6 shadow-sm border border-black/5"
                  >
                    <div className="flex items-center gap-4 mb-4">
                      <div className="text-5xl">{match.flagEmoji}</div>
                      <div className="flex-1">
                        <h3 className="text-xl font-black">{match.countryName}</h3>
                        <p className="text-black/40 text-xs font-bold">{match.era}</p>
                      </div>
                      <div className={`${labelStyle.bg} ${labelStyle.text} px-3 py-1.5 rounded-full text-xs font-black`}>
                        {match.equivalentLabel}
                      </div>
                    </div>

                    {/* Mini Spectrum */}
                    <div className="mb-4">
                      <div className="flex justify-between text-[9px] font-bold text-black/25 mb-1">
                        <span>보수</span>
                        <span>진보</span>
                      </div>
                      <div className="relative h-2 w-full rounded-full overflow-hidden bg-gray-100">
                        <div
                          className="absolute inset-0 opacity-40"
                          style={{ background: 'linear-gradient(to right, #1B3A6B, #4A7FC7, #AEAEAE, #E8944F, #D97B4A)' }}
                        />
                        <motion.div
                          initial={{ left: '50%' }}
                          animate={{ left: `${position}%` }}
                          transition={{ type: 'spring', damping: 20, stiffness: 100, delay: i * 0.1 + 0.3 }}
                          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3.5 h-3.5 bg-white border-[2px] border-black rounded-full shadow-md z-10"
                        />
                      </div>
                    </div>

                    {match.surprise && (
                      <div className="p-3 bg-amber-50 rounded-xl border border-amber-100 mb-3">
                        <h4 className="text-[10px] font-black uppercase text-amber-500 mb-1">📌 의외의 사실</h4>
                        <p className="text-xs font-medium text-amber-900/80">{match.surprise}</p>
                      </div>
                    )}

                    <p className="text-xs text-black/50 leading-relaxed">
                      {match.explanation}
                    </p>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {/* Show All Button */}
          {!showAll && matches.length > 3 && (
            <button
              onClick={() => setShowAll(true)}
              className="w-full bg-white border border-black/10 h-12 rounded-xl text-sm font-bold text-black/50 flex items-center justify-center gap-1 shadow-sm active:scale-95 transition-transform"
            >
              {matches.length - 3}개 나라 더 보기 <ChevronDown className="w-4 h-4" />
            </button>
          )}

          {/* Insight */}
          <div className="p-6 bg-indigo-50 rounded-2xl border border-indigo-100">
            <h4 className="text-[10px] font-black uppercase text-indigo-400 mb-2">💡 인사이트</h4>
            <p className="text-sm text-indigo-900/70 font-medium leading-relaxed">
              관점/성향은 시대와 장소에 따라 상대적으로 해석됩니다. 당신의 생각은 특정 환경에서 가장 빛을 발할 수 있습니다.
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

