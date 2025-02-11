import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Get the pathname
  const path = request.nextUrl.pathname;

  // Define public paths that don't require authentication
  const isPublicPath = path === '/login';

  // Get the token from cookie
  const token = request.cookies.get('session')?.value || '';

  // Add detailed debug logging
  console.log('Middleware - Debug Info:', {
    path,
    isPublicPath,
    hasToken: !!token,
    cookies: request.cookies.getAll(),
    url: request.url,
    headers: {
      cookie: request.headers.get('cookie'),
      host: request.headers.get('host'),
    }
  });

  // Redirect authenticated users away from public paths (like login)
  if (isPublicPath && token) {
    console.log('Middleware - Redirecting authenticated user from public path to dashboard');
    const redirectUrl = new URL('/dashboard', request.url);
    return NextResponse.redirect(redirectUrl);
  }

  // Redirect unauthenticated users to login if they try to access protected paths
  if (!isPublicPath && !token) {
    console.log('Middleware - Redirecting unauthenticated user to login');
    const redirectUrl = new URL('/login', request.url);
    const response = NextResponse.redirect(redirectUrl);
    
    // Add cache control headers to prevent caching of redirects
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    
    return response;
  }

  const response = NextResponse.next();
  // Add cache control headers to all responses
  response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  response.headers.set('Pragma', 'no-cache');
  response.headers.set('Expires', '0');
  
  return response;
}

// Configure which routes to run middleware on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
