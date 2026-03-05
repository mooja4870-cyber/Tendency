import React, { useEffect } from 'react';
import { motion } from 'motion/react';

interface SplashScreenProps {
  onTimeout: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onTimeout }) => {
  useEffect(() => {
    const timer = setTimeout(onTimeout, 3000);
    return () => clearTimeout(timer);
  }, [onTimeout]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col items-center justify-center h-full bg-black text-white overflow-hidden"
    >
      <div className="relative h-40 w-40 flex items-center justify-center">
        {/* Prism Shape */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1 }}
          className="z-10 relative"
        >
          <div
            className="w-0 h-0 border-l-[40px] border-l-transparent border-r-[40px] border-r-transparent border-b-[70px] border-b-white/20 relative"
            style={{ filter: 'drop-shadow(0 0 15px rgba(255,255,255,0.2))' }}
          >
            <div className="absolute top-[10px] left-1/2 -translate-x-1/2 w-px h-[50px] bg-white/30 blur-[1px]" />
          </div>
        </motion.div>

        {/* Light Rays */}
        <div className="absolute inset-0 flex items-center justify-center">
          {['#FF0000', '#FF7F00', '#FFFF00', '#00FF00', '#0000FF', '#4B0082', '#9400D3'].map((color, i) => (
            <motion.div
              key={i}
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 300, opacity: [0, 0.8, 0] }}
              transition={{ delay: 0.8 + i * 0.1, duration: 2, ease: "easeOut" }}
              className="absolute h-[1px] origin-left"
              style={{
                backgroundColor: color,
                rotate: `${-30 + i * 10}deg`,
                boxShadow: `0 0 10px ${color}`
              }}
            />
          ))}
        </div>

        {/* Incoming White Light */}
        <motion.div
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 200, opacity: 0.8 }}
          transition={{ duration: 0.8, ease: "easeIn" }}
          className="absolute h-[3px] bg-white origin-right right-1/2 translate-x-[-40px]"
          style={{ filter: 'blur(1px)', boxShadow: '0 0 10px white' }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2 }}
        className="mt-12 text-center"
      >
        <h1 className="text-5xl font-serif italic tracking-tight mb-2">PoliTest</h1>
        <p className="text-[10px] uppercase tracking-[0.5em] opacity-40 font-bold">Discover Your Bias</p>
      </motion.div>
    </motion.div>
  );
};
