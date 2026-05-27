import React from 'react';
import { motion } from 'motion/react';
import { Award, Zap, Star, Shield, Target, Crown, Flame, BookOpen } from 'lucide-react';

export interface Badge {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  unlocked: boolean;
  color: string;
}

interface BadgesProps {
  unlockedIds: string[];
}

export function Badges({ unlockedIds }: BadgesProps) {
  const allBadges: Badge[] = [
    { 
      id: 'streak_3', 
      title: 'Persistent', 
      description: '3-day reading streak', 
      icon: <Flame className="w-5 h-5" />, 
      unlocked: unlockedIds.includes('streak_3'),
      color: 'bg-orange-500' 
    },
    { 
      id: 'first_5min', 
      title: 'Early Explorer', 
      description: 'First 5 minutes completed', 
      icon: <Zap className="w-5 h-5" />, 
      unlocked: unlockedIds.includes('first_5min'),
      color: 'bg-blue-500' 
    },
    { 
      id: 'words_10', 
      title: 'Wordsmith', 
      description: '10 words in glossary', 
      icon: <BookOpen className="w-5 h-5" />, 
      unlocked: unlockedIds.includes('words_10'),
      color: 'bg-emerald-500' 
    },
    { 
      id: 'level_5', 
      title: 'Rising Star', 
      description: 'Reached Level 5', 
      icon: <Crown className="w-5 h-5" />, 
      unlocked: unlockedIds.includes('level_5'),
      color: 'bg-purple-500' 
    }
  ];

  const unlockedCount = allBadges.filter(b => b.unlocked).length;

  return (
    <div className="bg-white rounded-3xl p-6 border border-surface-container-high shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-headline text-lg font-bold text-on-surface flex items-center gap-2">
          <Award className="w-5 h-5 text-primary" />
          Milestones
        </h3>
        <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-1 rounded-full uppercase tracking-widest border border-primary/20">
          {unlockedCount}/{allBadges.length}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {allBadges.map((badge, index) => (
          <motion.div
            key={badge.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            className={`relative p-4 rounded-2xl border flex flex-col items-center text-center transition-all overflow-hidden ${
              badge.unlocked 
                ? 'bg-surface-container-lowest border-surface-container-high shadow-sm' 
                : 'bg-surface/50 border-dashed border-stone-200 opacity-60 grayscale'
            }`}
          >
            {badge.unlocked && (
              <div className={`absolute top-0 left-0 w-full h-1 ${badge.color}`} />
            )}
            
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-2 shadow-sm ${
              badge.unlocked ? `${badge.color} text-white` : 'bg-stone-100 text-stone-400'
            }`}>
              {badge.icon}
            </div>
            
            <h5 className="text-xs font-bold text-on-surface mb-0.5">{badge.title}</h5>
            <p className="text-[9px] text-on-surface-variant leading-tight font-medium">
              {badge.description}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
