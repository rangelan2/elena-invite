import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Get configuration from environment variables
const DEPLOYMENT_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://party.elenaandanthony.com'
const PASSWORD = process.env.SITE_PASSWORD || 'celebrate2025'

// Basic error monitoring
const reportError = (error: Error, request: NextRequest, context: string = '') => {
  console.error(`[ERROR] ${context}:`, error);
  
  // If in production and an error reporting endpoint is configured, send the error
  if (process.env.NODE_ENV === 'production' && process.env.ERROR_REPORTING_URL) {
    try {
      // You can replace this with any error reporting service like Sentry, LogRocket, etc.
      fetch(process.env.ERROR_REPORTING_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: error.message,
          stack: error.stack,
          url: request.nextUrl.pathname,
          userAgent: request.headers.get('user-agent'),
          timestamp: new Date().toISOString(),
          context
        }),
      }).catch(e => console.error('Failed to report error:', e));
    } catch (e) {
      console.error('Error in error reporting:', e);
    }
  }
};

export function middleware(request: NextRequest) {
  try {
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

    // Add server timing header for simple performance monitoring
    const requestStartTime = Date.now();
    response.headers.set('Server-Timing', `total;dur=${Date.now() - requestStartTime}`);

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
  } catch (error) {
    reportError(error as Error, request, 'middleware');
    return NextResponse.next();
  }
}

export const config = {
  matcher: '/:path*',
} 