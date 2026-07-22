import { motion } from 'motion/react';
import { Layout } from '@/components/Layout';
import { Flame, BookOpen, Languages, Star, Trophy, ArrowRight, Book, Edit3, Sprout, BarChart3, BookMarked, Zap, Calculator, Library, Target, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { usePreferences } from '@/lib/PreferencesContext';
import { useGamification } from '@/lib/GamificationContext';
import SEO from '@/lib/SEO';
import { TapEffect } from '@/components/TapEffect';
import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { DailyChallenges } from '@/components/DailyChallenges';
import { Badges } from '@/components/Badges';
import { AnimatedStreakCounter } from '@/components/AnimatedStreakCounter';
import { LevelProgressRing } from '@/components/LevelProgressRing';
import { cn } from '@/lib/utils';
import type { LeaderboardEntry } from '@/lib/gamification-types';
import { Leaderboard } from '@/components/Leaderboard';

export default function Dashboard() {
  const { user } = useAuth();
  const { userName, language, t, learningFocus, setLearningFocus } = usePreferences();
  const { addXP } = useGamification();
  const [progress, setProgress] = useState({
    currentMinutes: 0,
    dailyGoalMinutes: 10,
    totalWords: 0,
    streakDays: 0,
    pagesRead: 0,
    xp: 0,
    level: 1,
    badges: [] as string[],
    weeklyActivity: [] as { day: string; value: number }[],
    totalHours: 0,
    comprehensionScore: 0,
    reReads: 0
  });

  const [recentBooks, setRecentBooks] = useState<any[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);

  const fetchDataDebounced = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchData = useCallback(async () => {
    if (!user || user.id === 'guest-user') return;
    
    const { data: progressData, error: progressError } = await supabase
      .from('progress')
      .select('current_minutes, daily_goal_minutes, total_words, streak_days, pages_read, xp, level, badges, weekly_activity, comprehension_score, re_reads')
      .eq('id', user.id)
      .single();

    if (progressError && progressError.code !== 'PGRST116') {
      console.error('Error fetching progress:', progressError);
    }

    if (progressData) {
      setProgress({
        currentMinutes: progressData.current_minutes || 0,
        dailyGoalMinutes: progressData.daily_goal_minutes || 10,
        totalWords: progressData.total_words || 0,
        streakDays: progressData.streak_days || 0,
        pagesRead: progressData.pages_read || 0,
        xp: progressData.xp || 0,
        level: progressData.level || 1,
        badges: progressData.badges || [],
        weeklyActivity: progressData.weekly_activity || [],
        totalHours: (progressData.current_minutes || 0) / 60,
        comprehensionScore: progressData.comprehension_score || 0,
        reReads: progressData.re_reads || 0
      });
    }

    // Fetch leaderboard
    const { data: leaderboardData } = await supabase
      .from('progress')
      .select('id, xp, level, streak_days, users(name, avatar_url)')
      .order('xp', { ascending: false })
      .limit(10);

    if (leaderboardData) {
      const mapped: LeaderboardEntry[] = leaderboardData.map((entry: any, index: number) => ({
        id: entry.id,
        name: entry.users?.name || 'Anonymous',
        avatar_url: entry.users?.avatar_url,
        xp: entry.xp || 0,
        level: entry.level || 1,
        streak_days: entry.streak_days || 0,
        rank: index + 1
      }));
      setLeaderboard(mapped);
    }
  }, [user]);

  const debouncedFetchData = useCallback(() => {
    if (fetchDataDebounced.current) {
      clearTimeout(fetchDataDebounced.current);
    }
    fetchDataDebounced.current = setTimeout(() => {
      fetchData();
    }, 500);
  }, [fetchData]);

  useEffect(() => {
    if (!user || user.id === 'guest-user') return;
    
    fetchData();

    const progressChannel = supabase
      .channel(`dashboard_progress_${user.id}`)
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'progress',
        filter: `id=eq.${user.id}`
      }, () => {
        debouncedFetchData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(progressChannel);
      if (fetchDataDebounced.current) {
        clearTimeout(fetchDataDebounced.current);
      }
    };
  }, [user, debouncedFetchData]);

  const progressPercent = Math.min((progress.currentMinutes / progress.dailyGoalMinutes) * 100, 100);

  const fullWeeklyData = useMemo(() => {
    const dayLabels = ['mon','tue','wed','thu','fri','sat','sun'];
    return dayLabels.map(day => {
      const existing = progress.weeklyActivity.find((d: any) => d.day === day);
      return { day: day.toUpperCase(), value: existing ? Math.round(existing.value) : 0 };
    });
  }, [progress.weeklyActivity]);

  return (
    <Layout>
      <SEO
        title="Dashboard — Jumu AI"
        description="Your personalized Jumu AI dashboard. Track daily progress, view reading challenges, earn badges, and focus insights — all in one place."
        canonical="https://jumu.ai/dashboard"
        ogType="website"
      />
      <div className="max-w-7xl mx-auto px-8 pb-32">
        {/* Learning Focus Selection */}
        <section className="mb-16 bg-white rounded-3xl p-8 border border-surface-container shadow-card">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h3 className="text-xl font-bold text-on-surface mb-1">Your Learning Focus</h3>
              <p className="text-on-surface-muted text-sm">Choose what skills you want to prioritize today.</p>
            </div>
            <div className="flex bg-surface-container-low p-1 rounded-2xl gap-1">
              {(['reading', 'math', 'all'] as const).map(focus => (
                <button
                  key={focus}
                  onClick={() => setLearningFocus(focus)}
                  className={cn(
                    'px-6 py-2.5 rounded-xl text-sm font-medium capitalize transition-all',
                    learningFocus === focus 
                      ? 'bg-white text-primary shadow-sm' 
                      : 'text-on-surface-muted hover:text-on-surface hover:bg-surface-container/50'
                  )}
                >
                  {focus}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Hero Stats Row */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {/* Welcome + Level Card */}
          <div className="lg:col-span-2 bg-white rounded-3xl p-10 border border-surface-container shadow-card relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-primary/5 to-tertiary/5 rounded-full blur-3xl -mr-16 -mt-16" />
            
            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-6">
              <div className="flex items-center gap-5">
                <AnimatedStreakCounter streakDays={progress.streakDays} size="lg" />
                <div>
                  <h2 className="text-3xl font-headline font-bold text-on-surface mb-1">
                    {t('hi')} {userName || 'Friend'},
                  </h2>
                  <p className="text-lg text-on-surface-muted font-light">
                    {progress.streakDays >= 3 
                      ? `You're on a ${progress.streakDays}-day streak! Amazing focus.` 
                      : t('readyToLearn')}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 md:ml-auto">
                <div className="bg-surface-container-low rounded-2xl p-4 border border-surface-container">
                  <LevelProgressRing level={progress.level} xp={progress.xp} size={80} strokeWidth={6} showLabel={false} />
                </div>
                <div>
                  <p className="text-xs font-bold text-on-surface-muted uppercase tracking-widest mb-1">Level {progress.level}</p>
                  <p className="text-2xl font-headline font-black text-on-surface">{progress.xp.toLocaleString()}</p>
                  <p className="text-xs text-on-surface-muted">Total XP</p>
                </div>
              </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-4 mt-8 pt-6 border-t border-surface-container">
              <div>
                <p className="text-[10px] font-bold text-on-surface-muted uppercase tracking-widest mb-1">Pages Read</p>
                <p className="text-3xl font-headline font-black text-on-surface">{progress.pagesRead}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-on-surface-muted uppercase tracking-widest mb-1">{t('wordsRead')}</p>
                <p className="text-3xl font-headline font-black text-on-surface">{progress.totalWords.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-on-surface-muted uppercase tracking-widest mb-1">Time Today</p>
                <p className="text-3xl font-headline font-black text-on-surface">{Math.round(progress.currentMinutes)}<span className="text-lg text-on-surface-muted ml-1">min</span></p>
              </div>
            </div>
          </div>

          {/* Daily Progress Widget */}
          <TapEffect>
            <Link to="/progress" className="block bg-gradient-to-br from-primary/5 to-tertiary/5 rounded-3xl p-8 border border-primary/10 hover:border-primary/20 transition-all group relative overflow-hidden h-full">
              <div className="flex flex-col h-full justify-between relative z-10">
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-primary shadow-sm group-hover:scale-110 transition-transform">
                      <Sprout className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-on-surface">{t('dailyProgress')}</h3>
                      <p className="text-xs text-on-surface-muted">{Math.round(progress.currentMinutes)} of {progress.dailyGoalMinutes} min</p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <div className="text-right mb-2">
                    <span className="text-5xl font-headline font-black text-primary">{Math.round(progressPercent)}%</span>
                    {progressPercent >= 100 && (
                      <div className="text-[10px] font-bold text-primary uppercase tracking-wider mt-1">Goal Hit!</div>
                    )}
                  </div>
                  <div className="w-full h-3 bg-surface-container-high/50 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${progressPercent}%` }}
                      className="h-full bg-gradient-to-r from-primary to-tertiary rounded-full shadow-sm relative overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
                    </motion.div>
                  </div>
                </div>
              </div>
              
              <div className="absolute bottom-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl -mb-8 -mr-8 group-hover:scale-125 transition-transform duration-500" />
            </Link>
          </TapEffect>
        </motion.section>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 mb-16">
          <div className="md:col-span-1 lg:col-span-2 space-y-10">
            {/* Weekly Activity Chart */}
            <div className="bg-white rounded-3xl p-6 border border-surface-container shadow-card">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-base font-bold text-on-surface flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-primary" />
                  Reading Activity
                </h3>
                <span className="text-[10px] font-bold text-on-surface-muted uppercase tracking-widest">Last 7 Days</span>
              </div>
              <div className="h-[160px] w-full">
                <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                  <BarChart data={fullWeeklyData}>
                    <XAxis 
                      dataKey="day" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#64748B', fontWeight: 600, fontSize: 11 }} 
                    />
                    <Tooltip 
                      cursor={{ fill: 'rgba(0, 102, 255, 0.05)' }}
                      contentStyle={{ 
                        borderRadius: '12px', 
                        border: 'none', 
                        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                        backgroundColor: 'rgba(255,255,255,0.95)',
                        backdropFilter: 'blur(8px)'
                      }}
                    />
                    <Bar dataKey="value" radius={[4, 4, 4, 4]} barSize={16}>
                      {fullWeeklyData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={entry.value > 0 ? 'var(--primary)' : '#E2E8F0'} 
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Feature Grid */}
            <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                { title: t('smartReader'), desc: t('smartReaderDesc'), icon: Book, to: '/reader', category: 'reading' },
                { title: 'Library', desc: 'Find thousands of free classic books.', icon: Library, to: '/library', category: 'reading' },
                { title: 'Story Maker', desc: 'Create your own adventures with AI help.', icon: Edit3, to: '/writer', category: 'reading' },
                { title: 'Focus Zone', desc: 'Calm your mind sessions.', icon: Zap, to: '/focus-zone', category: 'all' },
                { title: t('mathHelper'), desc: t('mathHelperDesc'), icon: Calculator, to: '/math', category: 'math' },
                { title: t('glossary'), desc: t('glossaryDesc'), icon: BookMarked, to: '/glossary', category: 'reading' },
              ].filter(action => learningFocus === 'all' || action.category === 'all' || action.category === learningFocus).map((action, i) => (
                <div key={i} className="h-full">
                  <TapEffect className="h-full">
                    <Link 
                      to={action.to}
                      className="group bg-white rounded-3xl p-6 flex flex-col justify-between h-full min-h-[200px] transition-all border border-surface-container hover:border-primary/20 hover:shadow-card-hover relative overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-full -mr-6 -mt-6 transition-transform group-hover:scale-110" />
                      <div className="relative z-10">
                        <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary mb-4 shadow-sm group-hover:scale-110 group-hover:bg-primary group-hover:text-white transition-all">
                          <action.icon className="w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-bold text-on-surface mb-2">{action.title}</h3>
                        <p className="text-on-surface-muted leading-relaxed text-sm">{action.desc}</p>
                      </div>
                      <div className="flex items-center text-primary font-bold gap-2 group-hover:gap-4 transition-all mt-4 text-sm">
                        <span>Open Tool</span>
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    </Link>
                  </TapEffect>
                </div>
              ))}
            </section>

            {/* Achievements Section */}
            <Badges unlockedIds={progress.badges} />

            {/* Weekly Summary Section */}
            <section className="bg-white rounded-3xl p-8 border border-surface-container shadow-card">
              <div className="flex items-center gap-3 mb-6">
                <TrendingUp className="w-6 h-6 text-primary" />
                <h3 className="text-2xl font-headline font-bold text-on-surface">This Week</h3>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-surface-container-low p-4 rounded-xl">
                  <p className="text-[10px] font-bold text-on-surface-muted uppercase tracking-widest mb-1">Total Hours</p>
                  <p className="text-2xl font-headline font-black text-on-surface">{progress.totalHours.toFixed(1)}h</p>
                </div>
                <div className="bg-surface-container-low p-4 rounded-xl">
                  <p className="text-[10px] font-bold text-on-surface-muted uppercase tracking-widest mb-1">Comprehension</p>
                  <p className="text-2xl font-headline font-black text-on-surface">{progress.comprehensionScore}%</p>
                </div>
                <div className="bg-surface-container-low p-4 rounded-xl">
                  <p className="text-[10px] font-bold text-on-surface-muted uppercase tracking-widest mb-1">Re-reads</p>
                  <p className="text-2xl font-headline font-black text-on-surface">{progress.reReads}</p>
                </div>
                <div className="bg-surface-container-low p-4 rounded-xl">
                  <p className="text-[10px] font-bold text-on-surface-muted uppercase tracking-widest mb-1">Streak</p>
                  <p className="text-2xl font-headline font-black text-on-surface">{progress.streakDays} days</p>
                </div>
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <div className="flex flex-col gap-10">
            {/* Daily Challenges Sidebar Component */}
            <DailyChallenges />
            
            {/* Simple To-Do List Feature */}
            
            {/* Leaderboard */}
            {leaderboard.length > 0 && (
              <Leaderboard 
                entries={leaderboard} 
                currentUserId={user?.id}
                title="Top Learners"
                subtitle="Weekly rankings"
              />
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}