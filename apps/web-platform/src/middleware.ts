import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
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
    '/auth/error',
    '/auth/verify-request',
    '/auth/new-user',
    '/auth/signout',
  ];

  // Check if the path is public
  const isPublicRoute =
    publicRoutes.includes(pathname) ||
    pathname.startsWith('/cleaners/') || // City pages
    pathname.startsWith('/blog/') || // Blog posts
    pathname.startsWith('/api/auth') || // Auth API routes
    pathname.startsWith('/api/trpc') || // tRPC API routes
    pathname.startsWith('/_next/') || // Next.js internals
    pathname.startsWith('/static/'); // Static files

  // If it's a public route, allow access
  if (isPublicRoute) {
    return NextResponse.next();
  }

  // Get session from JWT token
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  // If no session and trying to access protected route, redirect to signin
  if (!token) {
    const signInUrl = new URL('/auth/signin', request.url);
    signInUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(signInUrl);
  }

  // Role-based access control
  const role = token.role as string;

  // Consumer portal - only CUSTOMER role
  if (pathname.startsWith('/consumer') || pathname.startsWith('/app')) {
    if (role !== 'CUSTOMER' && role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }
  }

  // Business portal - only BUSINESS role
  if (pathname.startsWith('/business')) {
    if (role !== 'BUSINESS' && role !== 'ADMIN') {
      // If user is CUSTOMER, suggest upgrading
      if (role === 'CUSTOMER') {
        return NextResponse.redirect(new URL('/business/upgrade', request.url));
      }
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }
  }

  // Enterprise portal - only ENTERPRISE role
  if (pathname.startsWith('/enterprise')) {
    if (role !== 'ENTERPRISE' && role !== 'ADMIN') {
      // If user is CUSTOMER or BUSINESS, suggest upgrading
      if (role === 'CUSTOMER' || role === 'BUSINESS') {
        return NextResponse.redirect(new URL('/enterprise/upgrade', request.url));
      }
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }
  }

  // Redirect authenticated users from root to their appropriate dashboard
  if (pathname === '/' && token) {
    switch (role) {
      case 'CUSTOMER':
        return NextResponse.redirect(new URL('/app/dashboard', request.url));
      case 'BUSINESS':
        return NextResponse.redirect(new URL('/business/dashboard', request.url));
      case 'ENTERPRISE':
        return NextResponse.redirect(new URL('/enterprise/dashboard', request.url));
      case 'DRIVER':
        return NextResponse.redirect(new URL('/driver/dashboard', request.url));
      case 'MERCHANT':
        return NextResponse.redirect(new URL('/merchant/dashboard', request.url));
      case 'ADMIN':
        return NextResponse.redirect(new URL('/admin/dashboard', request.url));
      default:
        break;
    }
  }

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
