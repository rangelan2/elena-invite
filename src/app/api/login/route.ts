import { NextResponse } from 'next/server';

const PASSWORD = process.env.SITE_PASSWORD || 'celebrate2025';

export async function POST(request: Request) {
  try {
    const { password } = await request.json();

    if (password === PASSWORD) {
      const response = NextResponse.json({ success: true });
      
      // Set a cookie that expires in 7 days
      response.cookies.set('auth', 'true', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: '/',
      });

      return response;
    }

    return NextResponse.json({ success: false }, { status: 401 });
  } catch (error) {
    return NextResponse.json({ success: false }, { status: 500 });
  }
} 