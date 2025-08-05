// Firebase OTP verification API route
import { NextRequest, NextResponse } from 'next/server';
import { FirebaseOTPService } from '@/lib/firebase/otp-service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('OTP Verification request for email:', body.email);

    const { email, otpCode } = body;

    // Validate input
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

    // Verify OTP and create Firebase user
    const result = await FirebaseOTPService.verifyOTPAndCreateUser(email, otpCode);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Invalid verification code' },
        { status: 400 }
      );
    }

    console.log('User created and verified successfully:', result.user?.uid);

    return NextResponse.json({
      message: 'Account created successfully! You can now sign in.',
      user: {
        uid: result.user?.uid,
        email: result.user?.email,
        displayName: result.user?.displayName
      }
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

    const result = await FirebaseOTPService.resendOTP(email);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to resend verification code' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      message: 'New verification code sent. Please check your email.'
    });

  } catch (error) {
    console.error('Resend OTP error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
