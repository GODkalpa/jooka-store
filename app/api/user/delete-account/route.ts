// User delete account API route
import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { getAdminDb } from '@/lib/firebase/admin';

async function deleteAccount(request: NextRequest) {
  try {
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

    // Delete user data from Firestore
    const batch = db.batch();

    // Get all user-related documents
    const [profiles, addresses, cartItems, orders, notifications] = await Promise.all([
      db.collection('profiles').where('user_id', '==', userId).get(),
      db.collection('addresses').where('user_id', '==', userId).get(),
      db.collection('cart_items').where('user_id', '==', userId).get(),
      db.collection('orders').where('user_id', '==', userId).get(),
      db.collection('notifications').where('user_id', '==', userId).get(),
    ]);

    // Add delete operations to batch
    profiles.docs.forEach(doc => batch.delete(doc.ref));
    addresses.docs.forEach(doc => batch.delete(doc.ref));
    cartItems.docs.forEach(doc => batch.delete(doc.ref));
    notifications.docs.forEach(doc => batch.delete(doc.ref));

    // For orders, we might want to keep them for business records but anonymize them
    orders.docs.forEach(doc => {
      batch.update(doc.ref, {
        user_id: 'deleted-user',
        user_email: 'deleted@example.com',
        anonymized: true,
        anonymized_at: new Date(),
      });
    });

    // Delete user document
    const userDoc = db.collection('users').doc(userId);
    batch.delete(userDoc);

    // Execute batch delete
    await batch.commit();

    // Delete user from Firebase Auth
    await getAuth().deleteUser(userId);

    return NextResponse.json({ 
      message: 'Account deleted successfully'
    });
  } catch (error) {
    console.error('Delete account error:', error);
    return NextResponse.json(
      { error: 'Failed to delete account' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  return deleteAccount(request);
}