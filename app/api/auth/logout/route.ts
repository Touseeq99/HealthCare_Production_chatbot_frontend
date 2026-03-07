import { NextResponse } from 'next/server'

export async function POST() {
    const response = NextResponse.json({ success: true })

    const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax' as const,
        path: '/',
        maxAge: 0,
        expires: new Date(0), // Set to past date to ensure deletion
    }

    // Clear all auth-related cookies
    response.cookies.set('userToken', '', cookieOptions)
    response.cookies.set('refreshToken', '', cookieOptions)
    response.cookies.set('userRole', '', cookieOptions)
    response.cookies.set('clientRole', '', { ...cookieOptions, httpOnly: false })

    // Also use the delete method for safe measure
    response.cookies.delete('userToken')
    response.cookies.delete('refreshToken')
    response.cookies.delete('userRole')
    response.cookies.delete('clientRole')

    return response
}
