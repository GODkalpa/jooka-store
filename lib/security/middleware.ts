// Security middleware functions
import { NextRequest, NextResponse } from 'next/server';
import { 
  checkRateLimit, 
  addSecurityHeaders, 
  validateApiKey, 
  validateIpWhitelist,
  logSecurityEvent 
} from './validation';

// Enhanced rate limiting middleware
export function withRateLimit(
  handler: (request: NextRequest) => Promise<NextResponse>,
  options: {
    maxRequests?: number;
    windowMs?: number;
    skipSuccessfulRequests?: boolean;
    keyGenerator?: (request: NextRequest) => string;
  } = {}
) {
  const {
    maxRequests = 100,
    windowMs = 15 * 60 * 1000, // 15 minutes
    skipSuccessfulRequests = false,
    keyGenerator = (req) => req.ip || req.headers.get('x-forwarded-for') || 'unknown'
  } = options;

  return async (request: NextRequest): Promise<NextResponse> => {
    const identifier = keyGenerator(request);
    const rateLimit = checkRateLimit(identifier, maxRequests, windowMs);

    if (!rateLimit.allowed) {
      logSecurityEvent({
        type: 'rate_limit',
        ip: identifier,
        userAgent: request.headers.get('user-agent') || 'unknown',
        endpoint: request.nextUrl.pathname,
        details: { maxRequests, windowMs }
      });

      const response = NextResponse.json(
        { 
          error: 'Too many requests',
          retryAfter: Math.ceil((rateLimit.resetTime - Date.now()) / 1000)
        },
        { status: 429 }
      );

      response.headers.set('X-RateLimit-Limit', maxRequests.toString());
      response.headers.set('X-RateLimit-Remaining', '0');
      response.headers.set('X-RateLimit-Reset', rateLimit.resetTime.toString());
      response.headers.set('Retry-After', Math.ceil((rateLimit.resetTime - Date.now()) / 1000).toString());

      return addSecurityHeaders(response);
    }

    try {
      const response = await handler(request);
      
      // Add rate limit headers to successful responses
      response.headers.set('X-RateLimit-Limit', maxRequests.toString());
      response.headers.set('X-RateLimit-Remaining', rateLimit.remaining.toString());
      response.headers.set('X-RateLimit-Reset', rateLimit.resetTime.toString());

      return addSecurityHeaders(response);
    } catch (error) {
      console.error('Handler error:', error);
      const response = NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
      return addSecurityHeaders(response);
    }
  };
}

// API key authentication middleware
export function withApiKey(
  handler: (request: NextRequest) => Promise<NextResponse>
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    if (!validateApiKey(request)) {
      logSecurityEvent({
        type: 'auth_failure',
        ip: request.ip || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
        endpoint: request.nextUrl.pathname,
        details: { reason: 'invalid_api_key' }
      });

      const response = NextResponse.json(
        { error: 'Invalid API key' },
        { status: 401 }
      );
      return addSecurityHeaders(response);
    }

    const response = await handler(request);
    return addSecurityHeaders(response);
  };
}

// IP whitelist middleware
export function withIpWhitelist(
  handler: (request: NextRequest) => Promise<NextResponse>
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    if (!validateIpWhitelist(request)) {
      logSecurityEvent({
        type: 'auth_failure',
        ip: request.ip || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
        endpoint: request.nextUrl.pathname,
        details: { reason: 'ip_not_whitelisted' }
      });

      const response = NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
      return addSecurityHeaders(response);
    }

    const response = await handler(request);
    return addSecurityHeaders(response);
  };
}

// Request logging middleware
export function withRequestLogging(
  handler: (request: NextRequest) => Promise<NextResponse>
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const startTime = Date.now();
    const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';
    const method = request.method;
    const url = request.nextUrl.pathname;

    try {
      const response = await handler(request);
      const duration = Date.now() - startTime;

      // Log successful requests (in production, send to logging service)
      console.log(`${method} ${url} - ${response.status} - ${duration}ms - ${ip}`);

      return addSecurityHeaders(response);
    } catch (error) {
      const duration = Date.now() - startTime;
      
      logSecurityEvent({
        type: 'suspicious_activity',
        ip,
        userAgent,
        endpoint: url,
        details: { 
          method, 
          error: error instanceof Error ? error.message : 'Unknown error',
          duration 
        }
      });

      console.error(`${method} ${url} - ERROR - ${duration}ms - ${ip}:`, error);

      const response = NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
      return addSecurityHeaders(response);
    }
  };
}

// CORS middleware with security considerations
export function withSecureCors(
  handler: (request: NextRequest) => Promise<NextResponse>,
  options: {
    origin?: string | string[];
    methods?: string[];
    headers?: string[];
    credentials?: boolean;
  } = {}
) {
  const {
    origin = process.env.NEXTAUTH_URL || 'http://localhost:3000',
    methods = ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    headers = ['Content-Type', 'Authorization', 'X-API-Key'],
    credentials = true
  } = options;

  return async (request: NextRequest): Promise<NextResponse> => {
    // Handle preflight requests
    if (request.method === 'OPTIONS') {
      const response = new NextResponse(null, { status: 200 });
      
      response.headers.set('Access-Control-Allow-Origin', Array.isArray(origin) ? origin.join(',') : origin);
      response.headers.set('Access-Control-Allow-Methods', methods.join(','));
      response.headers.set('Access-Control-Allow-Headers', headers.join(','));
      response.headers.set('Access-Control-Max-Age', '86400');
      
      if (credentials) {
        response.headers.set('Access-Control-Allow-Credentials', 'true');
      }

      return addSecurityHeaders(response);
    }

    const response = await handler(request);

    // Add CORS headers to actual response
    response.headers.set('Access-Control-Allow-Origin', Array.isArray(origin) ? origin.join(',') : origin);
    
    if (credentials) {
      response.headers.set('Access-Control-Allow-Credentials', 'true');
    }

    return addSecurityHeaders(response);
  };
}

// Combine multiple security middlewares
export function withSecurity(
  handler: (request: NextRequest) => Promise<NextResponse>,
  options: {
    rateLimit?: { maxRequests?: number; windowMs?: number };
    requireApiKey?: boolean;
    requireIpWhitelist?: boolean;
    enableLogging?: boolean;
    cors?: { origin?: string | string[]; methods?: string[]; headers?: string[] };
  } = {}
) {
  let securedHandler = handler;

  // Apply middlewares in reverse order (last applied = first executed)
  if (options.enableLogging !== false) {
    securedHandler = withRequestLogging(securedHandler);
  }

  if (options.cors) {
    securedHandler = withSecureCors(securedHandler, options.cors);
  }

  if (options.requireIpWhitelist) {
    securedHandler = withIpWhitelist(securedHandler);
  }

  if (options.requireApiKey) {
    securedHandler = withApiKey(securedHandler);
  }

  if (options.rateLimit) {
    securedHandler = withRateLimit(securedHandler, options.rateLimit);
  }

  return securedHandler;
}