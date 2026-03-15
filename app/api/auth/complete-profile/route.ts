import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { role, name, surname, specialization, doctor_register_number } = body

        // Validate basic fields
        if (!role || !name || !surname) {
            return NextResponse.json(
                { success: false, message: 'Missing required fields' },
                { status: 400 }
            )
        }

        const cookieStore = await cookies()
        let token = cookieStore.get('userToken')?.value

        // If no application-specific token, try to get Supabase session token
        if (!token) {
            const { createServerClient } = await import('@supabase/ssr')
            const supabase = createServerClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL!,
                process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
                {
                    cookies: {
                        get(name: string) {
                            return cookieStore.get(name)?.value
                        },
                        set(name: string, value: string, options: any) {
                            cookieStore.set({ name, value, ...options })
                        },
                        remove(name: string, options: any) {
                            cookieStore.set({ name, value: '', ...options })
                        },
                    },
                }
            )
            const { data: { session } } = await supabase.auth.getSession()
            token = session?.access_token
        }

        if (!token) {
            return NextResponse.json(
                { success: false, message: 'Unauthorized. Please log in again.' },
                { status: 401 }
            )
        }

        const backendUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/complete-profile`

        const response = await fetch(backendUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                role,
                name,
                surname,
                specialization,
                doctor_register_number
            }),
        })

        let data;
        try {
            data = await response.json()
        } catch (e) {
            data = { message: 'Unexpected response from server' }
        }

        if (!response.ok) {
            return NextResponse.json(
                { success: false, message: data.message || 'Failed to update profile' },
                { status: response.status }
            )
        }

        // Update cookies to reflect the new role
        const responseHeaders = new Headers()
        const cookieOptions = {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax' as const,
            path: '/',
            maxAge: 60 * 60 * 24 * 7, // 7 days
        }

        const nextResponse = NextResponse.json({
            success: true,
            message: 'Profile updated successfully',
            user: data.user || null
        })

        nextResponse.cookies.set('userRole', role, cookieOptions)
        nextResponse.cookies.set('clientRole', role, { ...cookieOptions, httpOnly: false })

        return nextResponse
    } catch (error) {
        console.error('Complete profile error:', error)
        return NextResponse.json(
            { success: false, message: 'System error. Please try again later.' },
            { status: 500 }
        )
    }
}
