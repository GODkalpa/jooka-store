// Firebase configuration placeholder (Safe Fallback Mode for Medusa Stack)
import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'dummy_api_key_placeholder',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'jooka-app.firebaseapp.com',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'jooka-app',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'jooka-app.appspot.com',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '123456789',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '1:123456789:web:abcdef',
};

let app: FirebaseApp | undefined;
let auth: Auth | undefined;
let db: Firestore | undefined;

function getFirebaseApp(): FirebaseApp {
  if (app) return app;
  const existingApps = getApps();
  if (existingApps.length > 0) {
    app = existingApps[0];
    return app;
  }
  try {
    app = initializeApp(firebaseConfig);
  } catch {
    // Graceful fallback
  }
  return app as FirebaseApp;
}

function getFirebaseAuth(): Auth {
  if (auth) return auth;
  const firebaseApp = getFirebaseApp();
  try {
    auth = getAuth(firebaseApp);
  } catch {
    // Graceful fallback
  }
  return auth as Auth;
}

function getFirebaseDb(): Firestore {
  if (db) return db;
  const firebaseApp = getFirebaseApp();
  try {
    db = getFirestore(firebaseApp);
  } catch {
    // Graceful fallback
  }
  return db as Firestore;
}

export {
  getFirebaseApp as app,
  getFirebaseAuth as auth,
  getFirebaseDb as db,
  getFirebaseApp,
  getFirebaseAuth,
  getFirebaseDb
};

export default getFirebaseApp;
