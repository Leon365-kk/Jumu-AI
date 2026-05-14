import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language, translations } from './translations';
import { supabase } from './supabase';
import { User } from '@supabase/supabase-js';

interface AppContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: keyof typeof translations['en']) => string;
  theme: string;
  setTheme: (theme: string) => void;
  font: string;
  setFont: (font: string) => void;
  userName: string;
  setUserName: (name: string) => void;
  user: User | null;
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
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [language, setLanguageState] = useState<Language>('en');
  const [theme, setThemeState] = useState('light');
  const [font, setFontState] = useState('inter');
  const [userName, setUserNameState] = useState('');
  const [learningFocus, setLearningFocusState] = useState<'reading' | 'math' | 'all'>('all');
  const [isVoiceAssistantOpen, setIsVoiceAssistantOpen] = useState(false);
  const [xpNotification, setXpNotification] = useState<{ xp: number; message?: string } | null>(null);
  const [levelUpNotification, setLevelUpNotification] = useState<number | null>(null);
  const [badgeNotification, setBadgeNotification] = useState<{ title: string; description: string } | null>(null);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        fetchUserProfile(currentUser.id);
      } else {
        setLoading(false);
        // Clear local state on logout
        setUserNameState('');
        setLanguageState('en');
        setThemeState('light');
        setFontState('inter');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const addXP = async (amount: number, message?: string, challengeUpdates?: { id: string; increment: number }[]) => {
    if (!user || user.id === 'guest-user') return;
    
    // Lazy load the gamification utility to avoid circular issues
    const { updateGamification } = await import('./gamification');
    const result = await updateGamification(user.id, { xpGain: amount, challengeUpdates });
    
    if (result) {
      setXpNotification({ xp: amount, message });
      if (result.levalUp) {
        setLevelUpNotification(result.newLevel);
      }
      
      if (result.newBadgesCount > 0) {
        // Find the latest unlocked badge info
        // We can just show a generic "New Milestone" or use a helper
        // Since we don't have the badge title here easily, let's just use a default or fetch it
        setBadgeNotification({ 
          title: "New Milestone!", 
          description: "You've unlocked a new achievement. Check your dashboard!" 
        });
      }
    }
  };

  const fetchUserProfile = async (userId: string) => {
    if (userId === 'guest-user') {
      setLoading(false);
      return;
    }
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
        console.error('Error fetching profile:', error);
      }

      if (data) {
        if (data.display_name) setUserNameState(data.display_name);
        if (data.preferences) {
          if (data.preferences.language) setLanguageState(data.preferences.language);
          if (data.preferences.theme) setThemeState(data.preferences.theme);
          if (data.preferences.font) setFontState(data.preferences.font);
          if (data.preferences.learningFocus) setLearningFocusState(data.preferences.learningFocus);
        }
      }
    } catch (err) {
      console.error('Profile fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin
        }
      });
      if (error) throw error;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const loginWithEmail = async (email: string, pass: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password: pass });
      if (error) throw error;
    } catch (error) {
      console.error('Email login error:', error);
      throw error;
    }
  };

  const registerWithEmail = async (email: string, pass: string) => {
    try {
      const { error } = await supabase.auth.signUp({ email, password: pass });
      if (error) throw error;
    } catch (error) {
      console.error('Email registration error:', error);
      throw error;
    }
  };
  const loginAsGuest = () => {
    const guestUser: User = {
      id: 'guest-user',
      email: 'guest@jumu.ai',
      app_metadata: {},
      user_metadata: { display_name: 'Guest Explorer' },
      aud: 'authenticated',
      created_at: new Date().toISOString(),
    };
    setUser(guestUser);
    setUserNameState('Guest Explorer');
    setLoading(false);
  };
 
   const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const setLanguage = async (lang: Language) => {
    setLanguageState(lang);
    if (user && user.id !== 'guest-user') {
      try {
        await supabase.from('users').upsert({
          id: user.id,
          preferences: { language: lang, theme, font }
        });
      } catch (error) {
        console.error('Error updating language:', error);
      }
    }
  };

  const setTheme = async (t: string) => {
    setThemeState(t);
    if (user && user.id !== 'guest-user') {
      try {
        await supabase.from('users').upsert({
          id: user.id,
          preferences: { language, theme: t, font }
        });
      } catch (error) {
        console.error('Error updating theme:', error);
      }
    }
  };

  const setFont = async (f: string) => {
    setFontState(f);
    if (user && user.id !== 'guest-user') {
      try {
        await supabase.from('users').upsert({
          id: user.id,
          preferences: { language, theme, font: f }
        });
      } catch (error) {
        console.error('Error updating font:', error);
      }
    }
  };

  const setUserName = async (name: string) => {
    setUserNameState(name);
    if (user && user.id !== 'guest-user') {
      try {
        await supabase.from('users').upsert({
          id: user.id,
          display_name: name,
          email: user.email,
          updated_at: new Date().toISOString()
        });
      } catch (error) {
        console.error('Error updating username:', error);
      }
    }
  };
  
  const setLearningFocus = async (focus: 'reading' | 'math' | 'all') => {
    setLearningFocusState(focus);
    if (user && user.id !== 'guest-user') {
      try {
        await supabase.from('users').upsert({
          id: user.id,
          preferences: { language, theme, font, learningFocus: focus }
        });
      } catch (error) {
        console.error('Error updating focus:', error);
      }
    }
  };

  const t = (key: keyof typeof translations['en']) => {
    return translations[language][key] || translations['en'][key];
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.style.fontFamily = font === 'dyslexic' ? 'OpenDyslexic, sans-serif' : 'Inter, sans-serif';
  }, [theme, font]);

  return (
    <AppContext.Provider value={{ 
      language, setLanguage, t, 
      theme, setTheme, 
      font, setFont,
      userName, setUserName,
      learningFocus, setLearningFocus,
      user, loading,
      isVoiceAssistantOpen, setIsVoiceAssistantOpen,
      xpNotification, setXpNotification,
      levelUpNotification, setLevelUpNotification,
      badgeNotification, setBadgeNotification,
      addXP,
      loginWithGoogle, loginWithEmail, registerWithEmail, loginAsGuest, logout
    }}>
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
