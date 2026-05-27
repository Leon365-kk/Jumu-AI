import { supabase } from './supabase';

export interface GamificationUpdate {
  xpGain: number;
  challengeUpdates?: { id: string; increment: number }[];
}

export const updateGamification = async (userId: string, update: GamificationUpdate) => {
  try {
    const { data: currentProgress, error: fetchError } = await supabase
      .from('progress')
      .select('*')
      .eq('id', userId)
      .single();

    let data = currentProgress;
    
    if (fetchError && fetchError.code === 'PGRST116') {
      // Create initial progress if it doesn't exist
      const initialProgress = {
        id: userId,
        xp: 0,
        level: 1,
        streak_days: 1,
        total_words: 0,
        pages_read: 0,
        current_minutes: 0,
        daily_goal_minutes: 10,
        badges: [],
        daily_challenges: [],
        weekly_activity: [{ day: new Date().toLocaleDateString('en-US', { weekday: 'narrow' }), value: 0 }],
        updated_at: new Date().toISOString()
      };
      
      const { data: createdData, error: createError } = await supabase
        .from('progress')
        .insert(initialProgress)
        .select()
        .single();
      
      if (createError) throw createError;
      data = createdData;
    } else if (fetchError || !data) {
      return;
    }

    let newXP = (data.xp || 0) + update.xpGain;
    let newLevel = data.level || 1;

    // Simple level up logic: constant 1000 XP per level
    const xpPerLevel = 1000;
    const potentialLevel = Math.floor(newXP / xpPerLevel) + 1;
    
    if (potentialLevel > newLevel) {
      newLevel = potentialLevel;
      // You could trigger a level up event or notification here
    }

    // Update challenges
    let updatedChallenges = [...(data.daily_challenges || [])];
    if (update.challengeUpdates) {
      updatedChallenges = updatedChallenges.map(challenge => {
        const updateInfo = update.challengeUpdates?.find(u => u.id === challenge.id);
        if (updateInfo) {
          const newCurrent = Math.min(challenge.current + updateInfo.increment, challenge.goal);
          const isCompleted = newCurrent >= challenge.goal;
          
          return {
            ...challenge,
            current: newCurrent,
            completed: isCompleted
          };
        }
        return challenge;
      });
    }

    // Badge/Milestone Logic
    const currentBadges = data.badges || [];
    const newBadges = [...currentBadges];
    
    // Streak Logic (Gentle update)
    const lastUpdate = data.updated_at ? new Date(data.updated_at) : null;
    const now = new Date();
    let newStreak = data.streak_days || 0;

    if (!lastUpdate) {
      newStreak = 1;
    } else {
      const lastUpdateDate = new Date(lastUpdate.getFullYear(), lastUpdate.getMonth(), lastUpdate.getDate());
      const nowDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const diffDays = Math.round((nowDate.getTime() - lastUpdateDate.getTime()) / (1000 * 3600 * 24));

      if (diffDays === 1) {
        newStreak += 1;
      } else if (diffDays > 1) {
        newStreak = 1; // Reset to 1 since they are active today
      }
      // If diffDays === 0, streak remains the same (already updated today)
    }

    // Check for level 5
    if (newLevel >= 5 && !newBadges.includes('level_5')) {
      newBadges.push('level_5');
    }
    
    // Check for total words (milestone)
    const totalWords = data.total_words || 0;
    if (totalWords >= 10 && !newBadges.includes('words_10')) {
      newBadges.push('words_10');
    }

    // Check for 3-day streak
    if (newStreak >= 3 && !newBadges.includes('streak_3')) {
      newBadges.push('streak_3');
    }

    // Check for first 5 minutes
    const currentMinutes = (data.current_minutes || 0) + (update.xpGain / 10); // Approximation
    if (currentMinutes >= 5 && !newBadges.includes('first_5min')) {
      newBadges.push('first_5min');
    }

    // Save back to DB
    const { error: updateError } = await supabase
      .from('progress')
      .update({
        xp: newXP,
        level: newLevel,
        daily_challenges: updatedChallenges,
        badges: newBadges,
        streak_days: newStreak, // Updated streak
        updated_at: now.toISOString()
      })
      .eq('id', userId);

    if (updateError) throw updateError;

    return { 
      newXP, 
      newLevel, 
      levalUp: potentialLevel > currentProgress.level,
      newBadgesCount: newBadges.length - currentBadges.length
    };
  } catch (error) {
    console.error('Error updating gamification:', error);
  }
};

// Common reward triggers
export const rewards = {
  READ_MINUTE: 10,
  USE_TOOL: 25,
  SAVE_WORD: 15,
  COMPLETE_CHALLENGE: 100,
};
