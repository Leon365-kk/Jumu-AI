import { Router, type Request, type Response } from 'express';
import { supabase } from '../lib/supabase.ts';
import { updateProgress } from '../lib/progressUtils.ts';

const router = Router();

router.post('/complete', async (req: Request, res: Response) => {
  try {
    const { userId, sessionType, contentId, durationMinutes, metrics } = req.body;

    if (!userId || !sessionType || durationMinutes === undefined) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Save learning session with specific session type
    const { error: sessionError } = await supabase
      .from('learning_sessions')
      .insert({
        user_id: userId,
        session_type: sessionType,
        content_id: contentId,
        duration_minutes: durationMinutes,
        metrics,
        completed_at: new Date().toISOString()
      } as any);

    if (sessionError) throw sessionError;

    // Update progress using shared utility
    const { xpGain } = await updateProgress(userId, durationMinutes);

    res.json({ success: true, xpGain });
  } catch (error: any) {
    console.error('Session complete error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

export default router;
