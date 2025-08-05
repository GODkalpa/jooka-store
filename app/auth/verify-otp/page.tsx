'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function VerifyOTPPage() {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isResending, setIsResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email');
  const type = searchParams.get('type'); // 'registration' or 'signin'

  useEffect(() => {
    if (!email) {
      router.push('/auth/signup');
      return;
    }
  }, [email, router]);

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    const newOtp = [...otp];

    for (let i = 0; i < pastedData.length && i < 6; i++) {
      if (/^\d$/.test(pastedData[i])) {
        newOtp[i] = pastedData[i];
      }
    }

    setOtp(newOtp);

    // Focus the next empty input or the last input
    const nextEmptyIndex = newOtp.findIndex(digit => digit === '');
    const focusIndex = nextEmptyIndex === -1 ? 5 : nextEmptyIndex;
    inputRefs.current[focusIndex]?.focus();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpCode = otp.join('');

    if (otpCode.length !== 6) {
      setError('Please enter the complete 6-digit code');
      return;
    }

    setIsLoading(true);
    setError('');
    setMessage('');

    try {
      if (type === 'registration') {
        // Handle registration OTP verification with Firebase
        const response = await fetch('/api/verify-otp', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email,
            otpCode,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Verification failed');
        }

        // Registration successful - now we need to sign in the user on the client side
        // The user was created on the server, but we need to authenticate them on the client
        setError('');
        setMessage('Account created successfully! Redirecting to sign in...');

        // Redirect to sign-in page with success message
        setTimeout(() => {
          router.push('/auth/signin?message=Account created successfully! Please sign in with your credentials.');
        }, 2000);
      } else {
        // Handle sign-in OTP verification (existing flow)
        const response = await fetch('/api/auth/verify-otp-custom', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email,
            token: otpCode,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Verification failed');
        }

        // Redirect to success page
        router.push('/auth/verified');
      }

    } catch (error) {
      setError(error instanceof Error ? error.message : 'Verification failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (resendCooldown > 0) return;

    setIsResending(true);
    setError('');

    try {
      const response = await fetch('/api/verify-otp', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to resend code');
      }

      setResendCooldown(60); // 60 second cooldown
      setOtp(['', '', '', '', '', '']); // Clear current OTP
      inputRefs.current[0]?.focus(); // Focus first input

    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to resend code');
    } finally {
      setIsResending(false);
    }
  };

  if (!email) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full space-y-8"
      >
        <div className="text-center">
          <div className="w-16 h-16 bg-[#D4AF37] rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Check Your Email</h1>
          <p className="text-gray-400 mb-2">
            We've sent a verification code to
          </p>
          <p className="text-[#D4AF37] font-medium">{email}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-900/20 border border-red-500 text-red-400 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {message && (
            <div className="bg-green-900/20 border border-green-500 text-green-400 px-4 py-3 rounded">
              {message}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-4 text-center">
              Enter the 6-digit code from your email
            </label>
            <div className="flex justify-center space-x-3">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => { inputRefs.current[index] = el; }}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={handlePaste}
                  className="w-12 h-12 text-center text-xl font-bold bg-gray-900 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent"
                />
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || otp.join('').length !== 6}
            className="w-full bg-[#D4AF37] text-black py-3 px-4 rounded-md font-medium hover:bg-[#B8941F] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Verifying...' : 'Verify Email'}
          </button>
        </form>

        <div className="text-center space-y-4">
          <div className="bg-blue-900/20 border border-blue-500 text-blue-400 px-4 py-3 rounded text-sm">
            <p className="font-medium mb-1">Received a link instead of a code?</p>
            <p>Click the link in your email to verify your account, or request a new code below.</p>
          </div>

          <p className="text-gray-400">
            Didn't receive the code?
          </p>

          <button
            onClick={handleResendCode}
            disabled={isResending || resendCooldown > 0}
            className="text-[#D4AF37] hover:text-[#B8941F] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isResending
              ? 'Sending...'
              : resendCooldown > 0
                ? `Resend in ${resendCooldown}s`
                : 'Resend Code'
            }
          </button>

          <div className="pt-4 border-t border-gray-800">
            <Link
              href="/auth/signup"
              className="text-gray-400 hover:text-white transition-colors text-sm"
            >
              ← Back to Sign Up
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}