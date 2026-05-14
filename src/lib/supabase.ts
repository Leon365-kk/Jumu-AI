import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL;
const supabaseAnonKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY;
const fallbackSupabaseUrl = 'https://example.supabase.co';
const fallbackSupabaseAnonKey = 'missing-supabase-anon-key';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);
export const missingSupabaseConfigMessage =
  'Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. Add them to your environment variables and redeploy.';

if (!isSupabaseConfigured) {
  console.error(missingSupabaseConfigMessage);
}

// Use harmless placeholders so app boot doesn't crash on missing env vars.
export const supabase = createClient(
  supabaseUrl || fallbackSupabaseUrl,
  supabaseAnonKey || fallbackSupabaseAnonKey
);
