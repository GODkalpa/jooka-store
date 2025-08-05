'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/auth/firebase-auth';
import { motion } from 'framer-motion';

export default function VerifyPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  const { verifyOTP, user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const handleVerification = async () => {
      try {
        // Check if this is a sign-in link
        const url = window.location.href;
        if (url.includes('apiKey') && url.includes('oobCode')) {
          const result = await verifyOTP();

          if (result.success) {
            // Check if this is a new registration with pending data
            const pendingRegistration = localStorage.getItem('pendingRegistration');

            if (pendingRegistration) {
              try {
                const registrationData = JSON.parse(pendingRegistration);

                // Create user profile with the registration data
                const response = await fetch('/api/user/complete-registration', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify(registrationData),
                });

                if (response.ok) {
                  localStorage.removeItem('pendingRegistration');
                  setSuccess(true);
                  // Redirect to dashboard after successful profile creation
                  setTimeout(() => {
                    router.push('/dashboard');
                  }, 2000);
                } else {
                  const errorData = await response.json();
                  setError(errorData.error || 'Failed to complete registration');
                }
              } catch (profileError) {
                console.error('Profile creation error:', profileError);
                setError('Failed to complete registration. Please contact support.');
              }
            } else {
              // Regular sign-in without registration data
              setSuccess(true);
              setTimeout(() => {
                // Will be handled by the user redirect effect below
              }, 2000);
            }
          } else {
            setError(result.error || 'Failed to verify sign-in link');
          }
        } else {
          setError('Invalid sign-in link');
        }
      } catch (err) {
        setError('An unexpected error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    handleVerification();
  }, [verifyOTP, router]);

  // If user is already authenticated, redirect based on role
  useEffect(() => {
    if (user && !isLoading) {
      if (user.role === 'admin') {
        router.push('/admin/dashboard');
      } else {
        router.push('/dashboard');
      }
    }
  }, [user, isLoading, router]);

  const handleResendLink = () => {
    router.push('/auth/signin');
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full space-y-8 text-center"
      >
        <div>
          <h1 className="text-4xl font-bold text-gold mb-2">
            {isLoading ? 'Verifying...' : success ? 'Welcome!' : 'Verification Failed'}
          </h1>
          <p className="text-gold/70">
            {isLoading 
              ? 'Please wait while we verify your sign-in link'
              : success 
                ? 'You have been successfully signed in'
                : 'There was a problem with your sign-in link'
            }
          </p>
        </div>

        {isLoading && (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold"></div>
          </div>
        )}

        {success && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="bg-green-900/20 border border-green-500/30 rounded-lg p-6"
          >
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-green-400 text-lg font-medium">Sign-in successful!</p>
            <p className="text-green-400/70 text-sm mt-2">Redirecting to your dashboard...</p>
          </motion.div>
        )}

        {error && (
          <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-6">
            <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <p className="text-red-400 text-lg font-medium mb-2">Verification Failed</p>
            <p className="text-red-400/70 text-sm mb-4">{error}</p>
            
            <button
              onClick={handleResendLink}
              className="bg-gold text-black py-2 px-6 rounded-lg font-medium hover:bg-gold/90 transition-colors"
            >
              Get New Sign-In Link
            </button>
          </div>
        )}

        {!isLoading && !success && !error && (
          <div className="bg-gold/10 border border-gold/30 rounded-lg p-6">
            <p className="text-gold text-lg font-medium mb-2">Check Your Email</p>
            <p className="text-gold/70 text-sm mb-4">
              We've sent you a secure sign-in link. Click the link in your email to continue.
            </p>
            
            <button
              onClick={handleResendLink}
              className="text-gold hover:text-gold/80 font-medium text-sm"
            >
              Need a new link? Click here
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
