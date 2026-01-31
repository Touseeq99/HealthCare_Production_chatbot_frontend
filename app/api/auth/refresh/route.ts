import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST() {
    try {
        const cookieStore = await cookies()
        const refreshToken = cookieStore.get('refreshToken')?.value

        if (!refreshToken) {
            return NextResponse.json(
                { success: false, message: 'No refresh token found' },
                { status: 401 }
            )
        }

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/refresh-token`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ refresh_token: refreshToken }),
        })

        const data = await response.json()

        if (!response.ok) {
            // If refresh fails, clear all cookies
            const clearResponse = NextResponse.json(
                { success: false, message: data.message || 'Refresh failed' },
                { status: 401 }
            )

            const cookieOptions = {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax' as const,
                path: '/',
                maxAge: 0,
            }

            clearResponse.cookies.set('userToken', '', cookieOptions)
            clearResponse.cookies.set('refreshToken', '', cookieOptions)
            clearResponse.cookies.set('tokenExpires', '', { ...cookieOptions, httpOnly: false })
            clearResponse.cookies.set('userRole', '', cookieOptions)
            clearResponse.cookies.set('clientRole', '', { ...cookieOptions, httpOnly: false })

            return clearResponse
        }

        const { access_token, refresh_token: newRefreshToken } = data
        const token = access_token || data.token

        // Create response with updated cookies
        const nextResponse = NextResponse.json({ success: true })

        const secureCookieOptions = {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax' as const,
            path: '/',
        }

        const clientCookieOptions = {
            httpOnly: false,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax' as const,
            path: '/',
        }

        if (token) {
            nextResponse.cookies.set('userToken', token, {
                ...secureCookieOptions,
                maxAge: 1800, // 30 mins
            })

            // Update expiration
            const tokenExpires = new Date(Date.now() + 1800 * 1000)
            nextResponse.cookies.set('tokenExpires', tokenExpires.toISOString(), {
                ...clientCookieOptions,
                maxAge: 1800,
            })
        }

        if (newRefreshToken) {
            nextResponse.cookies.set('refreshToken', newRefreshToken, {
                ...secureCookieOptions,
                maxAge: 604800, // 7 days
            })
        }

        return nextResponse
    } catch (error) {
        console.error('Refresh error:', error)
        return NextResponse.json(
            { success: false, message: 'Internal server error' },
            { status: 500 }
        )
    }
}
