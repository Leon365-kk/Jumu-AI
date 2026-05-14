import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'motion/react';
import Landing from './pages/Landing';
import Splash from './pages/Splash';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Reader from './pages/Reader';
import Library from './pages/Library';
import Writer from './pages/Writer';
import MathHelper from './pages/MathHelper';
import FocusZone from './pages/FocusZone';
import CameraView from './pages/Camera';
import Settings from './pages/Settings';
import Progress from './pages/Progress';
import Glossary from './pages/Glossary';
import OnboardingName from './pages/OnboardingName';

import { useApp } from './lib/AppContext';
import { Loader2 } from 'lucide-react';
import { isSupabaseConfigured, missingSupabaseConfigMessage } from './lib/supabase';

function AnimatedRoutes() {
  const location = useLocation();
  const { loading } = useApp();

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-surface">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      <Routes location={location}>
        <Route path="/" element={<Landing />} />
        <Route path="/splash" element={<Splash />} />
        <Route path="/login" element={<Login />} />
        <Route path="/onboarding/name" element={<OnboardingName />} />
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
  );
}

export default function App() {
  if (!isSupabaseConfigured) {
    return (
      <div className="min-h-screen w-full bg-surface text-text flex items-center justify-center p-6">
        <div className="max-w-xl rounded-2xl border border-border bg-card p-6 space-y-3">
          <h1 className="text-2xl font-bold">Configuration Required</h1>
          <p className="opacity-90">{missingSupabaseConfigMessage}</p>
          <p className="text-sm opacity-80">
            For Vercel, add both env vars in Project Settings {'>'} Environment Variables for
            Production and redeploy.
          </p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <AnimatedRoutes />
    </Router>
  );
}
