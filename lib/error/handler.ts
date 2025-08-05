// Global error handling system
import { NextRequest, NextResponse } from 'next/server';

export enum ErrorCode {
  // Authentication errors
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  
  // Validation errors
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  INVALID_INPUT = 'INVALID_INPUT',
  MISSING_REQUIRED_FIELD = 'MISSING_REQUIRED_FIELD',
  
  // Resource errors
  NOT_FOUND = 'NOT_FOUND',
  ALREADY_EXISTS = 'ALREADY_EXISTS',
  CONFLICT = 'CONFLICT',
  
  // Business logic errors
  INSUFFICIENT_INVENTORY = 'INSUFFICIENT_INVENTORY',
  PAYMENT_FAILED = 'PAYMENT_FAILED',
  ORDER_PROCESSING_ERROR = 'ORDER_PROCESSING_ERROR',
  
  // System errors
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',
  EXTERNAL_SERVICE_ERROR = 'EXTERNAL_SERVICE_ERROR',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  
  // File upload errors
  FILE_TOO_LARGE = 'FILE_TOO_LARGE',
  INVALID_FILE_TYPE = 'INVALID_FILE_TYPE',
  UPLOAD_FAILED = 'UPLOAD_FAILED',
}

export interface ApiError {
  code: ErrorCode;
  message: string;
  details?: any;
  timestamp: string;
  requestId?: string;
  path?: string;
}

export class AppError extends Error {
  public readonly code: ErrorCode;
  public readonly statusCode: number;
  public readonly details?: any;
  public readonly timestamp: string;

  constructor(
    code: ErrorCode,
    message: string,
    statusCode: number = 500,
    details?: any
  ) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
    this.timestamp = new Date().toISOString();

    // Maintains proper stack trace for where our error was thrown
    Error.captureStackTrace(this, AppError);
  }

  toJSON(): ApiError {
    return {
      code: this.code,
      message: this.message,
      details: this.details,
      timestamp: this.timestamp,
    };
  }
}

// Predefined error creators
export const createError = {
  unauthorized: (message = 'Authentication required') =>
    new AppError(ErrorCode.UNAUTHORIZED, message, 401),
  
  forbidden: (message = 'Access denied') =>
    new AppError(ErrorCode.FORBIDDEN, message, 403),
  
  notFound: (resource = 'Resource', message?: string) =>
    new AppError(
      ErrorCode.NOT_FOUND,
      message || `${resource} not found`,
      404
    ),
  
  validation: (message = 'Validation failed', details?: any) =>
    new AppError(ErrorCode.VALIDATION_ERROR, message, 400, details),
  
  conflict: (message = 'Resource already exists') =>
    new AppError(ErrorCode.ALREADY_EXISTS, message, 409),
  
  insufficientInventory: (product: string, available: number, requested: number) =>
    new AppError(
      ErrorCode.INSUFFICIENT_INVENTORY,
      `Insufficient inventory for ${product}`,
      400,
      { available, requested }
    ),
  
  paymentFailed: (message = 'Payment processing failed', details?: any) =>
    new AppError(ErrorCode.PAYMENT_FAILED, message, 400, details),
  
  rateLimit: (message = 'Too many requests') =>
    new AppError(ErrorCode.RATE_LIMIT_EXCEEDED, message, 429),
  
  fileUpload: (message = 'File upload failed', details?: any) =>
    new AppError(ErrorCode.UPLOAD_FAILED, message, 400, details),
  
  internal: (message = 'Internal server error', details?: any) =>
    new AppError(ErrorCode.INTERNAL_ERROR, message, 500, details),
  
  database: (message = 'Database operation failed', details?: any) =>
    new AppError(ErrorCode.DATABASE_ERROR, message, 500, details),
  
  externalService: (service: string, message?: string) =>
    new AppError(
      ErrorCode.EXTERNAL_SERVICE_ERROR,
      message || `${service} service unavailable`,
      503,
      { service }
    ),
};

// Error handler middleware
export function withErrorHandler(
  handler: (request: NextRequest) => Promise<NextResponse>
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    try {
      return await handler(request);
    } catch (error) {
      return handleError(error, request);
    }
  };
}

// Central error handling function
export function handleError(error: unknown, request?: NextRequest): NextResponse {
  const requestId = generateRequestId();
  const path = request?.nextUrl.pathname;

  // Log the error
  logError(error, { requestId, path });

  // Handle known AppError instances
  if (error instanceof AppError) {
    const apiError: ApiError = {
      ...error.toJSON(),
      requestId,
      path,
    };

    return NextResponse.json(
      { error: apiError },
      { status: error.statusCode }
    );
  }

  // Handle Zod validation errors
  if (error && typeof error === 'object' && 'issues' in error) {
    const validationError = createError.validation(
      'Validation failed',
      (error as any).issues
    );

    const apiError: ApiError = {
      ...validationError.toJSON(),
      requestId,
      path,
    };

    return NextResponse.json(
      { error: apiError },
      { status: validationError.statusCode }
    );
  }

  // Handle generic errors
  const genericError = createError.internal(
    process.env.NODE_ENV === 'production' 
      ? 'An unexpected error occurred'
      : error instanceof Error ? error.message : 'Unknown error'
  );

  const apiError: ApiError = {
    ...genericError.toJSON(),
    requestId,
    path,
  };

  return NextResponse.json(
    { error: apiError },
    { status: genericError.statusCode }
  );
}

// Error logging function
function logError(error: unknown, context: { requestId: string; path?: string }) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    requestId: context.requestId,
    path: context.path,
    error: {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      code: error instanceof AppError ? error.code : undefined,
      details: error instanceof AppError ? error.details : undefined,
    },
  };

  // In production, this would be sent to a logging service like Sentry, LogRocket, etc.
  if (process.env.NODE_ENV === 'production') {
    console.error('Application Error:', JSON.stringify(logEntry));
  } else {
    console.error('Application Error:', logEntry);
  }

  // Send to external error tracking service
  if (process.env.SENTRY_DSN) {
    // Sentry integration would go here
  }
}

// Generate unique request ID
function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Error boundary for React components (to be used in client-side code)
export class ErrorBoundary {
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  static componentDidCatch(error: Error, errorInfo: any) {
    logError(error, { 
      requestId: generateRequestId(),
      path: window.location.pathname 
    });
  }
}

// Async error handler for promises
export function handleAsyncError<T>(
  promise: Promise<T>,
  fallbackValue?: T
): Promise<T | undefined> {
  return promise.catch((error) => {
    logError(error, { 
      requestId: generateRequestId(),
      path: typeof window !== 'undefined' ? window.location.pathname : undefined 
    });
    return fallbackValue;
  });
}

// Retry mechanism for failed operations
export async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: Error;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      if (attempt === maxRetries) {
        throw lastError;
      }

      // Exponential backoff
      await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, attempt - 1)));
    }
  }

  throw lastError!;
}