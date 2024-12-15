import { auth } from '@/lib/firebase/admin';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  console.log('Session API route called');
  
  try {
    const body = await request.json();
    console.log('Request body:', body);
    
    const { idToken } = body;
    
    if (!idToken) {
      console.error('No idToken provided');
      return NextResponse.json(
        { error: 'ID token is required' },
        { status: 400 }
      );
    }

    // Create session cookie
    const expiresIn = 60 * 60 * 24 * 5 * 1000; // 5 days
    
    try {
      console.log('Creating session cookie...');
      const sessionCookie = await auth.createSessionCookie(idToken, { expiresIn });
      console.log('Session cookie created successfully');

      // Set cookie
      const cookieStore = cookies();
      await cookieStore.set('__session', sessionCookie, {
        maxAge: expiresIn,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        sameSite: 'lax'
      });

      return NextResponse.json({ status: 'success' });
    } catch (error: any) {
      console.error('Firebase admin error:', {
        message: error.message,
        code: error.code,
        stack: error.stack
      });
      return NextResponse.json(
        { error: 'Invalid ID token', details: error.message },
        { status: 401 }
      );
    }
  } catch (error: any) {
    console.error('Session creation error:', {
      message: error.message,
      stack: error.stack
    });
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
} 