import { motion } from 'motion/react';
import { Layout } from '@/components/Layout';
import { Flame, BookOpen, Languages, Star, Sparkles, Trophy, ArrowRight, Book, Edit3, Sprout, BarChart3, BookMarked, Zap, Calculator, Library } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useApp } from '@/lib/AppContext';
import { TapEffect } from '@/components/TapEffect';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { DailyChallenges } from '@/components/DailyChallenges';
import { Badges } from '@/components/Badges';
import { TodoList } from '@/components/TodoList';

export default function Dashboard() {
  const { userName, language, t, user, learningFocus, setLearningFocus } = useApp();
  const [progress, setProgress] = useState({
    currentMinutes: 0,
    dailyGoalMinutes: 10,
    totalWords: 0,
    streakDays: 0,
    pagesRead: 0,
    xp: 0,
    level: 1,
    badges: [] as string[],
    weeklyActivity: [] as { day: string; value: number }[]
  });

  const [recentBooks, setRecentBooks] = useState<any[]>([]);

  const fetchData = async () => {
    if (!user || user.id === 'guest-user') return;
    
    // Fetch General Progress
    const { data: progressData, error: progressError } = await supabase
      .from('progress')
      .select('*')
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
        weeklyActivity: progressData.weekly_activity || []
      });
    }
  };

  useEffect(() => {
    if (!user || user.id === 'guest-user') return;
    
    fetchData();

    const progressChannel = supabase
      .channel('dashboard_progress')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'progress',
        filter: `id=eq.${user.id}`
      }, () => {
        fetchData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(progressChannel);
    };
  }, [user]);

  const progressPercent = Math.min((progress.currentMinutes / progress.dailyGoalMinutes) * 100, 100);

  // Ensure 7 days are always represented for the chart
  const fullWeeklyData = ['M', 'T', 'W', 'T', 'F', 'S', 'S'].map(day => {
    const existing = progress.weeklyActivity.find(d => d.day === day);
    return { day, value: existing ? Math.round(existing.value) : 0 };
  });

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-6 pb-24">
        {/* Learning Focus Selection */}
        <section className="mb-12 bg-white rounded-[40px] p-8 border-2 border-surface-container-highest shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h3 className="font-headline text-2xl font-bold text-on-surface mb-1">Your Learning Focus</h3>
              <p className="text-on-surface-variant text-sm">Choose what skills you want to prioritize today.</p>
            </div>
            <div className="flex bg-surface-container-low p-1.5 rounded-2xl gap-1">
              {(['reading', 'math', 'all'] as const).map(focus => (
                <button
                  key={focus}
                  onClick={() => setLearningFocus(focus)}
                  className={`px-6 py-2.5 rounded-xl text-sm font-bold capitalize transition-all ${
                    learningFocus === focus 
                      ? 'bg-primary text-white shadow-lg' 
                      : 'text-on-surface-variant hover:bg-surface-container-high'
                  }`}
                >
                  {focus}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Personalized Welcome */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6"
        >
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-primary/10 rounded-3xl flex items-center justify-center text-primary relative">
              {progress.streakDays >= 3 ? (
                <Flame className="w-8 h-8 fill-current text-orange-500" />
              ) : (
                <Sparkles className="w-8 h-8 fill-current" />
              )}
              <div className="absolute -top-2 -right-2 bg-tertiary text-white text-[10px] font-black px-2 py-1 rounded-full shadow-lg border-2 border-white">
                LVL {progress.level}
              </div>
            </div>
            <div>
              <h2 className="font-headline text-4xl font-extrabold tracking-tight text-on-surface mb-1">{t('hi')} {userName || 'Friend'},</h2>
              <p className="font-headline text-2xl text-on-surface-variant font-light">
                {progress.streakDays >= 3 
                  ? `You're on a ${progress.streakDays}-day streak! Amazing focus.` 
                  : t('readyToLearn')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-white border border-surface-container-high px-4 py-3 rounded-2xl flex items-center gap-3 shadow-sm">
              <Zap className="w-5 h-5 text-tertiary fill-current" />
              <div>
                <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest leading-none mb-1">Total XP</p>
                <p className="font-headline font-bold text-on-surface leading-none">{progress.xp.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </motion.section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Daily Progress Widget */}
          <div className="lg:col-span-2 space-y-8">
            <TapEffect>
              <Link to="/progress" className="block bg-surface-container-low rounded-3xl p-8 transition-all hover:bg-surface-container-lowest group border border-surface-container-high/50 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/2 rounded-full -mr-20 -mt-20 blur-3xl pointer-events-none" />
                
                <div className="flex justify-between items-end mb-8 relative z-10">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                      <Sprout className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-headline text-xl font-bold text-on-surface mb-1">{t('dailyProgress')}</h3>
                      <p className="text-on-surface-variant font-medium">{Math.round(progress.currentMinutes)} of {progress.dailyGoalMinutes} minutes read</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-primary font-headline font-bold text-4xl">{Math.round(progressPercent)}%</span>
                    {progressPercent >= 100 && (
                      <div className="text-[10px] font-black text-tertiary uppercase tracking-tighter mt-1">Goal Hit! 🌟</div>
                    )}
                  </div>
                </div>
                <div className="w-full h-4 bg-surface-container-highest rounded-full overflow-hidden mb-12 relative z-10">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercent}%` }}
                    className="h-full bg-gradient-to-r from-primary to-primary-container rounded-full shadow-lg shadow-primary/20"
                  ></motion.div>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-8 border-t border-surface-container-highest relative z-10">
                  <div>
                    <div className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1">Total Pages</div>
                    <div className="text-2xl font-headline font-bold text-primary">{progress.pagesRead}</div>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1">{t('wordsRead')}</div>
                    <div className="text-2xl font-headline font-bold text-primary">{progress.totalWords.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1">{t('dailyStreak')}</div>
                    <div className="text-2xl font-headline font-bold text-tertiary flex items-center gap-1">
                      {progress.streakDays} Days <Flame className="w-5 h-5 fill-current" />
                    </div>
                  </div>
                  <div className="flex items-center justify-end">
                    <div className="w-10 h-10 rounded-full bg-primary/5 flex items-center justify-center text-primary opacity-0 group-hover:opacity-100 group-hover:translate-x-2 transition-all">
                      <ArrowRight className="w-6 h-6" />
                    </div>
                  </div>
                </div>
              </Link>
            </TapEffect>

            {/* Weekly Activity Chart moved but wrapped */}
            <div className="bg-white rounded-3xl p-8 border border-surface-container-high shadow-sm h-full flex flex-col">
              <h3 className="font-headline text-xl font-bold text-on-surface mb-8 flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-primary" />
                  Reading Activity
                </span>
                <span className="text-xs font-bold text-stone-400 uppercase tracking-widest">Last 7 Days</span>
              </h3>
              <div className="flex-1 min-h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                  <BarChart data={fullWeeklyData}>
                    <XAxis 
                      dataKey="day" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#78716c', fontWeight: 600, fontSize: 12 }} 
                    />
                    <Tooltip 
                      cursor={{ fill: 'transparent' }}
                      contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    />
                    <Bar dataKey="value" radius={[6, 6, 6, 6]} barSize={16}>
                      {fullWeeklyData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.value > 0 ? '#4A6267' : '#E7E5E4'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <p className="text-center text-xs font-medium text-stone-500 mt-4">
                Minutes reading per day
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-8">
            {/* New Daily Challenges Sidebar Component */}
            <DailyChallenges />
            
            {/* New Badges/Milestones Component */}
            <Badges unlockedIds={progress.badges} />

            {/* Simple To-Do List Feature */}
            <TodoList />
          </div>
        </div>

        {/* Feature Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-12">
          {[
            { title: t('smartReader'), desc: t('smartReaderDesc'), icon: Book, color: 'primary', to: '/reader', category: 'reading' },
            { title: 'Library', desc: 'Find thousands of free classic books.', icon: Library, color: 'primary', to: '/library', category: 'reading' },
            { title: 'Story Maker', desc: 'Create your own adventures with AI help.', icon: Edit3, color: 'primary', to: '/writer', category: 'reading' },
            { title: 'Focus Zone', desc: 'Calm your mind sessions.', icon: Zap, color: 'tertiary', to: '/focus-zone', category: 'all' },
            { title: t('mathHelper'), desc: t('mathHelperDesc'), icon: Calculator, color: 'primary', to: '/math', category: 'math' },
            { title: t('glossary'), desc: t('glossaryDesc'), icon: BookMarked, color: 'tertiary', to: '/glossary', category: 'reading' },
          ].filter(action => learningFocus === 'all' || action.category === 'all' || action.category === learningFocus).map((action, i) => (
            <div key={i} className="h-full">
              <TapEffect className="h-full">
                <Link 
                  to={action.to}
                  className="group bg-white rounded-2xl p-6 flex flex-col justify-between h-full min-h-[200px] transition-all hover:shadow-xl relative overflow-hidden border border-surface-container-high/50"
                >
                  <div className={`absolute top-0 right-0 w-24 h-24 bg-${action.color}/5 rounded-bl-full -mr-6 -mt-6 transition-transform group-hover:scale-110`} />
                  <div className="relative z-10">
                    <div className={`w-12 h-12 bg-${action.color}/10 rounded-xl flex items-center justify-center text-${action.color} mb-4 shadow-sm group-hover:scale-110 transition-all`}>
                      <action.icon className="w-6 h-6" />
                    </div>
                    <h3 className="font-headline text-xl font-bold text-on-surface mb-2">{action.title}</h3>
                    <p className="text-on-surface-variant leading-relaxed text-sm">{action.desc}</p>
                  </div>
                  <div className={`flex items-center text-${action.color} font-bold gap-2 group-hover:gap-4 transition-all mt-4 text-xs`}>
                    <span>Open Tool</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </Link>
              </TapEffect>
            </div>
          ))}
        </section>

        {/* Focus Insights Section */}
        <section className="bg-gradient-to-br from-primary/5 to-tertiary/5 backdrop-blur-2xl rounded-3xl p-10 mb-8 flex flex-col md:flex-row gap-10 items-center border border-white">
          <div className="flex-1">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-6">
              <Sparkles className="w-3 h-3 fill-current" />
              AI Insight
            </div>
            <h3 className="font-headline text-3xl font-bold mb-4">Reading Journey Analysis</h3>
            <p className="text-on-surface-variant text-lg leading-relaxed mb-6">
              {progress.pagesRead > 0 
                ? `You've explored ${progress.pagesRead} pages this week! Your focus peaks in the mornings. You're building strong vocabulary retention in ${language === 'en' ? 'English' : 'your favorite topics'}.`
                : "Welcome to your reading journey! Start by opening a storybook or uploading a worksheet to see your personalized reading insights grow."}
            </p>
            <div className="flex gap-4">
              <div className="bg-white/60 p-4 rounded-2xl flex-1 border border-white/40">
                <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1">Optimal Window</p>
                <p className="font-headline font-bold text-on-surface text-lg">9 AM - 11 AM</p>
              </div>
              <div className="bg-white/60 p-4 rounded-2xl flex-1 border border-white/40">
                <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1">Focus Type</p>
                <p className="font-headline font-bold text-on-surface text-lg">Deep Visual</p>
              </div>
            </div>
          </div>
          <div className="w-full md:w-1/3 h-64 rounded-2xl overflow-hidden shadow-2xl relative group bg-primary/10 flex items-center justify-center">
            <Sparkles className="w-20 h-20 text-primary opacity-20" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </section>
      </div>
    </Layout>
  );
}
