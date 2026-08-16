// Authentication Provider for JOOKA E-commerce Platform (Medusa & Session Based)
'use client';

import React, { useState, useEffect, createContext, useContext, ReactNode } from 'react';

export interface UserProfile {
  id: string;
  email: string;
  role: 'admin' | 'customer';
  firstName?: string;
  lastName?: string;
  created_at?: any;
  email_verified?: boolean;
  profile?: {
    avatar_url?: string;
    first_name?: string;
    last_name?: string;
    full_name?: string;
    phone?: string;
  };
}

interface AuthContextType {
  user: UserProfile | null;
  firebaseUser?: any;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  signInWithPassword: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<{ success: boolean; error?: string }>;
  refreshUser: () => Promise<void>;
  sendOTP: (email: string) => Promise<{ success: boolean; error?: string }>;
  verifyOTP: (email?: string) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user session from localStorage on mount
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('jooka_user_session');
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
    } catch (e) {
      console.warn('Failed to load local user session:', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const sendOTP = async (email: string) => {
    try {
      const res = await fetch('/api/register-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      return { success: res.ok, error: data.error };
    } catch (err) {
      return { success: false, error: (err as Error).message };
    }
  };

  const verifyOTP = async (email?: string) => {
    return { success: true };
  };

  const signInWithPassword = async (email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.error || 'Invalid credentials' };
      }

      const role: 'admin' | 'customer' = data.role === 'admin' ? 'admin' : 'customer';

      // Store the Medusa JWT token for SSO bridge (consumed by admin layout)
      if (data.medusaToken) {
        localStorage.setItem('medusa_jwt', data.medusaToken);
      }

      const userProfile: UserProfile = {
        id: data.userId || 'usr_jooka',
        email,
        role,
        firstName: email.split('@')[0],
        created_at: new Date().toISOString(),
        email_verified: true,
        profile: {
          full_name: email.split('@')[0],
        },
      };

      setUser(userProfile);
      localStorage.setItem('jooka_user_session', JSON.stringify(userProfile));

      return { success: true };
    } catch (err) {
      return { success: false, error: (err as Error).message };
    }
  };

  const logout = async () => {
    setUser(null);
    localStorage.removeItem('jooka_user_session');
    localStorage.removeItem('medusa_jwt');
    localStorage.removeItem('_medusa_jwt');
    localStorage.removeItem('medusa_session');
    return { success: true };
  };

  const refreshUser = async () => {};

  const value: AuthContextType = {
    user,
    firebaseUser: null,
    isLoading,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    signInWithPassword,
    logout,
    refreshUser,
    sendOTP,
    verifyOTP,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function useUser() {
  const { user, isLoading } = useAuth();
  return {
    user,
    isLoaded: !isLoading,
    isSignedIn: !!user,
  };
}

export async function getServerUser(): Promise<UserProfile | null> {
  return null;
}

export function isServerAuthenticated(): boolean {
  return false;
}
