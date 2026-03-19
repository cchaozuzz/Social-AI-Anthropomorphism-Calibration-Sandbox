import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { CprConfig } from '../types';

interface AudioVisualizerProps {
  config: CprConfig;
  isActive: boolean;
}

export const AudioVisualizer: React.FC<AudioVisualizerProps> = ({ config, isActive }) => {
  const [bars, setBars] = useState<number[]>(Array(15).fill(10));

  useEffect(() => {
    if (!isActive) {
      setBars(Array(15).fill(10));
      return;
    }

    const interval = setInterval(() => {
      setBars(Array(15).fill(0).map(() => Math.random() * 30 + 10));
    }, 150);

    return () => clearInterval(interval);
  }, [isActive]);

  // Stage 1: Abstract Mechanic (appearance < 20)
  if (config.appearance < 20) {
    return (
      <div className="flex items-end justify-center space-x-1.5 h-40">
        {bars.slice(0, 10).map((height, i) => (
          <motion.div
            key={i}
            className="w-2 bg-slate-700 rounded-sm border border-slate-500 shadow-[0_0_8px_rgba(51,65,85,0.5)]"
            animate={{ height: isActive ? height * 1.5 : 12 }}
            transition={{ type: 'tween', duration: 0.1 }}
          />
        ))}
      </div>
    );
  }

  // Stage 2: Robotic (appearance < 40)
  if (config.appearance < 40) {
    return (
      <div className="relative flex items-center justify-center h-40 w-40">
        <div className="w-24 h-24 bg-gray-900 rounded-full border-4 border-gray-700 flex items-center justify-center shadow-inner relative overflow-hidden">
          {/* Inner mechanical grid */}
          <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'radial-gradient(circle, transparent 20%, #000 20%, #000 80%, transparent 80%, transparent)', backgroundSize: '4px 4px' }} />
          
          {/* Glowing Eye */}
          <motion.div
            className="w-10 h-10 bg-red-500 rounded-full shadow-[0_0_20px_rgba(239,68,68,1)]"
            animate={{ 
              scale: isActive ? [1, 1.2, 1] : 1,
              opacity: isActive ? [0.7, 1, 0.7] : 0.5
            }}
            transition={{ repeat: isActive ? Infinity : 0, duration: 0.5 }}
          />
          <motion.div 
            className="absolute w-4 h-4 bg-white rounded-full blur-[2px] top-6 left-6"
            animate={{ opacity: isActive ? [0.5, 0.8, 0.5] : 0.3 }}
            transition={{ repeat: isActive ? Infinity : 0, duration: 0.5 }}
          />
        </div>
      </div>
    );
  }

  // Stage 3: Breathing / Organic Abstract (appearance < 60)
  if (config.appearance < 60) {
    return (
      <div className="relative flex items-center justify-center h-40 w-40">
        <motion.div
          className="absolute w-24 h-24 bg-teal-400/30 rounded-full blur-md"
          animate={{
            scale: isActive ? [1, 1.5, 1] : [1, 1.2, 1],
            opacity: isActive ? [0.5, 0.8, 0.5] : [0.3, 0.5, 0.3]
          }}
          transition={{ repeat: Infinity, duration: isActive ? 1 : 4, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute w-16 h-16 bg-teal-300/50 rounded-full blur-sm"
          animate={{
            scale: isActive ? [1, 1.3, 1] : [1, 1.1, 1],
          }}
          transition={{ repeat: Infinity, duration: isActive ? 0.8 : 4, ease: "easeInOut", delay: 0.2 }}
        />
        <motion.div
          className="relative w-12 h-12 bg-teal-100 rounded-full shadow-[0_0_20px_rgba(45,212,191,0.8)]"
          animate={{
            scale: isActive ? [1, 1.2, 1] : [1, 1.05, 1],
          }}
          transition={{ repeat: Infinity, duration: isActive ? 0.5 : 4, ease: "easeInOut" }}
        />
      </div>
    );
  }

  // Stage 4: Animal (appearance < 80)
  if (config.appearance < 80) {
    const isSmiling = config.warmth > 66;
    const isNumb = config.warmth < 33;

    return (
      <div className="relative flex items-center justify-center h-40 w-40">
        <div className="relative w-28 h-24 bg-orange-400 rounded-[40%] flex flex-col items-center justify-end pb-4 shadow-lg border border-orange-300">
          {/* Ears */}
          <motion.div 
            className="absolute -top-4 left-2 w-8 h-10 bg-orange-500 rounded-t-full origin-bottom"
            animate={{ rotate: isActive ? [-15, -5, -15] : (isNumb ? -25 : isSmiling ? -5 : -10) }}
            transition={{ repeat: isActive ? Infinity : 0, duration: 2 }}
          />
          <motion.div 
            className="absolute -top-4 right-2 w-8 h-10 bg-orange-500 rounded-t-full origin-bottom"
            animate={{ rotate: isActive ? [15, 5, 15] : (isNumb ? 25 : isSmiling ? 5 : 10) }}
            transition={{ repeat: isActive ? Infinity : 0, duration: 2, delay: 0.5 }}
          />
          
          {/* Eyes */}
          <div className="flex space-x-8 mb-2 z-10">
            <motion.div 
              className="w-3 bg-gray-900 rounded-full"
              animate={{ 
                height: isSmiling ? 12 : 20,
                scaleY: isActive ? [1, 0.1, 1] : 1 
              }}
              transition={{ repeat: isActive ? Infinity : 0, duration: 4, repeatDelay: 1 }}
            />
            <motion.div 
              className="w-3 bg-gray-900 rounded-full"
              animate={{ 
                height: isSmiling ? 12 : 20,
                scaleY: isActive ? [1, 0.1, 1] : 1 
              }}
              transition={{ repeat: isActive ? Infinity : 0, duration: 4, repeatDelay: 1 }}
            />
          </div>
          
          {/* Snout/Mouth */}
          <div className="w-12 h-8 bg-orange-100 rounded-full flex flex-col items-center justify-start pt-1.5 z-10 shadow-sm">
            <div className="w-3 h-2 bg-gray-800 rounded-full mb-1" /> {/* Nose */}
            <motion.div 
              className="bg-pink-400"
              animate={{ 
                height: isActive ? (isSmiling ? [8, 14, 8] : isNumb ? [2, 6, 2] : [6, 12, 6]) : (isSmiling ? 8 : isNumb ? 2 : 6),
                width: isActive ? (isSmiling ? [20, 16, 20] : isNumb ? [12, 10, 12] : [16, 10, 16]) : (isSmiling ? 20 : isNumb ? 12 : 16),
                borderRadius: isSmiling ? '4px 4px 12px 12px' : isNumb ? '4px' : '9999px'
              }}
              transition={{ repeat: isActive ? Infinity : 0, duration: 0.4 }}
            />
          </div>
        </div>
      </div>
    );
  }

  // Stage 5: Memoji / Minimalist 3D Human-like (appearance <= 100)
  const isSmiling = config.warmth > 66;
  const isNumb = config.warmth < 33;

  return (
    <div className="relative flex items-center justify-center h-40 w-40">
      {/* Background glow */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-tr from-rose-100 to-orange-50 rounded-full blur-2xl opacity-70"
        animate={{ scale: isActive ? [1, 1.05, 1] : 1 }}
        transition={{ repeat: isActive ? Infinity : 0, duration: 2 }}
      />
      
      {/* 3D Head Base (Soft, clay-like skin) */}
      <div className="relative w-28 h-36 rounded-[45%] shadow-[0_10px_25px_rgba(0,0,0,0.1)] border border-white/60 overflow-hidden bg-gradient-to-b from-[#fde3c8] to-[#f0c39c]">
        
        {/* Hair (Smooth, minimalist cap) */}
        <div className="absolute top-0 left-0 w-full h-10 bg-[#5c3a21] rounded-t-[45%] shadow-[inset_0_-3px_6px_rgba(0,0,0,0.2)]">
          {/* Front hair swoop */}
          <div className="absolute -bottom-2 left-0 w-16 h-6 bg-[#5c3a21] rounded-br-full" />
        </div>

        {/* Eyebrows */}
        <div className="absolute top-12 w-full flex justify-center space-x-5">
          <motion.div 
            className="w-5 h-1.5 bg-[#4a2e1b] rounded-full opacity-80"
            animate={{ 
              y: isActive ? [0, -1.5, 0] : 0,
              rotate: isSmiling ? -5 : isNumb ? 5 : 0
            }}
            transition={{ repeat: isActive ? Infinity : 0, duration: 2, ease: "easeInOut" }}
          />
          <motion.div 
            className="w-5 h-1.5 bg-[#4a2e1b] rounded-full opacity-80"
            animate={{ 
              y: isActive ? [0, -1.5, 0] : 0,
              rotate: isSmiling ? 5 : isNumb ? -5 : 0
            }}
            transition={{ repeat: isActive ? Infinity : 0, duration: 2, ease: "easeInOut", delay: 0.1 }}
          />
        </div>

        {/* Eyes (Solid dark with catchlight) */}
        <div className="absolute top-16 w-full flex justify-center space-x-5">
          {/* Left Eye */}
          <div className="relative w-4 h-5 bg-[#3e2723] rounded-full shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)] overflow-hidden">
            <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-white rounded-full opacity-90" />
            {/* Blink */}
            <motion.div 
              className="absolute top-0 left-0 w-full bg-[#fde3c8] z-10"
              animate={{ height: ['0%', '100%', '0%'] }}
              transition={{ repeat: Infinity, duration: 4, times: [0, 0.05, 0.1], repeatDelay: 3.9 }}
            />
            {/* Smile cheek push */}
            {isSmiling && (
              <div className="absolute -bottom-1 left-0 w-full h-2 bg-[#fde3c8] rounded-t-full" />
            )}
          </div>
          {/* Right Eye */}
          <div className="relative w-4 h-5 bg-[#3e2723] rounded-full shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)] overflow-hidden">
            <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-white rounded-full opacity-90" />
            {/* Blink */}
            <motion.div 
              className="absolute top-0 left-0 w-full bg-[#fde3c8] z-10"
              animate={{ height: ['0%', '100%', '0%'] }}
              transition={{ repeat: Infinity, duration: 4, times: [0, 0.05, 0.1], repeatDelay: 3.9 }}
            />
            {/* Smile cheek push */}
            {isSmiling && (
              <div className="absolute -bottom-1 left-0 w-full h-2 bg-[#fde3c8] rounded-t-full" />
            )}
          </div>
        </div>

        {/* Cheeks (Soft blush) */}
        <div className="absolute top-20 w-full flex justify-center space-x-10 opacity-50 mt-1">
          <motion.div 
            className="w-4 h-3 bg-rose-400 rounded-full blur-[3px]" 
            animate={{ y: isSmiling ? -2 : 0, opacity: isSmiling ? 0.8 : isNumb ? 0.2 : 0.5 }}
          />
          <motion.div 
            className="w-4 h-3 bg-rose-400 rounded-full blur-[3px]" 
            animate={{ y: isSmiling ? -2 : 0, opacity: isSmiling ? 0.8 : isNumb ? 0.2 : 0.5 }}
          />
        </div>

        {/* Nose (Minimalist shadow) */}
        <div className="absolute top-22 left-1/2 -translate-x-1/2 w-3 h-2.5 bg-[#d9a87e] rounded-full mt-1" />

        {/* Mouth (Smooth, expressive) */}
        <motion.div 
          className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-[#5d4037] overflow-hidden shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)] flex flex-col items-center justify-start"
          animate={{ 
            height: isActive ? (isSmiling ? [10, 20, 10] : isNumb ? [2, 6, 2] : [4, 14, 4]) : (isSmiling ? 10 : isNumb ? 2 : 4),
            width: isActive ? (isSmiling ? [24, 20, 24] : isNumb ? [16, 14, 16] : [14, 12, 14]) : (isSmiling ? 24 : isNumb ? 16 : 14),
            borderRadius: isSmiling ? '4px 4px 20px 20px' : isNumb ? '4px' : '8px',
            y: isSmiling ? -2 : isNumb ? 2 : 0
          }}
          transition={{ repeat: isActive ? Infinity : 0, duration: 0.3, ease: "easeInOut" }}
        >
          {/* Teeth (only visible when open) */}
          <motion.div 
            className="w-3/4 h-1.5 bg-white/90 rounded-b-sm"
            animate={{ opacity: isActive ? (isNumb ? 0 : 1) : (isSmiling ? 1 : 0) }}
            transition={{ repeat: isActive ? Infinity : 0, duration: 0.3 }}
          />
          {/* Tongue */}
          <motion.div 
            className="absolute bottom-0 w-3/4 h-2 bg-rose-400 rounded-t-full"
            animate={{ opacity: isActive && !isNumb ? [0, 1, 0] : 0 }}
            transition={{ repeat: isActive ? Infinity : 0, duration: 0.3 }}
          />
        </motion.div>
      </div>
    </div>
  );
};
