'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth/firebase-auth';
import { api, ApiError } from '@/lib/api/client';

export default function AuthDebugPage() {
  const { user, firebaseUser, isLoading, isAuthenticated, isAdmin } = useAuth();
  const [tokenInfo, setTokenInfo] = useState<any>(null);
  const [apiTestResult, setApiTestResult] = useState<string>('');

  useEffect(() => {
    if (firebaseUser) {
      firebaseUser.getIdToken().then(token => {
        setTokenInfo({
          token: token.substring(0, 50) + '...',
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          emailVerified: firebaseUser.emailVerified
        });
      }).catch(err => {
        setTokenInfo({ error: err.message });
      });
    }
  }, [firebaseUser]);

  const testApiCall = async () => {
    try {
      setApiTestResult('Testing API call...');
      const result = await api.get('/api/admin/users');
      setApiTestResult(`✅ Success: ${JSON.stringify(result, null, 2)}`);
    } catch (error) {
      if (error instanceof ApiError) {
        setApiTestResult(`❌ API Error: ${error.message} (Status: ${error.status})`);
      } else {
        setApiTestResult(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
  };

  const testDeleteUser = async () => {
    try {
      setApiTestResult('Testing delete user API call...');
      // Use a fake user ID for testing
      const result = await api.delete('/api/admin/users/test-user-id');
      setApiTestResult(`✅ Delete Success: ${JSON.stringify(result, null, 2)}`);
    } catch (error) {
      if (error instanceof ApiError) {
        setApiTestResult(`❌ Delete API Error: ${error.message} (Status: ${error.status})`);
      } else {
        setApiTestResult(`❌ Delete Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gold mb-8">Authentication Debug</h1>
        
        <div className="space-y-6">
          {/* Auth State */}
          <div className="bg-charcoal p-6 rounded-lg border border-gold/20">
            <h2 className="text-xl font-bold text-gold mb-4">Auth State</h2>
            <div className="space-y-2 text-sm">
              <p><strong>Loading:</strong> {isLoading ? 'Yes' : 'No'}</p>
              <p><strong>Authenticated:</strong> {isAuthenticated ? 'Yes' : 'No'}</p>
              <p><strong>Is Admin:</strong> {isAdmin ? 'Yes' : 'No'}</p>
              <p><strong>User Role:</strong> {user?.role || 'None'}</p>
              <p><strong>User Email:</strong> {user?.email || 'None'}</p>
              <p><strong>User ID:</strong> {user?.id || 'None'}</p>
            </div>
          </div>

          {/* Firebase User */}
          <div className="bg-charcoal p-6 rounded-lg border border-gold/20">
            <h2 className="text-xl font-bold text-gold mb-4">Firebase User</h2>
            <div className="space-y-2 text-sm">
              <p><strong>Firebase User:</strong> {firebaseUser ? 'Present' : 'None'}</p>
              <p><strong>Firebase UID:</strong> {firebaseUser?.uid || 'None'}</p>
              <p><strong>Firebase Email:</strong> {firebaseUser?.email || 'None'}</p>
              <p><strong>Email Verified:</strong> {firebaseUser?.emailVerified ? 'Yes' : 'No'}</p>
            </div>
          </div>

          {/* Token Info */}
          <div className="bg-charcoal p-6 rounded-lg border border-gold/20">
            <h2 className="text-xl font-bold text-gold mb-4">Token Info</h2>
            <pre className="text-xs bg-black p-4 rounded overflow-auto">
              {JSON.stringify(tokenInfo, null, 2)}
            </pre>
          </div>

          {/* API Test */}
          <div className="bg-charcoal p-6 rounded-lg border border-gold/20">
            <h2 className="text-xl font-bold text-gold mb-4">API Test</h2>
            <div className="space-y-4">
              <div className="flex space-x-4">
                <button
                  onClick={testApiCall}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
                >
                  Test Get Users API
                </button>
                <button
                  onClick={testDeleteUser}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded"
                >
                  Test Delete User API
                </button>
              </div>
              {apiTestResult && (
                <pre className="text-xs bg-black p-4 rounded overflow-auto whitespace-pre-wrap">
                  {apiTestResult}
                </pre>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}