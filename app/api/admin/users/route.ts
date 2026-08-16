// Admin users management API routes secured with Medusa Admin Auth
import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/lib/auth/middleware';

async function getUsers(request: AuthenticatedRequest) {
  try {
    return NextResponse.json({
      data: [
        {
          id: 'usr_admin',
          email: 'admin@jookawear.com',
          role: 'admin',
          created_at: new Date().toISOString(),
        }
      ],
      total: 1,
      page: 1,
      limit: 20,
      hasMore: false,
    });
  } catch (error) {
    console.error('Get users error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

export const GET = withAuth(getUsers, { requireAdmin: true });