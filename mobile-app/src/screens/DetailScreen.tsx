import React from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, Info, Search } from 'lucide-react';
import { DiagnosisResult, OrientationLabel } from '../domain/model/types';
import { useApp } from '../context/AppContext';

interface DetailScreenProps {
  result: DiagnosisResult;
  onBack: () => void;
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

export const DetailScreen: React.FC<DetailScreenProps> = ({ result, onBack }) => {
  const { reset } = useApp();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-md mx-auto px-4 py-8 space-y-5"
    >
      <div className="flex items-center gap-4 mb-4">
        <button onClick={onBack} className="p-2 hover:bg-black/5 rounded-full transition-colors">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h2 className="text-6xl font-display font-extrabold tracking-tight">상세 분석 보고서</h2>
      </div>

      {/* Category Analysis Card */}
      <div className="bg-white rounded-[20px] p-6 shadow-md">
        <h3 className="text-4xl font-display font-extrabold mb-6 flex items-center gap-2 tracking-tight">
          📊 항목별 성향 분석
        </h3>
        <div className="space-y-6">
          {result.categoryResults.map((cat) => {
            const categoryInfo = {
              ECONOMY: "💰 경제 정책",
              WELFARE: "🏥 복지",
              SECURITY: "🛡️ 안보",
              CULTURE: "🌍 문화·사회",
              ENVIRONMENT: "🌿 환경",
              RIGHTS: "⚖️ 인권·자유",
              TRADITION: "🏛️ 전통·질서",
              GOVERNANCE: "🏢 정부 역할"
            }[cat.category];

            return (
              <div key={cat.category} className="space-y-2">
                <div className="flex flex-col items-center gap-1">
                  <span className="text-2xl font-semibold">{categoryInfo}</span>
                  <span
                    className="text-xl font-bold"
                    style={{ color: getColorForLabel(cat.label) }}
                  >
                    {cat.label}
                  </span>
                </div>
                <SpectrumBar
                  position={cat.position}
                  leftLabel="보수"
                  rightLabel="진보"
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Moral Foundation Card */}
      <div className="bg-white rounded-[20px] p-6 shadow-md text-center">
        <h3 className="text-4xl font-display font-extrabold mb-6 tracking-tight">🧠 도덕적 기반 프로필</h3>
        <div className="flex justify-center">
          <RadarChart profile={result.moralProfile} />
        </div>
      </div>

      {/* Insight Card */}
      <div className="bg-[#F5F0FF] rounded-[20px] p-6 shadow-md flex gap-4">
        <div className="w-14 h-14 rounded-full bg-[#E8E0F0] flex items-center justify-center text-7xl shrink-0">
          🧑‍🏫
        </div>
        <div className="space-y-2">
          <h4 className="font-display font-extrabold text-3xl tracking-tight">나의 성향 해석</h4>
          <p className="text-2xl leading-relaxed text-[#444444] whitespace-pre-wrap">
            {result.personalityInsight}
          </p>
        </div>
      </div>

      {/* Info Links Card */}
      <div className="bg-white rounded-[20px] p-6 shadow-md">
        <h4 className="text-2xl font-bold mb-4">학술적 배경 및 참고 자료</h4>
        <div className="space-y-3">
          <a href="https://en.wikipedia.org/wiki/Moral_foundations_theory" target="_blank" rel="noopener noreferrer" className="w-full text-left text-xl text-cta hover:underline flex items-center gap-2">
            <Info className="w-4 h-4" /> 도덕적 기반 이론 (Moral Foundations Theory)
          </a>
          <a href="https://en.wikipedia.org/wiki/Political_psychology" target="_blank" rel="noopener noreferrer" className="w-full text-left text-xl text-cta hover:underline flex items-center gap-2">
            <Search className="w-4 h-4" /> 정치 심리학과 성격 특성 연구
          </a>
        </div>
      </div>

      <button
        onClick={() => {
          reset();
          onBack();
        }}
        className="w-full bg-white border-2 border-black/5 rounded-full py-5 font-bold hover:bg-black hover:text-white transition-all shadow-sm"
      >
        처음으로 돌아가기
      </button>
    </motion.div>
  );
};

function SpectrumBar({ position, leftLabel, rightLabel }: { position: number, leftLabel: string, rightLabel: string }) {
  return (
    <div className="w-full">
      <div className="flex justify-between text-[15px] font-bold uppercase tracking-tighter mb-1">
        <span className="text-[#1B3A6B]">{leftLabel}</span>
        <span className="text-[#D97B4A]">{rightLabel}</span>
      </div>
      <div className="relative h-4 w-full rounded-full overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(to right, #1B3A6B, #4A7FC7, #AEAEAE, #E8944F, #D97B4A)'
          }}
        />
        <motion.div
          initial={{ left: '50%' }}
          animate={{ left: `${position * 100}%` }}
          transition={{ type: 'spring', damping: 15, stiffness: 60 }}
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 bg-[#1B3A6B] border-2 border-[#FFD700] shadow-md z-10"
          style={{ transform: 'translateY(-50%) translateX(-50%) rotate(45deg)' }}
        />
      </div>
    </div>
  );
}

function RadarChart({ profile }: { profile: any }) {
  const size = 266;
  const center = size / 2;
  const radius = size * 0.34;

  const labels = [
    { label: '💗 배려', val: profile.carePosition },
    { label: '⚖️ 공정성', val: profile.fairnessPosition },
    { label: '🤝 충성', val: 1.0 - profile.loyaltyPosition },
    { label: '👑 권위', val: 1.0 - profile.authorityPosition },
    { label: '✨ 순수성', val: 1.0 - profile.purityPosition },
  ];

  const getPoint = (index: number, value: number) => {
    const angle = (Math.PI * 2 * index) / labels.length - Math.PI / 2;
    const r = radius * value;
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle),
    };
  };

  const getLabelPoint = (index: number) => {
    const angle = (Math.PI * 2 * index) / labels.length - Math.PI / 2;
    const r = radius * 1.28;
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle),
    };
  };

  const polygonPoints = labels.map((p, i) => {
    const pt = getPoint(i, p.val);
    return `${pt.x},${pt.y}`;
  }).join(' ');

  const gridLevels = [1 / 3, 2 / 3, 1.0];

  return (
    <svg width={size} height={size} className="radar-chart overflow-visible">
      {gridLevels.map((level, i) => {
        const gp = labels.map((_, idx) => {
          const pt = getPoint(idx, level);
          return `${pt.x},${pt.y}`;
        }).join(' ');
        return (
          <polygon
            key={i}
            points={gp}
            fill="none"
            stroke="#E0E0E0"
            strokeWidth="1"
          />
        );
      })}

      <motion.polygon
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        points={polygonPoints}
        fill="rgba(255, 107, 107, 0.25)"
        stroke="#FF6B6B"
        strokeWidth="3"
      />

      {labels.map((p, i) => {
        const pt = getPoint(i, p.val);
        const lpt = getLabelPoint(i);
        return (
          <g key={i}>
            <circle cx={pt.x} cy={pt.y} r="6" fill="#FF6B6B" />
            <circle cx={pt.x} cy={pt.y} r="3" fill="white" />
            <text
              x={lpt.x}
              y={lpt.y}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize="11"
              fontWeight="700"
              fill="#666"
            >
              {p.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
