// Next.js middleware for route protection with Firebase
import { NextRequest, NextResponse } from 'next/server';
import { isServerAuthenticated, getServerUser } from '@/lib/auth/firebase-auth';

// Define protected routes
const adminRoutes = ['/admin'];
const dashboardRoutes = ['/dashboard', '/account'];
const apiAdminRoutes = ['/api/admin'];
const apiUserRoutes = ['/api/customer', '/api/user'];
const publicRoutes = ['/admin-setup']; // Routes that should be publicly accessible

function isRouteMatch(pathname: string, routes: string[]): boolean {
  return routes.some(route => {
    // Exact match or starts with route followed by a slash
    return pathname === route || pathname.startsWith(route + '/');
  });
}

export default async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Skip protection for public routes
  if (isRouteMatch(pathname, publicRoutes)) {
    return NextResponse.next();
  }

  // Admin routes protection - temporarily disabled, using client-side protection
  // TODO: Implement proper server-side authentication with session tokens
  /*
  if (isRouteMatch(pathname, adminRoutes)) {
    if (!isServerAuthenticated()) {
      return NextResponse.redirect(new URL('/auth/signin?error=AdminRequired', req.url));
    }

    const user = await getServerUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.redirect(new URL('/auth/signin?error=AdminRequired', req.url));
    }
  }
  */

  // Customer dashboard protection - temporarily disabled, using client-side protection
  // TODO: Implement proper server-side authentication with session tokens
  /*
  if (isRouteMatch(pathname, dashboardRoutes)) {
    if (!isServerAuthenticated()) {
      return NextResponse.redirect(new URL('/auth/signin', req.url));
    }
  }
  */

  // API routes protection - temporarily disabled, using client-side protection
  // TODO: Implement proper server-side authentication with session tokens
  /*
  if (isRouteMatch(pathname, apiAdminRoutes)) {
    if (!isServerAuthenticated()) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const user = await getServerUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }
  }
  */

  // API routes should handle their own authentication
  // The middleware was incorrectly trying to use client-side auth on server-side
  // Each API route will verify the Authorization header token individually
  /*
  if (isRouteMatch(pathname, apiUserRoutes)) {
    if (!isServerAuthenticated()) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
  }
  */

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};