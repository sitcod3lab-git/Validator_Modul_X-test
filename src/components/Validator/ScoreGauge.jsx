import React from 'react';
import { motion } from 'framer-motion';

export default function ScoreGauge({ score = 0, size = 180, strokeWidth = 10 }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (score / 100) * circumference;

  const getStatusColor = (val) => {
    if (val >= 75) return '#10B981'; // Emerald
    if (val >= 45) return '#F59E0B'; // Amber
    return '#EF4444'; // Rose
  };

  const statusColor = getStatusColor(score);

  return (
    <div className="relative flex flex-col items-center justify-center" style={{ width: size, height: size }}>
      <svg className="w-full h-full transform -rotate-90" viewBox={`0 0 ${size} ${size}`}>
        {/* Background Track Arc */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke="#1E293B"
          strokeWidth={strokeWidth}
        />
        {/* Active Animated Arc */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke={statusColor}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
          strokeLinecap="round"
          style={{
            filter: `drop-shadow(0 0 8px ${statusColor}40)`
          }}
        />
      </svg>
      
      {/* Central Metric Value */}
      <div className="absolute inset-0 flex flex-col items-center justify-center font-mono">
        <span className="text-4xl font-bold text-white tracking-tighter" style={{ textShadow: `0 0 15px ${statusColor}30` }}>
          {score}%
        </span>
        <span className="text-[10px] tracking-widest text-slate-500 uppercase mt-1">
          Confidence
        </span>
      </div>
    </div>
  );
}
