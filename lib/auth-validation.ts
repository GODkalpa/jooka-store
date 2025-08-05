// Enhanced authentication validation utilities
import { z } from 'zod';

// Password strength validation
export function validatePasswordStrength(password: string): {
  isValid: boolean;
  score: number;
  feedback: string[];
} {
  const feedback: string[] = [];
  let score = 0;

  // Length check
  if (password.length >= 8) {
    score += 2;
  } else {
    feedback.push('Password must be at least 8 characters long');
  }

  // Character variety checks
  if (/[a-z]/.test(password)) score += 1;
  else feedback.push('Include lowercase letters');

  if (/[A-Z]/.test(password)) score += 1;
  else feedback.push('Include uppercase letters');

  if (/\d/.test(password)) score += 1;
  else feedback.push('Include numbers');

  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 1;
  else feedback.push('Include special characters');

  // Common patterns to avoid
  if (/(.)\1{2,}/.test(password)) {
    score -= 1;
    feedback.push('Avoid repeating characters');
  }

  if (/123|abc|qwe|password|admin/i.test(password)) {
    score -= 2;
    feedback.push('Avoid common patterns and words');
  }

  return {
    isValid: score >= 4 && password.length >= 8,
    score: Math.max(0, score),
    feedback
  };
}

// Email domain validation
export function validateEmailDomain(email: string): boolean {
  const disposableEmailDomains = [
    '10minutemail.com',
    'tempmail.org',
    'guerrillamail.com',
    'mailinator.com',
    'example.com',
    'test.com'
  ];

  const domain = email.split('@')[1]?.toLowerCase();
  return Boolean(domain && !disposableEmailDomains.includes(domain));
}

// Enhanced registration schema
export const enhancedRegisterSchema = z.object({
  email: z.string()
    .email('Invalid email format')
    .refine(validateEmailDomain, 'Please use a valid email domain'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .refine((password) => validatePasswordStrength(password).isValid,
      'Password must include uppercase, lowercase, numbers, and special characters'),
  firstName: z.string()
    .min(1, 'First name is required')
    .max(50, 'First name must be less than 50 characters')
    .regex(/^[a-zA-Z\s\-']+$/, 'First name contains invalid characters'),
  lastName: z.string()
    .min(1, 'Last name is required')
    .max(50, 'Last name must be less than 50 characters')
    .regex(/^[a-zA-Z\s\-']+$/, 'Last name contains invalid characters'),
  phone: z.string()
    .regex(/^[0-9]{10}$/, 'Phone number must be 10 digits')
    .refine((phone) => phone.startsWith('9'), 'Nepal mobile numbers must start with 9'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// Registration validation result type
export type RegistrationValidationResult = {
  success: boolean;
  data?: z.infer<typeof enhancedRegisterSchema>;
  errors?: {
    field: string;
    message: string;
  }[];
  passwordFeedback?: string[];
};

// Comprehensive registration validation
export function validateRegistration(body: any): RegistrationValidationResult {
  const result = enhancedRegisterSchema.safeParse(body);
  
  if (!result.success) {
    const errors = result.error.errors.map(err => ({
      field: err.path.join('.'),
      message: err.message
    }));
    
    return { success: false, errors };
  }

  // Additional password strength feedback
  const passwordStrength = validatePasswordStrength(result.data.password);
  
  return {
    success: true,
    data: result.data,
    passwordFeedback: passwordStrength.feedback
  };
}

// Rate limiting types and utilities
export interface RateLimitConfig {
  windowMs: number;
  maxAttempts: number;
}

export const defaultRateLimits: Record<string, RateLimitConfig> = {
  registration: { windowMs: 15 * 60 * 1000, maxAttempts: 3 }, // 15 minutes, 3 attempts
  login: { windowMs: 5 * 60 * 1000, maxAttempts: 5 }, // 5 minutes, 5 attempts
  otpVerification: { windowMs: 10 * 60 * 1000, maxAttempts: 5 }, // 10 minutes, 5 attempts
};

// Security headers for auth endpoints
export const securityHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
  'Pragma': 'no-cache',
  'Expires': '0',
};
