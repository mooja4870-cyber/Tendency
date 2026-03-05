import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import { Share2, RotateCcw, Bell } from 'lucide-react';
import { DiagnosisResult, OrientationLabel } from '../domain/model/types';
import { useApp } from '../context/AppContext';
import { ShareService } from '../services/ShareService';
import { NotificationService } from '../services/NotificationService';

interface HomeScreenProps {
  result: DiagnosisResult;
  onNavigate: (route: string) => void;
}

const getColorForLabel = (label: OrientationLabel) => {
  switch (label) {
    case OrientationLabel.STRONG_CONSERVATIVE: return '#1B3A6B';
    case OrientationLabel.CONSERVATIVE: return '#2E5EA6';
    case OrientationLabel.MODERATE_CONSERVATIVE: return '#4A7FC7';
    case OrientationLabel.LEAN_CONSERVATIVE: return '#7BA3D9';
    case OrientationLabel.CENTER_RIGHT: return '#9E9E9E';
    case OrientationLabel.CENTER_LEFT: return '#AEAEAE';
    case OrientationLabel.LEAN_PROGRESSIVE: return '#F7C98E';
    case OrientationLabel.MODERATE_PROGRESSIVE: return '#F2A85C';
    case OrientationLabel.PROGRESSIVE: return '#E8944F';
    case OrientationLabel.STRONG_PROGRESSIVE: return '#D97B4A';
    default: return '#AEAEAE';
  }
};

