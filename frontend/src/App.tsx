import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'motion/react';
import { lazy, Suspense } from 'react';
import { Loader2 } from 'lucide-react';

// Lazy load page components for code splitting
const Landing = lazy(() => import('./pages/Landing'));
const Splash = lazy(() => import('./pages/Splash'));
const Welcome = lazy(() => import('./pages/Welcome'));
const Login = lazy(() => import('./pages/Login'));
const OnboardingBasicQuestions = lazy(() => import('./pages/OnboardingBasicQuestions'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Reader = lazy(() => import('./pages/Reader'));
const Library = lazy(() => import('./pages/Library'));
const Writer = lazy(() => import('./pages/Writer'));
const MathHelper = lazy(() => import('./pages/MathHelper'));
const FocusZone = lazy(() => import('./pages/FocusZone'));
const CameraView = lazy(() => import('./pages/Camera'));
const Settings = lazy(() => import('./pages/Settings'));
const Progress = lazy(() => import('./pages/Progress'));
const Glossary = lazy(() => import('./pages/Glossary'));
const OnboardingName = lazy(() => import('./pages/OnboardingName'));
const OnboardingEntity = lazy(() => import('./pages/OnboardingEntity'));
const OnboardingGrade = lazy(() => import('./pages/OnboardingGrade'));
const OnboardingStyle = lazy(() => import('./pages/OnboardingStyle'));
const OnboardingInterests = lazy(() => import('./pages/OnboardingInterests'));
const OnboardingAssessment = lazy(() => import('./pages/OnboardingAssessment'));
const OnboardingInstitutionType = lazy(() => import('./pages/OnboardingInstitutionType'));
const OnboardingInstitutionDetails = lazy(() => import('./pages/OnboardingInstitutionDetails'));
const OnboardingOrganizationType = lazy(() => import('./pages/OnboardingOrganizationType'));
const OnboardingOrganizationDetails = lazy(() => import('./pages/OnboardingOrganizationDetails'));
const OnboardingAgeCheck = lazy(() => import('./pages/OnboardingAgeCheck'));
const OnboardingDisability = lazy(() => import('./pages/OnboardingDisability'));
const OnboardingGuardian = lazy(() => import('./pages/OnboardingGuardian'));
const MemoryMatch = lazy(() => import('./pages/games/MemoryMatch'));
const FindTheDifference = lazy(() => import('./pages/games/FindTheDifference'));

import { AuthProvider, useAuth } from './lib/AuthContext';
import { PreferencesProvider } from './lib/PreferencesContext';
import { GamificationProvider } from './lib/GamificationContext';
import { UIProvider } from './lib/UIContext';
import { AppProvider } from './lib/AppContext';
import { Sparkles } from 'lucide-react';
import { isSupabaseConfigured, missingSupabaseConfigMessage } from './lib/supabase';

function AnimatedRoutes() {
  const location = useLocation();
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-surface">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 bg-primary rounded-xl flex items-center justify-center">
            <span className="text-white font-bold text-2xl">J</span>
          </div>
          <p className="text-sm font-medium text-on-surface-muted">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Suspense fallback={
      <div className="h-screen w-screen flex items-center justify-center bg-surface">
        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
          <span className="text-white font-bold">J</span>
        </div>
      </div>
    }>
        <AnimatePresence mode="wait">
        <Routes location={location}>
          <Route path="/" element={<Landing />} />
          <Route path="/splash" element={<Splash />} />
          <Route path="/welcome" element={<Welcome />} />
          <Route path="/login" element={<Login />} />
          <Route path="/onboarding/basic-questions" element={<OnboardingBasicQuestions />} />
          <Route path="/games/memory-match" element={<MemoryMatch />} />
          <Route path="/games/find-difference" element={<FindTheDifference />} />
          <Route path="/onboarding" element={<OnboardingEntity />} />
          <Route path="/onboarding/name" element={<OnboardingName />} />
          <Route path="/onboarding/age" element={<OnboardingAgeCheck />} />
          <Route path="/onboarding/disability" element={<OnboardingDisability />} />
          <Route path="/onboarding/guardian" element={<OnboardingGuardian />} />
          <Route path="/onboarding/grade" element={<OnboardingGrade />} />
          <Route path="/onboarding/style" element={<OnboardingStyle />} />
          <Route path="/onboarding/interests" element={<OnboardingInterests />} />
          <Route path="/onboarding/assessment" element={<OnboardingAssessment />} />
          <Route path="/onboarding/institution-type" element={<OnboardingInstitutionType />} />
          <Route path="/onboarding/institution-details" element={<OnboardingInstitutionDetails />} />
          <Route path="/onboarding/organization-type" element={<OnboardingOrganizationType />} />
          <Route path="/onboarding/organization-details" element={<OnboardingOrganizationDetails />} />
          <Route path="/onboarding/personalize" element={<Settings />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/reader" element={<Reader />} />
          <Route path="/library" element={<Library />} />
          <Route path="/writer" element={<Writer />} />
          <Route path="/math" element={<MathHelper />} />
          <Route path="/focus-zone" element={<FocusZone />} />
          <Route path="/camera" element={<CameraView />} />
          <Route path="/progress" element={<Progress />} />
          <Route path="/glossary" element={<Glossary />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AnimatePresence>
    </Suspense>
  );
}

export default function App() {
  if (!isSupabaseConfigured) {
    return (
      <div className="min-h-screen w-full bg-surface text-text flex items-center justify-center p-6">
        <div className="max-w-xl rounded-2xl border border-surface-container bg-card p-8 space-y-4 shadow-card">
          <div className="w-12 h-12 bg-error/10 rounded-xl flex items-center justify-center text-error">
            <Sparkles className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-headline font-bold text-on-surface">Configuration Required</h1>
          <p className="opacity-90 text-on-surface-muted">{missingSupabaseConfigMessage}</p>
          <p className="text-sm opacity-80 text-on-surface-muted">
            For Vercel, add both env vars in Project Settings {'>'} Environment Variables for
            Production and redeploy.
          </p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <AuthProvider>
        <PreferencesProvider>
          <GamificationProvider>
            <UIProvider>
              <AppProvider>
                <AnimatedRoutes />
              </AppProvider>
            </UIProvider>
          </GamificationProvider>
        </PreferencesProvider>
      </AuthProvider>
    </Router>
  );
}