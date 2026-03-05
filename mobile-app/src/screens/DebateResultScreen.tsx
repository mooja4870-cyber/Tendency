import React from 'react';
import { motion } from 'motion/react';
import { ChevronLeft } from 'lucide-react';
import { DebateTopic, DebateChoice } from '../domain/model/types';

interface DebateResultScreenProps {
  topic: DebateTopic;
  userVote: DebateChoice | null;
  onBack: () => void;
}

export const DebateResultScreen: React.FC<DebateResultScreenProps> = ({ topic, userVote, onBack }) => {
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
          <h2 className="text-2xl font-bold">투표 결과</h2>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-black/5">
          <h3 className="text-xl font-bold mb-6 leading-tight">{topic.title}</h3>

          <div className="space-y-6">
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-[10px] font-bold mb-1">
                  <span>찬성</span>
                  <span>다수 의견</span>
                </div>
                <div className="h-2 w-full bg-black/5 rounded-full overflow-hidden">
                  <div className="h-full bg-prog-deep" style={{ width: '65%' }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-[10px] font-bold mb-1">
                  <span>반대</span>
                  <span>소수 의견</span>
                </div>
                <div className="h-2 w-full bg-black/5 rounded-full overflow-hidden">
                  <div className="h-full bg-cons-deep" style={{ width: '35%' }} />
                </div>
              </div>
            </div>

            <div className="p-4 bg-black/5 rounded-xl">
              <h4 className="text-[10px] font-black uppercase text-black/30 mb-1">나의 선택: {userVote === DebateChoice.AGREE ? '찬성' : userVote === DebateChoice.DISAGREE ? '반대' : '중립'}</h4>
              <h4 className="text-[10px] font-black uppercase text-black/30 mb-1 mt-4">인사이트</h4>
              <p className="text-xs font-medium leading-relaxed">당신의 성향 그룹은 대체로 '찬성'에 더 높은 지지를 보였습니다. 이는 기술 혁신에 대한 긍정적 태도를 반영합니다.</p>
            </div>

            <button className="w-full bg-black text-white h-12 rounded-xl text-sm font-bold shadow-sm active:scale-95 transition-transform">
              결과 공유하기
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
