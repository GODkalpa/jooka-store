// Firebase Admin SDK configuration for server-side operations
import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getAuth, Auth } from 'firebase-admin/auth';
import { getFirestore, Firestore } from 'firebase-admin/firestore';

let adminApp: App | undefined;
let adminAuth: Auth | undefined;
let adminDb: Firestore | undefined;

/**
 * Initialize Firebase Admin SDK
 */
export function initializeAdmin(): App {
  if (adminApp) return adminApp;

  console.log('Initializing Firebase Admin SDK...');

  // Check if already initialized
  const existingApps = getApps();
  if (existingApps.length > 0) {
    console.log('Using existing Firebase Admin app');
    adminApp = existingApps[0];
    return adminApp;
  }

  try {
    // Try to get service account from environment variables
    let serviceAccount: any = null;

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
        project_id: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID,
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

    if (serviceAccount && serviceAccount.project_id) {
      adminApp = initializeApp({
        credential: cert(serviceAccount),
        projectId: serviceAccount.project_id
      });
      console.log('Firebase Admin SDK initialized with service account');
    } else {
      // Fallback: Use default credentials (works in Firebase Functions or with gcloud auth)
      const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID;
      if (!projectId) {
        throw new Error('No Firebase project ID found in environment variables');
      }
      adminApp = initializeApp({
        projectId: projectId
      });
      console.log('Firebase Admin SDK initialized with default credentials');
    }

    return adminApp;
  } catch (error) {
    console.error('Failed to initialize Firebase Admin SDK:', error);
    throw new Error(`Firebase Admin initialization failed: ${error}`);
  }
}

/**
 * Get Firebase Admin Auth instance
 */
export function getAdminAuth(): Auth {
  if (adminAuth) return adminAuth;

  const app = initializeAdmin();
  adminAuth = getAuth(app);
  console.log('Firebase Admin Auth initialized');
  return adminAuth;
}

/**
 * Get Firebase Admin Firestore instance
 */
export function getAdminDb(): Firestore {
  if (adminDb) return adminDb;

  const app = initializeAdmin();
  adminDb = getFirestore(app);
  console.log('Firebase Admin Firestore initialized');
  return adminDb;
}

/**
 * Create user document in Firestore using Admin SDK
 */
export async function createUserDocument(userId: string, userData: {
  email: string;
  role: 'admin' | 'customer';
  email_verified?: boolean;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const db = getAdminDb();
    
    await db.collection('users').doc(userId).set({
      email: userData.email,
      role: userData.role,
      email_verified: userData.email_verified ?? true,
      created_at: new Date(),
      updated_at: new Date()
    });

    console.log(`User document created successfully for: ${userId}`);
    return { success: true };
  } catch (error) {
    console.error('Error creating user document:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

/**
 * Update user profile in Firestore using Admin SDK
 */
export async function updateUserProfile(userId: string, profileData: {
  full_name?: string;
  phone?: string;
  email?: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const db = getAdminDb();
    
    // Check if profile exists
    const profileRef = db.collection('profiles').doc(userId);
    const profileDoc = await profileRef.get();
    
    const profileUpdate = {
      user_id: userId,
      ...profileData,
      updated_at: new Date()
    };

    if (profileDoc.exists) {
      await profileRef.update(profileUpdate);
    } else {
      await profileRef.set({
        ...profileUpdate,
        created_at: new Date()
      });
    }

    console.log(`User profile updated successfully for: ${userId}`);
    return { success: true };
  } catch (error) {
    console.error('Error updating user profile:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

/**
 * Check if user exists in Firestore
 */
export async function checkUserExists(userId: string): Promise<boolean> {
  try {
    const db = getAdminDb();
    const userDoc = await db.collection('users').doc(userId).get();
    return userDoc.exists;
  } catch (error) {
    console.error('Error checking if user exists:', error);
    return false;
  }
}

/**
 * Check if user exists in Firebase Authentication by email
 */
export async function checkUserExistsByEmail(email: string): Promise<{ exists: boolean; user?: any; error?: string }> {
  try {
    const auth = getAdminAuth();
    const userRecord = await auth.getUserByEmail(email);

    return {
      exists: true,
      user: {
        uid: userRecord.uid,
        email: userRecord.email,
        emailVerified: userRecord.emailVerified,
        disabled: userRecord.disabled
      }
    };
  } catch (error: any) {
    // If user not found, Firebase throws an error with code 'auth/user-not-found'
    if (error.code === 'auth/user-not-found') {
      return { exists: false };
    }

    console.error('Error checking if user exists by email:', error);
    return {
      exists: false,
      error: error.message || 'Failed to check user existence'
    };
  }
}

/**
 * Get user data from Firestore using Admin SDK
 */
export async function getUserData(userId: string): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const db = getAdminDb();
    const userDoc = await db.collection('users').doc(userId).get();
    
    if (!userDoc.exists) {
      return { success: false, error: 'User not found' };
    }

    return { success: true, data: { id: userDoc.id, ...userDoc.data() } };
  } catch (error) {
    console.error('Error getting user data:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

// Export the admin app for other uses if needed
export { adminApp };
