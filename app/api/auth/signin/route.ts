// Sign in API route — authenticates with Medusa v2 Admin backend
import { NextRequest, NextResponse } from 'next/server';

const MEDUSA_BACKEND_URL = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || 'http://localhost:9000';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;
    
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const trimmedEmail = email.trim().toLowerCase();

    // 1. First attempt: Authenticate as Admin user
    let role: 'admin' | 'customer' = 'customer';
    let medusaToken: string | null = null;
    let authSucceeded = false;
    let userId: string | undefined;

    try {
      const adminRes = await fetch(`${MEDUSA_BACKEND_URL}/auth/user/emailpass`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmedEmail, password }),
      });

      if (adminRes.ok) {
        const adminData = await adminRes.json();
        medusaToken = adminData.token || null;
        role = 'admin';
        authSucceeded = true;
        userId = adminData.user?.id || 'admin';
      }
    } catch (e) {
      // Continue to customer check
    }

    // 2. Second attempt: If not admin, authenticate as Customer
    if (!authSucceeded) {
      try {
        const customerRes = await fetch(`${MEDUSA_BACKEND_URL}/auth/customer/emailpass`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: trimmedEmail, password }),
        });

        if (customerRes.ok) {
          const customerData = await customerRes.json();
          medusaToken = customerData.token || null;
          role = 'customer';
          authSucceeded = true;
          userId = customerData.customer?.id || 'customer';
        }
      } catch (e) {
        // Backend unreachable
      }
    }

    // If both failed
    if (!authSucceeded) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      message: 'Signed in successfully',
      email: trimmedEmail,
      role,
      userId,
      medusaToken,
    });

  } catch (error) {
    console.error('Sign in error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}