export const HomeScreen: React.FC<HomeScreenProps> = ({ result, onNavigate }) => {
  const { state, reset } = useApp();

  useEffect(() => {
    // Simulate a debate notification after 10 seconds for re-engagement demonstration
    if (state.debateTopic) {
      NotificationService.scheduleDebateNotification(
        state.debateTopic.title,
        () => onNavigate('/debate')
      );
    }
  }, [state.debateTopic]);

  const handleShare = () => {
    ShareService.share('result', state);
  };

  const handleEnableNotifications = async () => {
    const granted = await NotificationService.requestPermission();
    if (granted) {
      alert('알림이 활성화되었습니다! 새로운 토론 주제가 올라오면 알려드릴게요.');
    } else {
      alert('알림 권한이 거부되었습니다. 브라우저 설정에서 권한을 허용해주세요.');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-full bg-gradient-to-b from-[#F5F0FF] to-[#FAFBFF] pb-28"
    >
      <div className="max-w-md mx-auto px-4 pt-8 space-y-6">
        {/* Top Summary Card */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-white rounded-[28px] p-6 shadow-xl shadow-purple-500/5 border border-purple-100 text-center"
        >
          <div className="flex flex-col items-center">
            <div className="w-20 h-20 rounded-full bg-[#F0EAFF] flex items-center justify-center text-6xl mb-4">
              🔮
            </div>

            <h3 className="text-2xl font-extrabold text-black/40 mb-1 tracking-tight">나의 관점·성향</h3>
            <h2
              className="text-[48px] font-display font-black mb-6 tracking-tight"
              style={{ color: getColorForLabel(result.overallLabel) }}
            >
              {result.overallLabel}
            </h2>

            <SpectrumBar position={result.overallPosition} leftLabel="보수" rightLabel="진보" />

            {result.figureMatches?.[0] && (
              <div className="mt-6 pt-4 border-t border-gray-50 w-full">
                <p className="text-2xl font-bold text-[#667EEA] flex items-center justify-center gap-1">
                  <span>🎭</span> 닮은 인물: {result.figureMatches[0].figure.nameKorean}
                </p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Feature Grid Section */}
        <div className="space-y-4">
          <h3 className="text-[32px] font-display font-extrabold text-black/80 px-1 tracking-tight">🔍 더 깊이 알아보기</h3>

          <div className="grid grid-cols-2 gap-3">
            {/* 상세 분석 - 와이드형 (상단 배치, 높이 축소) */}
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onNavigate('/detail')}
              className="col-span-2 bg-[#B8E6CF] bg-opacity-20 rounded-[20px] px-6 py-3 flex items-center justify-between border border-white shadow-sm active:scale-95 transition-transform h-[70px]"
            >
              <div className="flex items-center gap-4">
                <div className="text-5xl">📊</div>
                <div className="text-left">
                  <h4 className="font-black text-[22px] leading-tight text-black/80">상세 분석</h4>
                  <p className="text-[17px] font-bold text-black/40">항목별·도덕기반</p>
                </div>
              </div>
            </motion.button>

            <FeatureCard
              emoji="🪞"
              title="인지편향 거울"
              subtitle={`${result.biasReport.detectedBiases.length}개 발견`}
              color="bg-[#FF6B6B]"
              onClick={() => onNavigate('/bias')}
            />
            <FeatureCard
              emoji="👁️"
              title="반대편의 눈"
              subtitle="공감 시뮬레이터"
              color="bg-[#4ECDC4]"
              onClick={() => onNavigate('/empathy')}
            />
            <FeatureCard
              emoji="🌍"
              title="시대·국가 매칭"
              subtitle="다른 나라에선?"
              color="bg-[#45B7D1]"
              onClick={() => onNavigate('/time-match')}
            />
            <FeatureCard
              emoji="💕"
              title="관계 궁합"
              subtitle="친구와 비교"
              color="bg-[#F38181]"
              onClick={() => onNavigate('/invite')}
            />
            <FeatureCard
              emoji="🫧"
              title="필터버블 진단"
              subtitle="나의 정보 편식"
              color="bg-[#AA96DA]"
              onClick={() => onNavigate('/bubble')}
            />
            <FeatureCard
              emoji="🗳️"
              title="주간 토론"
              subtitle="이번 주 이슈"
              color="bg-[#FFE66D]"
              onClick={() => onNavigate('/debate')}
            />
            <FeatureCard
              emoji="🎭"
              title="역사인물 매칭"
              subtitle="나와 닮은 인물"
              color="bg-[#A8D8EA]"
              onClick={() => onNavigate('/figure-match')}
            />
            {/* 결과 공유 - 그리드 편입 */}
            <FeatureCard
              emoji="🔗"
              title="결과 공유"
              subtitle="친구에게 보내기"
              color="bg-white"
              onClick={handleShare}
            />
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="space-y-3 pt-4">
          <div className="flex gap-3">
            <button
              onClick={handleEnableNotifications}
              className="flex-1 bg-[#F0EAFF] text-[#667EEA] h-16 rounded-2xl flex items-center justify-center gap-2 font-bold text-2xl shadow-sm active:scale-95 transition-transform"
            >
              <Bell className="w-5 h-5" />
              토론 알림
            </button>
            <button
              onClick={reset}
              className="flex-1 bg-black text-white h-16 rounded-2xl flex items-center justify-center gap-2 font-bold text-2xl shadow-sm active:scale-95 transition-transform"
            >
              <RotateCcw className="w-5 h-5" />
              다시하기
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

interface FeatureCardProps {
  emoji: string;
  title: string;
  subtitle: string;
  color: string;
  onClick: () => void;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ emoji, title, subtitle, color, onClick }) => {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`${color} bg-opacity-15 rounded-[20px] p-3 text-center flex flex-col items-center justify-center gap-1 min-h-[110px] border border-white shadow-sm active:scale-95 transition-transform`}
    >
      <div className="text-6xl mb-1">{emoji}</div>
      <div className="flex flex-col items-center">
        <h4 className="font-black text-[20px] leading-tight text-black/80 whitespace-nowrap">
          {title}
        </h4>
        <p className="text-[15px] font-bold text-black/40 whitespace-nowrap">
          {subtitle}
        </p>
      </div>
    </motion.button>
  );
};

function SpectrumBar({ position, leftLabel, rightLabel }: { position: number, leftLabel: string, rightLabel: string }) {
  return (
    <div className="w-full">
      <div className="flex justify-between text-[15px] font-black uppercase tracking-widest mb-2 px-1">
        <span className="text-[#1B3A6B] opacity-60">{leftLabel}</span>
        <span className="text-[#D97B4A] opacity-60">{rightLabel}</span>
      </div>
      <div className="relative h-3 w-full rounded-full bg-gray-100 overflow-hidden">
        <div
          className="absolute inset-0 opacity-30"
          style={{
            background: 'linear-gradient(to right, #1B3A6B, #4A7FC7, #AEAEAE, #E8944F, #D97B4A)'
          }}
        />
        <motion.div
          initial={{ left: '50%' }}
          animate={{ left: `${position * 100}%` }}
          transition={{ type: 'spring', damping: 20, stiffness: 100 }}
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 border-[2px] border-white/50 shadow-lg z-10"
          style={{
            background: 'radial-gradient(circle at 30% 30%, #ff7eb3, #ff758c 50%, #8b5cf6 100%)',
            boxShadow: '0 0 15px rgba(139, 92, 246, 0.8), inset -2px -2px 5px rgba(0, 0, 0, 0.3)',
            borderRadius: '50%'
          }}
        />
      </div>
    </div>
  );
}
