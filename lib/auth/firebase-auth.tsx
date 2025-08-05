// Firebase Authentication hooks and utilities for JOOKA E-commerce Platform
'use client';

import React, { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import {
  sendOTPEmail,
  verifyOTPAndSignIn,
  signOut,
  getCurrentUser,
  onAuthStateChange,
  getUserId,
  getUserEmail
} from '@/lib/firebase/auth';
import { signInWithEmailPassword } from '@/lib/firebase/auth-fallback';
import { db } from '@/lib/database';
import type { User, UserWithProfile } from '@/types/firebase';

// Auth context type
interface AuthContextType {
  user: UserWithProfile | null;
  firebaseUser: FirebaseUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  sendOTP: (email: string) => Promise<{ success: boolean; error?: string }>;
  verifyOTP: (email?: string) => Promise<{ success: boolean; error?: string }>;
  signInWithPassword: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<{ success: boolean; error?: string }>;
  refreshUser: () => Promise<void>;
}

// Create auth context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth provider component
export function AuthProvider({ children }: { children: ReactNode }) {
  console.log('AuthProvider initialized');
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [user, setUser] = useState<UserWithProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  console.log('AuthProvider state initialized, setting up auth listener');
  console.log('typeof window:', typeof window);

  // Handle client-side mounting
  useEffect(() => {
    console.log('🔥 Mounting useEffect called');
    setIsMounted(true);
  }, []);

  // Listen to Firebase auth state changes (client-side only)
  useEffect(() => {
    // Only run on client side after mounting
    if (!isMounted) {
      return;
    }

    let unsubscribe: (() => void) | null = null;
    let isActive = true;

    const setupAuthListener = async () => {
      try {
        unsubscribe = onAuthStateChange(async (firebaseUser) => {
          if (!isActive) return; // Prevent state updates if component unmounted
          
          setFirebaseUser(firebaseUser);
          setIsLoading(true);

          // Debounce user data fetching to prevent rapid successive calls
          await new Promise(resolve => setTimeout(resolve, 50));
          
          if (isActive) {
            await fetchUserData(firebaseUser);
            setIsLoading(false);
          }
        });
      } catch (error) {
        console.error('Error setting up auth state listener:', error);
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    setupAuthListener();

    // Fallback timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      if (isActive) {
        setIsLoading(false);
      }
    }, 3000);

    return () => {
      isActive = false;
      if (unsubscribe) {
        unsubscribe();
      }
      clearTimeout(timeout);
    };
  }, [isMounted]);

  // Fetch user data from Firestore when Firebase user changes
  const fetchUserData = async (firebaseUser: FirebaseUser | null) => {
    if (!firebaseUser) {
      setUser(null);
      return;
    }

    try {
      // Check if user exists in our database
      const result = await db.getUser(firebaseUser.uid);

      if (result.success && result.data) {
        setUser(result.data);
      } else {
        // Check if this is the first user (no admin exists)
        const existingAdmins = await db.getUsers({ role: 'admin', limit: 1 });
        const isFirstUser = existingAdmins.data.length === 0;
        
        // Create user in our database if they don't exist
        const createResult = await db.createUser({
          email: firebaseUser.email!,
          role: isFirstUser ? 'admin' : 'customer'
        });

        if (createResult.success && createResult.data) {
          // Fetch the complete user data with profile
          const userResult = await db.getUser(createResult.data.id);
          if (userResult.success && userResult.data) {
            setUser(userResult.data);
            
            if (isFirstUser) {
              console.log('🎉 First user created with admin privileges');
            }
          }
        }
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      setUser(null);
    }
  };

  // Send OTP email
  const sendOTP = async (email: string) => {
    return await sendOTPEmail(email);
  };

  // Verify OTP and sign in
  const verifyOTP = async (email?: string) => {
    const result = await verifyOTPAndSignIn(email);

    if (result.success && result.user) {
      // User data will be updated through the auth state change listener
      return { success: true };
    }

    return { success: false, error: result.error };
  };

  // Sign in with email and password
  const signInWithPassword = async (email: string, password: string) => {
    try {
      const result = await signInWithEmailPassword(email, password);

      if (result.success && result.user) {
        // User data will be updated through the auth state change listener
        return { success: true };
      }

      return { success: false, error: result.error };
    } catch (error) {
      console.error('Sign in error:', error);
      return { success: false, error: 'An unexpected error occurred' };
    }
  };

  // Sign out
  const logout = async () => {
    const result = await signOut();

    if (result.success) {
      setUser(null);
      setFirebaseUser(null);
    }

    return result;
  };

  // Refresh user data
  const refreshUser = async () => {
    if (firebaseUser) {
      await fetchUserData(firebaseUser);
    }
  };

  const value: AuthContextType = {
    user,
    firebaseUser,
    isLoading,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    sendOTP,
    verifyOTP,
    signInWithPassword,
    logout,
    refreshUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}

// Hook for user data (similar to Clerk's useUser)
export function useUser() {
  const { user, firebaseUser, isLoading } = useAuth();

  return {
    user,
    isLoaded: !isLoading,
    isSignedIn: !!user
  };
}

// Server-side auth utilities
export async function getServerUser(): Promise<UserWithProfile | null> {
  try {
    const userId = getUserId();
    if (!userId) return null;

    const result = await db.getUser(userId);
    return result.success ? result.data || null : null;
  } catch (error) {
    console.error('Error getting server user:', error);
    return null;
  }
}

// Check if user is authenticated (server-side)
export function isServerAuthenticated(): boolean {
  return !!getUserId();
}

// Get current user ID (server-side)
export function getServerUserId(): string | null {
  return getUserId();
}

// Get current user email (server-side)
export function getServerUserEmail(): string | null {
  return getUserEmail();
}

// Role-based access control helpers
export function hasRole(user: UserWithProfile | null, role: string): boolean {
  return user?.role === role;
}

export function isAdmin(user: UserWithProfile | null): boolean {
  return hasRole(user, 'admin');
}

export function isCustomer(user: UserWithProfile | null): boolean {
  return hasRole(user, 'customer');
}
