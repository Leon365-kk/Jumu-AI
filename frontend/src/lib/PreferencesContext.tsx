import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { Language, translations } from './translations';
import { supabase } from './supabase';

interface PreferencesContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: keyof typeof translations['en']) => string;
  theme: string;
  setTheme: (theme: string) => void;
  font: string;
  setFont: (font: string) => void;
  userName: string;
  setUserName: (name: string) => void;
  learningFocus: 'reading' | 'math' | 'all';
  setLearningFocus: (focus: 'reading' | 'math' | 'all') => Promise<void>;
}

const PreferencesContext = createContext<PreferencesContextType | undefined>(undefined);

export function PreferencesProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en');
  const [theme, setThemeState] = useState('light');
  const [font, setFontState] = useState('inter');
  const [userName, setUserNameState] = useState('');
  const [learningFocus, setLearningFocusState] = useState<'reading' | 'math' | 'all'>('all');

  const preferenceUpdateTimers = useState<Record<string, NodeJS.Timeout>>({})[0];

  const setLanguage = useCallback(async (lang: Language) => {
    setLanguageState(lang);
    // Debounced DB write handled by AppContext for now
  }, []);

  const setTheme = useCallback(async (t: string) => {
    setThemeState(t);
  }, []);

  const setFont = useCallback(async (f: string) => {
    setFontState(f);
  }, []);

  const setUserName = async (name: string) => {
    setUserNameState(name);
  };

  const setLearningFocus = async (focus: 'reading' | 'math' | 'all') => {
    setLearningFocusState(focus);
  };

  const t = (key: keyof typeof translations['en']) => {
    return translations[language][key] || translations['en'][key];
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.style.fontFamily = font === 'dyslexic' ? 'OpenDyslexic, sans-serif' : 'Inter, sans-serif';
  }, [theme, font]);

  return (
    <PreferencesContext.Provider value={{ language, setLanguage, t, theme, setTheme, font, setFont, userName, setUserName, learningFocus, setLearningFocus }}>
      {children}
    </PreferencesContext.Provider>
  );
}

export function usePreferences() {
  const context = useContext(PreferencesContext);
  if (context === undefined) {
    throw new Error('usePreferences must be used within a PreferencesProvider');
  }
  return context;
}