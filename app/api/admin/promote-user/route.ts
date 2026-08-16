// API route to promote a user to admin (development only)
import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/lib/auth/middleware';

async function promoteUser(request: AuthenticatedRequest) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'Admin management must be performed through the Medusa Admin Dashboard' },
      { status: 403 }
    );
  }

  return NextResponse.json({
    message: 'Please manage admin users through Medusa Admin Dashboard or backend CLI script.',
    success: true,
  });
}

export const POST = withAuth(promoteUser, { requireAdmin: true });