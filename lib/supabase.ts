import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder'

// This prevents the build from crashing if env vars are missing during pre-rendering
export const supabase = createClient(supabaseUrl, supabaseAnonKey)
