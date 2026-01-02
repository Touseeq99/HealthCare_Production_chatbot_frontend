import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const {
            email,
            password,
            name,
            surname,
            role,
            phone,
            specialization,
            doctorRegisterNumber
        } = body

        // Map frontend camelCase to backend snake_case if necessary
        const backendBody = {
            email,
            password,
            name,
            surname,
            role,
            phone,
            specialization,
            doctor_register_number: doctorRegisterNumber
        }

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/signup`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(backendBody),
        })

        const data = await response.json()

        if (!response.ok) {
            return NextResponse.json(
                { success: false, message: data.message || 'Registration failed' },
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
            message: data.message || 'Registration successful',
            user: user
        })
    } catch (error) {
        console.error('Signup error:', error)
        return NextResponse.json(
            { success: false, message: 'Internal server error' },
            { status: 500 }
        )
    }
}
