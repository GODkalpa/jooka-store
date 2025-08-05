'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';

const errorMessages: Record<string, string> = {
  Configuration: 'There is a problem with the server configuration.',
  AccessDenied: 'You do not have permission to sign in.',
  Verification: 'The verification token has expired or has already been used.',
  Default: 'An error occurred during authentication.',
  AdminRequired: 'Admin access is required to view this page.',
  EmailNotVerified: 'Please verify your email address before signing in.',
};

export default function AuthErrorPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error') || 'Default';
  const message = errorMessages[error] || errorMessages.Default;

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full text-center space-y-6"
      >
        <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        
        <h1 className="text-2xl font-bold text-white">Authentication Error</h1>
        
        <p className="text-gray-400">{message}</p>
        
        <div className="space-y-3">
          <Link
            href="/auth/signin"
            className="block w-full bg-[#D4AF37] text-black py-2 px-4 rounded-md font-medium hover:bg-[#B8941F] transition-colors"
          >
            Try Again
          </Link>
          
          <Link
            href="/"
            className="block text-gray-400 hover:text-white transition-colors"
          >
            Go Home
          </Link>
        </div>
      </motion.div>
    </div>
  );
}