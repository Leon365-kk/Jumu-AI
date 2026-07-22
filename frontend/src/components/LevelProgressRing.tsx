import { motion } from 'motion/react';
import { Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LevelProgressRingProps {
  level: number;
  xp: number;
  size?: number;
  strokeWidth?: number;
  showLabel?: boolean;
}

export function LevelProgressRing({ level, xp, size = 120, strokeWidth = 8, showLabel = true }: LevelProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  
  const getLevelProgress = (xp: number, level: number): number => {
    const thresholds = [0, 100, 250, 500, 750, 1000, 1500, 2250, 3375, 5062, 7500, 11250, 16875, 25312, 37968, 56952, 85428, 128142, 192213, 288319];
    if (level >= thresholds.length) return 100;
    const levelStart = thresholds[level - 1] || 0;
    const levelEnd = thresholds[level] || 1000;
    const progress = xp - levelStart;
    return Math.min(Math.max((progress / (levelEnd - levelStart)) * 100, 0), 100);
  };

  const progress = getLevelProgress(xp, level);
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  const getLevelColor = (lvl: number) => {
    if (lvl >= 20) return { stroke: '#8B5CF6', bg: 'from-violet-500 to-purple-600' };
    if (lvl >= 10) return { stroke: '#7C3AED', bg: 'from-purple-500 to-violet-600' };
    if (lvl >= 5) return { stroke: '#C62828', bg: 'from-red-700 to-red-900' };
    return { stroke: '#10B981', bg: 'from-emerald-500 to-teal-600' };
  };

  const colors = getLevelColor(level);

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          className="text-surface-container"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={colors.stroke}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
          style={{
            strokeDasharray: circumference,
          }}
        />
      </svg>
      
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.5, type: 'spring', stiffness: 200 }}
          className={cn(
            'w-3/5 h-3/5 rounded-full flex items-center justify-center',
            'bg-gradient-to-br shadow-lg',
            colors.bg
          )}
        >
          <Trophy className="w-1/3 h-1/3 text-white" />
        </motion.div>
        {showLabel && (
          <span className="absolute -bottom-6 font-headline font-black text-2xl text-on-surface">
            {level}
          </span>
        )}
      </div>
    </div>
  );
}
