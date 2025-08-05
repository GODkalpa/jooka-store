'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function VerifiedPage() {
  const router = useRouter();

  useEffect(() => {
    // Auto-redirect to sign in after 5 seconds
    const timer = setTimeout(() => {
      router.push('/auth/signin');
    }, 5000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full text-center space-y-6"
      >
        <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto">
          <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-white">Email Verified!</h1>
          <p className="text-gray-400">
            Your email has been successfully verified. You can now sign in to your account.
          </p>
        </div>

        <div className="space-y-3">
          <Link
            href="/auth/signin"
            className="block w-full bg-[#D4AF37] text-black py-3 px-4 rounded-md font-medium hover:bg-[#B8941F] transition-colors"
          >
            Sign In Now
          </Link>
          
          <p className="text-sm text-gray-500">
            You'll be automatically redirected to sign in in a few seconds...
          </p>
        </div>

        <div className="pt-4 border-t border-gray-800">
          <Link
            href="/"
            className="text-gray-400 hover:text-white transition-colors text-sm"
          >
            ← Back to Home
          </Link>
        </div>
      </motion.div>
    </div>
  );
}