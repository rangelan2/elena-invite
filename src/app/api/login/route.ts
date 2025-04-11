import { NextResponse } from 'next/server';

const PASSWORD = process.env.SITE_PASSWORD || 'celebrate2025';
// Rate limiting implementation
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 5;
const ipRequestCounts = new Map<string, { count: number, timestamp: number }>();

// Sanitize input function
const sanitizeInput = (input: string): string => {
  return input.trim().toLowerCase().replace(/[^\w\s]/gi, '');
};

export async function POST(request: Request) {
  try {
    // Get client IP for rate limiting
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    
    // Apply rate limiting
    const now = Date.now();
    const ipData = ipRequestCounts.get(ip);
    
    if (ipData) {
      // If window has expired, reset the counter
      if (now - ipData.timestamp > RATE_LIMIT_WINDOW) {
        ipRequestCounts.set(ip, { count: 1, timestamp: now });
      } else if (ipData.count >= MAX_REQUESTS_PER_WINDOW) {
        // Too many requests in the window
        return NextResponse.json(
          { success: false, message: 'Too many attempts. Please try again later.' },
          { status: 429 }
        );
      } else {
        // Increment counter
        ipRequestCounts.set(ip, { count: ipData.count + 1, timestamp: ipData.timestamp });
      }
    } else {
      // First request from this IP
      ipRequestCounts.set(ip, { count: 1, timestamp: now });
    }

    // Clean up old entries every 100 requests
    if (ipRequestCounts.size > 100) {
      const currentTime = Date.now();
      // Using Array.from to avoid iterator errors with Map
      Array.from(ipRequestCounts.entries()).forEach(([key, value]) => {
        if (currentTime - value.timestamp > RATE_LIMIT_WINDOW) {
          ipRequestCounts.delete(key);
        }
      });
    }

    // Process the login request
    const body = await request.json();
    const rawPassword = body.password || '';
    
    // Sanitize the input
    const password = sanitizeInput(rawPassword);

    if (password === PASSWORD) {
      const response = NextResponse.json({ success: true });
      
      const isProduction = process.env.NODE_ENV === 'production';
      
      // Set a cookie that expires in 7 days with enhanced security
      response.cookies.set('auth', 'true', {
        httpOnly: true,
        secure: isProduction, // Always use secure in production
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: '/',
        // Add these for additional security
        ...(isProduction && {
          domain: process.env.COOKIE_DOMAIN || '.elenaandanthony.com', // Restrict to domain
        })
      });

      return response;
    }

    return NextResponse.json({ success: false }, { status: 401 });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
} 