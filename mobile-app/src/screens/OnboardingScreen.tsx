import React from 'react';
import { motion } from 'motion/react';
import { Play } from 'lucide-react';

interface OnboardingScreenProps {
  onStart: () => void;
}

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onStart }) => {
  return (
    <div
      className="h-full flex flex-col justify-between text-white relative overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, #0a0e17 0%, #0d121f 100%)',
        paddingTop: 'max(env(safe-area-inset-top, 0px), 2rem)',
        paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 2rem)'
      }}
    >
      {/* Background Glowing Effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-indigo-600/20 rounded-full blur-[100px] -z-10 pointer-events-none" />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[400px] h-[200px] bg-fuchsia-600/10 rounded-full blur-[120px] -z-10 pointer-events-none" />

      {/* CSS for animations & specific effects */}
      <style>{`
        @keyframes floating {
          0% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-12px) rotate(2deg); }
          100% { transform: translateY(0px) rotate(0deg); }
        }
        .crystal-ball {
          animation: floating 4s ease-in-out infinite;
          filter: drop-shadow(0 0 25px rgba(139, 92, 246, 0.4));
        }
        .glass-btn {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.1);
        }
      `}</style>

      {/* Top / Hero Section */}
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-[6rem] leading-none mb-4 crystal-ball z-10"
        >
          🔮
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-center z-10"
        >
          <h1 className="text-5xl font-black mb-3 tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400 drop-shadow-sm">
            Prism
          </h1>
          <p className="text-[1.05rem] text-gray-400 font-medium leading-relaxed tracking-tight" style={{ textWrap: 'balance' }}>
            다각도로 분석하는<br />나의 입체적 정치 관점·성향
          </p>
        </motion.div>
      </div>

      {/* Features Showcase (Glassmorphism Cards) */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.4 }}
        className="px-5 pb-8 space-y-3 z-10"
      >
        <div className="glass-btn flex flex-col p-4 rounded-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-[20px] -translate-y-1/2 translate-x-1/2" />
          <h3 className="text-sm text-gray-300 font-bold uppercase tracking-widest mb-1">Feature 01</h3>
          <p className="text-lg font-bold text-white tracking-tight">상세한 8차원 성향 분석</p>
        </div>

        <div className="glass-btn flex flex-col p-4 rounded-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full blur-[20px] -translate-y-1/2 translate-x-1/2" />
          <h3 className="text-sm text-gray-300 font-bold uppercase tracking-widest mb-1">Feature 02</h3>
          <p className="text-lg font-bold text-white tracking-tight">나와 닮은 역사 인물 매칭</p>
        </div>
      </motion.div>

      {/* Bottom Action Area */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="px-5 pb-4 z-10 shrink-0"
      >
        <button
          onClick={onStart}
          className="w-full relative group overflow-hidden rounded-[20px] p-[1px] shadow-2xl active:scale-[0.98] transition-all duration-300"
        >
          {/* Animated Gradient Border */}
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-80" />
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-100 blur-md group-hover:opacity-100 transition-opacity duration-300" />

          {/* Inner Content */}
          <div className="relative bg-[#0d121f]/90 backdrop-blur-xl px-6 py-[18px] rounded-[19px] flex items-center justify-center gap-2">
            <span className="text-[1.1rem] font-bold text-white tracking-tight shadow-sm">
              심층 진단 시작하기 (1분)
            </span>
            <Play className="w-[18px] h-[18px] fill-white text-white drop-shadow-sm" />
          </div>
        </button>

        <p className="text-center text-[0.65rem] text-gray-500 mt-4 px-4 leading-relaxed font-light">
          미국 하버드 대학교 Moral Foundations Theory에 근거한 분석입니다. 모든 응답은 익명으로 안전하게 처리됩니다.
        </p>
      </motion.div>
    </div>
  );
};

