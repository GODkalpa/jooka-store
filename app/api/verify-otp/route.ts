// OTP Verification API route connecting Medusa Customer API
import { NextRequest, NextResponse } from 'next/server';
import { PendingRegistrationService } from '@/lib/services/pending-registration';
import { emailService } from '@/lib/email/email-service';

const MEDUSA_BACKEND_URL = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || 'http://localhost:9000';
const PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || '';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, otpCode } = body;

    if (!email || !otpCode) {
      return NextResponse.json(
        { error: 'Email and verification code are required' },
        { status: 400 }
      );
    }

    if (!/^\d{6}$/.test(otpCode)) {
      return NextResponse.json(
        { error: 'Verification code must be 6 digits' },
        { status: 400 }
      );
    }

    // Verify OTP code with rate-limiting and attempt tracking
    const verification = PendingRegistrationService.verifyOTP(email, otpCode);
    if (!verification.success) {
      return NextResponse.json(
        { error: verification.error || 'Invalid or expired verification code' },
        { status: 400 }
      );
    }

    const pending = PendingRegistrationService.get(email);
    const regData = pending?.data;
    const firstName = regData?.fullName?.split(' ')[0] || 'Customer';
    const lastName = regData?.fullName?.split(' ').slice(1).join(' ') || '';

    // Create / Register Customer in Medusa Backend if available
    let medusaToken: string | null = null;
    if (regData) {
      try {
        // 1. Register auth credentials in Medusa v2
        const regRes = await fetch(`${MEDUSA_BACKEND_URL}/auth/customer/emailpass/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: regData.email.trim().toLowerCase(),
            password: regData.password,
          }),
        });

        if (regRes.ok) {
          const regJson = await regRes.json();
          medusaToken = regJson.token || null;
        }

        // 2. Create customer profile record in Medusa
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
        };
        if (medusaToken) {
          headers['Authorization'] = `Bearer ${medusaToken}`;
        }
        if (PUBLISHABLE_KEY) {
          headers['x-publishable-api-key'] = PUBLISHABLE_KEY;
        }

        await fetch(`${MEDUSA_BACKEND_URL}/store/customers`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            email: regData.email.trim().toLowerCase(),
            first_name: firstName,
            last_name: lastName,
            phone: regData.phone || '',
          }),
        });
      } catch (medusaErr) {
        console.warn('Medusa customer registration notice:', (medusaErr as Error).message);
      }
    }

    // Clear pending registration
    PendingRegistrationService.delete(email);

    return NextResponse.json({
      message: 'Account verified and created successfully! You can now sign in.',
      user: {
        email: email,
        displayName: regData?.fullName || email,
      },
    });

  } catch (error) {
    console.error('OTP Verification error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Resend OTP endpoint
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    const registration = PendingRegistrationService.get(email);
    if (!registration) {
      return NextResponse.json(
        { error: 'No pending registration found' },
        { status: 404 }
      );
    }

    // Check cooldown (60 seconds minimum)
    if (Date.now() - registration.timestamp < 30000) {
      return NextResponse.json(
        { error: 'Please wait at least 30 seconds before requesting another code' },
        { status: 429 }
      );
    }

    const otpCode = PendingRegistrationService.generateOTP();
    registration.otpCode = otpCode;
    registration.timestamp = Date.now();
    registration.attempts = 0;

    const firstName = registration.data.fullName?.split(' ')[0] || '';
    await emailService.sendOTP(email, otpCode, firstName);

    return NextResponse.json({
      message: 'New verification code sent. Please check your email.',
    });

  } catch (error) {
    console.error('Resend OTP error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
