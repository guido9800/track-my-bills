
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
  // NOTE: This basic middleware example doesn't check actual Firebase auth state.
  // Proper auth state checking in middleware requires more setup (e.g., cookies, server-side SDK).
  // The AuthContext handles client-side redirects after hydration.
  // This middleware is more of a placeholder or for very basic path protection.

  const { pathname } = request.nextUrl;
  const isAuthenticated = request.cookies.has('firebaseAuthCookiePlaceholder'); // Replace with actual auth check

  // Example: If trying to access protected routes and not "authenticated" (placeholder logic)
  const protectedPaths = ['/', '/add-bill', '/bill', '/edit-bill'];
  const isProtectedPath = protectedPaths.some(p => pathname.startsWith(p) && (p !== '/' || pathname === '/'));


  // This middleware is commented out because AuthContext handles redirects more effectively after client-side hydration.
  // Server-side middleware auth checks are more complex to sync with Firebase client-side auth state.
  /*
  if (isProtectedPath && !isAuthenticated) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (['/login', '/signup'].includes(pathname) && isAuthenticated) {
    return NextResponse.redirect(new URL('/', request.url));
  }
  */

  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images (public images folder)
     * - assets (public assets folder)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|images|assets).*)',
  ],
};
