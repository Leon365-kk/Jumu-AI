import { motion } from 'motion/react';
import { Flame } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AnimatedStreakCounterProps {
  streakDays: number;
  size?: 'sm' | 'md' | 'lg';
  showFire?: boolean;
}

export function AnimatedStreakCounter({ streakDays, size = 'md', showFire = true }: AnimatedStreakCounterProps) {
  const sizeClasses = {
    sm: 'w-10 h-10 text-lg',
    md: 'w-14 h-14 text-2xl',
    lg: 'w-20 h-20 text-4xl'
  };

  const iconSizes = {
    sm: 'w-5 h-5',
    md: 'w-7 h-7',
    lg: 'w-10 h-10'
  };

  const getStreakColor = (days: number) => {
    if (days >= 30) return 'from-red-500 to-orange-600';
    if (days >= 14) return 'from-orange-500 to-red-500';
    if (days >= 7) return 'from-amber-500 to-orange-500';
    if (days >= 3) return 'from-yellow-500 to-amber-500';
    return 'from-gray-400 to-gray-500';
  };

  return (
    <div className={cn('relative flex items-center justify-center', sizeClasses[size])}>
      {streakDays > 0 && (
        <div className={cn(
          'absolute inset-0 rounded-full bg-gradient-to-br animate-pulse-glow',
          getStreakColor(streakDays)
        )} />
      )}
      
      <motion.div
        animate={{ 
          scale: streakDays > 0 ? [1, 1.05, 1] : 1,
          rotate: streakDays >= 7 ? [-2, 2, -2] : 0
        }}
        transition={{ 
          duration: streakDays >= 7 ? 2 : 3, 
          repeat: Infinity, 
          ease: 'easeInOut' 
        }}
        className={cn(
          'relative z-10 flex items-center justify-center rounded-full',
          'bg-gradient-to-br shadow-lg',
          streakDays > 0 ? getStreakColor(streakDays) : 'bg-gray-200',
          sizeClasses[size]
        )}
      >
        {showFire && streakDays > 0 ? (
          <Flame className={cn(iconSizes[size], 'text-white fill-current animate-streak')} />
        ) : (
          <span className="font-headline font-black text-white">
            {streakDays}
          </span>
        )}
      </motion.div>
      
      {streakDays >= 7 && (
        <div className="absolute -bottom-1 -right-1 bg-gold text-white text-[10px] font-black px-1.5 py-0.5 rounded-full border-2 border-white shadow-md z-20">
          HOT
        </div>
      )}
    </div>
  );
}
