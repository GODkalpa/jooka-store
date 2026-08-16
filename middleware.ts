// Next.js middleware for route protection with Medusa & JWT
import { NextRequest, NextResponse } from 'next/server';

const MEDUSA_BACKEND_URL = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || 'http://localhost:9000';

function isRouteMatch(pathname: string, routes: string[]): boolean {
  return routes.some(route => pathname === route || pathname.startsWith(route + '/'));
}

export default async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 1. Admin route handler: Directs to Medusa Admin Dashboard
  if (isRouteMatch(pathname, ['/admin'])) {
    const medusaToken = req.cookies.get('medusa_jwt')?.value || req.cookies.get('_medusa_jwt')?.value;
    if (medusaToken) {
      return NextResponse.redirect(new URL(`${MEDUSA_BACKEND_URL}/app`, req.url));
    }
    // If not authenticated yet, let user sign in via /auth/signin?redirect=/admin
    // or proceed to client layout for local storage token handover
    return NextResponse.next();
  }

  // 2. Customer Dashboard Protection
  if (isRouteMatch(pathname, ['/dashboard', '/account'])) {
    const hasToken = req.cookies.get('medusa_jwt')?.value || 
                     req.cookies.get('_medusa_jwt')?.value || 
                     req.cookies.get('jooka_user_session')?.value;
    
    // In client-side hybrid mode, if no cookie, client-side AuthProvider handles redirect
    return NextResponse.next();
  }

  // 3. API Admin Route Protection
  if (isRouteMatch(pathname, ['/api/admin'])) {
    const authHeader = req.headers.get('authorization');
    const cookieToken = req.cookies.get('medusa_jwt')?.value || req.cookies.get('_medusa_jwt')?.value;
    const token = authHeader?.startsWith('Bearer ') ? authHeader.split('Bearer ')[1] : cookieToken;

    if (!token) {
      return NextResponse.json(
        { error: 'Admin authentication required' },
        { status: 401 }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};