'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Mail, Shield, CheckCircle, AlertCircle } from 'lucide-react';

export default function AdminSetupPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [step, setStep] = useState<'email' | 'instructions' | 'complete'>('email');
  
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    setError('');
    setMessage('');

    try {
      // Call the setup-admin API
      const response = await fetch('/api/setup-admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const result = await response.json();

      if (response.ok) {
        // Store admin setup flag in localStorage
        if (result.isAdminSetup) {
          localStorage.setItem('adminSetupEmail', email);
        }
        setMessage(result.message);
        setStep('instructions');
      } else {
        setError(result.error || 'Failed to setup admin account');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignInRedirect = () => {
    router.push('/auth/signin');
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full space-y-8"
      >
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <Shield className="w-16 h-16 text-gold" />
          </div>
          <h1 className="text-4xl font-bold text-gold mb-2">Admin Setup</h1>
          <p className="text-gold/70">Set up your first admin account for JOOKA</p>
        </div>

        {step === 'email' && (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gold mb-2">
                Admin Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gold/50 w-5 h-5" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-12 pr-4 py-3 bg-gold/10 border border-gold/30 rounded-lg text-gold placeholder-gold/50 focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-transparent"
                  placeholder="Enter your admin email"
                  disabled={isLoading}
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4 flex items-start">
                <AlertCircle className="w-5 h-5 text-red-400 mr-2 mt-0.5 flex-shrink-0" />
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gold text-black py-3 px-4 rounded-lg font-medium hover:bg-gold/90 focus:outline-none focus:ring-2 focus:ring-gold/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black mr-2"></div>
                  Setting up admin...
                </div>
              ) : (
                'Setup Admin Account'
              )}
            </button>
          </form>
        )}

        {step === 'instructions' && (
          <div className="space-y-6">
            <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4 flex items-start">
              <CheckCircle className="w-5 h-5 text-green-400 mr-2 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-green-400 text-sm font-medium mb-2">Setup initiated successfully!</p>
                <p className="text-green-400/80 text-sm">{message}</p>
              </div>
            </div>

            <div className="bg-gold/10 border border-gold/30 rounded-lg p-4">
              <h3 className="text-gold font-medium mb-3">Next Steps:</h3>
              <ol className="text-gold/80 text-sm space-y-2">
                <li className="flex items-start">
                  <span className="bg-gold text-black rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mr-2 mt-0.5 flex-shrink-0">1</span>
                  Check your email ({email}) for the verification link
                </li>
                <li className="flex items-start">
                  <span className="bg-gold text-black rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mr-2 mt-0.5 flex-shrink-0">2</span>
                  Click the "Sign in to project-..." link in the email
                </li>
                <li className="flex items-start">
                  <span className="bg-gold text-black rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mr-2 mt-0.5 flex-shrink-0">3</span>
                  You'll be automatically signed in with admin privileges
                </li>
                <li className="flex items-start">
                  <span className="bg-gold text-black rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mr-2 mt-0.5 flex-shrink-0">4</span>
                  You'll be redirected to the admin dashboard
                </li>
              </ol>
            </div>

            <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
              <p className="text-blue-400 text-sm">
                <strong>Note:</strong> The email link will automatically verify your account and sign you in. 
                No need to enter any codes manually.
              </p>
            </div>
          </div>
        )}

        <div className="text-center">
          <p className="text-gold/50 text-xs">
            This page is only available for setting up the first admin account.
            Once an admin exists, use the regular sign-in process.
          </p>
        </div>

        <div className="text-center">
          <button
            onClick={() => router.push('/')}
            className="text-gold/70 hover:text-gold text-sm"
          >
            ← Back to Home
          </button>
        </div>
      </motion.div>
    </div>
  );
}