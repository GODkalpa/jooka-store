// Admin orders management API routes
import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth/middleware';
import { FirebaseAdminDatabaseService } from '@/lib/database/firebase-admin-service';

async function getAdminOrders(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status') || undefined;

    console.log('Admin fetching orders with params:', { page, limit, status });

    const adminDb = new FirebaseAdminDatabaseService();
    
    // Get all orders for admin (not filtered by user_id)
    const result = await adminDb.getOrders({
      page,
      limit,
      status
    });

    if (result.error) {
      console.error('Error fetching admin orders:', result.error);
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }

    console.log(`Admin orders fetched: ${result.data?.length || 0} orders`);

    return NextResponse.json({
      data: result.data || [],
      pagination: {
        page: result.page || 1,
        limit: result.limit || 20,
        total: result.total || 0,
        totalPages: Math.ceil((result.total || 0) / (result.limit || 20)),
        hasMore: result.hasMore || false
      }
    });
  } catch (error) {
    console.error('Get admin orders error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}

export const GET = withAuth(getAdminOrders, { requireAdmin: true });
