import { supabase } from './supabase';
import { BADGE_DEFINITIONS, LEVEL_THRESHOLDS, XP_REWARDS, DAILY_CHALLENGE_TEMPLATES } from './gamification-types';
import type { UserProgress, DailyChallenge } from './gamification-types';

export type { UserProgress, DailyChallenge };
export { BADGE_DEFINITIONS, LEVEL_THRESHOLDS, XP_REWARDS, DAILY_CHALLENGE_TEMPLATES };

export const rewards = {
  READ_MINUTE: 10,
  USE_TOOL: 25,
  SAVE_WORD: 15,
  COMPLETE_CHALLENGE: 100,
  LOGIN_DAILY: 5,
  COMPLETE_ASSESSMENT: 200,
  SHARE_ACHIEVEMENT: 30,
  COMPLETE_LEVEL: 500,
  FIRST_SESSION: 50,
  STREAK_7_DAYS: 150,
  STREAK_30_DAYS: 1000,
};

export interface GamificationUpdate {
  xpGain: number;
  challengeUpdates?: { id: string; increment: number }[];
}

export const getLevelFromXP = (xp: number): number => {
  let level = 1;
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (xp >= LEVEL_THRESHOLDS[i]) {
      level = i + 1;
      break;
    }
  }
  return level;
};

export const getXPForNextLevel = (xp: number): number => {
  const currentLevel = getLevelFromXP(xp);
  if (currentLevel >= LEVEL_THRESHOLDS.length) return 0;
  return LEVEL_THRESHOLDS[currentLevel] - xp;
};

export const getLevelProgress = (xp: number): number => {
  const currentLevel = getLevelFromXP(xp);
  if (currentLevel >= LEVEL_THRESHOLDS.length) return 100;
  const levelStart = LEVEL_THRESHOLDS[currentLevel - 1] || 0;
  const levelEnd = LEVEL_THRESHOLDS[currentLevel];
  const progress = xp - levelStart;
  const range = levelEnd - levelStart;
  return Math.min(Math.round((progress / range) * 100), 100);
};

export const checkBadges = (progress: UserProgress): string[] => {
  const currentBadges = progress.badges || [];
  const newBadges = [...currentBadges];
  
  const xp = progress.xp || 0;
  const level = progress.level || 1;
  const streak = progress.streak_days || 0;
  const totalWords = progress.total_words || 0;
  const pagesRead = progress.pages_read || 0;
  
  const badgeChecks: [string, boolean][] = [
    ['streak_3', streak >= 3],
    ['streak_7', streak >= 7],
    ['streak_30', streak >= 30],
    ['words_10', totalWords >= 10],
    ['words_50', totalWords >= 50],
    ['words_100', totalWords >= 100],
    ['pages_10', pagesRead >= 10],
    ['pages_50', pagesRead >= 50],
    ['pages_100', pagesRead >= 100],
    ['level_5', level >= 5],
    ['level_10', level >= 10],
    ['level_20', level >= 20],
    ['math_5', (progress.daily_challenges || []).filter(c => c.type === 'math' && c.completed).length >= 5],
    ['focus_30', progress.current_minutes >= 30],
  ];
  
  for (const [badgeId, condition] of badgeChecks) {
    if (condition && !newBadges.includes(badgeId)) {
      newBadges.push(badgeId);
    }
  }
  
  const newBadgeIds = newBadges.filter(b => !currentBadges.includes(b));
  
  return newBadgeIds;
};

export const generateDailyChallenges = (userId?: string): DailyChallenge[] => {
  const today = new Date().toISOString().split('T')[0];
  const seed = new Date().getDate() + new Date().getMonth() * 31;
  
  const shuffled = [...DAILY_CHALLENGE_TEMPLATES]
    .sort(() => {
      const x = Math.sin(seed) * 10000;
      return x - Math.floor(x) - 0.5;
    });
  
  const selected = shuffled.slice(0, 4).map((template, index) => ({
    ...template,
    id: `${template.id}_${today}_${index}`,
    current: 0,
    completed: false
  }));
  
  return selected as DailyChallenge[];
};

