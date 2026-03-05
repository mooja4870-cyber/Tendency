import React from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { EmpathyScenario } from '../domain/model/types';

interface EmpathyScreenProps {
  scenarios: EmpathyScenario[];
  onSelectScenario: (id: number) => void;
  onBack: () => void;
}

export const EmpathyScreen: React.FC<EmpathyScreenProps> = ({ scenarios, onSelectScenario, onBack }) => {
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
          <h2 className="text-6xl font-display font-extrabold tracking-tight">반대편의 눈</h2>
        </div>

        <div className="space-y-3">
          <p className="text-2xl text-black/40 font-bold px-1 mb-2">시나리오를 선택하여 반대편의 시각을 확인해보세요.</p>
          {scenarios.map(scenario => (
            <motion.button
              key={scenario.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onSelectScenario(scenario.id)}
              className="w-full bg-white rounded-2xl p-5 shadow-sm border border-black/5 text-left flex justify-between items-center group"
            >
              <div className="flex-1 pr-4">
                <div className="inline-block bg-red-500 text-white px-2 py-0.5 rounded text-[8px] font-black mb-2">HOT</div>
                <h3 className="text-2xl font-bold leading-tight group-hover:text-cta transition-colors">{scenario.newsHeadline}</h3>
              </div>
              <ChevronRight className="w-5 h-5 text-black/20 group-hover:text-cta transition-colors" />
            </motion.button>
          ))}
        </div>
      </div>
    </motion.div>
  );
};
