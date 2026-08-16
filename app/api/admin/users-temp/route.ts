// Temporary users API - secured with Admin Authentication
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database/index';
import { withAuth, AuthenticatedRequest } from '@/lib/auth/middleware';

async function getUsersDebug(request: AuthenticatedRequest) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'Endpoint disabled in production' },
      { status: 404 }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || undefined;
    const role = searchParams.get('role') || undefined;

    const result = await db.getUsers({
      search,
      role,
      page,
      limit
    });

    if (result.error) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      data: result.data || [],
      pagination: {
        page,
        limit,
        total: result.total || 0,
        totalPages: Math.ceil((result.total || 0) / limit)
      }
    });
    
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

export const GET = withAuth(getUsersDebug, { requireAdmin: true });

