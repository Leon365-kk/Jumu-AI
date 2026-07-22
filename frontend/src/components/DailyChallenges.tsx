import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, CheckCircle2, Star, Zap, Target, ArrowRight, Flame, BookOpen, Calculator } from 'lucide-react';
import { useApp } from '@/lib/AppContext';
import { supabase } from '@/lib/supabase';
import type { DailyChallenge } from '@/lib/gamification-types';
import { generateDailyChallenges } from '@/lib/gamification';
import { cn } from '@/lib/utils';

export function DailyChallenges() {
  const { user } = useApp();
  const [challenges, setChallenges] = useState<DailyChallenge[]>([]);
  const [xp, setXP] = useState(0);
  const [level, setLevel] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || user.id === 'guest-user') {
      setLoading(false);
      return;
    }
    fetchGamificationData();
  }, [user]);

  const fetchGamificationData = async () => {
    if (!user || user.id === 'guest-user') return;
    try {
      const { data, error } = await supabase
        .from('progress')
        .select('*')
        .eq('id', user.id)
        .single();

      if (data) {
        setXP(data.xp || 0);
        setLevel(data.level || 1);
        
        const today = new Date().toISOString().split('T')[0];
        if (data.last_challenge_reset !== today) {
          const newChallenges = generateDailyChallenges(user.id);
          setChallenges(newChallenges);
          await supabase.from('progress').update({
            daily_challenges: newChallenges,
            last_challenge_reset: today
          }).eq('id', user.id);
        } else {
          setChallenges(data.daily_challenges || []);
        }
      }
      setLoading(false);
    } catch (err) {
      console.error('Error fetching challenges:', err);
      setLoading(false);
    }
  };

  const getLevelProgress = (xp: number, level: number): number => {
    const thresholds = [0, 100, 250, 500, 750, 1000, 1500, 2250, 3375, 5062, 7500, 11250, 16875, 25312, 37968, 56952, 85428, 128142, 192213, 288319];
    if (level >= thresholds.length) return 100;
    const levelStart = thresholds[level - 1] || 0;
    const levelEnd = thresholds[level] || 1000;
    const progress = xp - levelStart;
    return Math.min(Math.max((progress / (levelEnd - levelStart)) * 100, 0), 100);
  };

  if (loading) return null;

  return (
    <div className="space-y-6">
      {/* Level & XP Overview */}
      <div className="relative overflow-hidden rounded-3xl p-6 bg-gradient-to-br from-primary/5 via-primary/10 to-tertiary/5 border border-primary/10">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -mr-8 -mt-8" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-tertiary/10 rounded-full blur-2xl -ml-6 -mb-6" />
        
        <div className="flex items-center justify-between mb-4 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 bg-gradient-to-br from-primary to-primary-dark text-white rounded-2xl flex items-center justify-center font-headline font-black text-2xl shadow-lg">
              {level}
            </div>
            <div>
              <h4 className="font-headline font-bold text-on-surface">Level {level} Explorer</h4>
              <p className="text-xs text-on-surface-muted font-bold uppercase tracking-widest">{xp.toLocaleString()} Total XP</p>
            </div>
          </div>
          <Trophy className="w-8 h-8 text-gold/30" />
        </div>
        
        <div className="w-full h-2.5 bg-surface-container-high/50 rounded-full overflow-hidden mb-2 relative z-10">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${getLevelProgress(xp, level)}%` }}
            className="h-full bg-gradient-to-r from-primary via-primary to-tertiary rounded-full shadow-sm relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
          </motion.div>
        </div>
        <div className="flex items-center justify-between relative z-10">
          <p className="text-[10px] text-on-surface-muted text-right font-bold uppercase tracking-tighter">
            {Math.max(0, getLevelProgress(xp, level) < 100 ? (() => {
              const thresholds = [0, 100, 250, 500, 750, 1000, 1500, 2250, 3375, 5062, 7500, 11250, 16875, 25312, 37968, 56952, 85428, 128142, 192213, 288319];
              const levelStart = thresholds[level - 1] || 0;
              const levelEnd = thresholds[level] || 1000;
              return levelEnd - xp;
            })() : 0)} XP to Next Level
          </p>
        </div>
      </div>

      {/* Daily Challenges List */}
      <div className="rounded-3xl p-6 bg-surface-container-low/30 border border-surface-container/50">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-headline text-lg font-bold text-on-surface flex items-center gap-2">
            <span className="w-8 h-8 bg-tertiary/10 rounded-lg flex items-center justify-center text-tertiary">
              <Zap className="w-4 h-4 fill-current" />
            </span>
            Daily Challenges
          </h3>
          <span className="text-[10px] font-bold text-on-surface-muted uppercase tracking-widest bg-white px-2.5 py-1 rounded-full border border-surface-container shadow-sm">
            Resets in 14h
          </span>
        </div>

        <div className="space-y-3">
          <AnimatePresence>
            {challenges.map((challenge, index) => (
              <motion.div 
                key={challenge.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={cn(
                  'p-4 rounded-2xl border transition-all',
                  challenge.completed 
                    ? 'bg-success/5 border-success/20' 
                    : 'bg-white border-surface-container hover:border-primary/20 hover:shadow-md'
                )}
              >
                <div className="flex items-center gap-4">
                  <div className={cn(
                    'w-10 h-10 rounded-xl flex items-center justify-center transition-all flex-shrink-0',
                    challenge.completed 
                      ? 'bg-success text-white' 
                      : 'bg-primary/10 text-primary'
                  )}>
                    {challenge.completed ? <CheckCircle2 className="w-5 h-5" /> : challenge.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1">
                      <h5 className={cn(
                        'font-bold text-sm truncate',
                        challenge.completed ? 'text-success' : 'text-on-surface'
                      )}>
                        {challenge.title}
                      </h5>
                      <span className="text-[10px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded uppercase ml-2 flex-shrink-0">
                        +{challenge.reward} XP
                      </span>
                    </div>
                    <p className="text-xs text-on-surface-variant leading-tight mb-2">
                      {challenge.description}
                    </p>
                    
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-1.5 bg-surface-container-high/50 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${(challenge.current / challenge.goal) * 100}%` }}
                          className={cn('h-full rounded-full', challenge.completed ? 'bg-success' : 'bg-gradient-to-r from-primary to-primary-dark')}
                        />
                      </div>
                      <span className="text-[10px] font-bold text-on-surface-muted tabular-nums">
                        {challenge.current}/{challenge.goal}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
        
        <button className="w-full mt-6 py-3 px-4 bg-white border border-surface-container rounded-xl text-xs font-bold text-on-surface-variant hover:bg-surface-container-low transition-all flex items-center justify-center gap-2 group">
          View All Quests
          <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
}