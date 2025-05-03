/* eslint-disable @typescript-eslint/no-explicit-any */
import { COOKIE_OPTIONS, verifyToken } from "@/common/utils/auth";
import { NextRequest, NextResponse } from "next/server";



const UNAUTHENTICATED_ONLY_ROUTES = [
  // Frontend routes + Server Actions
  '/auth',
  '/auth/forgot-password',
  '/auth/reset-password',
  '/auth/reset-password/sent',
  '/auth/reset-password/:token',

  // API routes
  '/api/auth/forgot-password',
];

const PROTECTED_ROUTES = [
  // Frontend routes
  '/auth/profile',
  '/auth/change-password',
  '/news/:path*',

  // API routes
  '/api/auth/:path*',
];

const ALL_ROUTES = [
  ...UNAUTHENTICATED_ONLY_ROUTES,
  ...PROTECTED_ROUTES
];


export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const authToken = request.cookies.get("auth_token")?.value;

  const isMatchingRoute = (route: string) => {
    if (route.endsWith('/:token')) {
      return pathname.startsWith('/auth/reset-password') &&
        pathname !== '/auth/reset-password/sent';
    }
    return pathname === route;
  };

  if (UNAUTHENTICATED_ONLY_ROUTES.some(isMatchingRoute)) {
    if (authToken) {
      return NextResponse.redirect(new URL('/', request.url));
    }
    return NextResponse.next();
  }

  if (PROTECTED_ROUTES.some(route =>
    pathname === route ||
    pathname.startsWith(route.replace('/:path*', ''))
  )) {
    if (!authToken) {
      return NextResponse.redirect(new URL('/auth', request.url));
    }

    try {
      await verifyToken(authToken);
      return NextResponse.next();
    } catch (error: any) {
      console.error('Error verifying token:', error);
      const response = NextResponse.redirect(new URL('/auth', request.url));
      response.cookies.set("auth_token", "", {
        ...COOKIE_OPTIONS,
        maxAge: 0,
      });
      return response;
    }
  }

  return NextResponse.next();
}




export const config = {
  matcher: [
    // UNAUTHENTICATED ROUTES Frontend routes + Server Actions
    '/auth',
    '/auth/forgot-password',
    '/auth/reset-password',
    '/auth/reset-password/sent',
    '/auth/reset-password/:token',
    // UNAUTHENTICATED ROUTES API routes
    '/api/auth/forgot-password',

    // PROTECTED_ROUTES Frontend routes
    '/auth/profile',
    '/auth/change-password',
    '/news/:path*',
    // PROTECTED_ROUTES API routes
    '/api/auth/:path*',
  ]
};