export type OnboardingEntityType = 'student' | 'institution' | 'organization';

export interface StudentOnboardingData {
  gradeLevel: string;
  learningStyle: string;
  interests: string[];
  assessment: Record<string, unknown>;
  birthDate?: string;
  disabilityTypes?: string[];
  accessibilityNeeds?: string;
  guardianEmail?: string;
  guardianName?: string;
}

export interface InstitutionOnboardingData {
  type: string;
  name: string;
  address: string;
  contactEmail: string;
}

export interface OrganizationOnboardingData {
  type: string;
  name: string;
  description: string;
  contactEmail: string;
}

export interface AgeCheckResult {
  age: number;
  isMinor: boolean;
  requiresGuardian: boolean;
  confidence: number;
  reasoning: string;
  aiAssessment?: {
    isMinor: boolean;
    confidence: number;
    reasoning: string;
    requiresGuardian: boolean;
  };
}

export interface DisabilityAssessmentResult {
  disabilityTypes: string[];
  accessibilityNeeds: string;
  aiSummary?: string;
}

export function hasCompletedOnboarding(entityType?: OnboardingEntityType | null) {
  if (!entityType) return false;

  if (entityType === 'student') {
    const grade = localStorage.getItem('onboarding_grade');
    const style = localStorage.getItem('onboarding_learning_style');
    const interests = localStorage.getItem('onboarding_interests');
    const basicQuestions = localStorage.getItem('onboarding_basic_questions');
    const gamesCompleted = localStorage.getItem('onboarding_games_completed');
    return Boolean((grade && style && interests) || (basicQuestions && gamesCompleted));
  }

  if (entityType === 'institution') {
    // Check if institution onboarding is complete
    const type = localStorage.getItem('onboarding_institution_type');
    const name = localStorage.getItem('onboarding_institution_name');
    const address = localStorage.getItem('onboarding_institution_address');
    const email = localStorage.getItem('onboarding_institution_email');
    return Boolean(type && name && address && email);
  }

  if (entityType === 'organization') {
    // Check if organization onboarding is complete
    const type = localStorage.getItem('onboarding_organization_type');
    const name = localStorage.getItem('onboarding_organization_name');
    const description = localStorage.getItem('onboarding_organization_description');
    const email = localStorage.getItem('onboarding_organization_email');
    return Boolean(type && name && description && email);
  }

  return false;
}

export function clearOnboardingState() {
  if (typeof window === 'undefined') return;

  localStorage.removeItem('onboarding_entity_type');
  localStorage.removeItem('onboarding_grade');
  localStorage.removeItem('onboarding_learning_style');
  localStorage.removeItem('onboarding_interests');
  localStorage.removeItem('onboarding_assessment');
  localStorage.removeItem('onboarding_institution_type');
  localStorage.removeItem('onboarding_institution_name');
  localStorage.removeItem('onboarding_institution_address');
  localStorage.removeItem('onboarding_institution_email');
  localStorage.removeItem('onboarding_organization_type');
  localStorage.removeItem('onboarding_organization_name');
  localStorage.removeItem('onboarding_organization_description');
  localStorage.removeItem('onboarding_organization_email');
  localStorage.removeItem('onboarding_age_check');
  localStorage.removeItem('onboarding_disability');
  localStorage.removeItem('onboarding_birth_date');
  localStorage.removeItem('onboarding_basic_questions');
  localStorage.removeItem('onboarding_games_completed');
}

export function getStudentOnboardingData(): StudentOnboardingData {
  if (typeof window === 'undefined') {
    return { gradeLevel: '', learningStyle: '', interests: [], assessment: {} };
  }

  const ageCheck = (() => {
    try {
      return JSON.parse(localStorage.getItem('onboarding_age_check') || '{}');
    } catch {
      return {};
    }
  })();

  const disability = (() => {
    try {
      return JSON.parse(localStorage.getItem('onboarding_disability') || '{}');
    } catch {
      return {};
    }
  })();

  return {
    gradeLevel: localStorage.getItem('onboarding_grade') || '',
    learningStyle: localStorage.getItem('onboarding_learning_style') || '',
    interests: JSON.parse(localStorage.getItem('onboarding_interests') || '[]'),
    assessment: JSON.parse(localStorage.getItem('onboarding_assessment') || '{}'),
    birthDate: ageCheck?.birthDate || localStorage.getItem('onboarding_birth_date') || undefined,
    disabilityTypes: disability?.disabilityTypes || undefined,
    accessibilityNeeds: disability?.accessibilityNeeds || undefined,
    guardianEmail: ageCheck?.guardianEmail || undefined,
    guardianName: ageCheck?.guardianName || undefined
  };
}

export function getInstitutionOnboardingData(): InstitutionOnboardingData {
  if (typeof window === 'undefined') {
    return { type: '', name: '', address: '', contactEmail: '' };
  }

  return {
    type: localStorage.getItem('onboarding_institution_type') || '',
    name: localStorage.getItem('onboarding_institution_name') || '',
    address: localStorage.getItem('onboarding_institution_address') || '',
    contactEmail: localStorage.getItem('onboarding_institution_email') || ''
  };
}

export function getOrganizationOnboardingData(): OrganizationOnboardingData {
  if (typeof window === 'undefined') {
    return { type: '', name: '', description: '', contactEmail: '' };
  }

  return {
    type: localStorage.getItem('onboarding_organization_type') || '',
    name: localStorage.getItem('onboarding_organization_name') || '',
    description: localStorage.getItem('onboarding_organization_description') || '',
    contactEmail: localStorage.getItem('onboarding_organization_email') || ''
  };
}
