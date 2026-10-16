import { createClient as createSupabaseClient } from '@supabase/supabase-js';

// Use safe fallbacks during build time if environment variables are missing
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key';

export const supabase = createSupabaseClient(supabaseUrl, supabaseAnonKey);

export function createClient() {
  return createSupabaseClient(supabaseUrl, supabaseAnonKey);
}
