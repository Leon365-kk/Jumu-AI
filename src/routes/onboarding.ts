import { Router, type Request, type Response } from 'express';
import { supabase } from '../lib/supabase.ts';

const router = Router();

// POST /api/onboarding/check-age
// Uses AI + deterministic logic to determine if user is a minor based on birth date and grade level
router.post('/check-age', async (req: Request, res: Response) => {
  try {
    const { userId, birthDate, gradeLevel } = req.body;

    if (!userId || !birthDate) {
      return res.status(400).json({ error: 'Missing required fields: userId and birthDate' });
    }

    const birth = new Date(birthDate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }

    // Heuristic: grade level K-12 typically corresponds to ages 5-18
    let gradeBasedAge = null;
    if (gradeLevel) {
      const gradeMap: Record<string, number> = {
        'K': 5, '1': 6, '2': 7, '3': 8, '4': 9, '5': 10,
        '6': 11, '7': 12, '8': 13, '9': 14, '10': 15, '11': 16, '12': 17,
        'college': 18
      };
      gradeBasedAge = gradeMap[gradeLevel];
    }

    // Use AI to make a nuanced assessment if there's ambiguity
    let aiAssessment: { isMinor: boolean; confidence: number; reasoning: string; requiresGuardian: boolean } | null = null;

    if (age >= 0 && age <= 12 && gradeBasedAge && Math.abs(age - gradeBasedAge) > 2) {
      // Significant discrepancy between stated age and grade - use AI
      try {
        const aiResponse = await fetch(`${process.env.VITE_API_URL || ''}/api/gemini`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: 'meta/llama-3.1-8b-instruct',
            config: { responseMimeType: 'application/json' },
            contents: [
              {
                role: 'user',
                parts: [
                  {
                    text: `You are an educational safety assistant. Analyze whether a user is a minor (under 18) based on their stated birth date and grade level.

Birth date: ${birthDate}
Calculated age: ${age} years
Grade level: ${gradeLevel || 'not provided'}
Grade-based expected age: ${gradeBasedAge || 'N/A'}

Rules:
- If calculated age is clearly under 18, they are a minor
- If calculated age is 18+, they are NOT a minor
- If there's a significant discrepancy (>2 years) between age and grade, flag for review
- If age is exactly 18, consider them NOT a minor unless grade suggests otherwise

Respond ONLY with valid JSON:
{
  "isMinor": true/false,
  "confidence": 0-100,
  "reasoning": "brief explanation",
  "requiresGuardian": true/false
}`
                  }
                ]
              }
            ]
          })
        });

        if (aiResponse.ok) {
          const aiData = await aiResponse.json();
          try {
            const parsed = JSON.parse(aiData.text);
            aiAssessment = {
              isMinor: parsed.isMinor ?? age < 18,
              confidence: parsed.confidence ?? 90,
              reasoning: parsed.reasoning || 'Based on stated birth date',
              requiresGuardian: parsed.requiresGuardian ?? age < 18
            };
          } catch {
            aiAssessment = null;
          }
        }
      } catch (aiError) {
        console.error('AI age assessment failed:', aiError);
      }
    }

    const isMinor = age < 18;
    const confidence = aiAssessment?.confidence ?? (age >= 0 && age <= 12 ? 95 : 85);
    const requiresGuardian = isMinor && age < 13;

    // Update user profile
    const { error: updateError } = await supabase
      .from('users')
      .upsert({
        id: userId,
        birth_date: birthDate,
        ai_assessed_minor: isMinor,
        updated_at: new Date().toISOString()
      } as any)
      .eq('id', userId);

    if (updateError) throw updateError;

    res.json({
      success: true,
      age,
      isMinor,
      requiresGuardian,
      confidence,
      reasoning: aiAssessment?.reasoning || `Calculated age is ${age}, which is ${isMinor ? 'under' : 'at or above'} 18.`,
      aiAssessment
    });
  } catch (error: any) {
    console.error('Age check error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// POST /api/onboarding/assess-disability
// Uses AI to analyze user's self-described accessibility needs and classify them
router.post('/assess-disability', async (req: Request, res: Response) => {
  try {
    const { userId, freeText, selectedTypes } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'Missing userId' });
    }

    let disabilityTypes = selectedTypes || [];
    let accessibilityNeeds = freeText || '';
    let aiSummary = '';

    // If free text provided, use AI to extract and classify
    if (freeText && freeText.trim().length > 10) {
      try {
        const aiResponse = await fetch(`${process.env.VITE_API_URL || ''}/api/gemini`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: 'meta/llama-3.1-8b-instruct',
            config: { responseMimeType: 'application/json' },
            contents: [
              {
                role: 'user',
                parts: [
                  {
                    text: `You are an accessibility assessment assistant for an educational platform. Analyze the user's description of their learning needs and extract structured information.

User's description: "${freeText}"

Classify into these categories if applicable:
- visual: blindness, low vision, color blindness, visual processing
- auditory: deafness, hard of hearing, auditory processing
- cognitive: dyslexia, ADHD, autism, intellectual disability, memory issues
- physical: motor impairment, cerebral palsy, spinal muscular atrophy
- speech: speech impairment, mutism, aphasia
- mental_health: anxiety, depression, PTSD, OCD
- neurodivergent: autism spectrum, Aspergers, sensory processing
- other: anything not fitting above

Respond ONLY with valid JSON:
{
  "disabilityTypes": ["category1", "category2"],
  "accessibilityNeeds": "concise summary of needed accommodations",
  "recommendedFeatures": ["text-to-speech", "high-contrast", "simplified-ui", "keyboard-nav", "breaks-reminders"],
  "confidence": 0-100,
  "sensitivity": "low/medium/high - how sensitively the platform should treat this user's data"
}`
                  }
                ]
              }
            ]
          })
        });

        if (aiResponse.ok) {
          const aiData = await aiResponse.json();
          try {
            const parsed = JSON.parse(aiData.text);
            disabilityTypes = Array.isArray(parsed.disabilityTypes) ? parsed.disabilityTypes : disabilityTypes;
            accessibilityNeeds = parsed.accessibilityNeeds || accessibilityNeeds;
            aiSummary = JSON.stringify({
              recommendedFeatures: parsed.recommendedFeatures || [],
              confidence: parsed.confidence || 80,
              sensitivity: parsed.sensitivity || 'medium'
            });
          } catch {
            aiSummary = 'AI parsing failed';
          }
        }
      } catch (aiError) {
        console.error('AI disability assessment failed:', aiError);
        aiSummary = 'AI assessment unavailable';
      }
    }

    // Save to user profile and student_profiles
    const { error: userError } = await supabase
      .from('users')
      .upsert({
        id: userId,
        disability_types: disabilityTypes,
        accessibility_needs: accessibilityNeeds,
        ai_assessed_disability: aiSummary || null,
        updated_at: new Date().toISOString()
      } as any)
      .eq('id', userId);

    if (userError) throw userError;

    // Also update student_profiles if it exists
    const { data: existingProfile } = await supabase
      .from('student_profiles')
      .select('user_id')
      .eq('user_id', userId)
      .single();

    if (existingProfile) {
      const queryBuilder = (supabase as any)
        .from('student_profiles')
        .update({
          disability_types: disabilityTypes,
          accessibility_needs: accessibilityNeeds,
          ai_assessment_summary: aiSummary ? JSON.parse(aiSummary) : null
        });
      await queryBuilder.eq('user_id', userId);
    }

    res.json({
      success: true,
      disabilityTypes,
      accessibilityNeeds,
      aiSummary
    });
  } catch (error: any) {
    console.error('Disability assessment error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// POST /api/onboarding/complete
// Finalizes onboarding, marks user profile as complete, triggers recommendations
router.post('/complete', async (req: Request, res: Response) => {
  try {
    const { userId, entityType, entityId, profileData } = req.body;

    if (!userId || !entityType) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Update user with onboarding completion
    const { error: userError } = await supabase
      .from('users')
      .upsert({
        id: userId,
        entity_type: entityType,
        entity_id: entityId,
        onboarding_completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      } as any)
      .eq('id', userId);

    if (userError) throw userError;

    // Generate initial recommendations based on profile
    try {
      await fetch(`${process.env.VITE_API_URL || ''}/api/recommendations/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });
    } catch (recError) {
      console.error('Failed to generate initial recommendations:', recError);
    }

    res.json({ success: true, message: 'Onboarding completed successfully' });
  } catch (error: any) {
    console.error('Complete onboarding error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

export default router;
