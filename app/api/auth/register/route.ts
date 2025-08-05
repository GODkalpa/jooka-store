// Enhanced user registration API route for Firebase
import { NextRequest, NextResponse } from 'next/server';
import { validateUserRegistration } from '@/lib/validation/schemas';
import { sendOTPEmail } from '@/lib/firebase/auth';
import { createUserWithEmailPassword } from '@/lib/firebase/auth-fallback';
import { createUserDocument, updateUserProfile } from '@/lib/firebase/admin';
import type { RegistrationFormData } from '@/types/firebase';

// Store pending registrations temporarily (in production, use Redis or database)
const pendingRegistrations = new Map<string, {
  data: RegistrationFormData;
  timestamp: number;
  attempts: number;
}>();

// Clean up expired registrations (older than 10 minutes)
const cleanupExpiredRegistrations = () => {
  const now = Date.now();
  const expireTime = 10 * 60 * 1000; // 10 minutes

  for (const [email, registration] of pendingRegistrations.entries()) {
    if (now - registration.timestamp > expireTime) {
      pendingRegistrations.delete(email);
    }
  }
};

export async function POST(request: NextRequest) {
  try {
    console.log('Registration API called');
    
    const body = await request.json();
    console.log('Registration data received for email:', body.email);
    
    // Validate the registration data
    const validation = validateUserRegistration(body);
    if (!validation.success) {
      console.error('Validation failed:', validation.error.errors);
      return NextResponse.json(
        { error: 'Invalid registration data', details: validation.error.errors },
        { status: 400 }
      );
    }

    const { fullName, email, phone, password } = validation.data;

    // Clean up expired registrations
    cleanupExpiredRegistrations();

    // Check if there's already a pending registration for this email
    const existingRegistration = pendingRegistrations.get(email);
    if (existingRegistration && existingRegistration.attempts >= 3) {
      console.warn('Too many attempts for email:', email);
      return NextResponse.json(
        { error: 'Too many registration attempts. Please try again later.' },
        { status: 429 }
      );
    }

    // Store the registration data temporarily
    pendingRegistrations.set(email, {
      data: { fullName, email, phone, password, confirmPassword: password },
      timestamp: Date.now(),
      attempts: (existingRegistration?.attempts || 0) + 1
    });

    console.log('This route is deprecated. Use /api/register-otp for OTP-based registration.');

    return NextResponse.json(
      { error: 'This registration method is deprecated. Please use the OTP-based registration flow.' },
      { status: 410 }
    );

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// Get pending registration data (for verification process)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json(
        { error: 'Email parameter required' },
        { status: 400 }
      );
    }

    const registration = pendingRegistrations.get(email);
    if (!registration) {
      return NextResponse.json(
        { error: 'No pending registration found for this email' },
        { status: 404 }
      );
    }

    // Check if registration has expired
    const now = Date.now();
    const expireTime = 10 * 60 * 1000; // 10 minutes
    if (now - registration.timestamp > expireTime) {
      pendingRegistrations.delete(email);
      return NextResponse.json(
        { error: 'Registration has expired. Please start over.' },
        { status: 410 }
      );
    }

    // Return registration data (without password for security)
    const { password, confirmPassword, ...safeData } = registration.data;
    return NextResponse.json({
      data: safeData,
      timestamp: registration.timestamp
    });

  } catch (error) {
    console.error('Get registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Clean up registration data after successful verification
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json(
        { error: 'Email parameter required' },
        { status: 400 }
      );
    }

    pendingRegistrations.delete(email);
    return NextResponse.json({ message: 'Registration data cleaned up' });

  } catch (error) {
    console.error('Delete registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
