'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { RefreshCw } from 'lucide-react';

function VerifyOTPContent() {
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

        setError('');
        setMessage('Account verified successfully! Redirecting to sign in...');

        setTimeout(() => {
          router.push('/auth/signin?message=Account created successfully! Please sign in with your credentials.');
        }, 1800);
      } else {
        // Handle sign-in OTP verification
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

      setResendCooldown(60);
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();

    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to resend code');
    } finally {
      setIsResending(false);
    }
  };

  if (!email) {
    return null;
  }

  return (
    <div className="py-12 sm:py-20 px-4 flex items-center justify-center font-sans text-gray-900">
      <div className="w-full max-w-md bg-white border border-gray-200 rounded-2xl p-8 shadow-sm space-y-6">
        <div className="text-center space-y-1">
          <span className="inline-block bg-[#C8102E] text-white text-[10px] font-bold uppercase px-3 py-1 rounded-full tracking-widest mb-1">
            Verification
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900">
            Check Your Email
          </h1>
          <p className="text-xs text-gray-500">
            We sent a 6-digit verification code to
          </p>
          <p className="text-xs font-mono font-bold text-gray-900 mt-1">{email}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-xs text-red-700 font-medium">
              {error}
            </div>
          )}

          {message && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-xs text-emerald-700 font-medium">
              {message}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-3 text-center">
              Enter 6-Digit Code
            </label>
            <div className="flex justify-center gap-2 sm:gap-3">
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
                  className="w-10 h-12 sm:w-12 sm:h-14 text-center text-xl font-mono font-bold bg-white border border-gray-300 rounded-lg text-gray-900 focus:border-gray-900 focus:ring-1 focus:ring-gray-900 outline-none transition-all"
                />
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || otp.join('').length !== 6}
            className="w-full py-3 bg-gray-900 hover:bg-[#C8102E] text-white text-xs font-semibold uppercase tracking-wider rounded-lg transition-colors shadow-xs flex items-center justify-center space-x-2 border border-gray-900 hover:border-[#C8102E] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Verifying...</span>
              </div>
            ) : (
              <span>Verify Code</span>
            )}
          </button>
        </form>

        <div className="text-center space-y-3 pt-3 border-t border-gray-100">
          <div className="flex items-center justify-center space-x-2 text-xs text-gray-600">
            <span>Didn't receive code?</span>
            <button
              onClick={handleResendCode}
              disabled={isResending || resendCooldown > 0}
              className="font-bold text-gray-900 hover:text-[#C8102E] hover:underline inline-flex items-center gap-1 disabled:opacity-50 disabled:no-underline"
            >
              {isResending ? (
                <>
                  <RefreshCw className="w-3 h-3 animate-spin" /> Sending...
                </>
              ) : resendCooldown > 0 ? (
                `Resend in ${resendCooldown}s`
              ) : (
                'Resend Code'
              )}
            </button>
          </div>

          <div>
            <Link
              href="/auth/signup"
              className="text-xs text-gray-500 hover:text-gray-900 transition-colors"
            >
              ← Back to Sign Up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function LoadingSpinner() {
  return (
    <div className="py-20 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-gray-900 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
}

export default function VerifyOTPPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <VerifyOTPContent />
    </Suspense>
  );
}