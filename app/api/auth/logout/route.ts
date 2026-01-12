import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST() {
    const cookieStore = await cookies()
    const token = cookieStore.get('userToken')?.value

    // Try to blacklist the token on the backend, but don't fail if it's already blacklisted
    if (token) {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/logout`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })

            // Ignore 401 errors - token might already be blacklisted
            if (!response.ok && response.status !== 401) {
                console.error('Backend logout failed with status:', response.status)
            }
        } catch (error) {
            console.error('Backend logout failed:', error)
            // Continue to clear cookies anyway
        }
    }

    // Clear all auth cookies with explicit expiration
    const nextResponse = NextResponse.json({ success: true })

    // Cookie options for clearing
    const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax' as const,
        path: '/',
        maxAge: 0, // Expire immediately
    }

    nextResponse.cookies.set('userToken', '', cookieOptions)
    nextResponse.cookies.set('refreshToken', '', cookieOptions)
    nextResponse.cookies.set('userRole', '', { ...cookieOptions, httpOnly: false })
    nextResponse.cookies.set('tokenExpires', '', { ...cookieOptions, httpOnly: false })

    return nextResponse
}
