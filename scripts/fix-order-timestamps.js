// Load environment variables
require('dotenv').config({ path: '.env.local' });

const admin = require('firebase-admin');

// Initialize Firebase Admin SDK with the same logic as lib/firebase/admin.ts
function initializeFirebaseAdmin() {
  // Check if already initialized
  if (admin.apps.length > 0) {
    console.log('Using existing Firebase Admin app');
    return admin.apps[0];
  }

  console.log('Initializing Firebase Admin SDK...');

  try {
    // Try to get service account from environment variables
    let serviceAccount = null;

    // Method 1: Full JSON service account key
    if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
      try {
        serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
        console.log('Using full service account key from environment');
      } catch (error) {
        console.error('Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY:', error);
      }
    }

    // Method 2: Individual environment variables
    if (!serviceAccount && process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL) {
      serviceAccount = {
        type: "service_account",
        project_id: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
        private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        client_email: process.env.FIREBASE_CLIENT_EMAIL,
        client_id: process.env.FIREBASE_CLIENT_ID,
        auth_uri: "https://accounts.google.com/o/oauth2/auth",
        token_uri: "https://oauth2.googleapis.com/token",
        auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
        client_x509_cert_url: `https://www.googleapis.com/robot/v1/metadata/x509/${process.env.FIREBASE_CLIENT_EMAIL}`
      };
      console.log('Using individual service account fields from environment');
    }

    if (serviceAccount) {
      return admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
      });
    } else {
      // Fallback: Use default credentials
      return admin.initializeApp({
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
      });
    }
  } catch (error) {
    console.error('Failed to initialize Firebase Admin SDK:', error);
    throw error;
  }
}

// Initialize the app
initializeFirebaseAdmin();

const db = admin.firestore();

async function fixOrderTimestamps() {
  try {
    console.log('Starting to fix order timestamps...');
    
    // Get all orders
    const ordersSnapshot = await db.collection('orders').get();
    console.log(`Found ${ordersSnapshot.docs.length} orders to check`);
    
    let fixedCount = 0;
    const batch = db.batch();
    
    for (const doc of ordersSnapshot.docs) {
      const orderData = doc.data();
      let needsUpdate = false;
      const updates = {};
      
      // Check if created_at is an empty object
      if (orderData.created_at && typeof orderData.created_at === 'object' && Object.keys(orderData.created_at).length === 0) {
        updates.created_at = admin.firestore.FieldValue.serverTimestamp();
        needsUpdate = true;
        console.log(`Order ${doc.id}: Fixing empty created_at`);
      }
      
      // Check if updated_at is an empty object
      if (orderData.updated_at && typeof orderData.updated_at === 'object' && Object.keys(orderData.updated_at).length === 0) {
        updates.updated_at = admin.firestore.FieldValue.serverTimestamp();
        needsUpdate = true;
        console.log(`Order ${doc.id}: Fixing empty updated_at`);
      }
      
      if (needsUpdate) {
        batch.update(doc.ref, updates);
        fixedCount++;
      }
    }
    
    if (fixedCount > 0) {
      await batch.commit();
      console.log(`✅ Fixed ${fixedCount} orders with empty timestamps`);
    } else {
      console.log('✅ No orders needed timestamp fixes');
    }
    
    // Also fix order items
    const orderItemsSnapshot = await db.collection('order_items').get();
    console.log(`Found ${orderItemsSnapshot.docs.length} order items to check`);
    
    let fixedItemsCount = 0;
    const itemsBatch = db.batch();
    
    for (const doc of orderItemsSnapshot.docs) {
      const itemData = doc.data();
      let needsUpdate = false;
      const updates = {};
      
      // Check if created_at is an empty object
      if (itemData.created_at && typeof itemData.created_at === 'object' && Object.keys(itemData.created_at).length === 0) {
        updates.created_at = admin.firestore.FieldValue.serverTimestamp();
        needsUpdate = true;
      }
      
      // Check if updated_at is an empty object
      if (itemData.updated_at && typeof itemData.updated_at === 'object' && Object.keys(itemData.updated_at).length === 0) {
        updates.updated_at = admin.firestore.FieldValue.serverTimestamp();
        needsUpdate = true;
      }
      
      if (needsUpdate) {
        itemsBatch.update(doc.ref, updates);
        fixedItemsCount++;
      }
    }
    
    if (fixedItemsCount > 0) {
      await itemsBatch.commit();
      console.log(`✅ Fixed ${fixedItemsCount} order items with empty timestamps`);
    } else {
      console.log('✅ No order items needed timestamp fixes');
    }
    
    console.log('🎉 All timestamp fixes completed!');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error fixing timestamps:', error);
    process.exit(1);
  }
}

fixOrderTimestamps(); 