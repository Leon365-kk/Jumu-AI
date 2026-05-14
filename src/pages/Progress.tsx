import { motion } from 'motion/react';
import { Layout } from '@/components/Layout';
import { Sprout, Flame, Clock, BookOpen, Target, BarChart3, Brain, Star, ChevronRight, Edit2 } from 'lucide-react';
import { Badges } from '@/components/Badges';
import { useState, useEffect } from 'react';
import { useApp } from '@/lib/AppContext';
import { supabase } from '@/lib/supabase';

interface ProgressData {
  dailyGoalMinutes: number;
  currentMinutes: number;
  streakDays: number;
  totalHours: number;
  totalWords: number;
  pagesRead: number;
  comprehensionScore: number;
  reReads: number;
  xp: number;
  level: number;
  badges: string[];
  weeklyActivity: { day: string; value: number }[];
}

export default function Progress() {
  const { user } = useApp();
  const [data, setData] = useState<ProgressData>({
    dailyGoalMinutes: 10,
    currentMinutes: 0,
    streakDays: 0,
    totalHours: 0,
    totalWords: 0,
    pagesRead: 0,
    comprehensionScore: 0,
    reReads: 0,
    xp: 0,
    level: 1,
    badges: [],
    weeklyActivity: [
      { day: 'M', value: 0 },
      { day: 'T', value: 0 },
      { day: 'W', value: 0 },
      { day: 'T', value: 0 },
      { day: 'F', value: 0 },
      { day: 'S', value: 0 },
      { day: 'S', value: 0 },
    ]
  });

  const fetchProgress = async () => {
    if (!user || user.id === 'guest-user') return;
    const { data: progressData, error } = await supabase
      .from('progress')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching progress:', error);
    }

    if (progressData) {
      setData({
        dailyGoalMinutes: progressData.daily_goal_minutes || 10,
        currentMinutes: progressData.current_minutes || 0,
        streakDays: progressData.streak_days || 0,
        totalHours: progressData.total_hours || 0,
        totalWords: progressData.total_words || 0,
        pagesRead: progressData.pages_read || 0,
        comprehensionScore: progressData.comprehension_score || 0,
        reReads: progressData.re_reads || 0,
        xp: progressData.xp || 0,
        level: progressData.level || 1,
        badges: progressData.badges || [],
        weeklyActivity: progressData.weekly_activity || data.weeklyActivity
      });
    } else {
      // Initialize progress for new user
      await supabase.from('progress').insert({
        id: user.id,
        daily_goal_minutes: 10,
        current_minutes: 0,
        streak_days: 0,
        total_hours: 0,
        total_words: 0,
        comprehension_score: 0,
        re_reads: 0,
        xp: 0,
        level: 1,
        weekly_activity: data.weeklyActivity
      });
    }
  };

  useEffect(() => {
    if (!user || user.id === 'guest-user') return;

    fetchProgress();

    const channel = supabase
      .channel('progress_changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'progress',
        filter: `id=eq.${user.id}`
      }, () => {
        fetchProgress();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const progressPercent = (data.currentMinutes / data.dailyGoalMinutes) * 100;

  const achievements = [
    { title: "First 10 minutes completed", icon: <Clock className="w-5 h-5" />, date: data.currentMinutes >= 10 ? "Achieved" : "In Progress" },
    { title: `${data.streakDays}-day streak`, icon: <Flame className="w-5 h-5" />, date: data.streakDays > 0 ? "Active" : "Start today!" },
    { title: "First article finished", icon: <BookOpen className="w-5 h-5" />, date: data.totalWords > 0 ? "Achieved" : "Reading..." },
  ];

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-6 pb-32">
        {/* Header & Encouragement */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 text-center"
        >
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full mb-6">
            <Star className="w-4 h-4 fill-current" />
            <span className="text-sm font-bold">Great job today!</span>
          </div>
          <h2 className="font-headline text-4xl font-extrabold text-primary mb-2">Your Growth</h2>
          <p className="text-on-surface-variant text-lg">“Small steps matter. You’re improving every day.”</p>
        </motion.section>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* 1. Daily Progress Ring */}
          <section className="bg-white rounded-3xl p-8 shadow-sm border border-surface-container-highest flex flex-col items-center justify-center text-center">
            <div className="relative w-48 h-48 mb-6">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="96"
                  cy="96"
                  r="88"
                  stroke="currentColor"
                  strokeWidth="12"
                  fill="transparent"
                  className="text-surface-container-high"
                />
                <motion.circle
                  cx="96"
                  cy="96"
                  r="88"
                  stroke="currentColor"
                  strokeWidth="12"
                  fill="transparent"
                  strokeDasharray={552.92}
                  initial={{ strokeDashoffset: 552.92 }}
                  animate={{ strokeDashoffset: 552.92 - (552.92 * progressPercent) / 100 }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  className="text-primary"
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-headline font-bold text-primary">{Math.round(progressPercent)}%</span>
                <span className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Goal</span>
              </div>
            </div>
            <h3 className="text-2xl font-headline font-bold text-on-surface mb-1">{data.currentMinutes} / {data.dailyGoalMinutes} minutes read</h3>
            <p className="text-on-surface-variant font-medium mb-8">You’re almost there!</p>

            {/* Level Progress */}
            <div className="w-full pt-8 border-t border-surface-container-highest">
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-primary text-white rounded-lg flex items-center justify-center font-headline font-bold text-sm">
                    {data.level}
                  </div>
                  <span className="text-sm font-bold text-on-surface">Level {data.level} Explorer</span>
                </div>
                <span className="text-xs font-bold text-stone-400 uppercase tracking-widest">{data.xp % 1000} / 1000 XP</span>
              </div>
              <div className="w-full h-2 bg-surface-container-highest rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${(data.xp % 1000) / 10}%` }}
                  className="h-full bg-gradient-to-r from-primary to-tertiary rounded-full shadow-sm"
                />
              </div>
            </div>
          </section>

          <div className="space-y-8">
            {/* 2. Streak Tracker */}
            <section className="bg-gradient-to-br from-tertiary/10 to-tertiary/5 rounded-3xl p-6 border border-tertiary/20">
              <div className="flex items-center gap-4 mb-3">
                <div className="w-12 h-12 bg-tertiary/20 rounded-2xl flex items-center justify-center text-tertiary">
                  <Flame className="w-6 h-6 fill-current" />
                </div>
                <div>
                  <h4 className="text-xl font-headline font-bold text-on-surface">{data.streakDays} Day Streak 🔥</h4>
                  <p className="text-sm text-on-surface-variant font-medium">You’re building a great habit!</p>
                </div>
              </div>
            </section>

            {/* 3. Reading Time & 4. Words */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-surface-container-low rounded-3xl p-6 border border-surface-container-highest">
                <Clock className="w-6 h-6 text-primary mb-3" />
                <div className="text-2xl font-headline font-bold text-on-surface">{data.totalHours} hrs</div>
                <div className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Reading Time</div>
              </div>
              <div className="bg-surface-container-low rounded-3xl p-6 border border-surface-container-highest">
                <BookOpen className="w-6 h-6 text-primary mb-3" />
                <div className="text-2xl font-headline font-bold text-on-surface">{data.pagesRead.toLocaleString()}</div>
                <div className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Pages Read</div>
              </div>
            </div>

            {/* 7. Comprehension Boost */}
            <section className="bg-primary/5 rounded-3xl p-6 border border-primary/10">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Brain className="w-6 h-6 text-primary" />
                  <h4 className="font-headline font-bold text-on-surface">Comprehension Boost</h4>
                </div>
                <span className="bg-primary text-white text-xs font-bold px-2 py-1 rounded-full">
                  {data.reReads} re-reads
                </span>
              </div>
              <div className="flex items-end gap-2 mb-2">
                <span className="text-3xl font-headline font-bold text-primary">{data.comprehensionScore}%</span>
                <span className="text-sm text-on-surface-variant font-medium pb-1">understanding score</span>
              </div>
              <p className="text-xs text-on-surface-variant leading-relaxed">Based on your quiz results and {data.reReads} re-reads. You're focusing better!</p>
            </section>
          </div>
        </div>

        {/* 6. Weekly Activity Chart */}
        <section className="mt-12 bg-white rounded-3xl p-8 shadow-sm border border-surface-container-highest">
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-3">
              <BarChart3 className="w-6 h-6 text-primary" />
              <h3 className="font-headline text-xl font-bold text-on-surface">Weekly Activity</h3>
            </div>
            <span className="text-sm font-medium text-on-surface-variant">Consistency is key</span>
          </div>
          <div className="flex items-end justify-between h-40 gap-2">
            {data.weeklyActivity.map((item, i) => {
              const height = Math.min((item.value / data.dailyGoalMinutes) * 100, 100);
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-3">
                  <div className="relative w-full max-w-[40px] h-full flex items-end">
                    <motion.div 
                      initial={{ height: 0 }}
                      animate={{ height: `${height}%` }}
                      transition={{ duration: 1, delay: i * 0.1 }}
                      className="w-full bg-primary/20 rounded-t-xl relative group"
                    >
                      <div className="absolute inset-0 bg-primary opacity-0 group-hover:opacity-100 transition-opacity rounded-t-xl" />
                      {item.value > 0 && (
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-primary text-white text-[10px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                          {Math.round(item.value)}m
                        </div>
                      )}
                    </motion.div>
                  </div>
                  <span className="text-xs font-bold text-stone-400">{item.day}</span>
                </div>
              );
            })}
          </div>
        </section>

        {/* 5. Goals Section */}
        <section className="mt-12 bg-surface-container-low rounded-3xl p-8 border border-surface-container-highest">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <Target className="w-6 h-6 text-primary" />
              <h3 className="font-headline text-xl font-bold text-on-surface">Your Goals</h3>
            </div>
            <button className="p-2 text-primary hover:bg-primary/10 rounded-full transition-colors">
              <Edit2 className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-2xl flex justify-between items-center">
              <div>
                <div className="font-bold text-on-surface">Daily Reading Goal</div>
                <div className="text-sm text-on-surface-variant">Set to {data.dailyGoalMinutes} minutes per day</div>
              </div>
              <div className="text-xl font-headline font-bold text-primary">{data.dailyGoalMinutes}m</div>
            </div>
            <div className="bg-white p-4 rounded-2xl flex justify-between items-center">
              <div>
                <div className="font-bold text-on-surface">Weekly Sessions</div>
                <div className="text-sm text-on-surface-variant">Aim for 5 active days</div>
              </div>
              <div className="text-xl font-headline font-bold text-primary">5d</div>
            </div>
          </div>
        </section>

        {/* 8. Achievements replaced with Dynamic Badges */}
        <section className="mt-12">
          <Badges unlockedIds={data.badges} />
        </section>
      </div>
    </Layout>
  );
}
