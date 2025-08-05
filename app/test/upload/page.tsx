'use client';

import { useState } from 'react';

export default function UploadTestPage() {
  const [authStatus, setAuthStatus] = useState<any>(null);
  const [uploadResult, setUploadResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkAuth = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/test/auth-status');
      const data = await response.json();
      setAuthStatus(data);
    } catch (err) {
      setError('Failed to check auth status');
    } finally {
      setLoading(false);
    }
  };

  const testUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setLoading(true);
      setError(null);
      
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('/api/test/upload-test', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Upload failed');
      }
      
      setUploadResult(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setLoading(false);
    }
  };

  const testAuthUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setLoading(true);
      setError(null);
      
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'products');
      
      const response = await fetch('/api/upload/image', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Upload failed');
      }
      
      setUploadResult(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold text-gold">Upload Test Page</h1>
        
        {/* Auth Status */}
        <div className="bg-charcoal p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Authentication Status</h2>
          <button
            onClick={checkAuth}
            disabled={loading}
            className="bg-gold text-black px-4 py-2 rounded mb-4"
          >
            Check Auth Status
          </button>
          {authStatus && (
            <pre className="bg-black p-4 rounded text-sm overflow-auto">
              {JSON.stringify(authStatus, null, 2)}
            </pre>
          )}
        </div>

        {/* Test Upload (No Auth) */}
        <div className="bg-charcoal p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Test Upload (No Auth Required)</h2>
          <input
            type="file"
            accept="image/*"
            onChange={testUpload}
            disabled={loading}
            className="mb-4"
          />
        </div>

        {/* Auth Upload */}
        <div className="bg-charcoal p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Auth Upload (Real Endpoint)</h2>
          <input
            type="file"
            accept="image/*"
            onChange={testAuthUpload}
            disabled={loading}
            className="mb-4"
          />
        </div>

        {/* Results */}
        {error && (
          <div className="bg-red-900/20 border border-red-500 p-4 rounded">
            <h3 className="font-semibold text-red-400">Error:</h3>
            <p className="text-red-300">{error}</p>
          </div>
        )}

        {uploadResult && (
          <div className="bg-green-900/20 border border-green-500 p-4 rounded">
            <h3 className="font-semibold text-green-400">Upload Result:</h3>
            <pre className="bg-black p-4 rounded text-sm overflow-auto mt-2">
              {JSON.stringify(uploadResult, null, 2)}
            </pre>
          </div>
        )}

        {loading && (
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gold"></div>
            <p className="mt-2">Loading...</p>
          </div>
        )}
      </div>
    </div>
  );
}