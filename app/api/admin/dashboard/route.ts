// Admin dashboard API route secured with Medusa Admin authentication
import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/lib/auth/middleware';
import { OrderService } from '@/lib/services/order-service';

async function getDashboardData(request: AuthenticatedRequest) {
  try {
    const ordersResult = OrderService.getOrders({ limit: 100 });
    const allOrders = ordersResult.data || [];

    const totalOrders = allOrders.length;
    const totalRevenue = allOrders.reduce((sum, o) => sum + (o.total_amount || 0), 0);
    const avgOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

    const recentOrders = allOrders.slice(0, 10);

    const dashboardData = {
      sales: {
        summary: {
          total_orders: totalOrders,
          total_revenue: totalRevenue,
          avg_order_value: avgOrderValue,
        },
        daily_sales: [],
        top_products: [],
      },
      lowStockProducts: [],
      recentOrders,
      stats: {
        totalUsers: 1,
        totalOrders,
        totalRevenue,
        avgOrderValue,
        lowStockCount: 0,
      },
    };

    return NextResponse.json({ data: dashboardData });
  } catch (error) {
    console.error('Get dashboard data error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}

export const GET = withAuth(getDashboardData, { requireAdmin: true });