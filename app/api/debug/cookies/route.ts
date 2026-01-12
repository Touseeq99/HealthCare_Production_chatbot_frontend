import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET() {
    const cookieStore = await cookies()

    const allCookies = {
        userToken: cookieStore.get('userToken')?.value || 'NOT SET',
        refreshToken: cookieStore.get('refreshToken')?.value || 'NOT SET',
        tokenExpires: cookieStore.get('tokenExpires')?.value || 'NOT SET',
        userRole: cookieStore.get('userRole')?.value || 'NOT SET',
    }

    // Show first 20 chars of tokens for security
    const sanitized = {
        userToken: allCookies.userToken === 'NOT SET' ? 'NOT SET' : allCookies.userToken.substring(0, 20) + '...',
        refreshToken: allCookies.refreshToken === 'NOT SET' ? 'NOT SET' : allCookies.refreshToken.substring(0, 20) + '...',
        tokenExpires: allCookies.tokenExpires,
        userRole: allCookies.userRole,
    }

    return NextResponse.json({
        message: 'Current cookies on server',
        cookies: sanitized,
        timestamp: new Date().toISOString()
    })
}
