import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, CheckCircle2, Circle, Star, Zap, Target, ArrowRight } from 'lucide-react';
import { useApp } from '@/lib/AppContext';
import { supabase } from '@/lib/supabase';

interface Challenge {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  reward: number;
  goal: number;
  current: number;
  completed: boolean;
  type: 'reading' | 'vocabulary' | 'writing' | 'general';
}

export function DailyChallenges() {
  const { user, t } = useApp();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
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
        
        // Handle challenges - if they don't exist or are old, generate new ones
        const today = new Date().toISOString().split('T')[0];
        if (data.last_challenge_reset !== today) {
          generateDailyChallenges(data);
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

  const generateDailyChallenges = async (progressData: any) => {
    const today = new Date().toISOString().split('T')[0];
    
    const possibleChallenges: Omit<Challenge, 'current' | 'completed'>[] = [
      { id: '1', title: 'Deep Diver', description: 'Read for 10 minutes', reward: 50, goal: 10, icon: <Zap className="w-5 h-5" />, type: 'reading' },
      { id: '2', title: 'Wordsmith', description: 'Save 3 new words', reward: 30, goal: 3, icon: <Star className="w-5 h-5" />, type: 'vocabulary' },
      { id: '3', title: 'Creative Spark', description: 'Use the Writing Tool', reward: 40, goal: 1, icon: <Target className="w-5 h-5" />, type: 'writing' },
      { id: '4', title: 'Library Visit', description: 'Open 2 different books', reward: 20, goal: 2, icon: <Zap className="w-5 h-5" />, type: 'general' },
      { id: '5', title: 'Morning Focus', description: 'Read before noon', reward: 60, goal: 1, icon: <Star className="w-5 h-5" />, type: 'reading' },
    ];

    // Select 3 random challenges based on the date as seed
    const seed = new Date().getDate();
    const shuffled = [...possibleChallenges].sort(() => 0.5 - (Math.random() * seed / 31));
    const selected = shuffled.slice(0, 3).map(c => ({
      ...c,
      current: 0,
      completed: false
    }));

    setChallenges(selected);
    
    // Save to database
    if (user && user.id !== 'guest-user') {
      await supabase.from('progress').update({
        daily_challenges: selected,
        last_challenge_reset: today
      }).eq('id', user.id);
    }
  };

  const calculateLevelProgress = () => {
    const xpPerLevel = 1000;
    const currentProgress = xp % xpPerLevel;
    return (currentProgress / xpPerLevel) * 100;
  };

  if (loading) return null;

  return (
    <div className="space-y-6">
      {/* Level & XP Overview */}
      <div className="bg-white rounded-3xl p-6 border border-surface-container-high shadow-sm overflow-hidden relative">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full -mr-8 -mt-8" />
        <div className="flex items-center justify-between mb-4 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary text-white rounded-2xl flex items-center justify-center font-headline font-black text-xl shadow-lg">
              {level}
            </div>
            <div>
              <h4 className="font-headline font-bold text-on-surface">Level {level} Explorer</h4>
              <p className="text-xs text-on-surface-variant font-bold uppercase tracking-widest">{xp.toLocaleString()} Total XP</p>
            </div>
          </div>
          <Trophy className="w-8 h-8 text-tertiary opacity-20" />
        </div>
        
        <div className="w-full h-3 bg-surface-container-highest rounded-full overflow-hidden mb-2 relative z-10">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${calculateLevelProgress()}%` }}
            className="h-full bg-gradient-to-r from-primary to-tertiary rounded-full shadow-sm"
          />
        </div>
        <p className="text-[10px] text-on-surface-variant text-right font-bold uppercase tracking-tighter">
          {1000 - (xp % 1000)} XP to Next Level
        </p>
      </div>

      {/* Daily Challenges List */}
      <div className="bg-surface-container-low rounded-3xl p-6 border border-surface-container-high/50">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-headline text-lg font-bold text-on-surface flex items-center gap-2">
            <span className="w-8 h-8 bg-tertiary/10 rounded-lg flex items-center justify-center text-tertiary">
              <Zap className="w-4 h-4 fill-current" />
            </span>
            Daily Challenges
          </h3>
          <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest bg-white px-2 py-1 rounded-full border border-surface-container-high shadow-sm">
            Resets in 14h
          </span>
        </div>

        <div className="space-y-4">
          {challenges.map((challenge, index) => (
            <motion.div 
              key={challenge.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`p-4 rounded-2xl border transition-all ${
                challenge.completed 
                ? 'bg-success/5 border-success/20' 
                : 'bg-white border-surface-container-high hover:border-primary/20'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                  challenge.completed ? 'bg-success text-white' : 'bg-surface-container-high text-on-surface-variant'
                }`}>
                  {challenge.completed ? <CheckCircle2 className="w-5 h-5" /> : challenge.icon}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-1">
                    <h5 className={`font-bold text-sm ${challenge.completed ? 'text-success' : 'text-on-surface'}`}>
                      {challenge.title}
                    </h5>
                    <span className="text-[10px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded uppercase">
                      +{challenge.reward} XP
                    </span>
                  </div>
                  <p className="text-xs text-on-surface-variant leading-tight">
                    {challenge.description}
                  </p>
                  
                  <div className="mt-3 flex items-center gap-3">
                    <div className="flex-1 h-1.5 bg-surface-container-highest rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${(challenge.current / challenge.goal) * 100}%` }}
                        className={`h-full rounded-full ${challenge.completed ? 'bg-success' : 'bg-primary'}`}
                      />
                    </div>
                    <span className="text-[10px] font-bold text-stone-400">
                      {challenge.current}/{challenge.goal}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        
        <button className="w-full mt-6 py-3 px-4 bg-white border border-surface-container-high rounded-xl text-xs font-bold text-on-surface-variant hover:bg-surface-container-lowest transition-all flex items-center justify-center gap-2 group">
          View All Quests
          <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
}
