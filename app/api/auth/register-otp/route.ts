// OTP-based registration API route for Firebase
import { NextRequest, NextResponse } from 'next/server';
import { validateUserRegistration } from '@/lib/validation/schemas';
import { PendingRegistrationService } from '@/lib/services/pending-registration';
import { EmailService } from '@/lib/email/email-service';
import type { RegistrationFormData } from '@/types/firebase';



export async function POST(request: NextRequest) {
  try {
    console.log('This route is deprecated. Use /api/register-otp for OTP-based registration.');

    return NextResponse.json(
      { error: 'This registration method is deprecated. Please use /api/register-otp for OTP-based registration.' },
      { status: 410 }
    );
    
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
    PendingRegistrationService.cleanupExpired();

    // Check if there's already a pending registration for this email
    const existingRegistration = PendingRegistrationService.get(email);
    if (existingRegistration && existingRegistration.attempts >= 3) {
      console.warn('Too many attempts for email:', email);
      return NextResponse.json(
        { error: 'Too many registration attempts. Please try again later.' },
        { status: 429 }
      );
    }

    // Generate OTP
    const otpCode = PendingRegistrationService.generateOTP();

    // Store the registration data temporarily
    PendingRegistrationService.store(email, {
      data: { fullName, email, phone, password, confirmPassword: password },
      otpCode,
      timestamp: Date.now(),
      attempts: (existingRegistration?.attempts || 0) + 1
    });

    console.log('Sending OTP email to:', email);

    // Send OTP email
    const emailService = EmailService.getInstance();
    const emailResult = await emailService.sendOTP(email, otpCode, fullName);

    if (!emailResult.success) {
      // Remove from pending registrations if email fails
      PendingRegistrationService.delete(email);
      return NextResponse.json(
        { error: emailResult.error || 'Failed to send verification email' },
        { status: 500 }
      );
    }

    console.log('OTP sent successfully to:', email);

    return NextResponse.json({
      message: 'Verification code sent to your email. Please check your inbox.',
      email: email
    });

  } catch (error) {
    console.error('OTP Registration error:', error);
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

    const registration = PendingRegistrationService.get(email);
    if (!registration) {
      return NextResponse.json(
        { error: 'No pending registration found for this email' },
        { status: 404 }
      );
    }

    // Check if registration is valid
    const validity = PendingRegistrationService.isValid(email);
    if (!validity.valid) {
      return NextResponse.json(
        { error: validity.error },
        { status: 410 }
      );
    }

    // Return registration data (without password and OTP for security)
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

// Verify OTP and complete registration
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, otpCode } = body;

    if (!email || !otpCode) {
      return NextResponse.json(
        { error: 'Email and OTP code are required' },
        { status: 400 }
      );
    }

    // Verify OTP using the service
    const verificationResult = PendingRegistrationService.verifyOTP(email, otpCode);
    if (!verificationResult.success) {
      return NextResponse.json(
        { error: verificationResult.error },
        { status: 400 }
      );
    }

    // OTP verified - now we need to complete the registration
    // This will be handled by the verify-otp API endpoint
    return NextResponse.json({
      message: 'OTP verified successfully',
      email: email
    });

  } catch (error) {
    console.error('OTP verification error:', error);
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

    PendingRegistrationService.delete(email);
    return NextResponse.json({ message: 'Registration data cleaned up' });

  } catch (error) {
    console.error('Delete registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
