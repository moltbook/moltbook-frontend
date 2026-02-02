import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Routes that require authentication
const protectedRoutes = ['/settings'];

// Routes that should redirect if authenticated
const authRoutes = ['/auth/login', '/auth/register'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware entirely for API routes - let them handle their own auth
  // This is a safety check in addition to the matcher config
  if (pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  // Forward all original request headers to downstream handlers
  // This ensures Authorization headers are preserved for any routes
  // that might slip through the matcher
  const requestHeaders = new Headers(request.headers);

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  // Add security headers to response
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - API routes (start with /api/)
     * - Static files (_next/static, _next/image)
     * - Favicon
     * - Files with extensions (e.g., .js, .css, .png)
     */
    '/((?!api/|_next/static|_next/image|favicon\\.ico|.*\\.[\\w]+$).*)',
  ],
};
