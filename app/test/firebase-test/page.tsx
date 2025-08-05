'use client';

import React, { useState, useEffect } from 'react';
import { getFirebaseAuth, getFirebaseApp } from '@/lib/firebase/config';

export default function FirebaseTestPage() {
  const [status, setStatus] = useState<string>('Testing...');
  const [details, setDetails] = useState<any>({});

  useEffect(() => {
    testFirebaseConfig();
  }, []);

  const testFirebaseConfig = async () => {
    try {
      setStatus('Testing Firebase configuration...');
      
      // Test environment variables
      const envVars = {
        apiKey: !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
        authDomain: !!process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
        projectId: !!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        storageBucket: !!process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: !!process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
        appId: !!process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
      };

      console.log('Environment variables:', envVars);
      setDetails(prev => ({ ...prev, envVars }));

      // Test Firebase app initialization
      const app = getFirebaseApp();
      console.log('Firebase app:', app);
      setDetails(prev => ({ ...prev, app: !!app }));

      // Test Firebase auth initialization
      const auth = getFirebaseAuth();
      console.log('Firebase auth:', auth);
      setDetails(prev => ({ ...prev, auth: !!auth }));

      setStatus('Firebase configuration test completed successfully!');
    } catch (error) {
      console.error('Firebase test error:', error);
      setStatus(`Firebase test failed: ${error}`);
      setDetails(prev => ({ ...prev, error: error instanceof Error ? error.message : 'Unknown error' }));
    }
  };

  const testEmailSend = async () => {
    try {
      setStatus('Testing email send...');
      
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fullName: 'Test User',
          email: 'test@example.com',
          phone: '9800000000',
          password: 'TestPassword123!',
          confirmPassword: 'TestPassword123!'
        }),
      });

      const result = await response.json();
      console.log('Email test result:', result);
      
      if (response.ok) {
        setStatus('Email test completed successfully!');
      } else {
        setStatus(`Email test failed: ${result.error}`);
      }
      
      setDetails(prev => ({ ...prev, emailTest: result }));
    } catch (error) {
      console.error('Email test error:', error);
      setStatus(`Email test failed: ${error}`);
      setDetails(prev => ({ ...prev, emailTestError: error instanceof Error ? error.message : 'Unknown error' }));
    }
  };

  return (
    <div className="min-h-screen bg-black text-gold p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Firebase Configuration Test</h1>
        
        <div className="bg-gold/10 border border-gold/30 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Status</h2>
          <p className="text-lg">{status}</p>
        </div>

        <div className="bg-gold/10 border border-gold/30 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Test Details</h2>
          <pre className="text-sm overflow-auto">
            {JSON.stringify(details, null, 2)}
          </pre>
        </div>

        <div className="space-y-4">
          <button
            onClick={testFirebaseConfig}
            className="bg-gold text-black px-6 py-3 rounded-lg font-medium hover:bg-gold/90"
          >
            Test Firebase Config
          </button>
          
          <button
            onClick={testEmailSend}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 ml-4"
          >
            Test Email Send
          </button>
        </div>

        <div className="mt-8 bg-gold/10 border border-gold/30 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Environment Variables Check</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>NEXT_PUBLIC_FIREBASE_API_KEY: {process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? '✅ Set' : '❌ Missing'}</div>
            <div>NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: {process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ? '✅ Set' : '❌ Missing'}</div>
            <div>NEXT_PUBLIC_FIREBASE_PROJECT_ID: {process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ? '✅ Set' : '❌ Missing'}</div>
            <div>NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: {process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ? '✅ Set' : '❌ Missing'}</div>
            <div>NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: {process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ? '✅ Set' : '❌ Missing'}</div>
            <div>NEXT_PUBLIC_FIREBASE_APP_ID: {process.env.NEXT_PUBLIC_FIREBASE_APP_ID ? '✅ Set' : '❌ Missing'}</div>
          </div>
        </div>
      </div>
    </div>
  );
}