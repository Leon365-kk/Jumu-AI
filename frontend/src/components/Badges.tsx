import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Award, ChevronDown, ChevronUp } from 'lucide-react';
import { BADGE_DEFINITIONS } from '@/lib/gamification-types';
import { AchievementCard } from '@/components/AchievementCard';
import { cn } from '@/lib/utils';

interface BadgesProps {
  unlockedIds: string[];
}

export function Badges({ unlockedIds }: BadgesProps) {
  const [isOpen, setIsOpen] = useState(false);
  const unlockedCount = BADGE_DEFINITIONS.filter(b => unlockedIds.includes(b.id)).length;

  return (
    <div className="rounded-3xl p-6 bg-surface-container-low/30 border border-surface-container/50">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between mb-4 text-left"
      >
        <h3 className="font-headline text-lg font-bold text-on-surface flex items-center gap-2">
          <Award className="w-5 h-5 text-primary" />
          Achievements
        </h3>
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-full uppercase tracking-widest border border-primary/20">
            {unlockedCount}/{BADGE_DEFINITIONS.length}
          </span>
          {isOpen ? (
            <ChevronUp className="w-5 h-5 text-on-surface-muted transition-transform" />
          ) : (
            <ChevronDown className="w-5 h-5 text-on-surface-muted transition-transform" />
          )}
        </div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="grid grid-cols-2 gap-3 pt-2">
              {BADGE_DEFINITIONS.map((badge, index) => (
                <AchievementCard
                  key={badge.id}
                  badge={badge}
                  unlocked={unlockedIds.includes(badge.id)}
                  index={index}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
