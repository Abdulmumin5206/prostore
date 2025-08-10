import { createClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const isSupabaseConfigured: boolean = Boolean(supabaseUrl && supabaseAnonKey)

export let supabase: SupabaseClient | null = null

if (isSupabaseConfigured) {
  supabase = createClient(supabaseUrl as string, supabaseAnonKey as string)
} else {
  // In development we allow the app to run without Supabase to support local admin override
  // eslint-disable-next-line no-console
  console.warn('Supabase environment variables are missing. Auth will be limited to dev admin override (admin/admin).')
} 