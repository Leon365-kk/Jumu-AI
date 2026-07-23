import { Router, type Request, type Response } from 'express';
import { supabase } from '../lib/supabase.ts';
import { updateProgress } from '../lib/progressUtils.ts';

const router = Router();

// Types
interface SkillAssessment {
  userId: string;
  skillCategory: string;
  skillName: string;
  score: number;
  maxScore: number;
  details?: Record<string, any>;
}

interface LearningSession {
  userId: string;
  sessionType: 'reading' | 'math' | 'focus' | 'writing';
  contentId?: string;
  durationMinutes: number;
  metrics?: Record<string, any>;
}

// POST /api/analytics/update-profile
// Process assessment results and update skill scores
router.post('/update-profile', async (req: Request, res: Response) => {
  try {
    const { userId, skillCategory, skillName, score, maxScore, details }: SkillAssessment = req.body;

    if (!userId || !skillCategory || !skillName || score === undefined || maxScore === undefined) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Get or create skill in skill_master
    let { data: skill, error: skillError } = await (supabase
      .from('skill_master')
      .select('id')
      .eq('category', skillCategory)
      .eq('name', skillName)
      .maybeSingle()) as any;

    if (skillError) {
      throw skillError;
    }

    if (!skill) {
      const skillInsert = await (supabase
        .from('skill_master')
        .insert({ category: skillCategory, name: skillName } as any)
        .select('id')
        .single()) as any;
      const { data: newSkill, error: createError } = skillInsert;

      if (createError) throw createError;
      skill = newSkill;
    }

    if (!skill?.id) {
      return res.status(500).json({ error: 'Failed to resolve skill' });
    }

    // Calculate normalized score (0-100)
    const normalizedScore = (score / maxScore) * 100;

    // Update or create student_skill scores and save assessment in parallel
    const [existingScoreResult, assessmentResult] = await Promise.all([
      (supabase
        .from('student_skill_scores')
        .select('score, confidence')
        .eq('user_id', userId)
        .eq('skill_id', skill.id)
        .single()) as any,
      (supabase
        .from('skill_assessments')
        .insert({
          user_id: userId,
          skill_category: skillCategory,
          skill_name: skillName,
          score,
          max_score: maxScore,
          details
        } as any)) as any
    ]);

    if (assessmentResult.error) throw assessmentResult.error;

    let newScore: number;
    let newConfidence: number;

    if (existingScoreResult.error && existingScoreResult.error.code === 'PGRST116') {
      // First time - create new score
      newScore = normalizedScore;
      newConfidence = 50; // Initial confidence
    } else if (existingScoreResult.error) {
      throw existingScoreResult.error;
    } else if (existingScoreResult.data) {
      // Update existing score with weighted average
      const oldScore = existingScoreResult.data.score;
      const oldConfidence = existingScoreResult.data.confidence;
      
      // Weight new score based on confidence
      const weight = oldConfidence / 100;
      newScore = (oldScore * (1 - weight) + normalizedScore * weight);
      newConfidence = Math.min(100, oldConfidence + 10);
    } else {
      // Fallback if data is null
      newScore = normalizedScore;
      newConfidence = 50;
    }

    const { error: upsertError } = await (supabase
      .from('student_skill_scores')
      .upsert({
        user_id: userId,
        skill_id: skill.id,
        score: newScore,
        confidence: newConfidence,
        updated_at: new Date().toISOString()
      } as any)) as any;

    if (upsertError) throw upsertError;

    // Generate recommendations based on new score
    await generateRecommendations(userId);

    res.json({ success: true, score: newScore, confidence: newConfidence });
  } catch (error: any) {
    console.error('Analytics update error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// GET /api/analytics/strengths/:userId
router.get('/strengths/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const { data, error } = await supabase
      .from('student_skill_scores')
      .select(`
        score,
        confidence,
        skill:skill_id (
          id,
          category,
          name,
          description
        )
      `)
      .eq('user_id', userId)
      .gte('score', 80);

    if (error) throw error;

    res.json({ strengths: data || [] });
  } catch (error: any) {
    console.error('Get strengths error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// GET /api/analytics/weaknesses/:userId
router.get('/weaknesses/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const { data, error } = await supabase
      .from('student_skill_scores')
      .select(`
        score,
        confidence,
        skill:skill_id (
          id,
          category,
          name,
          description
        )
      `)
      .eq('user_id', userId)
      .lte('score', 60)
      .limit(50);

    if (error) throw error;

    res.json({ weaknesses: data || [] });
  } catch (error: any) {
    console.error('Get weaknesses error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// POST /api/sessions/complete
// Process completed learning session
router.post('/sessions/complete', async (req: Request, res: Response) => {
  try {
    const { userId, sessionType, contentId, durationMinutes, metrics }: LearningSession = req.body;

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

    // Generate recommendations
    await generateRecommendations(userId);

    res.json({ success: true, xpGain });
  } catch (error: any) {
    console.error('Session complete error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// POST /api/analytics/game-telemetry
// Record cognitive game results and update skill scores
router.post('/game-telemetry', async (req: Request, res: Response) => {
  try {
    const { userId, game, gameVersion, turns, metrics, completed, xpEarned } = req.body;

    if (!userId || !game || !Array.isArray(turns)) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const gameCategoryMap: Record<string, { category: string; skill: string }> = {
      'memory-match': { category: 'cognitive', skill: 'working_memory' },
      'find-difference': { category: 'cognitive', skill: 'visual_attention' }
    };

    const mapping = gameCategoryMap[game] || { category: 'cognitive', skill: game };
    const accuracy = typeof metrics?.accuracy === 'number' ? metrics.accuracy : (completed ? 0.7 : 0.4);
    const normalizedScore = Math.round(accuracy * 100);

    // Persist game assessment
    const { error: gameError } = await supabase
      .from('game_assessments')
      .insert({
        user_id: userId,
        game,
        game_version: gameVersion,
        turns,
        metrics,
        completed,
        xp_earned: xpEarned || 0
      });

    if (gameError) {
      console.error('Game assessment insert error:', gameError);
    }

    // Update or create skill score for this cognitive skill
    let { data: skill, error: skillError } = await (supabase
      .from('skill_master')
      .select('id')
      .eq('category', mapping.category)
      .eq('name', mapping.skill)
      .maybeSingle()) as any;

    if (skillError) throw skillError;

    if (!skill) {
      const skillInsert = await (supabase
        .from('skill_master')
        .insert({ category: mapping.category, name: mapping.skill } as any)
        .select('id')
        .single()) as any;
      const { data: newSkill, error: createError } = skillInsert;
      if (createError) throw createError;
      skill = newSkill;
    }

    if (!skill?.id) {
      return res.status(500).json({ error: 'Failed to resolve skill' });
    }

    // Upsert student_skill_scores
    const { data: existingScore, error: scoreError } = await (supabase
      .from('student_skill_scores')
      .select('score, confidence')
      .eq('user_id', userId)
      .eq('skill_id', skill.id)
      .single()) as any;

    if (scoreError && scoreError.code !== 'PGRST116') throw scoreError;

    let newScore: number;
    let newConfidence: number;

    if (!existingScore) {
      newScore = normalizedScore;
      newConfidence = 60;
    } else {
      const oldScore = existingScore.score;
      const oldConfidence = existingScore.confidence;
      const weight = oldConfidence / 100;
      newScore = oldScore * (1 - weight) + normalizedScore * weight;
      newConfidence = Math.min(100, oldConfidence + 15);
    }

    const { error: upsertError } = await (supabase
      .from('student_skill_scores')
      .upsert({
        user_id: userId,
        skill_id: skill.id,
        score: newScore,
        confidence: newConfidence,
        updated_at: new Date().toISOString()
      } as any));

    if (upsertError) throw upsertError;

    await generateRecommendations(userId);

    res.json({ success: true, score: newScore, confidence: newConfidence, skill: mapping.skill });
  } catch (error: any) {
    console.error('Game telemetry error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// POST /api/recommendations/generate
// Generate personalized recommendations
router.post('/recommendations/generate', async (req: Request, res: Response) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'Missing userId' });
    }

    await generateRecommendations(userId);

    res.json({ success: true });
  } catch (error: any) {
    console.error('Generate recommendations error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// GET /api/recommendations/:userId
router.get('/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const { data, error } = await supabase
      .from('recommendations')
      .select('*')
      .eq('user_id', userId)
      .eq('completed', false)
      .order('priority', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json({ recommendations: data || [] });
  } catch (error: any) {
    console.error('Get recommendations error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// Helper function to generate recommendations
async function generateRecommendations(userId: string) {
  // Get current skill scores with skill details in single query
  const { data: skillScores, error: scoresError } = await supabase
    .from('student_skill_scores')
    .select(`
      score,
      skill:skill_id (
        id,
        category,
        name
      )
    `)
    .eq('user_id', userId);

  if (scoresError) {
    console.error('Error fetching skill scores:', scoresError);
    return;
  }

  // Clear old recommendations and build new ones in parallel
  const [deleteResult] = await Promise.all([
    supabase
      .from('recommendations')
      .delete()
      .eq('user_id', userId)
      .eq('completed', false)
  ]);

  // Build recommendations array from skill scores (in-memory processing, no N+1 queries)
  const recommendations = (skillScores || []).map((skill) => {
    const skillName = (skill.skill as any)?.name;
    const category = (skill.skill as any)?.category;

    if (skill.score < 60) {
      return {
        user_id: userId,
        type: 'content',
        content_id: `remedial_${category}_${skillName}`,
        reason: `Improve your ${skillName} skills in ${category}`,
        priority: 5
      };
    } else if (skill.score <= 85) {
      return {
        user_id: userId,
        type: 'practice',
        content_id: `practice_${category}_${skillName}`,
        reason: `Strengthen your ${skillName} with guided practice`,
        priority: 2
      };
    } else {
      return {
        user_id: userId,
        type: 'challenge',
        content_id: `advanced_${category}_${skillName}`,
        reason: `Challenge your ${skillName} skills`,
        priority: 3
      };
    }
  }).filter(Boolean);

  // Insert new recommendations in single bulk operation
  if (recommendations.length > 0) {
    const { error: insertError } = await supabase
      .from('recommendations')
      .insert(recommendations as any);

    if (insertError) {
      console.error('Error inserting recommendations:', insertError);
    }
  }
}

export default router;