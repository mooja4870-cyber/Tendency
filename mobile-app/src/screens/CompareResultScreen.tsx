import React from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, Share2 } from 'lucide-react';
import { CompatibilityResult } from '../domain/model/types';

interface CompareResultScreenProps {
  compatibility: CompatibilityResult;
  onBack: () => void;
}

export const CompareResultScreen: React.FC<CompareResultScreenProps> = ({ compatibility, onBack }) => {
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
          <h2 className="text-2xl font-bold">궁합 분석 결과</h2>
        </div>

        <div className="bg-white rounded-2xl p-8 shadow-sm border border-black/5 text-center">
          <div className="text-5xl mb-4">💖</div>
          <h3 className="text-sm font-bold text-black/40 uppercase tracking-widest mb-2">우리의 관계는</h3>
          <h2 className="text-3xl font-black text-cta mb-6">"{compatibility.overallCompatibility}"</h2>

          <div className="space-y-6 text-left">
            <div>
              <h4 className="text-[10px] font-black text-black/30 uppercase mb-3">공통된 가치관</h4>
              <div className="flex flex-wrap gap-2">
                {compatibility.sharedValues.map((val, i) => (
                  <span key={i} className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-bold">
                    #{val}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-[10px] font-black text-black/30 uppercase mb-3">차이가 있는 분야</h4>
              <div className="flex flex-wrap gap-2">
                {compatibility.conflictAreas.map((val, i) => (
                  <span key={i} className="px-3 py-1 bg-red-50 text-red-700 rounded-full text-xs font-bold">
                    #{val}
                  </span>
                ))}
              </div>
            </div>

            <div className="p-4 bg-black/5 rounded-xl">
              <h4 className="text-[10px] font-black uppercase text-black/30 mb-2">대화 가이드</h4>
              <div className="space-y-3">
                {compatibility.adviceList.map((advice, i) => (
                  <div key={i}>
                    <div className="text-xs font-bold mb-1">📍 {advice.area}</div>
                    <p className="text-xs text-black/60 leading-relaxed">{advice.advice}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <button className="w-full bg-cta text-white h-14 rounded-2xl font-bold shadow-lg active:scale-95 transition-transform flex items-center justify-center gap-2">
          <Share2 className="w-5 h-5" /> 궁합 결과 공유하기
        </button>
      </div>
    </motion.div>
  );
};
