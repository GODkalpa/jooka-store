// Firebase Authentication utilities for JOOKA E-commerce Platform
import {
  signInWithEmailLink,
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User,
  ActionCodeSettings
} from 'firebase/auth';
import { getFirebaseAuth } from './config';

// Email OTP configuration
const getActionCodeSettings = (): ActionCodeSettings => {
  const baseUrl = typeof window !== 'undefined'
    ? window.location.origin
    : process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  return {
    url: `${baseUrl}/auth/email-link`,
    handleCodeInApp: true,
    iOS: {
      bundleId: 'com.jooka.app'
    },
    android: {
      packageName: 'com.jooka.app',
      installApp: true,
      minimumVersion: '12'
    },
    dynamicLinkDomain: undefined // Set this if you have a custom domain
  };
};

/**
 * Send OTP email for authentication
 */
export async function sendOTPEmail(email: string): Promise<{ success: boolean; error?: string }> {
  try {
    console.log('Attempting to send OTP email to:', email);

    // This function now works on both client and server side
    const isServer = typeof window === 'undefined';
    console.log('Running on server:', isServer);

    // Debug environment variables
    console.log('Environment check:', {
      apiKey: !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      authDomainExists: !!process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectIdExists: !!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      hasApiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY?.length || 0,
      authDomainValue: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectIdValue: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    });

    let auth;
    try {
      auth = getFirebaseAuth();
      if (!auth) {
        throw new Error('Firebase auth not initialized');
      }
    } catch (configError) {
      console.error('Firebase configuration error:', configError);
      throw new Error('Firebase is not properly configured. Please check your environment variables.');
    }

    console.log('Firebase auth instance obtained, sending email...');

    // Get action code settings
    const actionCodeSettings = getActionCodeSettings();
    console.log('Action code settings:', actionCodeSettings);

    // Attempt to send the sign-in link
    await sendSignInLinkToEmail(auth, email, actionCodeSettings);

    // Store email in localStorage for verification (client-side only)
    if (!isServer && typeof window !== 'undefined') {
      window.localStorage.setItem('emailForSignIn', email);
    }

    console.log('OTP email sent successfully');
    return { success: true };
  } catch (error) {
    console.error('Error sending OTP email:', error);

    // Provide more specific error messages
    let errorMessage = 'Failed to send OTP email';

    if (error instanceof Error) {
      console.log('Full error object:', error);
      console.log('Error code:', (error as any).code);
      console.log('Error message:', error.message);

      if (error.message.includes('auth/invalid-email')) {
        errorMessage = 'Invalid email address';
      } else if (error.message.includes('auth/user-disabled')) {
        errorMessage = 'This email address has been disabled';
      } else if (error.message.includes('auth/too-many-requests')) {
        errorMessage = 'Too many requests. Please try again later';
      } else if (error.message.includes('auth/configuration-not-found') || error.message.includes('noImplementation')) {
        errorMessage = 'Email link authentication is not enabled in Firebase Console. Please enable "Email link (passwordless sign-in)" in Authentication > Sign-in method.';
      } else if ((error as any).code === 'auth/operation-not-allowed') {
        errorMessage = 'Email link authentication is not enabled. Please enable it in Firebase Console.';
      } else {
        errorMessage = error.message;
      }
    }

    return {
      success: false,
      error: errorMessage
    };
  }
}

/**
 * Verify OTP and sign in user
 */
export async function verifyOTPAndSignIn(email?: string): Promise<{ success: boolean; user?: User; error?: string }> {
  try {
    const auth = getFirebaseAuth();
    if (!auth) {
      throw new Error('Firebase auth not initialized');
    }

    const url = typeof window !== 'undefined' ? window.location.href : '';

    if (!isSignInWithEmailLink(auth, url)) {
      return { success: false, error: 'Invalid sign-in link' };
    }

    // Get email from parameter or localStorage
    let userEmail = email;
    if (!userEmail && typeof window !== 'undefined') {
      userEmail = window.localStorage.getItem('emailForSignIn') || undefined;
    }

    if (!userEmail) {
      return { success: false, error: 'Email not found' };
    }

    const result = await signInWithEmailLink(auth, userEmail, url);

    // Clear email from localStorage
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem('emailForSignIn');
    }

    return { success: true, user: result.user };
  } catch (error) {
    console.error('Error verifying OTP:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to verify OTP'
    };
  }
}

/**
 * Sign out current user
 */
export async function signOut(): Promise<{ success: boolean; error?: string }> {
  try {
    const auth = getFirebaseAuth();
    if (!auth) {
      throw new Error('Firebase auth not initialized');
    }

    await firebaseSignOut(auth);
    return { success: true };
  } catch (error) {
    console.error('Error signing out:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to sign out'
    };
  }
}

/**
 * Get current user
 */
export function getCurrentUser(): User | null {
  try {
    const auth = getFirebaseAuth();
    return auth?.currentUser || null;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

/**
 * Listen to auth state changes
 */
export function onAuthStateChange(callback: (user: User | null) => void) {
  try {
    const auth = getFirebaseAuth();
    console.log('onAuthStateChange called, auth object:', !!auth);
    if (!auth) {
      console.warn('Firebase auth not initialized');
      return () => { };
    }

    console.log('Setting up auth state listener...');
    return onAuthStateChanged(auth, callback);
  } catch (error) {
    console.error('Error setting up auth state listener:', error);
    return () => { };
  }
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  try {
    const auth = getFirebaseAuth();
    return !!auth?.currentUser;
  } catch (error) {
    console.error('Error checking authentication:', error);
    return false;
  }
}

/**
 * Get user email
 */
export function getUserEmail(): string | null {
  try {
    const auth = getFirebaseAuth();
    return auth?.currentUser?.email || null;
  } catch (error) {
    console.error('Error getting user email:', error);
    return null;
  }
}

/**
 * Get user ID
 */
export function getUserId(): string | null {
  try {
    const auth = getFirebaseAuth();
    return auth?.currentUser?.uid || null;
  } catch (error) {
    console.error('Error getting user ID:', error);
    return null;
  }
}
