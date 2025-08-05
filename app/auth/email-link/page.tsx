'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { verifyOTPAndSignIn } from '@/lib/firebase/auth';
import { useAuth } from '@/lib/auth/firebase-auth';

function EmailLinkVerificationContent() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isVerified, setIsVerified] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isLoading: authLoading } = useAuth();

  useEffect(() => {
    const verifyEmailLink = async () => {
      try {
        setIsLoading(true);
        
        // Get email from URL params, localStorage, or admin setup
        let email = searchParams.get('email');
        
        if (!email && typeof window !== 'undefined') {
          // Try regular email sign-in storage
          email = localStorage.getItem('emailForSignIn');
          
          // If not found, try admin setup email
          if (!email) {
            email = localStorage.getItem('adminSetupEmail');
          }
        }

        console.log('URL search params:', Object.fromEntries(searchParams.entries()));
        console.log('Email from URL params:', searchParams.get('email'));
        console.log('Email from localStorage (emailForSignIn):', typeof window !== 'undefined' ? localStorage.getItem('emailForSignIn') : null);
        console.log('Email from localStorage (adminSetupEmail):', typeof window !== 'undefined' ? localStorage.getItem('adminSetupEmail') : null);
        console.log('Final email to use:', email);
        console.log('Current URL:', typeof window !== 'undefined' ? window.location.href : 'server-side');
        
        const result = await verifyOTPAndSignIn(email || undefined);

        if (result.success) {
          setSuccess(true);
          setIsVerified(true);

          // Clean up localStorage items
          if (typeof window !== 'undefined') {
            localStorage.removeItem('emailForSignIn');
            localStorage.removeItem('adminSetupEmail');
          }
        } else {
          setError(result.error || 'Failed to verify email link');
        }
      } catch (error) {
        console.error('Email link verification error:', error);
        setError('Failed to verify email link. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    verifyEmailLink();
  }, [router, searchParams]);

  // Handle redirect after user data is loaded
  useEffect(() => {
    if (isVerified && user && !authLoading) {
      setTimeout(() => {
        if (user.role === 'admin') {
          router.push('/admin/dashboard');
        } else {
          router.push('/dashboard');
        }
      }, 2000);
    }
  }, [isVerified, user, authLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full text-center"
        >
          <div className="w-16 h-16 bg-[#D4AF37] rounded-full flex items-center justify-center mx-auto mb-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Verifying Your Email</h1>
          <p className="text-gray-400">Please wait while we verify your email link...</p>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full text-center"
        >
          <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Verification Failed</h1>
          <p className="text-gray-400 mb-6">{error}</p>
          <button
            onClick={() => router.push('/auth/signin')}
            className="bg-[#D4AF37] text-black py-2 px-6 rounded-md font-medium hover:bg-[#B8941F] transition-colors"
          >
            Back to Sign In
          </button>
        </motion.div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full text-center"
        >
          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Email Verified!</h1>
          <p className="text-gray-400 mb-6">Your email has been successfully verified. Redirecting you to your dashboard...</p>
          <div className="animate-pulse text-[#D4AF37]">Redirecting...</div>
        </motion.div>
      </div>
    );
  }

  return null;
}

function LoadingSpinner() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D4AF37]"></div>
    </div>
  );
}

export default function EmailLinkVerificationPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <EmailLinkVerificationContent />
    </Suspense>
  );
}