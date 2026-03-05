import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ChevronLeft } from 'lucide-react';
import { MediaType, MediaSource } from '../domain/model/types';
import { BubbleAnalyzer } from '../domain/scoring/BubbleAnalyzer';

interface BubbleScreenProps {
  onAnalyze: (selectedMediaIds: number[]) => void;
  onBack: () => void;
}

const bubbleAnalyzer = new BubbleAnalyzer();

export const BubbleScreen: React.FC<BubbleScreenProps> = ({ onAnalyze, onBack }) => {
  const [selectedMediaIds, setSelectedMediaIds] = useState<number[]>([]);

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
          <h2 className="text-2xl font-bold">필터 버블 진단</h2>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-black/5">
          <h3 className="text-lg font-bold mb-2">선호하는 매체를 선택해주세요</h3>
          <p className="text-xs text-black/40 mb-6">당신의 정보 환경을 분석하여 필터버블을 진단합니다.</p>

          <div className="space-y-6">
            {[
              { title: 'TV/방송사', type: MediaType.TV },
              { title: '신문/언론사', type: MediaType.NEWSPAPER },
              { title: '온라인/기타', type: MediaType.ONLINE }
            ].map(group => (
              <div key={group.title}>
                <h4 className="text-[10px] font-black text-black/30 uppercase mb-3">{group.title}</h4>
                <div className="grid grid-cols-2 gap-2">
                  {bubbleAnalyzer.getAllMedia().filter(m => m.type === group.type).map(media => (
                    <button
                      key={media.id}
                      onClick={() => {
                        setSelectedMediaIds(prev =>
                          prev.includes(media.id)
                            ? prev.filter(id => id !== media.id)
                            : [...prev, media.id]
                        );
                      }}
                      className={`p-3 rounded-xl border text-xs font-bold transition-all ${selectedMediaIds.includes(media.id)
                        ? 'bg-black text-white border-black'
                        : 'bg-white border-black/5 hover:border-black/20'
                        }`}
                    >
                      {media.name}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={() => onAnalyze(selectedMediaIds)}
            className="w-full bg-black text-white h-14 rounded-2xl font-bold shadow-lg mt-8 active:scale-95 transition-transform"
          >
            진단 결과 보기
          </button>
        </div>
      </div>
    </motion.div>
  );
};
