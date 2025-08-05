// Authentication middleware for route protection with Firebase
import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { getAdminDb } from '@/lib/firebase/admin';

export interface AuthenticatedRequest extends NextRequest {
  user?: {
    id: string;
    email: string;
    role: string;
    emailVerified: boolean;
  };
}

// Middleware to check if user is authenticated
export async function requireAuth(request: NextRequest): Promise<NextResponse | null> {
  try {
    // Get token from Authorization header
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const token = authHeader.split('Bearer ')[1];
    
    // Verify token with Firebase Admin
    const decodedToken = await getAuth().verifyIdToken(token);
    
    // Get user data from Firestore
    const db = getAdminDb();
    const userDoc = await db.collection('users').doc(decodedToken.uid).get();
    
    if (!userDoc.exists) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 401 }
      );
    }

    const userData = userDoc.data();

    // Add user info to request
    (request as AuthenticatedRequest).user = {
      id: decodedToken.uid,
      email: decodedToken.email || userData?.email || '',
      role: userData?.role || 'customer',
      emailVerified: decodedToken.email_verified || false
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
  if (authResult) return authResult; // Return auth error if not authenticated

  const user = (request as AuthenticatedRequest).user;

  if (user?.role !== 'admin') {
    return NextResponse.json(
      { error: 'Admin access required' },
      { status: 403 }
    );
  }

  return null; // Continue to the actual handler
}

// Higher-order function to wrap API handlers with authentication
export function withAuth<T extends any[]>(
  handler: (request: AuthenticatedRequest, ...args: T) => Promise<NextResponse>,
  options?: { requireAdmin?: boolean }
) {
  return async (request: NextRequest, ...args: T): Promise<NextResponse> => {
    const authResult = await requireAuth(request);
    if (authResult) return authResult;

    // Check admin requirement if specified
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