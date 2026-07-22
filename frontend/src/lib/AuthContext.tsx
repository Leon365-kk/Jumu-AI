import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Language, translations } from './translations';
import { isSupabaseConfigured, supabase } from './supabase';
import { User } from '@supabase/supabase-js';
import { clearOnboardingState } from './onboarding';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  loginWithGoogle: () => Promise<void>;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  registerWithEmail: (email: string, pass: string) => Promise<void>;
  loginAsGuest: () => void;
  logout: () => Promise<void>;
  refreshOnboardingStatus: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        fetchUserProfile(currentUser.id);
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (userId: string) => {
    if (userId === 'guest-user') {
      setLoading(false);
      return;
    }
    try {
      const { data, error } = await supabase
        .from('users')
        .select('display_name, preferences, disability_types, ai_assessed_minor')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error);
      }
    } catch (err) {
      console.error('Profile fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin + "/welcome" }
    });
    if (error) throw error;
  };

  const loginWithEmail = async (email: string, pass: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password: pass });
    if (error) throw error;
    clearOnboardingState();
  };

  const registerWithEmail = async (email: string, pass: string) => {
    const { error } = await supabase.auth.signUp({ email, password: pass });
    if (error) throw error;
    clearOnboardingState();
  };

  const loginAsGuest = () => {
    clearOnboardingState();
    const guestUser: User = {
      id: 'guest-user',
      email: 'guest@jumu.ai',
      app_metadata: {},
      user_metadata: { display_name: 'Guest Explorer' },
      aud: 'authenticated',
      created_at: new Date().toISOString(),
    };
    setUser(guestUser);
    setLoading(false);
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  const refreshOnboardingStatus = async () => {
    if (!user || user.id === 'guest-user') return;

    const { data, error } = await supabase
      .from('users')
      .select('entity_type, entity_id')
      .eq('id', user.id)
      .maybeSingle();

    if (error) {
      console.error('Onboarding status fetch error:', error);
      return;
    }

    if (data?.entity_type) {
      localStorage.setItem('onboarding_entity_type', data.entity_type);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, loginWithGoogle, loginWithEmail, registerWithEmail, loginAsGuest, logout, refreshOnboardingStatus }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

