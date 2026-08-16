'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth/firebase-auth';

export default function AuthDebugPage() {
  const { user, firebaseUser, isLoading, isAuthenticated, isAdmin } = useAuth();
  const [tokenInfo, setTokenInfo] = useState<any>(null);

  useEffect(() => {
    if (firebaseUser && typeof firebaseUser.getIdToken === 'function') {
      firebaseUser.getIdToken().then((token: string) => {
        setTokenInfo({
          token: token.substring(0, 50) + '...',
          uid: firebaseUser.uid,
          email: firebaseUser.email,
        });
      }).catch((err: any) => {
        setTokenInfo({ error: err.message });
      });
    }
  }, [firebaseUser]);

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-gold">Authentication Debug</h1>
        <div className="bg-charcoal p-6 rounded-lg border border-gold/20 space-y-2 text-sm">
          <p><strong>Loading:</strong> {isLoading ? 'Yes' : 'No'}</p>
          <p><strong>Authenticated:</strong> {isAuthenticated ? 'Yes' : 'No'}</p>
          <p><strong>Is Admin:</strong> {isAdmin ? 'Yes' : 'No'}</p>
          <p><strong>User Role:</strong> {user?.role || 'None'}</p>
          <p><strong>User Email:</strong> {user?.email || 'None'}</p>
        </div>
      </div>
    </div>
  );
}