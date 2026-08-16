// OTP Registration API route powered by Resend Email Service & Medusa Customer Storage
import { NextRequest, NextResponse } from 'next/server';
import { userRegistrationSchema } from '@/lib/validation/schemas';
import { PendingRegistrationService } from '@/lib/services/pending-registration';
import { emailService } from '@/lib/email/email-service';

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

    // Generate 6-digit OTP code
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Store pending registration matching PendingRegistrationData structure
    PendingRegistrationService.store(email, {
      data: {
        fullName,
        email,
        phone: phone || '',
        password,
        confirmPassword: password,
      },
      otpCode,
      timestamp: Date.now(),
      attempts: 0,
    });

    // Send OTP email via Resend / EmailService
    const emailResult = await emailService.sendOTP(email, otpCode, firstName);

    if (!emailResult.success) {
      return NextResponse.json(
        { error: `Failed to send verification code: ${emailResult.error || 'Email delivery failed'}` },
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