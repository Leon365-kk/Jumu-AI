import { motion } from 'motion/react';
import { Crown, Medal, Trophy, TrendingUp, Users, Flame } from 'lucide-react';
import type { LeaderboardEntry } from '@/lib/gamification-types';
import { cn } from '@/lib/utils';

interface LeaderboardProps {
  entries: LeaderboardEntry[];
  currentUserId?: string;
  title?: string;
  subtitle?: string;
  maxEntries?: number;
}

export function Leaderboard({ 
  entries, 
  currentUserId, 
  title = 'Leaderboard',
  subtitle = 'Top learners this week',
  maxEntries = 10 
}: LeaderboardProps) {
  const displayEntries = entries.slice(0, maxEntries);
  const currentUserEntry = entries.find(e => e.id === currentUserId);
  
  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="w-5 h-5 text-yellow-500 fill-current" />;
    if (rank === 2) return <Medal className="w-5 h-5 text-gray-400" />;
    if (rank === 3) return <Medal className="w-5 h-5 text-amber-600" />;
    return <span className="w-5 h-5 flex items-center justify-center text-xs font-bold text-on-surface-muted">{rank}</span>;
  };

  const getRankBadgeColor = (rank: number) => {
    if (rank === 1) return 'from-yellow-400 to-amber-500 border-yellow-300';
    if (rank === 2) return 'from-gray-300 to-gray-400 border-gray-300';
    if (rank === 3) return 'from-orange-400 to-orange-500 border-orange-300';
    return 'from-surface-container to-surface-container-high border-surface-container-high';
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-headline text-xl font-bold text-on-surface flex items-center gap-2">
            <Trophy className="w-6 h-6 text-gold" />
            {title}
          </h3>
          <p className="text-sm text-on-surface-muted mt-1">{subtitle}</p>
        </div>
        <div className="flex items-center gap-1 text-xs text-on-surface-muted">
          <TrendingUp className="w-4 h-4" />
          <span>Updated daily</span>
        </div>
      </div>

      <div className="space-y-3">
        {displayEntries.map((entry, index) => {
          const isCurrentUser = entry.id === currentUserId;
          const rank = entry.rank || index + 1;
          
          return (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className={cn(
                'relative flex items-center gap-4 p-4 rounded-2xl border transition-all',
                'bg-surface-container-low/50 backdrop-blur-sm',
                isCurrentUser 
                  ? 'border-primary/30 bg-primary/5 shadow-glow' 
                  : 'border-surface-container/50 hover:border-surface-container-high'
              )}
            >
              <div className="flex-shrink-0 w-10">
                {getRankIcon(rank)}
              </div>

              <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br border-2 flex-shrink-0"
                   style={{
                     backgroundImage: entry.avatar_url ? `url(${entry.avatar_url})` : undefined,
                     backgroundSize: 'cover',
                     backgroundPosition: 'center'
                   }}>
                {!entry.avatar_url && (
                  <div className={cn('w-full h-full flex items-center justify-center text-white font-bold text-sm bg-gradient-to-br', getRankBadgeColor(rank))}>
                    {entry.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className={cn(
                    'font-bold text-sm truncate',
                    isCurrentUser ? 'text-primary' : 'text-on-surface'
                  )}>
                    {entry.name}
                    {isCurrentUser && <span className="text-xs ml-1">(You)</span>}
                  </h4>
                </div>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-xs text-on-surface-muted">
                    Level {entry.level}
                  </span>
                  {entry.streak_days > 0 && (
                    <span className="text-xs text-orange-500 font-medium flex items-center gap-1">
                      <Flame className="w-3 h-3" />
                      {entry.streak_days}d
                    </span>
                  )}
                </div>
              </div>

              <div className="text-right">
                <div className="font-headline font-black text-lg text-on-surface">
                  {entry.xp.toLocaleString()}
                </div>
                <div className="text-[10px] text-on-surface-muted uppercase tracking-widest">
                  XP
                </div>
              </div>

              {rank <= 3 && (
                <div className={cn(
                  'absolute top-2 right-2 w-2 h-2 rounded-full',
                  rank === 1 && 'bg-yellow-400',
                  rank === 2 && 'bg-gray-400',
                  rank === 3 && 'bg-orange-500'
                )} />
              )}
            </motion.div>
          );
        })}
      </div>

      {currentUserEntry && !displayEntries.find(e => e.id === currentUserId) && (
        <div className="mt-4 pt-4 border-t border-surface-container/50">
          <div className="flex items-center gap-3 text-sm text-on-surface-muted">
            <Users className="w-4 h-4" />
            <span>Your rank: #{currentUserEntry.rank || '?'}</span>
          </div>
        </div>
      )}
    </div>
  );
}
