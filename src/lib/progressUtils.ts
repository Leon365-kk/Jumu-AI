import { supabase } from './supabase.ts';

interface ProgressUpdateResult {
  xpGain: number;
}

export async function updateProgress(
  userId: string,
  durationMinutes: number
): Promise<ProgressUpdateResult> {
  // Update progress table (XP, streak, etc.)
  const { data: currentProgress, error: progressError } = await supabase
    .from('progress')
    .select('*')
    .eq('id', userId)
    .single() as any;

  if (progressError && progressError.code !== 'PGRST116') {
    throw progressError;
  }

  // Calculate XP gain (10 XP per minute)
  const xpGain = durationMinutes * 10;
  
  // Update or create progress
  if (currentProgress && typeof currentProgress === 'object') {
    const queryBuilder = (supabase as any)
      .from('progress')
      .update({
        current_minutes: (currentProgress.current_minutes || 0) + durationMinutes,
        xp: (currentProgress.xp || 0) + xpGain,
        updated_at: new Date().toISOString()
      });
    const { error: updateError } = await queryBuilder.eq('id', userId);

    if (updateError) throw updateError;
  } else {
    const { error: insertError } = await supabase
      .from('progress')
      .insert({
        id: userId,
        current_minutes: durationMinutes,
        xp: xpGain,
        level: 1,
        streak_days: 1,
        total_hours: 0,
        total_words: 0,
        pages_read: 0,
        comprehension_score: 0,
        re_reads: 0,
        daily_goal_minutes: 10,
        badges: [],
        weekly_activity: []
      } as any);

    if (insertError) throw insertError;
  }

  return { xpGain };
}
