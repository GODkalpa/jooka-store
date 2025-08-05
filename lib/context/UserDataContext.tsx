'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from '@/lib/auth/firebase-auth';
import { api } from '@/lib/api/client';

// Types for user data
interface UserProfile {
  id: string;
  email: string;
  profile?: {
    first_name?: string;
    last_name?: string;
    phone?: string;
    date_of_birth?: string;
  };
}

interface Address {
  id: string;
  type: 'shipping' | 'billing';
  first_name: string;
  last_name: string;
  company?: string;
  street_address_1: string;
  street_address_2?: string;
  city: string;
  state: string;
  postal_code?: string;
  country: string;
  phone?: string;
  is_default: boolean;
  created_at: string;
}

interface UserDataContextType {
  userProfile: UserProfile | null;
  addresses: Address[];
  loading: boolean;
  error: string | null;
  refreshUserData: () => Promise<void>;
  updateUserProfile: (data: Partial<UserProfile>) => void;
  addAddress: (address: Address) => void;
  updateAddress: (id: string, address: Partial<Address>) => void;
  removeAddress: (id: string) => void;
  setDefaultAddress: (id: string) => void;
}

const UserDataContext = createContext<UserDataContextType | undefined>(undefined);

interface UserDataProviderProps {
  children: ReactNode;
}

export function UserDataProvider({ children }: UserDataProviderProps) {
  const { user, firebaseUser, isLoading } = useAuth();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch user data when user changes - debounced to prevent excessive calls
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    if (!isLoading && user && firebaseUser) {
      // Debounce the API call to prevent rapid successive calls
      timeoutId = setTimeout(() => {
        refreshUserData();
      }, 100);
    } else if (!isLoading && !user) {
      // Clear data when user logs out
      setUserProfile(null);
      setAddresses([]);
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [user, firebaseUser, isLoading]);

  const refreshUserData = async () => {
    if (!user || !firebaseUser) return;

    setLoading(true);
    setError(null);

    try {
      // Fetch user profile
      const profileResult = await api.get('/api/user/profile');
      setUserProfile(profileResult.data);

      // Fetch addresses
      const addressResult = await api.get('/api/user/addresses');
      setAddresses(addressResult.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch user data');
    } finally {
      setLoading(false);
    }
  };

  const updateUserProfile = (data: Partial<UserProfile>) => {
    if (userProfile) {
      setUserProfile({ ...userProfile, ...data });
    }
  };

  const addAddress = (address: Address) => {
    setAddresses(prev => [...prev, address]);
  };

  const updateAddress = (id: string, updatedAddress: Partial<Address>) => {
    setAddresses(prev =>
      prev.map(addr =>
        addr.id === id ? { ...addr, ...updatedAddress } : addr
      )
    );
  };

  const removeAddress = (id: string) => {
    setAddresses(prev => prev.filter(addr => addr.id !== id));
  };

  const setDefaultAddress = (id: string) => {
    setAddresses(prev =>
      prev.map(addr => ({
        ...addr,
        is_default: addr.id === id
      }))
    );
  };

  const value: UserDataContextType = {
    userProfile,
    addresses,
    loading,
    error,
    refreshUserData,
    updateUserProfile,
    addAddress,
    updateAddress,
    removeAddress,
    setDefaultAddress,
  };

  return (
    <UserDataContext.Provider value={value}>
      {children}
    </UserDataContext.Provider>
  );
}

export function useUserData() {
  const context = useContext(UserDataContext);
  if (context === undefined) {
    throw new Error('useUserData must be used within a UserDataProvider');
  }
  return context;
}

// Hook for getting user profile data
export function useUserProfile() {
  const { userProfile, loading, error, refreshUserData } = useUserData();
  return { userProfile, loading, error, refreshUserData };
}

// Hook for getting addresses data
export function useAddresses() {
  const { 
    addresses, 
    loading, 
    error, 
    addAddress, 
    updateAddress, 
    removeAddress, 
    setDefaultAddress,
    refreshUserData 
  } = useUserData();
  
  return { 
    addresses, 
    loading, 
    error, 
    addAddress, 
    updateAddress, 
    removeAddress, 
    setDefaultAddress,
    refreshAddresses: refreshUserData 
  };
}
