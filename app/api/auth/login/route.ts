import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { email, password, role } = body

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/token`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
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

        const { token, user } = data

        // Set secure HttpOnly cookies
        const cookieStore = await cookies()

        if (token) {
            cookieStore.set('userToken', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                path: '/',
                maxAge: 86400, // 24 hours
            })
        }

        cookieStore.set('userRole', role, {
            httpOnly: false, // Accessible by client-side for UI logic
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 86400,
        })

        return NextResponse.json({
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
    } catch (error) {
        console.error('Login error:', error)
        return NextResponse.json(
            { success: false, message: 'Internal server error' },
            { status: 500 }
        )
    }
}
