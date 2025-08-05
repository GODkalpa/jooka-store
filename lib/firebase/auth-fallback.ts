// Fallback authentication method using email/password
import { 
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signInWithEmailAndPassword,
  User
} from 'firebase/auth';
import { getFirebaseAuth } from './config';

/**
 * Create user with email and password (fallback method)
 */
export async function createUserWithEmailPassword(
  email: string, 
  password: string
): Promise<{ success: boolean; user?: User; error?: string }> {
  try {
    console.log('Creating user with email/password:', email);
    
    const auth = getFirebaseAuth();
    if (!auth) {
      throw new Error('Firebase auth not initialized');
    }

    // Create user
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    console.log('User created successfully:', user.uid);

    // Send email verification
    try {
      await sendEmailVerification(user);
      console.log('Verification email sent');
    } catch (verificationError) {
      console.warn('Failed to send verification email:', verificationError);
      // Don't fail the registration if verification email fails
    }

    return { success: true, user };
  } catch (error) {
    console.error('Error creating user:', error);
    
    let errorMessage = 'Failed to create account';
    
    if (error instanceof Error) {
      if (error.message.includes('auth/email-already-in-use')) {
        errorMessage = 'An account with this email already exists';
      } else if (error.message.includes('auth/invalid-email')) {
        errorMessage = 'Invalid email address';
      } else if (error.message.includes('auth/weak-password')) {
        errorMessage = 'Password is too weak';
      } else {
        errorMessage = error.message;
      }
    }
    
    return { success: false, error: errorMessage };
  }
}

/**
 * Sign in with email and password
 */
export async function signInWithEmailPassword(
  email: string,
  password: string
): Promise<{ success: boolean; user?: User; error?: string }> {
  try {
    console.log('🔥 Attempting to sign in with email/password:', email);

    const auth = getFirebaseAuth();
    if (!auth) {
      throw new Error('Firebase auth not initialized');
    }

    console.log('🔥 Firebase auth initialized, attempting sign in...');
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    console.log('🔥 User signed in successfully:', user.uid);
    console.log('🔥 User email verified:', user.emailVerified);
    return { success: true, user };
  } catch (error) {
    console.error('🔥 Error signing in:', error);
    
    let errorMessage = 'Failed to sign in';
    
    if (error instanceof Error) {
      if (error.message.includes('auth/user-not-found')) {
        errorMessage = 'No account found with this email';
      } else if (error.message.includes('auth/wrong-password')) {
        errorMessage = 'Incorrect password';
      } else if (error.message.includes('auth/invalid-email')) {
        errorMessage = 'Invalid email address';
      } else if (error.message.includes('auth/user-disabled')) {
        errorMessage = 'This account has been disabled';
      } else {
        errorMessage = error.message;
      }
    }
    
    return { success: false, error: errorMessage };
  }
}