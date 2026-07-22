import { motion } from 'motion/react';
import { Layout } from '@/components/Layout';
import { Target, TrendingUp, Award, BookOpen, Flame, Zap } from 'lucide-react';
import SEO from '@/lib/SEO';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { AnimatedStreakCounter } from '@/components/AnimatedStreakCounter';
import { LevelProgressRing } from '@/components/LevelProgressRing';
import { Badges } from '@/components/Badges';
import { cn } from '@/lib/utils';
import type { UserProgress } from '@/lib/gamification-types';
import { fetchProgress, getLevelProgress } from '@/lib/gamification';

export default function Progress() {
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [weeklyData, setWeeklyData] = useState<{ day: string; value: number }[]>([]);

  useEffect(() => {
    const init = async () => {
      const data = await fetchProgress('current-user');
      if (data) setProgress(data);
      setWeeklyData(['M', 'T', 'W', 'T', 'F', 'S', 'S'].map(day => ({
        day,
        value: Math.floor(Math.random() * 45) + 5
      })));
    };
    init();
  }, []);

  if (!progress) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-6 py-24 text-center">
          <div className="w-16 h-16 bg-surface-container-high rounded-full flex items-center justify-center mx-auto mb-4">
            <Target className="w-8 h-8 text-on-surface-muted" />
          </div>
          <h2 className="text-2xl font-headline font-bold text-on-surface mb-2">No Progress Yet</h2>
          <p className="text-on-surface-muted">Start learning to see your progress here!</p>
        </div>
      </Layout>
    );
  }

  const progressPercent = Math.min((progress.current_minutes / progress.daily_goal_minutes) * 100, 100);
  const xpPerLevel = 1000;

  return (
    <Layout>
      <SEO
        title="Progress — Jumu AI"
        description="Track your learning progress, view streaks, badges, and weekly activity on Jumu AI."
        canonical="https://jumu.ai/progress"
        ogType="website"
      />
      <div className="max-w-7xl mx-auto px-6 pb-24">
        {/* Header Stats */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10 grid grid-cols-1 lg:grid-cols-2 gap-8"
        >
          {/* Level & Streak Card */}
          <div className="bg-white rounded-3xl p-8 border border-surface-container shadow-card relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-primary/5 to-tertiary/5 rounded-full blur-3xl -mr-16 -mt-16" />
            
            <div className="relative z-10 flex items-center gap-8">
              <LevelProgressRing 
                level={progress.level} 
                xp={progress.xp} 
                size={140} 
                strokeWidth={10} 
              />
              
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <AnimatedStreakCounter streakDays={progress.streak_days} size="lg" />
                  <div>
                    <p className="text-xs font-bold text-on-surface-muted uppercase tracking-widest">Current Streak</p>
                    <p className="text-2xl font-headline font-black text-on-surface">{progress.streak_days} days</p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-bold text-on-surface-muted uppercase tracking-wider">Level Progress</span>
                      <span className="font-bold text-primary">{Math.round(getLevelProgress(progress.xp))}%</span>
                    </div>
                    <div className="w-full h-2 bg-surface-container-high/50 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${getLevelProgress(progress.xp)}%` }}
                        className="h-full bg-gradient-to-r from-primary to-tertiary rounded-full"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Daily Goal Card */}
          <div className="bg-gradient-to-br from-primary/5 to-tertiary/5 rounded-3xl p-8 border border-primary/10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-primary/10 rounded-full blur-2xl -mr-12 -mt-12" />
            
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-primary shadow-sm">
                  <Target className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-on-surface">Daily Goal</h3>
                  <p className="text-xs text-on-surface-muted">Keep the momentum going</p>
                </div>
              </div>

              <div className="text-center mb-6">
                <div className="relative inline-flex items-center justify-center">
                  <svg width="180" height="180" className="transform -rotate-90">
                    <circle cx="90" cy="90" r="80" stroke="#E2E8F0" strokeWidth="12" fill="none" />
                    <motion.circle
                      cx="90" cy="90" r="80"
                      stroke="var(--primary)"
                      strokeWidth="12"
                      fill="none"
                      strokeLinecap="round"
                      initial={{ strokeDashoffset: 502 }}
                      animate={{ strokeDashoffset: 502 - (502 * progressPercent / 100) }}
                      transition={{ duration: 1.5, ease: 'easeOut' }}
                      style={{ strokeDasharray: 502 }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-5xl font-headline font-black text-on-surface">{Math.round(progressPercent)}%</span>
                    <span className="text-xs text-on-surface-muted uppercase tracking-widest mt-1">Complete</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white rounded-2xl p-4 border border-surface-container">
                  <p className="text-[10px] font-bold text-on-surface-muted uppercase tracking-widest mb-1">Today</p>
                  <p className="text-2xl font-headline font-black text-on-surface">{Math.round(progress.current_minutes)}<span className="text-sm text-on-surface-muted ml-1">min</span></p>
                </div>
                <div className="bg-white rounded-2xl p-4 border border-surface-container">
                  <p className="text-[10px] font-bold text-on-surface-muted uppercase tracking-widest mb-1">Goal</p>
                  <p className="text-2xl font-headline font-black text-on-surface">{progress.daily_goal_minutes}<span className="text-sm text-on-surface-muted ml-1">min</span></p>
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Stats Grid */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {[
            { label: 'Total XP', value: progress.xp.toLocaleString(), icon: Zap, color: 'text-primary' },
            { label: 'Words Learned', value: progress.total_words.toLocaleString(), icon: BookOpen, color: 'text-tertiary' },
            { label: 'Pages Read', value: progress.pages_read.toString(), icon: BookOpen, color: 'text-success' },
            { label: 'Streak', value: `${progress.streak_days} days`, icon: Flame, color: 'text-orange-500' },
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white rounded-3xl p-6 border border-surface-container shadow-card"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center bg-surface-container-low', stat.color)}>
                  <stat.icon className="w-5 h-5" />
                </div>
              </div>
              <p className="text-3xl font-headline font-black text-on-surface">{stat.value}</p>
              <p className="text-xs font-bold text-on-surface-muted uppercase tracking-widest mt-1">{stat.label}</p>
            </motion.div>
          ))}
        </section>

        {/* Weekly Activity */}
        <section className="bg-white rounded-3xl p-6 border border-surface-container shadow-card mb-12">
          <h3 className="text-xl font-bold text-on-surface mb-6 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Weekly Activity
          </h3>
          <div className="min-h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                <XAxis 
                  dataKey="day" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748B', fontWeight: 600, fontSize: 12 }} 
                />
                <YAxis hide />
                <Tooltip 
                  cursor={{ fill: 'rgba(0, 102, 255, 0.05)' }}
                  contentStyle={{ 
                    borderRadius: '16px', 
                    border: 'none', 
                    boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
                    backgroundColor: 'rgba(255,255,255,0.95)',
                    backdropFilter: 'blur(10px)'
                  }}
                />
                <Bar dataKey="value" radius={[8, 8, 8, 8]} barSize={32}>
                  {weeklyData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.value > 0 ? 'var(--primary)' : '#E2E8F0'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-center text-xs font-medium text-on-surface-muted mt-4">
            Minutes reading per day
          </p>
        </section>

        {/* Badges Section */}
        <section>
          <Badges unlockedIds={progress.badges} />
        </section>
      </div>
    </Layout>
  );
}