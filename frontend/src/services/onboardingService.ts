import { supabase } from '@/lib/supabase';
import type { AgeCheckResult, DisabilityAssessmentResult } from '@/lib/onboarding';

const API_BASE = import.meta.env.VITE_API_URL || '';

// Types
export interface StudentProfile {
  gradeLevel: string;
  learningStyle: string;
  interests: string[];
  learningPace?: string;
}

export interface SkillAssessment {
  userId: string;
  skillCategory: string;
  skillName: string;
  score: number;
  maxScore: number;
  details?: Record<string, any>;
}

export interface LearningSession {
  userId: string;
  sessionType: 'reading' | 'math' | 'focus' | 'writing';
  contentId?: string;
  durationMinutes: number;
  metrics?: Record<string, any>;
}

async function parseApiError(response: Response, fallbackMessage: string) {
  const error = await response.json().catch(() => ({}));
  return new Error(error.message || fallbackMessage);
}

async function callGemini(contents: any[], config?: any): Promise<any> {
  const endpoint = API_BASE ? `${API_BASE}/api/gemini` : '/api/gemini';
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'meta/llama-3.1-8b-instruct',
      contents,
      config: { ...config, responseMimeType: 'application/json' }
    })
  });

  if (!response.ok) {
    throw new Error(`AI request failed: ${response.status}`);
  }

  const data = await response.json();
  return data.text ? JSON.parse(data.text) : null;
}

// Age check using AI + deterministic logic
export async function checkAge(userId: string, birthDate: string): Promise<AgeCheckResult> {
  const birth = new Date(birthDate);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }

  const isMinor = age < 18;
  const requiresGuardian = isMinor && age < 13;

  let aiAssessment;
  if (isMinor) {
    try {
      aiAssessment = await callGemini([{
        role: 'user',
        parts: [{
          text: `You are an educational safety assistant. The user provided birth date: ${birthDate}. Calculated age: ${age}. Determine if they are a minor (under 18). Respond with JSON: {"isMinor": boolean, "confidence": number, "reasoning": "string", "requiresGuardian": boolean}`
        }]
      }]);
    } catch {
      // Non-blocking
    }
  }

  const result: AgeCheckResult = {
    age,
    isMinor,
    requiresGuardian,
    confidence: aiAssessment?.confidence ?? 90,
    reasoning: aiAssessment?.reasoning || `Calculated age is ${age}`,
    aiAssessment
  };

  // Persist to Supabase
  const { error } = await supabase
    .from('users')
    .upsert({
      id: userId,
      birth_date: birthDate,
      ai_assessed_minor: isMinor,
      updated_at: new Date().toISOString()
    })
    .eq('id', userId);

  if (error) throw error;

  return result;
}

// Disability/accessibility needs assessment
export async function assessDisability(
  userId: string,
  freeText: string,
  selectedTypes: string[]
): Promise<DisabilityAssessmentResult> {
  let disabilityTypes = selectedTypes || [];
  let accessibilityNeeds = freeText || '';
  let aiSummary = '';

  if (freeText && freeText.trim().length > 10) {
    try {
      const parsed = await callGemini([{
        role: 'user',
        parts: [{
          text: `You are an accessibility assessment assistant. Analyze this user's description of their learning needs: "${freeText}". Classify into categories: visual, auditory, cognitive, physical, speech, mental_health, neurodivergent, other. Respond with JSON: {"disabilityTypes": ["category"], "accessibilityNeeds": "summary", "recommendedFeatures": ["feature"], "confidence": number, "sensitivity": "low/medium/high"}`
        }]
      }]);

      if (parsed) {
        disabilityTypes = Array.isArray(parsed.disabilityTypes) ? parsed.disabilityTypes : disabilityTypes;
        accessibilityNeeds = parsed.accessibilityNeeds || accessibilityNeeds;
        aiSummary = JSON.stringify({
          recommendedFeatures: parsed.recommendedFeatures || [],
          confidence: parsed.confidence || 80,
          sensitivity: parsed.sensitivity || 'medium'
        });
      }
    } catch {
      aiSummary = 'AI assessment unavailable';
    }
  }

  // Persist to Supabase
  const { error: userError } = await supabase
    .from('users')
    .upsert({
      id: userId,
      disability_types: disabilityTypes,
      accessibility_needs: accessibilityNeeds,
      ai_assessed_disability: aiSummary || null,
      updated_at: new Date().toISOString()
    })
    .eq('id', userId);

  if (userError) throw userError;

  const { data: existingProfile } = await supabase
    .from('student_profiles')
    .select('user_id')
    .eq('user_id', userId)
    .single();

  if (existingProfile) {
    await supabase
      .from('student_profiles')
      .update({
        disability_types: disabilityTypes,
        accessibility_needs: accessibilityNeeds,
        ai_assessment_summary: aiSummary ? JSON.parse(aiSummary) : null
      })
      .eq('user_id', userId);
  }

  return { disabilityTypes, accessibilityNeeds, aiSummary };
}

