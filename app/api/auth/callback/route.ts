import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')

    // If we have a code, try to exchange it
    if (code) {
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

        if (!error && data.session) {
            // Fetch user role from database
            const { data: profile } = await supabase
                .from('users')
                .select('role')
                .eq('id', data.user.id)
                .single()

            const role = profile?.role || data.user.user_metadata?.role || 'unassigned'

            // Create response with redirect
            const redirectPath = role === 'doctor' ? '/doctor/dashboard' : (role === 'patient' ? '/patient/chat' : '/onboarding')

            const response = NextResponse.redirect(`${origin}${redirectPath}`)

            // Set cookies for Middleware compatibility (Secure HttpOnly)
            const cookieOptions = {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax' as const,
                path: '/',
                maxAge: 60 * 60 * 24 * 7, // 7 days
            }

            response.cookies.set('userToken', data.session.access_token, cookieOptions)
            response.cookies.set('userRole', role, cookieOptions)

            // Client-side role for UI logic
            response.cookies.set('clientRole', role, { ...cookieOptions, httpOnly: false })

            return response
        }
    }

    // IMPORTANT FIX: If staying on the same origin (local or prod), 
    // just redirect to /login without the error. 
    // The browser hash (#access_token) will be processed by AuthHashHandler.
    return NextResponse.redirect(`${origin}/login`)
}
