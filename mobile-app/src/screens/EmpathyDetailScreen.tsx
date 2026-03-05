import React from 'react';
import { motion } from 'motion/react';
import { ChevronLeft } from 'lucide-react';
import { EmpathyScenario } from '../domain/model/types';

interface EmpathyDetailScreenProps {
  scenario: EmpathyScenario;
  onBack: () => void;
}

export const EmpathyDetailScreen: React.FC<EmpathyDetailScreenProps> = ({ scenario, onBack }) => {
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
          <h2 className="text-2xl font-bold">시나리오 분석</h2>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-black/5">
          <h3 className="text-lg font-bold mb-2 leading-tight">{scenario.newsHeadline}</h3>
          <p className="text-xs text-black/40 mb-6 leading-relaxed">{scenario.newsDescription}</p>

          <div className="space-y-3 mb-6">
            <div className="p-4 bg-black/5 rounded-xl border border-black/5">
              <div className="flex items-center gap-2 mb-2">
                <span>{scenario.userPerspective.emoji}</span>
                <span className="text-[10px] font-black uppercase text-black/40">{scenario.userPerspective.orientationLabel} (나)</span>
              </div>
              <p className="text-sm font-bold mb-1">{scenario.userPerspective.reaction}</p>
              <p className="text-xs text-black/60">{scenario.userPerspective.reasoning}</p>
            </div>

            <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-100">
              <div className="flex items-center gap-2 mb-2">
                <span>{scenario.oppositePerspective.emoji}</span>
                <span className="text-[10px] font-black uppercase text-indigo-400">{scenario.oppositePerspective.orientationLabel}</span>
              </div>
              <p className="text-sm font-bold text-indigo-900 mb-1">{scenario.oppositePerspective.reaction}</p>
              <p className="text-xs text-indigo-800/70">{scenario.oppositePerspective.reasoning}</p>
              <div className="mt-3 pt-3 border-t border-indigo-100 flex items-center justify-between">
                <span className="text-[10px] font-bold text-indigo-300">핵심 가치</span>
                <span className="text-[10px] font-black text-indigo-500">{scenario.oppositePerspective.coreValue}</span>
              </div>
            </div>
          </div>

          <div className="p-4 bg-amber-50 rounded-xl border border-amber-100">
            <h4 className="text-[10px] font-black uppercase text-amber-500 mb-1">인사이트</h4>
            <p className="text-xs text-amber-900/70 font-medium leading-relaxed">{scenario.insight}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
