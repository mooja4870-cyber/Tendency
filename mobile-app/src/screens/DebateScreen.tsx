import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ChevronLeft } from 'lucide-react';
import { DebateTopic, DebateChoice, OrientationLabel } from '../domain/model/types';

interface DebateScreenProps {
  topic?: DebateTopic | null;
  userLabel: OrientationLabel;
  onVote: (choice: DebateChoice) => void;
  onBack: () => void;
}

export const DebateScreen: React.FC<DebateScreenProps> = ({ topic, userLabel, onVote, onBack }) => {
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
          <h2 className="text-2xl font-bold">주간 토론 카드</h2>
        </div>

        {!topic ? (
          <div className="bg-white rounded-2xl p-10 mt-10 shadow-sm border border-black/5 flex flex-col items-center justify-center text-center">
            <span className="text-5xl mb-4">🚧</span>
            <h3 className="text-xl font-black mb-2 tracking-tight">Coming Soon</h3>
            <p className="text-sm text-black/40 leading-relaxed font-medium">
              다음 버전에 정식 토론 기능이<br />업데이트될 예정입니다.<br />조금만 기다려주세요!
            </p>
          </div>
        ) : (

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-black/5">
            <div className="flex justify-between items-start mb-4">
              <div className="bg-black text-white px-2 py-1 rounded text-[10px] font-black">WEEKLY #{topic.weekNumber}</div>
              <div className="text-[10px] font-bold text-black/30">{topic.relatedCategory}</div>
            </div>
            <h3 className="text-xl font-bold mb-2 leading-tight">{topic.title}</h3>
            <p className="text-xs text-black/40 mb-8 leading-relaxed">{topic.description}</p>

            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="text-[10px] font-black text-prog-deep uppercase text-center">찬성 논거</div>
                  {topic.proArguments.map((arg, i) => (
                    <div key={i} className="p-3 bg-prog-deep/5 rounded-xl text-[11px] font-medium text-prog-deep leading-relaxed">
                      {arg}
                    </div>
                  ))}
                </div>
                <div className="space-y-3">
                  <div className="text-[10px] font-black text-cons-deep uppercase text-center">반대 논거</div>
                  {topic.conArguments.map((arg, i) => (
                    <div key={i} className="p-3 bg-cons-deep/5 rounded-xl text-[11px] font-medium text-cons-deep leading-relaxed">
                      {arg}
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-black/5">
                <h4 className="text-[10px] font-black text-black/30 uppercase text-center mb-4">당신의 선택은?</h4>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => onVote(DebateChoice.AGREE)}
                    className="h-12 rounded-xl border border-black/10 text-xs font-bold active:bg-black active:text-white transition-colors"
                  >
                    찬성
                  </button>
                  <button
                    onClick={() => onVote(DebateChoice.UNSURE)}
                    className="h-12 rounded-xl border border-black/10 text-xs font-bold active:bg-black active:text-white transition-colors"
                  >
                    중립
                  </button>
                  <button
                    onClick={() => onVote(DebateChoice.DISAGREE)}
                    className="h-12 rounded-xl border border-black/10 text-xs font-bold active:bg-black active:text-white transition-colors"
                  >
                    반대
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};
