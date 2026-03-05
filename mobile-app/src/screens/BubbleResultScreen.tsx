import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, CheckCircle2, Circle } from 'lucide-react';
import { BubbleReport } from '../domain/model/types';

interface BubbleResultScreenProps {
  report: BubbleReport;
  onBack: () => void;
}

const CHALLENGES = [
  { id: 1, text: '평소와 반대 성향 뉴스 기사 1개 읽기', emoji: '📰' },
  { id: 2, text: '다른 성향 유튜브 채널 1개 구독하기', emoji: '📺' },
  { id: 3, text: '뉴스 댓글에서 반대 의견 3개 정독하기', emoji: '💬' },
  { id: 4, text: '팩트체크 사이트에서 최근 이슈 확인하기', emoji: '🔍' },
  { id: 5, text: '가족이나 친구와 정치 주제로 대화하기', emoji: '🗣️' },
];

export const BubbleResultScreen: React.FC<BubbleResultScreenProps> = ({ report, onBack }) => {
  const [showChallenge, setShowChallenge] = useState(false);
  const [completed, setCompleted] = useState<number[]>([]);

  const toggleComplete = (id: number) => {
    setCompleted(prev => prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]);
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
          <h2 className="text-2xl font-bold">진단 결과</h2>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-black/5">
          <div className="flex justify-between items-end mb-8">
            <div>
              <h3 className="text-[10px] font-black text-black/30 uppercase tracking-widest mb-1">필터버블 지수</h3>
              <div className="text-4xl font-black text-cta">
                {report.diversityLevel}
              </div>
            </div>
            <div className="text-right">
              <div className="text-[10px] font-black text-black/30 uppercase mb-2">정보 다양성</div>
              <div className="inline-block px-2 py-1 bg-black/5 rounded text-[10px] font-bold">
                {report.diversityPosition > 0.7 ? '매우 높음' : report.diversityPosition > 0.4 ? '보통' : '낮음'}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <h4 className="text-[10px] font-black text-black/30 uppercase mb-3">구독 중인 매체 성향</h4>
              <div className="h-3 w-full bg-black/5 rounded-full overflow-hidden flex">
                <div className="h-full bg-cons-deep" style={{ width: `${report.conservativeRatio * 100}%` }} />
                <div className="h-full bg-prog-deep" style={{ width: `${report.progressiveRatio * 100}%` }} />
              </div>
              <div className="flex justify-between mt-2 text-[10px] font-bold">
                <span className="text-cons-deep">보수 성향 매체</span>
                <span className="text-prog-deep">진보 성향 매체</span>
              </div>
            </div>

            <div className="p-4 bg-black/5 rounded-xl">
              <h4 className="text-[10px] font-black uppercase text-black/30 mb-2">진단 결과</h4>
              <p className="text-sm font-medium leading-relaxed">{report.prescription}</p>
            </div>

            <div>
              <h4 className="text-[10px] font-black text-black/30 uppercase mb-3">추천 매체 (균형 잡기)</h4>
              <div className="space-y-2">
                {report.recommendedMedia.map(media => (
                  <div key={media.id} className="flex items-center justify-between p-3 bg-white border border-black/5 rounded-xl">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{media.logoEmoji}</span>
                      <span className="text-sm font-bold">{media.name}</span>
                    </div>
                    <span className="text-[10px] font-bold text-black/40">{media.type}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={() => setShowChallenge(!showChallenge)}
          className="w-full bg-cta text-white h-14 rounded-2xl font-bold shadow-lg active:scale-95 transition-transform"
        >
          {showChallenge ? '챌린지 접기' : '필터버블 탈출 챌린지 시작'}
        </button>

        <AnimatePresence>
          {showChallenge && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-black/5 space-y-4">
                <div>
                  <h4 className="text-sm font-black mb-1">🎯 오늘의 미션</h4>
                  <p className="text-[11px] text-black/40">하루에 하나씩 실천해보세요!</p>
                </div>
                <div className="space-y-2">
                  {CHALLENGES.map(ch => (
                    <button
                      key={ch.id}
                      onClick={() => toggleComplete(ch.id)}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${completed.includes(ch.id)
                          ? 'bg-green-50 border-green-200'
                          : 'bg-black/[0.02] border-black/5'
                        }`}
                    >
                      {completed.includes(ch.id)
                        ? <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                        : <Circle className="w-5 h-5 text-black/20 flex-shrink-0" />
                      }
                      <span className="text-sm mr-1">{ch.emoji}</span>
                      <span className={`text-xs font-medium ${completed.includes(ch.id) ? 'line-through text-black/30' : ''}`}>
                        {ch.text}
                      </span>
                    </button>
                  ))}
                </div>
                <div className="text-center pt-2">
                  <p className="text-[11px] font-bold text-black/30">
                    {completed.length}/{CHALLENGES.length} 완료 🔥
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

