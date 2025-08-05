// Firebase configuration for JOOKA E-commerce Platform
import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, Firestore, connectFirestoreEmulator } from 'firebase/firestore';

// Firebase configuration object - ensure we get the values properly
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '',
};

// Validate configuration
function validateConfig() {
  const requiredKeys = [
    'NEXT_PUBLIC_FIREBASE_API_KEY',
    'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
    'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
    'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
    'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
    'NEXT_PUBLIC_FIREBASE_APP_ID',
  ];

  console.log('Validating Firebase config...');

  // Check the actual config object values instead of process.env
  const configValues = [
    firebaseConfig.apiKey,
    firebaseConfig.authDomain,
    firebaseConfig.projectId,
    firebaseConfig.storageBucket,
    firebaseConfig.messagingSenderId,
    firebaseConfig.appId,
  ];

  console.log('Config values:', configValues.map((val, i) => ({ [requiredKeys[i]]: !!val })));

  const missingValues = configValues.filter(val => !val || val === 'undefined' || val === '');

  if (missingValues.length > 0) {
    console.warn('Missing Firebase configuration values. Missing count:', missingValues.length);
    console.warn('Full config (masked):', {
      apiKey: firebaseConfig.apiKey ? `${firebaseConfig.apiKey.substring(0, 10)}...` : 'MISSING',
      authDomain: firebaseConfig.authDomain || 'MISSING',
      projectId: firebaseConfig.projectId || 'MISSING',
      storageBucket: firebaseConfig.storageBucket || 'MISSING',
      messagingSenderId: firebaseConfig.messagingSenderId || 'MISSING',
      appId: firebaseConfig.appId ? `${firebaseConfig.appId.substring(0, 10)}...` : 'MISSING',
    });
    return false;
  }

  console.log('Firebase config validation passed');
  return true;
}

// Initialize Firebase app
let app: FirebaseApp | undefined;
let auth: Auth | undefined;
let db: Firestore | undefined;

// Function to get or initialize Firebase
function getFirebaseApp(): FirebaseApp {
  if (app) return app;

  console.log('Initializing Firebase app...');
  const existingApps = getApps();

  if (existingApps.length > 0) {
    console.log('Using existing Firebase app');
    app = existingApps[0];
  } else {
    console.log('Creating new Firebase app with config:', {
      apiKey: firebaseConfig.apiKey ? '***' : 'MISSING',
      authDomain: firebaseConfig.authDomain || 'MISSING',
      projectId: firebaseConfig.projectId || 'MISSING',
      storageBucket: firebaseConfig.storageBucket || 'MISSING',
      messagingSenderId: firebaseConfig.messagingSenderId || 'MISSING',
      appId: firebaseConfig.appId ? '***' : 'MISSING',
    });

    if (!validateConfig()) {
      throw new Error('Firebase configuration validation failed. Please check your environment variables.');
    }

    try {
      app = initializeApp(firebaseConfig);
      console.log('Firebase app created successfully');
    } catch (error) {
      console.error('Failed to initialize Firebase app:', error);
      throw new Error(`Firebase initialization failed: ${error}`);
    }
  }

  return app;
}

// Function to get or initialize Firebase Auth
function getFirebaseAuth(): Auth {
  if (auth) return auth;

  console.log('Initializing Firebase Auth...');
  const firebaseApp = getFirebaseApp();
  auth = getAuth(firebaseApp);
  
  // Configure auth settings for better reliability
  if (typeof window !== 'undefined') {
    // Set auth language to English for consistency
    auth.languageCode = 'en';
    
    // Enable persistence for better user experience
    auth.settings.appVerificationDisabledForTesting = false;
  }
  
  console.log('Firebase Auth initialized');
  return auth;
}

// Function to get or initialize Firestore
function getFirebaseDb(): Firestore {
  if (db) return db;

  console.log('Initializing Firestore...');
  const firebaseApp = getFirebaseApp();
  db = getFirestore(firebaseApp);
  console.log('Firestore initialized');

  return db;
}

// Don't initialize automatically on client-side to avoid issues
// Let individual functions initialize Firebase when needed
let clientInitialized = false;

function ensureClientInitialized() {
  if (typeof window === 'undefined') return;
  if (clientInitialized) return;

  try {
    console.log('Starting client-side Firebase initialization...');
    app = getFirebaseApp();
    auth = getFirebaseAuth();
    db = getFirebaseDb();
    clientInitialized = true;
    console.log('Client-side Firebase initialization complete');
  } catch (error) {
    console.error('Failed to initialize Firebase on client:', error);
    throw error;
  }
}

// Export Firebase services with lazy initialization
export {
  getFirebaseApp as app,
  getFirebaseAuth as auth,
  getFirebaseDb as db
};

// For backward compatibility, also export the getter functions directly
export { getFirebaseApp, getFirebaseAuth, getFirebaseDb };

export default getFirebaseApp;
