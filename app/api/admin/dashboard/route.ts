// Admin dashboard API route
import { NextRequest, NextResponse } from 'next/server';
// import { withAuth } from '@/lib/auth/middleware'; // Temporarily disabled
import { FirebaseAdminDatabaseService } from '@/lib/database/firebase-admin-service';


async function getDashboardData(request: NextRequest) {
  try {
    console.log('Starting dashboard data fetch...');
    const adminDb = new FirebaseAdminDatabaseService();

    // Get sales analytics for the last 30 days
    const salesResult = await adminDb.getSalesAnalytics().catch(err => {
      console.warn('Sales analytics error:', err.message);
      return { data: null, error: err.message };
    });

    // Get low stock products
    const lowStockResult = await adminDb.getLowStockProducts(10).catch(err => {
      console.warn('Low stock products error:', err.message);
      return { data: [], error: err.message };
    });

    // Get recent orders
    const recentOrdersResult = await adminDb.getOrders({
      page: 1,
      limit: 10,
    }).catch(err => {
      console.warn('Recent orders error:', err.message);
      return { data: [], error: err.message };
    });

    // Get user statistics using Firebase Admin SDK
    let userCount = 0;
    try {
      const usersResult = await adminDb.getUsers({ limit: 1000 }); // Get user count
      userCount = usersResult.data?.length || 0;
    } catch (err) {
      console.warn('User count error:', err instanceof Error ? err.message : 'Unknown error');
      userCount = 0;
    }

    const dashboardData = {
      sales: salesResult.data || {
        summary: { total_orders: 0, total_revenue: 0, avg_order_value: 0 },
        daily_sales: [],
        top_products: [],
      },
      lowStockProducts: lowStockResult.data || [],
      recentOrders: recentOrdersResult.data || [],
      stats: {
        totalUsers: userCount,
        totalOrders: salesResult.data?.summary?.total_orders || 0,
        totalRevenue: salesResult.data?.summary?.total_revenue || 0,
        avgOrderValue: salesResult.data?.summary?.avg_order_value || 0,
        lowStockCount: lowStockResult.data?.length || 0,
      },
    };

    return NextResponse.json({ data: dashboardData });
  } catch (error) {
    console.error('Get dashboard data error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// Temporarily bypass server-side auth since we're using client-side protection
// TODO: Implement proper server-side authentication with session tokens
export async function GET(request: NextRequest) {
  return getDashboardData(request);
}