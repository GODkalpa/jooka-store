'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

export default function VerifyRequestPage() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full text-center space-y-6"
      >
        <div className="w-16 h-16 bg-[#D4AF37] rounded-full flex items-center justify-center mx-auto">
          <svg className="w-8 h-8 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        
        <h1 className="text-2xl font-bold text-white">Check Your Email</h1>
        
        <p className="text-gray-400">
          A sign in link has been sent to your email address. Please check your inbox and click the link to continue.
        </p>
        
        <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
          <p className="text-sm text-gray-300">
            <strong>Didn't receive the email?</strong>
          </p>
          <ul className="text-sm text-gray-400 mt-2 space-y-1">
            <li>• Check your spam or junk folder</li>
            <li>• Make sure you entered the correct email address</li>
            <li>• Wait a few minutes for the email to arrive</li>
          </ul>
        </div>
        
        <Link
          href="/auth/signin"
          className="inline-block text-[#D4AF37] hover:text-[#B8941F] transition-colors"
        >
          Back to Sign In
        </Link>
      </motion.div>
    </div>
  );
}