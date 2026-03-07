import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')

    if (!code) {
        // No code present — likely a direct/stale visit, not a real OAuth callback
        return NextResponse.redirect(`${origin}/login?error=missing_code`)
    }

    const cookieStore = await cookies()
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    return cookieStore.get(name)?.value
                },
                set(name: string, value: string, options: CookieOptions) {
                    cookieStore.set({ name, value, ...options })
                },
                remove(name: string, options: CookieOptions) {
                    cookieStore.set({ name, value: '', ...options })
                },
            },
        }
    )

    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (error || !data.session) {
        console.error('[callback] exchangeCodeForSession error:', error?.message)
        return NextResponse.redirect(`${origin}/login?error=auth_failed`)
    }

    // Role priority:
    // 1. DB users table (source of truth for existing users)
    // 2. user_metadata (set during email signup, reliable fallback for
    //    returning users whose DB trigger hasn't fired yet or who are
    //    linking a Google account to an existing email account)
    // 3. 'unassigned' — only if neither source has a role
    let role: string = 'unassigned'

    const { data: profile } = await supabase
        .from('users')
        .select('role')
        .eq('id', data.user.id)
        .single()

    if (profile?.role && profile.role !== 'unassigned') {
        // DB has a valid role — use it
        role = profile.role
    } else {
        // DB row missing or unassigned — fall back to user_metadata
        const metaRole = data.user.user_metadata?.role
        if (metaRole && metaRole !== 'unassigned') {
            role = metaRole
        }
    }

    // Determine if this is a brand-new user (first OAuth sign-in)
    const isNewUser = data.user.created_at === data.user.last_sign_in_at

    // Decide where to send the user after disclaimer (or directly for returning users)
    let destination: string
    if (role === 'doctor') {
        destination = '/doctor/dashboard'
    } else if (role === 'patient') {
        destination = '/patient/chat'
    } else {
        destination = '/onboarding'
    }

    // New users must see the disclaimer first, just like email signups
    const redirectPath = isNewUser
        ? `/disclaimer?redirect=${encodeURIComponent(destination)}`
        : destination

    const response = NextResponse.redirect(`${origin}${redirectPath}`)

    // Set the clientRole for UI components (non-httpOnly)
    const cookieOptions = {
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax' as const,
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 7 days
    }

    // Non-httpOnly copy so client-side code can read it without an extra API call
    response.cookies.set('clientRole', role, { ...cookieOptions, httpOnly: false })

    return response
}
