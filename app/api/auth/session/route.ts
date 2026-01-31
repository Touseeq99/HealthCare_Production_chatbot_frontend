import { NextResponse } from 'next/server'

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { access_token, refresh_token, role } = body

        const response = NextResponse.json({ success: true })

        const cookieOptions = {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax' as const,
            path: '/',
        }

        if (access_token) {
            response.cookies.set('userToken', access_token, {
                ...cookieOptions,
                maxAge: 60 * 60 * 24 * 7, // 7 days
            })
        }

        if (refresh_token) {
            response.cookies.set('refreshToken', refresh_token, {
                ...cookieOptions,
                maxAge: 60 * 60 * 24 * 30, // 30 days
            })
        }

        if (role) {
            // HttpOnly for Middleware (Cannot be tampered with by scripts)
            response.cookies.set('userRole', role, {
                ...cookieOptions,
                maxAge: 60 * 60 * 24 * 7,
            })

            // Non-HttpOnly for UI Logic (e.g. showing/hiding dashboard buttons)
            response.cookies.set('clientRole', role, {
                ...cookieOptions,
                httpOnly: false,
                maxAge: 60 * 60 * 24 * 7,
            })
        }

        return response
    } catch (error) {
        return NextResponse.json({ error: 'Failed to set session' }, { status: 500 })
    }
}