// Submit guardian consent
export async function submitGuardianConsent(userId: string, guardianEmail: string, guardianName: string) {
  const { error } = await supabase
    .from('users')
    .upsert({
      id: userId,
      guardian_email: guardianEmail,
      guardian_consent: true,
      guardian_consent_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq('id', userId);

  if (error) throw error;

  // In production, send confirmation email to guardian
  // For now, just log it
  console.log(`Guardian consent recorded for user ${userId}: ${guardianName} (${guardianEmail})`);
}

// Create student profile
export async function createStudentProfile(userId: string, profile: StudentProfile) {
  const { error } = await supabase
    .from('student_profiles')
    .upsert({
      user_id: userId,
      grade_level: profile.gradeLevel,
      learning_style: profile.learningStyle,
      interests: profile.interests,
      learning_pace: profile.learningPace
    });

  if (error) throw error;
}

// Submit skill assessment
export async function submitSkillAssessment(assessment: SkillAssessment) {
  const response = await fetch(`${API_BASE}/api/analytics/update-profile`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(assessment),
  });

  if (!response.ok) {
    throw await parseApiError(response, 'Failed to submit assessment');
  }

  return response.json();
}

// Complete learning session
export async function completeLearningSession(session: LearningSession) {
  const response = await fetch(`${API_BASE}/api/sessions/complete`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(session),
  });

  if (!response.ok) {
    throw await parseApiError(response, 'Failed to complete session');
  }

  return response.json();
}

// Submit game telemetry for assessment
export async function submitGameTelemetry(payload: {
  userId: string;
  game: string;
  gameVersion: string;
  turns: any[];
  metrics: Record<string, any>;
  completed: boolean;
  xpEarned: number;
}) {
  try {
    const response = await fetch(`${API_BASE}/api/analytics/game-telemetry`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw await parseApiError(response, 'Failed to submit game telemetry');
    }

    return response.json();
  } catch (error) {
    console.error('Game telemetry submission failed (non-critical):', error);
    // Return success anyway so games don't break
    return { success: true, offline: true };
  }
}

// Get recommendations
export async function getRecommendations(userId: string) {
  const { data, error } = await supabase
    .from('recommendations')
    .select('*')
    .eq('user_id', userId)
    .eq('completed', false)
    .order('priority', { ascending: false });

  if (error) throw error;
  return data || [];
}

// Create institution
export async function createInstitution(
  adminUserId: string,
  name: string,
  type: string,
  address?: string,
  contactEmail?: string
) {
  const response = await fetch(`${API_BASE}/api/institutions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name,
      type,
      address,
      contactEmail,
      adminUserId,
    }),
  });

  if (!response.ok) {
    throw await parseApiError(response, 'Failed to create institution');
  }

  return response.json();
}

// Create organization
export async function createOrganization(
  adminUserId: string,
  name: string,
  type: string,
  description?: string,
  contactEmail?: string
) {
  const response = await fetch(`${API_BASE}/api/organizations`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name,
      type,
      description,
      contactEmail,
      adminUserId,
    }),
  });

  if (!response.ok) {
    throw await parseApiError(response, 'Failed to create organization');
  }

  return response.json();
}

// Get strengths
export async function getStrengths(userId: string) {
  const response = await fetch(`${API_BASE}/api/analytics/strengths/${userId}`);

  if (!response.ok) {
    throw await parseApiError(response, 'Failed to get strengths');
  }

  return response.json();
}

// Get weaknesses
export async function getWeaknesses(userId: string) {
  const response = await fetch(`${API_BASE}/api/analytics/weaknesses/${userId}`);

  if (!response.ok) {
    throw await parseApiError(response, 'Failed to get weaknesses');
  }

  return response.json();
}

export async function persistStudentOnboarding(userId: string, profile: StudentProfile & { birthDate?: string; disabilityTypes?: string[]; accessibilityNeeds?: string; guardianEmail?: string }) {
  await createStudentProfile(userId, profile);

  const assessment = JSON.parse(localStorage.getItem('onboarding_assessment') || '{}');
  const scores = assessment?.scores as Record<string, { correct: number; total: number }> | undefined;

  const assessmentPayloads: SkillAssessment[] = [];
  if (scores) {
    Object.entries(scores).forEach(([skillCategory, score]) => {
      assessmentPayloads.push({
        userId,
        skillCategory,
        skillName: skillCategory,
        score: score.correct,
        maxScore: score.total
      });
    });
  }

  await Promise.all(assessmentPayloads.map((assessment) => submitSkillAssessment(assessment)));

  // Mark onboarding as complete
  try {
    await fetch(`${API_BASE}/api/onboarding/complete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        entityType: 'student',
        profileData: {
          birthDate: profile.birthDate,
          disabilityTypes: profile.disabilityTypes,
          accessibilityNeeds: profile.accessibilityNeeds,
          guardianEmail: profile.guardianEmail
        }
      })
    });
  } catch (completeError) {
    console.error('Failed to mark onboarding complete:', completeError);
  }
}

export async function createInstitutionOnboarding(adminUserId: string) {
  return createInstitution(
    adminUserId,
    localStorage.getItem('onboarding_institution_name') || '',
    localStorage.getItem('onboarding_institution_type') || '',
    localStorage.getItem('onboarding_institution_address') || undefined,
    localStorage.getItem('onboarding_institution_email') || undefined
  );
}

export async function createOrganizationOnboarding(adminUserId: string) {
  return createOrganization(
    adminUserId,
    localStorage.getItem('onboarding_organization_name') || '',
    localStorage.getItem('onboarding_organization_type') || '',
    localStorage.getItem('onboarding_organization_description') || undefined,
    localStorage.getItem('onboarding_organization_email') || undefined
  );
}

export async function persistInstitutionOnboarding(adminUserId: string) {
  const result = await createInstitutionOnboarding(adminUserId);
  localStorage.setItem('onboarding_entity_type', 'institution');
  return result;
}

export async function persistOrganizationOnboarding(adminUserId: string) {
  const result = await createOrganizationOnboarding(adminUserId);
  localStorage.setItem('onboarding_entity_type', 'organization');
  return result;
}
