import React, { useEffect } from 'react';
import { motion } from 'motion/react';

interface LoadingScreenProps {
  onFinish: () => void;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ onFinish }) => {
  useEffect(() => {
    const timer = setTimeout(onFinish, 3000);
    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center h-full text-center px-8 bg-white"
    >
      <div className="relative mb-8">
        <motion.div
          animate={{
            rotate: [0, 10, -10, 0],
            scale: [1, 1.1, 1]
          }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="text-8xl"
        >
          🧐
        </motion.div>
        <motion.div
          animate={{
            x: [-20, 20, -20],
            y: [-10, 10, -10]
          }}
          transition={{ repeat: Infinity, duration: 3 }}
          className="absolute -top-4 -right-4 text-4xl"
        >
          🔍
        </motion.div>
      </div>
      <h2 className="text-2xl font-black mb-2">당신의 성향을 분석 중입니다</h2>
      <p className="text-black/40 font-bold mb-10">7가지 렌즈로 당신의 답변을 다각도로 분석하고 있어요...</p>

      <div className="w-48 h-1.5 bg-black/5 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: '100%' }}
          transition={{ duration: 3 }}
          className="h-full bg-cta"
        />
      </div>
    </motion.div>
  );
};
