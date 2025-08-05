// Customer dashboard API route
import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase/admin';
import { getAuth } from 'firebase-admin/auth';
import { convertObjectDates } from '@/lib/utils/date';

async function getCustomerDashboard(request: NextRequest) {
  try {
    console.log('Fetching customer dashboard data...');
    
    // Get user from Firebase Auth token
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    let decodedToken;
    
    try {
      decodedToken = await getAuth().verifyIdToken(token);
    } catch (authError) {
      console.error('Auth token verification failed:', authError);
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const userId = decodedToken.uid;
    const db = getAdminDb();

    // Fetch user data
    const userDoc = await db.collection('users').doc(userId).get();
    const userData = userDoc.exists ? convertObjectDates({ id: userDoc.id, ...userDoc.data() }) : null;

    // Fetch user profile
    const profileSnapshot = await db.collection('profiles').where('user_id', '==', userId).get();
    const profile = profileSnapshot.empty ? null : convertObjectDates({ id: profileSnapshot.docs[0].id, ...profileSnapshot.docs[0].data() });

    // Fetch recent orders (last 5)
    const ordersSnapshot = await db.collection('orders')
      .where('user_id', '==', userId)
      .orderBy('created_at', 'desc')
      .limit(5)
      .get();
    
    const recentOrders = ordersSnapshot.docs.map(doc => 
      convertObjectDates({ id: doc.id, ...doc.data() })
    );

    // Fetch cart items
    const cartSnapshot = await db.collection('cart_items')
      .where('user_id', '==', userId)
      .get();
    
    const cartItems = cartSnapshot.docs.map(doc => convertObjectDates({ id: doc.id, ...doc.data() }));
    const cartItemCount = cartItems.reduce((sum, item) => sum + (item.quantity || 0), 0);

    // Fetch addresses
    const addressesSnapshot = await db.collection('addresses')
      .where('user_id', '==', userId)
      .get();
    
    const addresses = addressesSnapshot.docs.map(doc => convertObjectDates({ id: doc.id, ...doc.data() }));

    // Fetch notifications (unread)
    const notificationsSnapshot = await db.collection('notifications')
      .where('user_id', '==', userId)
      .where('read', '==', false)
      .get();
    
    const notifications = notificationsSnapshot.docs.map(doc => convertObjectDates({ id: doc.id, ...doc.data() }));

    // Calculate stats
    const stats = {
      totalOrders: recentOrders.length,
      cartItems: cartItemCount,
      savedAddresses: addresses.length,
      unreadNotifications: notifications.length,
    };

    const dashboardData = {
      user: {
        ...userData,
        profile,
        email: decodedToken.email,
        role: userData?.role || 'customer'
      },
      recentOrders,
      cart: {
        items: cartItems,
        itemCount: cartItemCount,
      },
      addresses,
      paymentMethods: [], // COD only for now
      notifications,
      stats,
    };

    return NextResponse.json({ data: dashboardData });
  } catch (error) {
    console.error('Get customer dashboard error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  return getCustomerDashboard(request);
}