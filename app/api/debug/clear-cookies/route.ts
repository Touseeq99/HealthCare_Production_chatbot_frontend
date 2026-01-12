import { NextResponse } from 'next/server'

export async function POST() {
    const response = NextResponse.json({ success: true, message: 'All auth cookies cleared' })

    // Clear cookies with multiple variations to ensure they're deleted
    const domains = ['', 'localhost', '.localhost']
    const paths = ['/', '/api', '/api/auth']

    domains.forEach(domain => {
        paths.forEach(path => {
            const baseOptions = {
                path,
                maxAge: 0,
                expires: new Date(0),
            }

            const options = domain ? { ...baseOptions, domain } : baseOptions

            // Clear with httpOnly true
            response.cookies.set('userToken', '', { ...options, httpOnly: true })
            response.cookies.set('refreshToken', '', { ...options, httpOnly: true })

            // Clear with httpOnly false
            response.cookies.set('userToken', '', { ...options, httpOnly: false })
            response.cookies.set('refreshToken', '', { ...options, httpOnly: false })
            response.cookies.set('tokenExpires', '', { ...options, httpOnly: false })
            response.cookies.set('userRole', '', { ...options, httpOnly: false })
        })
    })

    return response
}
