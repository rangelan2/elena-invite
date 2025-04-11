import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Get configuration from environment variables
const DEPLOYMENT_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://party.elenaandanthony.com'
const PASSWORD = process.env.SITE_PASSWORD || 'celebrate2025'

export function middleware(request: NextRequest) {
  const response = NextResponse.next()

  // Add security headers
  response.headers.set('X-DNS-Prefetch-Control', 'on')
  response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('X-Frame-Options', 'SAMEORIGIN')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'origin-when-cross-origin')
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' https://fonts.gstatic.com; connect-src 'self'"
  )

  // Check if the user is authenticated
  const authCookie = request.cookies.get('auth')
  const isAuthenticated = authCookie?.value === 'true'
  const isLoginPage = request.nextUrl.pathname === '/login'

  // Allow access to API routes
  if (request.nextUrl.pathname.startsWith('/api')) {
    return response
  }

  // Allow access to social preview metadata
  if (request.headers.get('user-agent')?.toLowerCase().includes('bot')) {
    return response
  }

  // Allow access to static files and images
  if (
    request.nextUrl.pathname.startsWith('/_next') ||
    request.nextUrl.pathname.startsWith('/images') ||
    request.nextUrl.pathname.startsWith('/favicon.ico')
  ) {
    return response
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

  return response
}

export const config = {
  matcher: '/:path*',
} 