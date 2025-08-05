// User dashboard data API route
import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth/middleware';
import { db } from '@/lib/database/index';

async function getDashboardData(request: NextRequest) {
  const user = (request as any).user;
  
  try {
    // Fetch all user-related data in parallel
    const [
      userProfile,
      addresses,
      recentOrders,
      cartItems,
      notifications
    ] = await Promise.all([
      db.getUser(user.id),
      db.getUserAddresses(user.id),
      db.getUserOrders(user.id, { limit: 5 }), // Get last 5 orders
      db.getCartItems(user.id),
      db.getUserNotifications(user.id, true) // Get unread notifications only
    ]);

    // Calculate dashboard statistics
    const stats = {
      totalOrders: 0,
      pendingOrders: 0,
      completedOrders: 0,
      totalAddresses: addresses.success ? addresses.data.length : 0,
      cartItemsCount: cartItems.success ? cartItems.data.length : 0,
      unreadNotifications: notifications.success ? notifications.data.length : 0
    };

    if (recentOrders.success) {
      stats.totalOrders = recentOrders.data.length;
      stats.pendingOrders = recentOrders.data.filter(order => 
        ['pending', 'processing'].includes(order.status)
      ).length;
      stats.completedOrders = recentOrders.data.filter(order => 
        order.status === 'delivered'
      ).length;
    }

    // Get default address
    const defaultAddress = addresses.success 
      ? addresses.data.find(addr => addr.is_default) 
      : null;

    // Prepare response data
    const dashboardData = {
      user: userProfile.success ? userProfile.data : null,
      stats,
      recentOrders: recentOrders.success ? recentOrders.data : [],
      defaultAddress,
      cartSummary: {
        itemCount: stats.cartItemsCount,
        items: cartItems.success ? cartItems.data.slice(0, 3) : [] // Show first 3 items
      },
      notifications: notifications.success ? notifications.data.slice(0, 5) : [], // Show first 5 notifications
      quickActions: [
        {
          id: 'view_orders',
          name: 'View Orders',
          description: 'Check your order history and status',
          icon: 'package',
          url: '/dashboard/orders'
        },
        {
          id: 'manage_addresses',
          name: 'Manage Addresses',
          description: 'Add or edit delivery addresses',
          icon: 'map-pin',
          url: '/dashboard/addresses'
        },
        {
          id: 'update_profile',
          name: 'Update Profile',
          description: 'Edit your personal information',
          icon: 'user',
          url: '/dashboard/profile'
        },
        {
          id: 'continue_shopping',
          name: 'Continue Shopping',
          description: 'Browse our product catalog',
          icon: 'shopping-bag',
          url: '/shop'
        }
      ]
    };

    return NextResponse.json({ 
      data: dashboardData,
      message: 'Dashboard data retrieved successfully'
    });

  } catch (error) {
    console.error('Get dashboard data error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}

export const GET = withAuth(getDashboardData);
