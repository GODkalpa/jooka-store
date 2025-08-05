'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/auth/firebase-auth';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';

export default function SignInPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const { user, signInWithPassword } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const messageParam = searchParams.get('message');
  const errorParam = searchParams.get('error');

  useEffect(() => {
    if (messageParam) {
      setMessage(messageParam);
    }
    if (errorParam) {
      setError(errorParam);
    }
  }, [messageParam, errorParam]);

  // Redirect if already authenticated
  useEffect(() => {
    if (user) {
      // Redirect based on user role
      if (user.role === 'admin') {
        router.push('/admin/dashboard');
      } else {
        router.push('/dashboard');
      }
    }
  }, [user, router]);

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    // Clear errors when user starts typing
    if (error) setError('');
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    // Clear errors when user starts typing
    if (error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      setError('Please enter your email address');
      return;
    }

    if (!password) {
      setError('Please enter your password');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    setError('');
    setMessage('');

    try {
      // Sign in with email and password
      const result = await signInWithPassword(email, password);

      if (result.success) {
        // Redirect will be handled by the useEffect hook when user state changes
        setMessage('Signing in...');
      } else {
        setError(result.error || 'Failed to sign in');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };



  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full space-y-8"
      >
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gold mb-2">Welcome Back</h1>
          <p className="text-gold/70">Sign in to your account</p>
        </div>

        {errorParam && (
          <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
            <p className="text-red-400 text-sm">
              {errorParam === 'AdminRequired'
                ? 'Admin access required to view this page'
                : 'Authentication required'
              }
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gold mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gold/50 w-5 h-5" />
              <input
                id="email"
                type="email"
                value={email}
                onChange={handleEmailChange}
                required
                className="w-full pl-12 pr-4 py-3 bg-gold/10 border border-gold/30 rounded-lg text-gold placeholder-gold/50 focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-transparent"
                placeholder="Enter your email"
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gold mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gold/50 w-5 h-5" />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={handlePasswordChange}
                required
                className="w-full pl-12 pr-12 py-3 bg-gold/10 border border-gold/30 rounded-lg text-gold placeholder-gold/50 focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-transparent"
                placeholder="Enter your password"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gold/50 hover:text-gold"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {message && (
            <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4">
              <p className="text-green-400 text-sm">{message}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gold text-black py-3 px-4 rounded-lg font-medium hover:bg-gold/90 focus:outline-none focus:ring-2 focus:ring-gold/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black mr-2"></div>
                Signing In...
              </div>
            ) : (
              <>
                Sign In
                <ArrowRight className="ml-2 w-5 h-5" />
              </>
            )}
          </button>
        </form>

        <div className="text-center">
          <p className="text-gold/70 text-sm">
            Don't have an account?{' '}
            <button
              onClick={() => router.push('/auth/signup')}
              className="text-gold hover:text-gold/80 font-medium"
            >
              Sign up here
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
}