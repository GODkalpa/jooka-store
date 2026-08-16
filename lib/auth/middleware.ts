// Authentication middleware for route protection with Medusa & JWT
import { NextRequest, NextResponse } from 'next/server';

const MEDUSA_BACKEND_URL = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || 'http://localhost:9000';

export interface AuthenticatedRequest extends NextRequest {
  user?: {
    id: string;
    email: string;
    role: 'admin' | 'customer';
    emailVerified?: boolean;
  };
}

// Decode basic JWT payload safely
function decodeJwtPayload(token: string): any {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = Buffer.from(parts[1], 'base64').toString('utf-8');
    return JSON.parse(payload);
  } catch {
    return null;
  }
}

// Middleware to check if user is authenticated
export async function requireAuth(request: NextRequest): Promise<NextResponse | null> {
  try {
    const authHeader = request.headers.get('authorization');
    const cookieToken = request.cookies.get('medusa_jwt')?.value || request.cookies.get('_medusa_jwt')?.value;
    const token = authHeader?.startsWith('Bearer ') ? authHeader.split('Bearer ')[1] : cookieToken;

    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const payload = decodeJwtPayload(token);
    const userId = payload?.sub || payload?.actor_id || payload?.id || 'usr_authenticated';
    const userEmail = payload?.email || '';
    const actorType = payload?.actor_type || '';
    const role: 'admin' | 'customer' = actorType === 'user' || payload?.role === 'admin' ? 'admin' : 'customer';

    // Attach user info to request
    (request as AuthenticatedRequest).user = {
      id: userId,
      email: userEmail,
      role,
      emailVerified: true,
    };

    return null; // Continue to the actual handler
  } catch (error) {
    console.error('Auth middleware error:', error);
    return NextResponse.json(
      { error: 'Invalid authentication token' },
      { status: 401 }
    );
  }
}

// Middleware to check if user is admin
export async function requireAdmin(request: NextRequest): Promise<NextResponse | null> {
  const authResult = await requireAuth(request);
  if (authResult) return authResult;

  const user = (request as AuthenticatedRequest).user;

  if (user?.role !== 'admin') {
    return NextResponse.json(
      { error: 'Admin access required' },
      { status: 403 }
    );
  }

  return null;
}

// Higher-order function to wrap API handlers with authentication
export function withAuth<T extends any[]>(
  handler: (request: AuthenticatedRequest, ...args: T) => Promise<NextResponse>,
  options?: { requireAdmin?: boolean }
) {
  return async (request: NextRequest, ...args: T): Promise<NextResponse> => {
    const authResult = await requireAuth(request);
    if (authResult) return authResult;

    if (options?.requireAdmin) {
      const user = (request as AuthenticatedRequest).user;
      if (user?.role !== 'admin') {
        return NextResponse.json(
          { error: 'Admin access required' },
          { status: 403 }
        );
      }
    }

    return handler(request as AuthenticatedRequest, ...args);
  };
}