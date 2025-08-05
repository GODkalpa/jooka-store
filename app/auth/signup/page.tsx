'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Eye, EyeOff, User, Mail, Phone, Lock, CheckCircle, XCircle } from 'lucide-react';
import { validateUserRegistration } from '@/lib/validation/schemas';
import type { RegistrationFormData } from '@/types/firebase';

export default function SignUpPage() {
  const [formData, setFormData] = useState<RegistrationFormData>({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [passwordStrength, setPasswordStrength] = useState<{
    score: number;
    feedback: string[];
  }>({ score: 0, feedback: [] });

  const router = useRouter();

  // Password strength checker
  const checkPasswordStrength = (password: string) => {
    const feedback = [];
    let score = 0;

    if (password.length >= 8) {
      score += 1;
    } else {
      feedback.push('At least 8 characters');
    }

    if (/[A-Z]/.test(password)) {
      score += 1;
    } else {
      feedback.push('One uppercase letter');
    }

    if (/[a-z]/.test(password)) {
      score += 1;
    } else {
      feedback.push('One lowercase letter');
    }

    if (/[0-9]/.test(password)) {
      score += 1;
    } else {
      feedback.push('One number');
    }

    if (/[^A-Za-z0-9]/.test(password)) {
      score += 1;
    } else {
      feedback.push('One special character');
    }

    return { score, feedback };
  };

  // Handle input changes
  const handleInputChange = (field: keyof RegistrationFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // Clear field-specific errors
    if (fieldErrors[field]) {
      setFieldErrors(prev => ({ ...prev, [field]: '' }));
    }

    // Check password strength
    if (field === 'password') {
      setPasswordStrength(checkPasswordStrength(value));
    }
  };

  // Validate form
  const validateForm = () => {
    const validation = validateUserRegistration(formData);

    if (!validation.success) {
      const errors: Record<string, string> = {};
      validation.error.errors.forEach(err => {
        const field = err.path[0] as string;
        errors[field] = err.message;
      });
      setFieldErrors(errors);
      return false;
    }

    setFieldErrors({});
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      setError('Please fix the errors above');
      return;
    }

    setIsLoading(true);
    setError('');
    setMessage('');

    try {
      // Send OTP for registration using the correct API endpoint
      const response = await fetch('/api/register-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
          confirmPassword: formData.confirmPassword
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Verification code sent! Please check your email for the 6-digit code.');

        setTimeout(() => {
          router.push(`/auth/verify-otp?email=${encodeURIComponent(formData.email)}&type=registration`);
        }, 1500);
      } else {
        setError(data.error || 'Failed to send verification code');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
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
          <h1 className="text-4xl font-bold text-gold mb-2">Join JOOKA</h1>
          <p className="text-gold/70">Create your account to start shopping</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Full Name */}
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-gold mb-2">
              Full Name *
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gold/50 w-5 h-5" />
              <input
                id="fullName"
                type="text"
                value={formData.fullName}
                onChange={(e) => handleInputChange('fullName', e.target.value)}
                required
                className={`w-full pl-12 pr-4 py-3 bg-gold/10 border rounded-lg text-gold placeholder-gold/50 focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-transparent ${
                  fieldErrors.fullName ? 'border-red-500' : 'border-gold/30'
                }`}
                placeholder="Enter your full name"
                disabled={isLoading}
              />
            </div>
            {fieldErrors.fullName && (
              <p className="text-red-400 text-sm mt-1">{fieldErrors.fullName}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gold mb-2">
              Email Address *
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gold/50 w-5 h-5" />
              <input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                required
                className={`w-full pl-12 pr-4 py-3 bg-gold/10 border rounded-lg text-gold placeholder-gold/50 focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-transparent ${
                  fieldErrors.email ? 'border-red-500' : 'border-gold/30'
                }`}
                placeholder="Enter your email"
                disabled={isLoading}
              />
            </div>
            {fieldErrors.email && (
              <p className="text-red-400 text-sm mt-1">{fieldErrors.email}</p>
            )}
          </div>

          {/* Phone Number */}
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gold mb-2">
              Phone Number *
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gold/50 w-5 h-5" />
              <div className="flex">
                <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-gold/30 bg-gold/5 text-gold/70 text-sm">
                  +977
                </span>
                <input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  required
                  className={`flex-1 pl-3 pr-4 py-3 bg-gold/10 border rounded-r-lg text-gold placeholder-gold/50 focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-transparent ${
                    fieldErrors.phone ? 'border-red-500' : 'border-gold/30'
                  }`}
                  placeholder="98XXXXXXXX"
                  maxLength={10}
                  disabled={isLoading}
                />
              </div>
            </div>
            {fieldErrors.phone && (
              <p className="text-red-400 text-sm mt-1">{fieldErrors.phone}</p>
            )}
            <p className="text-gold/50 text-xs mt-1">Enter 10-digit Nepal mobile number</p>
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gold mb-2">
              Password *
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gold/50 w-5 h-5" />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                required
                className={`w-full pl-12 pr-12 py-3 bg-gold/10 border rounded-lg text-gold placeholder-gold/50 focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-transparent ${
                  fieldErrors.password ? 'border-red-500' : 'border-gold/30'
                }`}
                placeholder="Create a strong password"
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
            {fieldErrors.password && (
              <p className="text-red-400 text-sm mt-1">{fieldErrors.password}</p>
            )}

            {/* Password Strength Indicator */}
            {formData.password && (
              <div className="mt-2">
                <div className="flex items-center space-x-2">
                  <div className="flex-1 bg-gray-700 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${
                        passwordStrength.score <= 2 ? 'bg-red-500' :
                        passwordStrength.score <= 3 ? 'bg-yellow-500' :
                        'bg-green-500'
                      }`}
                      style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                    />
                  </div>
                  <span className={`text-xs ${
                    passwordStrength.score <= 2 ? 'text-red-400' :
                    passwordStrength.score <= 3 ? 'text-yellow-400' :
                    'text-green-400'
                  }`}>
                    {passwordStrength.score <= 2 ? 'Weak' :
                     passwordStrength.score <= 3 ? 'Medium' :
                     'Strong'}
                  </span>
                </div>
                {passwordStrength.feedback.length > 0 && (
                  <div className="mt-1">
                    <p className="text-xs text-gold/50">Password needs:</p>
                    <ul className="text-xs text-gold/50 ml-2">
                      {passwordStrength.feedback.map((item, index) => (
                        <li key={index}>• {item}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gold mb-2">
              Confirm Password *
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gold/50 w-5 h-5" />
              <input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                required
                className={`w-full pl-12 pr-12 py-3 bg-gold/10 border rounded-lg text-gold placeholder-gold/50 focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-transparent ${
                  fieldErrors.confirmPassword ? 'border-red-500' : 'border-gold/30'
                }`}
                placeholder="Confirm your password"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gold/50 hover:text-gold"
              >
                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {fieldErrors.confirmPassword && (
              <p className="text-red-400 text-sm mt-1">{fieldErrors.confirmPassword}</p>
            )}
            {formData.confirmPassword && formData.password !== formData.confirmPassword && (
              <div className="flex items-center mt-1">
                <XCircle className="w-4 h-4 text-red-400 mr-1" />
                <p className="text-red-400 text-sm">Passwords don't match</p>
              </div>
            )}
            {formData.confirmPassword && formData.password === formData.confirmPassword && formData.password && (
              <div className="flex items-center mt-1">
                <CheckCircle className="w-4 h-4 text-green-400 mr-1" />
                <p className="text-green-400 text-sm">Passwords match</p>
              </div>
            )}
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
            disabled={isLoading || passwordStrength.score < 3}
            className="w-full bg-gold text-black py-3 px-4 rounded-lg font-medium hover:bg-gold/90 focus:outline-none focus:ring-2 focus:ring-gold/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black mr-2"></div>
                Creating Account...
              </div>
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        <div className="text-center">
          <p className="text-gold/70 text-sm">
            We'll send you a verification code to complete your registration.
          </p>
        </div>

        <div className="text-center">
          <p className="text-gold/70 text-sm">
            Already have an account?{' '}
            <button
              onClick={() => router.push('/auth/signin')}
              className="text-gold hover:text-gold/80 font-medium"
            >
              Sign in here
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
}