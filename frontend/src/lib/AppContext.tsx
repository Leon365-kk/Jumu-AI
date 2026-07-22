import React, { createContext, useContext } from 'react';
import { useAuth } from './AuthContext';
import { usePreferences } from './PreferencesContext';
import { useGamification } from './GamificationContext';
import { useUI } from './UIContext';

interface AppContextType {
  language: string;
  setLanguage: (lang: any) => void;
  t: (key: any) => string;
  theme: string;
  setTheme: (theme: string) => void;
  font: string;
  setFont: (font: string) => void;
  userName: string;
  setUserName: (name: string) => void;
  user: any;
  loading: boolean;
  isVoiceAssistantOpen: boolean;
  setIsVoiceAssistantOpen: (open: boolean) => void;
  learningFocus: 'reading' | 'math' | 'all';
  setLearningFocus: (focus: 'reading' | 'math' | 'all') => Promise<void>;
  xpNotification: { xp: number; message?: string } | null;
  setXpNotification: (notif: { xp: number; message?: string } | null) => void;
  levelUpNotification: number | null;
  setLevelUpNotification: (level: number | null) => void;
  badgeNotification: { title: string; description: string } | null;
  setBadgeNotification: (badge: { title: string; description: string } | null) => void;
  addXP: (amount: number, message?: string, challengeUpdates?: { id: string; increment: number }[]) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  registerWithEmail: (email: string, pass: string) => Promise<void>;
  loginAsGuest: () => void;
  logout: () => Promise<void>;
  refreshOnboardingStatus: () => Promise<void>;
  userDisabilityTypes: string[];
  isMinor: boolean;
  requiresGuardian: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const auth = useAuth();
  const prefs = usePreferences();
  const gamification = useGamification();
  const ui = useUI();

  const value = {
    language: prefs.language,
    setLanguage: prefs.setLanguage,
    t: prefs.t,
    theme: prefs.theme,
    setTheme: prefs.setTheme,
    font: prefs.font,
    setFont: prefs.setFont,
    userName: prefs.userName,
    setUserName: prefs.setUserName,
    user: auth.user,
    loading: auth.loading,
    isVoiceAssistantOpen: ui.isVoiceAssistantOpen,
    setIsVoiceAssistantOpen: ui.setIsVoiceAssistantOpen,
    learningFocus: prefs.learningFocus,
    setLearningFocus: prefs.setLearningFocus,
    xpNotification: gamification.xpNotification,
    setXpNotification: gamification.setXpNotification,
    levelUpNotification: gamification.levelUpNotification,
    setLevelUpNotification: gamification.setLevelUpNotification,
    badgeNotification: gamification.badgeNotification,
    setBadgeNotification: gamification.setBadgeNotification,
    addXP: gamification.addXP,
    loginWithGoogle: auth.loginWithGoogle,
    loginWithEmail: auth.loginWithEmail,
    registerWithEmail: auth.registerWithEmail,
    loginAsGuest: auth.loginAsGuest,
    logout: auth.logout,
    refreshOnboardingStatus: auth.refreshOnboardingStatus,
    userDisabilityTypes: [],
    isMinor: false,
    requiresGuardian: false
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}