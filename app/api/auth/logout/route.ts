import { NextResponse } from 'next/server'

export async function POST() {
    const response = NextResponse.json({ success: true })

    const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax' as const,
        path: '/',
        maxAge: 0, // Delete cookie
    }

    // Clear all auth-related cookies
    response.cookies.set('userToken', '', cookieOptions)
    response.cookies.set('refreshToken', '', cookieOptions)
    response.cookies.set('userRole', '', cookieOptions)
    response.cookies.set('clientRole', '', { ...cookieOptions, httpOnly: false })

    return response
}
