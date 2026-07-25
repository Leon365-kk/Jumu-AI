import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Layout } from '@/components/Layout';
import { Award, Lock, Sparkles, Loader2 } from 'lucide-react';
import { BADGE_DEFINITIONS } from '@/lib/gamification-types';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/AuthContext';
import SEO from '@/lib/SEO';
import { cn } from '@/lib/utils';

export default function Achievements() {
  const { user } = useAuth();
  const [unlockedBadges, setUnlockedBadges] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBadges = async () => {
      if (!user || user.id === 'guest-user') {
        setUnlockedBadges([]);
        setLoading(false);
        return;
      }

      try {
        const { data } = await supabase
          .from('progress')
          .select('badges')
          .eq('id', user.id)
          .single();

        if (data?.badges) {
          setUnlockedBadges(data.badges);
        }
      } catch (error) {
        console.error('Error fetching badges:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBadges();
  }, [user]);

  const unlockedCount = BADGE_DEFINITIONS.filter(b => unlockedBadges.includes(b.id)).length;

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
    <Layout>
      <SEO
        title="Achievements — Jumu AI"
        description="View all your achievements and badges. Track your progress and unlock rewards as you learn."
        canonical="https://jumu.ai/achievements"
        ogType="website"
      />
      <div className="max-w-5xl mx-auto px-6 pb-24">
        <header className="mb-12">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-red-600/10 rounded-xl flex items-center justify-center text-red-600">
              <Award className="w-8 h-8" />
            </div>
            <div>
              <h1 className="font-headline text-4xl font-extrabold tracking-tight text-gray-900">Achievements</h1>
              <p className="text-gray-600 text-lg">You've unlocked {unlockedCount} of {BADGE_DEFINITIONS.length} badges</p>
            </div>
          </div>

          <div className="w-full bg-gray-100 rounded-full h-3 mt-6 overflow-hidden">
            <div 
              className="h-full bg-red-600 rounded-full transition-all duration-500"
              style={{ width: `${(unlockedCount / BADGE_DEFINITIONS.length) * 100}%` }}
            />
          </div>
        </header>

        {loading ? (
          <div className="py-20 text-center">
            <Loader2 className="w-10 h-10 animate-spin text-red-600 mx-auto mb-4" />
            <p className="font-bold text-red-600">Loading your achievements...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {BADGE_DEFINITIONS.map((badge, index) => {
              const isUnlocked = unlockedBadges.includes(badge.id);
              return (
                <motion.div
                  key={badge.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05, type: 'spring' }}
                  whileHover={isUnlocked ? { y: -4, scale: 1.02 } : {}}
                  className={cn(
                    'relative p-6 rounded-3xl border-2 transition-all duration-300 overflow-hidden',
                    'flex flex-col items-center text-center min-h-[160px]',
                    isUnlocked
                      ? cn('bg-white border-primary/20 shadow-card hover:shadow-card-hover', rarityGlow[badge.rarity])
                      : 'bg-surface/50 border-dashed border-surface-container-high opacity-60'
                  )}
                >
                  {isUnlocked && (
                    <div className={cn('absolute top-0 left-0 w-full h-1 bg-gradient-to-r', badge.color.replace('text-', 'from-').replace('600', '400') + ' to-' + badge.color.replace('text-', '').replace('600', '500'))} />
                  )}

                  <div className={cn(
                    'w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-all',
                    isUnlocked
                      ? cn('text-white shadow-lg', badge.bgColor)
                      : 'bg-surface-container text-surface-container-highest'
                  )}>
                    {isUnlocked ? (
                      <Award className="w-8 h-8" />
                    ) : (
                      <Lock className="w-7 h-7" />
                    )}
                  </div>

                  <h3 className={cn(
                    'text-lg font-bold mb-1',
                    isUnlocked ? 'text-on-surface' : 'text-on-surface-muted'
                  )}>
                    {badge.title}
                  </h3>
                  
                  <p className="text-sm text-on-surface-variant leading-relaxed">
                    {badge.description}
                  </p>

                  {!isUnlocked && (
                    <div className="absolute top-3 right-3">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-surface-container text-on-surface-muted">
                        {badge.rarity}
                      </span>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}

        {!loading && unlockedCount === 0 && (
          <div className="text-center py-20 bg-gray-100 rounded-xl border-2 border-dashed border-gray-300">
            <div className="w-20 h-20 bg-red-600/5 rounded-full flex items-center justify-center mx-auto mb-6 text-red-600/40">
              <Sparkles className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-headline font-bold mb-3">No achievements yet</h3>
            <p className="text-gray-600 mb-8 max-w-sm mx-auto">
              Start reading, solving math problems, and using the tools to unlock badges!
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
}
