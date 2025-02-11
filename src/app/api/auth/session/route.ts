import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();
    
    // Get the domain from the request
    const domain = request.headers.get('host')?.split(':')[0] || '';
    
    // Set the cookie with appropriate options for production
    const cookieOptions = {
      name: 'session',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 5, // 5 days
      path: '/',
    } as const;

    // Add domain in production if not localhost
    if (process.env.NODE_ENV === 'production' && !domain.includes('localhost')) {
      Object.assign(cookieOptions, { domain: `.${domain}` });
    }

    // Create response with the cookie
    const response = NextResponse.json({ 
      success: true,
      debug: {
        environment: process.env.NODE_ENV,
        domain,
        cookieSet: true,
      }
    });

    // Set cookie in response
    response.cookies.set(cookieOptions);

    // Add cache control headers
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');

    // Log cookie setting details (excluding sensitive token)
    console.log('Setting session cookie:', {
      environment: process.env.NODE_ENV,
      domain,
      secure: process.env.NODE_ENV === 'production',
      cookieSet: true,
    });

    return response;
  } catch (error: Error | unknown) {
    console.error('Error setting session cookie:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    // Create response without the cookie
    const response = NextResponse.json({ success: true });
    
    // Delete the cookie by setting maxAge to 0
    response.cookies.set({
      name: 'session',
      value: '',
      maxAge: 0,
      path: '/',
    });
    
    // Add cache control headers
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    
    return response;
  } catch (error) {
    console.error('Error deleting session cookie:', error);
    return NextResponse.json({ error: 'Failed to delete session' }, { status: 500 });
  }
}
