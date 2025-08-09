import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL as string;
const supabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON as string;

if (!supabaseUrl || !supabaseAnonKey) {
  // Throwing here helps fail fast in development if env is missing
  throw new Error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON in environment');
}

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey); 