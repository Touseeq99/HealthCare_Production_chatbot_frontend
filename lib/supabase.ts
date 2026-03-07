import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// IMPORTANT: Use createBrowserClient from @supabase/ssr — NOT createClient from @supabase/supabase-js.
//
// For PKCE OAuth flow in Next.js, the client must store the `code_verifier` in
// cookies (not localStorage) so the server-side /api/auth/callback route can
// read and verify it when exchanging the code for a session.
//
// createClient  → stores code_verifier in localStorage → server can't read it → auth_failed
// createBrowserClient → stores code_verifier in cookies  → server reads it    → ✅ works
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey)
