import { Router, type Request, type Response } from 'express';
import { supabase } from '../lib/supabase.ts';

const router = Router();

router.get('/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const { data, error } = await supabase
      .from('recommendations')
      .select('*')
      .eq('user_id', userId)
      .eq('completed', false)
      .order('priority', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) throw error;

    res.json({ recommendations: data || [] });
  } catch (error: any) {
    console.error('Get recommendations error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

export default router;
