import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Update this to match your deployment URL
const DEPLOYMENT_URL = 'https://party.elenaandanthony.com'

// This password should be moved to an environment variable
const PASSWORD = 'celebrate2025'

export function middleware(request: NextRequest) {
  // Check if the user is authenticated
  const authCookie = request.cookies.get('auth')
  const isAuthenticated = authCookie?.value === 'true'
  const isLoginPage = request.nextUrl.pathname === '/login'

  // Allow access to API routes
  if (request.nextUrl.pathname.startsWith('/api')) {
    return NextResponse.next()
  }

  // Allow access to social preview metadata
  if (request.headers.get('user-agent')?.toLowerCase().includes('bot')) {
    return NextResponse.next()
  }

  // Allow access to static files and images
  if (
    request.nextUrl.pathname.startsWith('/_next') ||
    request.nextUrl.pathname.startsWith('/images') ||
    request.nextUrl.pathname.startsWith('/favicon.ico')
  ) {
    return NextResponse.next()
  }

  // Redirect to login if not authenticated and not on login page
  if (!isAuthenticated && !isLoginPage) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // Redirect to home if authenticated and on login page
  if (isAuthenticated && isLoginPage) {
    const url = request.nextUrl.clone()
    url.pathname = '/'
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: '/:path*',
} 