import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    // You can add additional logic here if needed
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => {
        // Return true if the user is authenticated
        return !!token;
      },
    },
    pages: {
      signIn: '/login',
    },
  }
);

// Protect dashboard routes and other authenticated routes
export const config = {
  matcher: [
    /*
     * Match all dashboard and protected routes
     * Exclude:
     * - / (root/landing page)
     * - api/auth (authentication endpoints)
     * - login (login page)
     * - register (registration page)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public assets (images, etc.)
     */
    '/dashboard/:path*',
    '/dashboard',
    '/api/prospects/:path*',
    '/api/campaigns/:path*',
    '/api/scripts/:path*',
    '/api/voices/:path*',
  ],
};
