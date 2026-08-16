// Customer dashboard API route - Live database integration
import { NextRequest, NextResponse } from 'next/server';
import { FirebaseAdminDatabaseService } from '@/lib/database/firebase-admin-service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || searchParams.get('user_id') || undefined;

    const adminDb = new FirebaseAdminDatabaseService();
    const ordersResult = await adminDb.getOrders({ userId, limit: 10 });
    const orders = ordersResult.data || [];

    return NextResponse.json({
      data: {
        recentOrders: orders,
        cart: { items: [], itemCount: 0 },
        addresses: [],
        paymentMethods: [{ id: 'cod', type: 'cash_on_delivery', label: 'Cash on Delivery' }],
        notifications: [],
        stats: {
          totalOrders: orders.length,
          cartItems: 0,
          savedAddresses: 0,
          unreadNotifications: 0,
        },
      }
    });
  } catch (error) {
    console.error('Customer dashboard fetch error:', error);
    return NextResponse.json({
      data: {
        recentOrders: [],
        cart: { items: [], itemCount: 0 },
        addresses: [],
        paymentMethods: [],
        notifications: [],
        stats: { totalOrders: 0, cartItems: 0, savedAddresses: 0, unreadNotifications: 0 },
      }
    });
  }
}