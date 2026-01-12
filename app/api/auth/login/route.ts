import { NextResponse } from 'next/server'

export async function POST(request: Request) {
    try {
        const body = await request.json()
        let { email, password, role } = body

        // 1. Missing Required Fields
        if (!email || !password || !role) {
            return NextResponse.json(
                { success: false, message: 'Missing required fields: email, password, and role are required.' },
                { status: 400 }
            )
        }

        // 2. Validate Role
        if (!['patient', 'doctor', 'admin'].includes(role)) {
            return NextResponse.json(
                { success: false, message: 'Invalid role. Must be patient, doctor, or admin.' },
                { status: 400 }
            )
        }

        // 3. Validate Email Format
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
        if (!emailRegex.test(email)) {
            return NextResponse.json(
                { success: false, message: 'Invalid email format' },
                { status: 400 }
            )
        }

        // 5. Basic SQL Injection Prevention (Sanitization)
        // Detect common patterns if strict mode is required, or simpler: reject if found.
        const sqlInjectionPattern = /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|ALTER)\b)|(--|\#|\/\*)|(' OR '1'='1)/i
        if (sqlInjectionPattern.test(email) || sqlInjectionPattern.test(role)) {
            return NextResponse.json(
                { success: false, message: 'Invalid characters detection.' },
                { status: 400 }
            )
        }

        // 4. Upstream Request with correct headers
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/token`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'MetaMedMD-WebClient/1.0' // Satisfies >= 10 chars
            },
            body: JSON.stringify({ email, password, role }),
        })

        const data = await response.json()

        if (!response.ok) {
            return NextResponse.json(
                { success: false, message: data.message || 'Authentication failed' },
                { status: response.status }
            )
        }

        // Log the response to see what fields we're getting
        console.log('Backend login response fields:', Object.keys(data))
        console.log('Has token:', !!data.token)
        console.log('Has refreshToken:', !!data.refreshToken)
        console.log('Has refresh_token:', !!data.refresh_token)

        // Backend might use different field names
        const { token, refreshToken, refresh_token, user } = data
        const actualRefreshToken = refreshToken || refresh_token

        // Create response object to set cookies
        const nextResponse = NextResponse.json({
            success: true,
            user: {
                id: user?.id,
                name: user?.name,
                surname: user?.surname,
                email: user?.email,
                role: role,
                phone: user?.phone,
                specialization: user?.specialization,
                doctor_register_number: user?.doctor_register_number
            }
        })

        // Cookie options
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

        // First, clear any existing auth cookies to prevent conflicts
        nextResponse.cookies.set('userToken', '', { ...secureCookieOptions, maxAge: 0 })
        nextResponse.cookies.set('refreshToken', '', { ...secureCookieOptions, maxAge: 0 })
        nextResponse.cookies.set('tokenExpires', '', { ...clientCookieOptions, maxAge: 0 })
        nextResponse.cookies.set('userRole', '', { ...clientCookieOptions, maxAge: 0 })

        // Now set the new cookies
        if (token) {
            nextResponse.cookies.set('userToken', token, {
                ...secureCookieOptions,
                maxAge: 1800, // 30 minutes
            })

            // Set client-readable expiration time
            const tokenExpires = new Date(Date.now() + 1800 * 1000)
            nextResponse.cookies.set('tokenExpires', tokenExpires.toISOString(), {
                ...clientCookieOptions,
                maxAge: 1800,
            })
        }


        if (actualRefreshToken) {
            console.log('Setting refresh token cookie')
            nextResponse.cookies.set('refreshToken', actualRefreshToken, {
                ...secureCookieOptions,
                maxAge: 604800, // 7 days
            })
        } else {
            console.warn('No refresh token received from backend!')
        }

        nextResponse.cookies.set('userRole', role, {
            ...clientCookieOptions,
            maxAge: 604800, // 7 days
        })

        return nextResponse
    } catch (error) {
        console.error('Login error:', error)
        return NextResponse.json(
            { success: false, message: 'Internal server error' },
            { status: 500 }
        )
    }
}
