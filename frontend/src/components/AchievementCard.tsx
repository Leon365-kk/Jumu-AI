import { motion } from 'motion/react';
import { Award, Lock } from 'lucide-react';
import type { BadgeDefinition } from '@/lib/gamification-types';
import { cn } from '@/lib/utils';

interface AchievementCardProps {
  badge: BadgeDefinition;
  unlocked: boolean;
  unlockedAt?: string;
  index?: number;
}

export function AchievementCard({ badge, unlocked, unlockedAt, index = 0 }: AchievementCardProps) {
  const rarityColors = {
    common: 'border-emerald-200 bg-emerald-50/50',
    rare: 'border-blue-200 bg-blue-50/50',
    epic: 'border-purple-200 bg-purple-50/50',
    legendary: 'border-amber-200 bg-amber-50/50'
  };

  const rarityGlow = {
    common: 'shadow-emerald-500/10',
    rare: 'shadow-blue-500/15',
    epic: 'shadow-purple-500/20',
    legendary: 'shadow-amber-500/25'
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.05, type: 'spring' }}
      whileHover={unlocked ? { y: -4, scale: 1.02 } : {}}
      className={cn(
        'relative p-5 rounded-3xl border-2 transition-all duration-300 overflow-hidden',
        'flex flex-col items-center text-center min-h-[140px]',
        unlocked
          ? cn('bg-white border-primary/20 shadow-card hover:shadow-card-hover', rarityGlow[badge.rarity])
          : 'bg-surface/50 border-dashed border-surface-container-high opacity-60'
      )}
    >
      {unlocked && (
        <div className={cn('absolute top-0 left-0 w-full h-1 bg-gradient-to-r', badge.color.replace('text-', 'from-').replace('600', '400') + ' to-' + badge.color.replace('text-', '').replace('600', '500'))} />
      )}

      <div className={cn(
        'w-14 h-14 rounded-2xl flex items-center justify-center mb-3 transition-all',
        unlocked
          ? cn('text-white shadow-lg', badge.bgColor)
          : 'bg-surface-container text-surface-container-highest'
      )}>
        {unlocked ? (
          <Award className="w-7 h-7" />
        ) : (
          <Lock className="w-6 h-6" />
        )}
      </div>

      <h5 className={cn(
        'text-sm font-bold mb-1',
        unlocked ? 'text-on-surface' : 'text-on-surface-muted'
      )}>
        {badge.title}
      </h5>
      
      <p className="text-[11px] text-on-surface-variant leading-tight line-clamp-2">
        {badge.description}
      </p>

      {unlocked && unlockedAt && (
        <div className="mt-2 text-[10px] font-medium text-on-surface-muted">
          {new Date(unlockedAt).toLocaleDateString()}
        </div>
      )}

      {!unlocked && (
        <div className="absolute top-2 right-2">
          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-surface-container text-on-surface-muted">
            {badge.rarity}
          </span>
        </div>
      )}
    </motion.div>
  );
}