export const updateGamification = async (userId: string, update: GamificationUpdate): Promise<{
  newXP: number;
  newLevel: number;
  levelUp: boolean;
  newBadges: string[];
} | null> => {
  try {
    const { data: currentProgress, error: fetchError } = await supabase
      .from('progress')
      .select('*')
      .eq('id', userId)
      .single();

    let progress: UserProgress;
    
    if (fetchError && fetchError.code === 'PGRST116') {
      const initialProgress: UserProgress = {
        id: userId,
        xp: 0,
        level: 1,
        streak_days: 1,
        total_words: 0,
        pages_read: 0,
        current_minutes: 0,
        daily_goal_minutes: 10,
        badges: [],
        daily_challenges: generateDailyChallenges(userId),
        weekly_activity: [{ day: new Date().toLocaleDateString('en-US', { weekday: 'narrow' }), value: 0 }],
        updated_at: new Date().toISOString()
      };
      
      const { data: createdData, error: createError } = await supabase
        .from('progress')
        .insert(initialProgress)
        .select()
        .single();
      
      if (createError) throw createError;
      progress = createdData as UserProgress;
    } else if (fetchError || !currentProgress) {
      return null;
    } else {
      progress = currentProgress as UserProgress;
    }

    const now = new Date();
    const nowDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const lastUpdate = progress.updated_at ? new Date(progress.updated_at) : null;
    const lastUpdateDate = lastUpdate ? new Date(lastUpdate.getFullYear(), lastUpdate.getMonth(), lastUpdate.getDate()) : null;
    
    let newStreak = progress.streak_days || 0;
    if (!lastUpdateDate) {
      newStreak = 1;
    } else {
      const diffDays = Math.round((nowDate.getTime() - lastUpdateDate.getTime()) / (1000 * 3600 * 24));
      if (diffDays === 1) {
        newStreak += 1;
      } else if (diffDays > 1) {
        newStreak = 1;
      }
    }

    let newXP = (progress.xp || 0) + update.xpGain;
    const newLevel = getLevelFromXP(newXP);
    const levelUp = newLevel > (progress.level || 1);

    const updatedChallenges = [...(progress.daily_challenges || [])];
    if (update.challengeUpdates) {
      for (let i = 0; i < updatedChallenges.length; i++) {
        const challenge = updatedChallenges[i];
        const updateInfo = update.challengeUpdates.find(u => u.id === challenge.id);
        if (updateInfo) {
          const newCurrent = Math.min(challenge.current + updateInfo.increment, challenge.goal);
          updatedChallenges[i] = {
            ...challenge,
            current: newCurrent,
            completed: newCurrent >= challenge.goal
          };
        }
      }
    }

    const today = new Date().toISOString().split('T')[0];
    if (progress.daily_challenges && progress.daily_challenges.length > 0 && 
        progress.last_challenge_reset !== today) {
      updatedChallenges.length = 0;
      updatedChallenges.push(...generateDailyChallenges(userId));
    }

    const tempProgress = {
      ...progress,
      xp: newXP,
      level: newLevel,
      streak_days: newStreak,
      daily_challenges: updatedChallenges,
      current_minutes: progress.current_minutes + (update.xpGain / XP_REWARDS.READ_MINUTE)
    };
    
    const newBadgeIds = checkBadges(tempProgress);
    const updatedBadges = [...(progress.badges || []), ...newBadgeIds];

    const { data: updatedData, error: updateError } = await supabase
      .from('progress')
      .update({
        xp: newXP,
        level: newLevel,
        streak_days: newStreak,
        daily_challenges: updatedChallenges,
        badges: updatedBadges,
        last_challenge_reset: today,
        updated_at: now.toISOString()
      })
      .eq('id', userId)
      .select()
      .single();

    if (updateError) throw updateError;

    return {
      newXP,
      newLevel,
      levelUp,
      newBadges: newBadgeIds
    };
  } catch (error) {
    console.error('Error updating gamification:', error);
    return null;
  }
};

export const fetchProgress = async (userId: string): Promise<UserProgress | null> => {
  try {
    const { data, error } = await supabase
      .from('progress')
      .select('*')
      .eq('id', userId)
      .single();

    if (error || !data) {
      if (error?.code === 'PGRST116') {
        return updateGamification(userId, { xpGain: 0 }).then(result => {
          if (result) {
            return supabase.from('progress').select('*').eq('id', userId).single().then(({ data }) => data as UserProgress);
          }
          return null;
        });
      }
      return null;
    }

    const today = new Date().toISOString().split('T')[0];
    if ((data as any).last_challenge_reset !== today) {
      const updatedChallenges = generateDailyChallenges(userId);
      await supabase.from('progress').update({
        daily_challenges: updatedChallenges,
        last_challenge_reset: today
      }).eq('id', userId);
      
      return { ...data as UserProgress, daily_challenges: updatedChallenges };
    }

    return data as UserProgress;
  } catch (error) {
    console.error('Error fetching progress:', error);
    return null;
  }
};

export const completeChallenge = async (userId: string, challengeId: string): Promise<boolean> => {
  try {
    const { data: progress, error } = await supabase
      .from('progress')
      .select('*')
      .eq('id', userId)
      .single();

    if (error || !progress) return false;

    const challenges = [...(progress.daily_challenges || [])];
    const challengeIndex = challenges.findIndex(c => c.id === challengeId);
    
    if (challengeIndex === -1 || challenges[challengeIndex].completed) return false;

    challenges[challengeIndex] = {
      ...challenges[challengeIndex],
      completed: true,
      current: challenges[challengeIndex].goal
    };

    const { error: updateError } = await supabase
      .from('progress')
      .update({ daily_challenges: challenges })
      .eq('id', userId);

    if (updateError) throw updateError;

    const xpReward = challenges[challengeIndex].reward;
    await updateGamification(userId, { xpGain: xpReward });

    return true;
  } catch (error) {
    console.error('Error completing challenge:', error);
    return false;
  }
};
