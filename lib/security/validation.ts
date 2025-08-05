// Enhanced security validation middleware
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Input sanitization
export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/['"]/g, '') // Remove quotes
    .replace(/[;&|`$]/g, '') // Remove command injection characters
    .trim();
}

// SQL injection prevention
export function sanitizeSqlInput(input: string): string {
  return input
    .replace(/[';-]/g, '') // Remove SQL comment and statement terminators
    .replace(/\b(DROP|DELETE|INSERT|UPDATE|CREATE|ALTER|EXEC|EXECUTE)\b/gi, '') // Remove dangerous SQL keywords
    .trim();
}

// XSS prevention
export function sanitizeHtml(input: string): string {
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
    .replace(/`/g, '&#x60;')
    .replace(/=/g, '&#x3D;');
}

// Validate file uploads
export function validateFileUpload(file: File, options: {
  maxSize?: number;
  allowedTypes?: string[];
  allowedExtensions?: string[];
}) {
  const {
    maxSize = 5 * 1024 * 1024, // 5MB default
    allowedTypes = ['image/jpeg', 'image/png', 'image/webp'],
    allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp']
  } = options;

  // Check file size
  if (file.size > maxSize) {
    throw new Error(`File size exceeds maximum allowed size of ${maxSize / (1024 * 1024)}MB`);
  }

  // Check file type
  if (!allowedTypes.includes(file.type)) {
    throw new Error(`File type ${file.type} is not allowed`);
  }

  // Check file extension
  const extension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
  if (!allowedExtensions.includes(extension)) {
    throw new Error(`File extension ${extension} is not allowed`);
  }

  return true;
}

// Rate limiting store
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// Rate limiting function
export function checkRateLimit(
  identifier: string,
  maxRequests: number = 100,
  windowMs: number = 15 * 60 * 1000 // 15 minutes
): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now();
  const windowStart = now - windowMs;

  // Clean up old entries
  const keysToDelete: string[] = [];
  rateLimitStore.forEach((value, key) => {
    if (value.resetTime < windowStart) {
      keysToDelete.push(key);
    }
  });
  keysToDelete.forEach(key => rateLimitStore.delete(key));

  // Get or create rate limit entry
  let entry = rateLimitStore.get(identifier);
  if (!entry || entry.resetTime < windowStart) {
    entry = { count: 0, resetTime: now + windowMs };
    rateLimitStore.set(identifier, entry);
  }

  // Check if limit exceeded
  if (entry.count >= maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: entry.resetTime
    };
  }

  // Increment count
  entry.count++;
  rateLimitStore.set(identifier, entry);

  return {
    allowed: true,
    remaining: maxRequests - entry.count,
    resetTime: entry.resetTime
  };
}

// Security headers middleware
export function addSecurityHeaders(response: NextResponse): NextResponse {
  // Prevent XSS attacks
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  
  // HTTPS enforcement
  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  
  // Content Security Policy
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https:;"
  );
  
  // Referrer Policy
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Permissions Policy
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

  return response;
}

// Input validation schemas
export const securitySchemas = {
  email: z.string().email().max(255),
  password: z.string().min(8).max(128),
  name: z.string().min(1).max(100).regex(/^[a-zA-Z\s\-']+$/),
  phone: z.string()
    .regex(/^[0-9]{10}$/, 'Phone number must be 10 digits')
    .refine((phone) => phone.startsWith('9'), 'Nepal mobile numbers must start with 9'),
  address: z.string().min(1).max(255),
  city: z.string().min(1).max(100).regex(/^[a-zA-Z\s\-']+$/),
  state: z.string().min(1).max(100).regex(/^[a-zA-Z\s\-']+$/),
  postalCode: z.string().min(5).max(5).regex(/^[0-9]{5}$/, 'Nepal postal code must be 5 digits'),
  country: z.string().min(1).max(100).regex(/^[a-zA-Z\s\-']+$/).default('Nepal'),
  productName: z.string().min(1).max(255),
  productDescription: z.string().max(5000),
  price: z.number().min(0).max(999999.99),
  quantity: z.number().int().min(0).max(999999),
  slug: z.string().min(1).max(255).regex(/^[a-z0-9\-]+$/),
  uuid: z.string().uuid(),
};

// Validate request body against schema
export function validateRequestBody<T>(
  body: any,
  schema: z.ZodSchema<T>
): { success: true; data: T } | { success: false; errors: z.ZodError } {
  try {
    const data = schema.parse(body);
    return { success: true, data };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, errors: error };
    }
    throw error;
  }
}

// API key validation
export function validateApiKey(request: NextRequest): boolean {
  const apiKey = request.headers.get('x-api-key');
  const validApiKeys = process.env.VALID_API_KEYS?.split(',') || [];
  
  return apiKey ? validApiKeys.includes(apiKey) : false;
}

// IP whitelist validation
export function validateIpWhitelist(request: NextRequest): boolean {
  const clientIp = request.ip || request.headers.get('x-forwarded-for') || 'unknown';
  const whitelist = process.env.IP_WHITELIST?.split(',') || [];
  
  // If no whitelist is configured, allow all IPs
  if (whitelist.length === 0) return true;
  
  return whitelist.includes(clientIp);
}

// Request logging for security monitoring
export function logSecurityEvent(event: {
  type: 'auth_failure' | 'rate_limit' | 'invalid_input' | 'suspicious_activity';
  ip: string;
  userAgent: string;
  endpoint: string;
  details?: any;
}) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    ...event,
  };
  
  // In production, this would be sent to a security monitoring service
  console.warn('Security Event:', JSON.stringify(logEntry));
}