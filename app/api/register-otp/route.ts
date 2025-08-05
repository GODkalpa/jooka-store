// Firebase OTP-based registration API route
import { NextRequest, NextResponse } from 'next/server';
import { validateEmail, validatePassword, validateName } from '@/lib/validation';
import { userRegistrationSchema } from '@/lib/validation/schemas';
import { FirebaseOTPService } from '@/lib/firebase/otp-service';
import { checkUserExistsByEmail } from '@/lib/firebase/admin';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('OTP Registration request:', { ...body, password: '[REDACTED]', confirmPassword: '[REDACTED]' });

    // Validate input
    const validationResult = userRegistrationSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.errors },
        { status: 400 }
      );
    }

    const { email, password, fullName, phone } = validationResult.data;
    const firstName = fullName.split(' ')[0] || '';
    const lastName = fullName.split(' ').slice(1).join(' ') || '';

    // Additional validation
    if (!validateEmail(email) || !validatePassword(password) || 
        !validateName(firstName) || !validateName(lastName)) {
      return NextResponse.json(
        { error: 'Invalid input data' },
        { status: 400 }
      );
    }

    // Check if user already exists in Firebase Authentication
    console.log('Checking if user exists with email:', email);
    const userExistsResult = await checkUserExistsByEmail(email);

    if (userExistsResult.error) {
      console.error('Error checking user existence:', userExistsResult.error);
      return NextResponse.json(
        { error: 'Failed to validate email. Please try again.' },
        { status: 500 }
      );
    }

    if (userExistsResult.exists) {
      console.log('User already exists:', userExistsResult.user);
      return NextResponse.json(
        { error: 'An account with this email already exists. Please sign in instead.' },
        { status: 409 }
      );
    }

    console.log('Email is available for registration');

    // Send OTP using Firebase OTP service
    const result = await FirebaseOTPService.sendRegistrationOTP(
      email,
      firstName,
      lastName,
      password,
      phone
    );

    if (!result.success) {
      return NextResponse.json(
        { error: `Failed to send verification code: ${result.error}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Verification code sent. Please check your email for the 6-digit code.',
      email: email,
    });

  } catch (error) {
    console.error('OTP Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// No need to export - using shared service now