import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public routes that don't require authentication
  const publicRoutes = [
    '/',
    '/about',
    '/pricing',
    '/contact',
    '/auth/signin',
    '/auth/signup',
    '/auth/verify',
    '/auth/forgot-password',
  ];

  // Check if the path is public
  const isPublicRoute =
    publicRoutes.includes(pathname) ||
    pathname.startsWith('/cleaners/') || // City pages
    pathname.startsWith('/blog/') || // Blog posts
    pathname.startsWith('/api/') || // API routes
    pathname.startsWith('/_next/') || // Next.js internals
    pathname.startsWith('/static/'); // Static files

  // If it's a public route, allow access
  if (isPublicRoute) {
    return NextResponse.next();
  }

  // TODO: Get user session and role from NextAuth
  // For now, we'll just allow access and implement auth in Stage 5
  // const session = await getServerSession(request);
  // if (!session) {
  //   return NextResponse.redirect(new URL('/auth/signin', request.url));
  // }

  // Role-based redirects (to be implemented with NextAuth)
  // const { role } = session.user;
  // if (pathname.startsWith('/consumer') && role !== 'CUSTOMER') {
  //   return NextResponse.redirect(new URL('/unauthorized', request.url));
  // }
  // if (pathname.startsWith('/business') && role !== 'BUSINESS') {
  //   return NextResponse.redirect(new URL('/unauthorized', request.url));
  // }
  // if (pathname.startsWith('/enterprise') && role !== 'ENTERPRISE') {
  //   return NextResponse.redirect(new URL('/unauthorized', request.url));
  // }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
