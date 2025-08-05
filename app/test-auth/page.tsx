'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth/firebase-auth';

export default function TestAuthPage() {
  const { user, firebaseUser, isLoading, isAuthenticated } = useAuth();
  const [tokenInfo, setTokenInfo] = useState<any>(null);
  const [apiTestResult, setApiTestResult] = useState<any>(null);

  const testApiCall = async () => {
    if (!firebaseUser) {
      setApiTestResult({ error: 'No Firebase user' });
      return;
    }

    try {
      // Get ID token
      const token = await firebaseUser.getIdToken();
      console.log('ID Token:', token);
      
      setTokenInfo({
        tokenLength: token.length,
        tokenStart: token.substring(0, 50) + '...',
        uid: firebaseUser.uid,
        email: firebaseUser.email
      });

      // Test API call
      const response = await fetch('/api/customer/dashboard', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();
      setApiTestResult({
        status: response.status,
        ok: response.ok,
        data: result
      });
    } catch (error) {
      setApiTestResult({
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gold mb-8">Authentication Test Page</h1>
        
        <div className="space-y-6">
          {/* Auth State */}
          <div className="bg-charcoal p-6 rounded-lg border border-gold/20">
            <h2 className="text-xl font-semibold text-gold mb-4">Authentication State</h2>
            <div className="space-y-2 text-sm">
              <p><strong>Loading:</strong> {isLoading ? 'Yes' : 'No'}</p>
              <p><strong>Authenticated:</strong> {isAuthenticated ? 'Yes' : 'No'}</p>
              <p><strong>Firebase User:</strong> {firebaseUser ? 'Present' : 'None'}</p>
              <p><strong>Database User:</strong> {user ? 'Present' : 'None'}</p>
              
              {firebaseUser && (
                <div className="mt-4 p-4 bg-black/50 rounded">
                  <h3 className="font-semibold text-gold">Firebase User Details:</h3>
                  <p><strong>UID:</strong> {firebaseUser.uid}</p>
                  <p><strong>Email:</strong> {firebaseUser.email}</p>
                  <p><strong>Email Verified:</strong> {firebaseUser.emailVerified ? 'Yes' : 'No'}</p>
                </div>
              )}
              
              {user && (
                <div className="mt-4 p-4 bg-black/50 rounded">
                  <h3 className="font-semibold text-gold">Database User Details:</h3>
                  <pre className="text-xs overflow-auto">
                    {JSON.stringify(user, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>

          {/* Token Test */}
          {firebaseUser && (
            <div className="bg-charcoal p-6 rounded-lg border border-gold/20">
              <h2 className="text-xl font-semibold text-gold mb-4">Token Test</h2>
              <button
                onClick={testApiCall}
                className="bg-gold text-black px-4 py-2 rounded hover:bg-gold/80 transition-colors"
              >
                Test API Call
              </button>
              
              {tokenInfo && (
                <div className="mt-4 p-4 bg-black/50 rounded">
                  <h3 className="font-semibold text-gold">Token Info:</h3>
                  <p><strong>Token Length:</strong> {tokenInfo.tokenLength}</p>
                  <p><strong>Token Start:</strong> {tokenInfo.tokenStart}</p>
                  <p><strong>UID:</strong> {tokenInfo.uid}</p>
                  <p><strong>Email:</strong> {tokenInfo.email}</p>
                </div>
              )}
              
              {apiTestResult && (
                <div className="mt-4 p-4 bg-black/50 rounded">
                  <h3 className="font-semibold text-gold">API Test Result:</h3>
                  <pre className="text-xs overflow-auto">
                    {JSON.stringify(apiTestResult, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}

          {/* Instructions */}
          <div className="bg-charcoal p-6 rounded-lg border border-gold/20">
            <h2 className="text-xl font-semibold text-gold mb-4">Instructions</h2>
            <div className="space-y-2 text-sm">
              <p>1. If you're not authenticated, go to <a href="/auth/signin" className="text-gold hover:underline">/auth/signin</a> to sign in</p>
              <p>2. If you are authenticated, click "Test API Call" to test the dashboard API</p>
              <p>3. Check the browser console for additional debug information</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
