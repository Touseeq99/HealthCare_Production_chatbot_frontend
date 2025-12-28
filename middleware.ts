import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Routes that require authentication
const protectedRoutes = ['/doctor', '/admin', '/patient']

// Routes that should redirect to dashboard if already authenticated
const authRoutes = ['/login', '/signup']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Check if the path is a protected route
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))
  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route))
  
  // Get authentication data from cookies or localStorage (we'll use cookies for server-side)
  const userToken = request.cookies.get('userToken')?.value
  const userRole = request.cookies.get('userRole')?.value
  
  if (isProtectedRoute && !userToken) {
    // Redirect to login if trying to access protected route without authentication
    return NextResponse.redirect(new URL('/login', request.url))
  }
  
  if (isAuthRoute && userToken) {
    // Redirect to appropriate dashboard if already authenticated
    if (userRole === 'doctor') {
      return NextResponse.redirect(new URL('/doctor/dashboard', request.url))
    } else if (userRole === 'admin') {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url))
    } else if (userRole === 'patient') {
      return NextResponse.redirect(new URL('/patient/dashboard', request.url))
    }
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
}
