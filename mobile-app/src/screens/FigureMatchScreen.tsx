import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft } from 'lucide-react';
import { FigureMatch } from '../domain/model/types';

interface FigureMatchScreenProps {
  matches: FigureMatch[];
  onBack: () => void;
}

/** 마지막 글자에 받침이 있으면 true */
const hasBatchim = (str: string) => {
  const lastChar = str.charCodeAt(str.length - 1);
  // 한글 유니코드 범위: 0xAC00 ~ 0xD7A3
  if (lastChar < 0xAC00 || lastChar > 0xD7A3) return false;
  return (lastChar - 0xAC00) % 28 !== 0;
};

export const FigureMatchScreen: React.FC<FigureMatchScreenProps> = ({ matches, onBack }) => {
  const [toast, setToast] = useState('');

  const handleShare = async () => {
    const name = matches[0]?.figure.nameKorean || '역사인물';
    const suffix = hasBatchim(name) ? '이래' : '래';
    const text = `🎭 PoliTest 결과: 나는 ${name}${suffix}!\n\n` +
      matches.map((m, i) => `${i === 0 ? '🏆' : `${i + 1}위`} ${m.figure.nameKorean} - ${m.figure.shortDescription}`).join('\n') +
      `\n\n당신과 닮은 역사 인물을 확인해보세요!`;

    try {
      if (navigator.share) {
        await navigator.share({ title: 'PoliTest 역사인물 매칭', text });
      } else {
        await navigator.clipboard.writeText(text);
        setToast('📋 클립보드에 복사되었습니다!');
        setTimeout(() => setToast(''), 2500);
      }
    } catch (e) {
      try {
        await navigator.clipboard.writeText(text);
        setToast('📋 클립보드에 복사되었습니다!');
        setTimeout(() => setToast(''), 2500);
      } catch {
        setToast('공유에 실패했습니다');
        setTimeout(() => setToast(''), 2500);
      }
    }
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
          <h2 className="text-2xl font-display font-extrabold tracking-tight">역사인물 매칭</h2>
        </div>

        <div className="space-y-4">
          {matches.map((match, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.15 }}
              className={`${i === 0 ? 'bg-white p-8' : 'bg-white p-6'} rounded-2xl shadow-sm border border-black/5 text-center`}
            >
              {/* Rank Badge */}
              <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black mb-4 ${i === 0 ? 'bg-amber-100 text-amber-700' : 'bg-black/5 text-black/40'
                }`}>
                {i === 0 ? '🏆' : `${i + 1}위`} {i === 0 ? '가장 닮은 인물' : '유사 인물'}
              </div>

              <img
                src={match.figure.imageRes}
                alt={match.figure.name}
                className={`${i === 0 ? 'w-32 h-32' : 'w-24 h-24'} mx-auto mb-4 rounded-full shadow-md object-cover border-4 border-white`}
                referrerPolicy="no-referrer"
              />
              <h3 className={`${i === 0 ? 'text-2xl' : 'text-xl'} font-black mb-1`}>{match.figure.nameKorean}</h3>
              <p className="text-cta text-sm font-bold mb-4">{match.figure.shortDescription}</p>

              {/* Tags - for ALL figures */}
              <div className="flex flex-wrap justify-center gap-2 mb-5">
                {match.commonTraits.map((trait, j) => (
                  <span key={j} className="px-2 py-1 bg-black/5 rounded text-[10px] font-bold text-black/60">
                    #{trait}
                  </span>
                ))}
              </div>

              {/* Match Reason - for ALL figures */}
              <div className="p-4 bg-black/[0.03] rounded-xl text-left mb-4">
                <h4 className="text-[10px] font-black uppercase text-black/30 mb-1">매칭 이유</h4>
                <p className="text-sm leading-relaxed">{match.matchReason}</p>
              </div>

              {/* Famous Quote - for ALL figures */}
              <div className="italic text-xs text-black/40 px-4">
                "{match.figure.famousQuote}"
              </div>
            </motion.div>
          ))}

          <button
            onClick={handleShare}
            className="w-full bg-black text-white h-14 rounded-2xl font-bold shadow-lg active:scale-95 transition-transform"
          >
            공유: "나는 {matches[0]?.figure.nameKorean}{hasBatchim(matches[0]?.figure.nameKorean || '') ? '이래' : '래'}!"
          </button>
        </div>
      </div>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-black/90 text-white px-6 py-3 rounded-full text-sm font-bold shadow-xl z-50"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

