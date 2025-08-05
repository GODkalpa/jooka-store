// Verify registration OTP and complete user registration
import { NextRequest, NextResponse } from 'next/server';
import { createUserWithEmailPassword } from '@/lib/firebase/auth-fallback';
import { createUserDocument, updateUserProfile } from '@/lib/firebase/admin';
import { PendingRegistrationService } from '@/lib/services/pending-registration';

export async function POST(request: NextRequest) {
  try {
    console.log('This route is deprecated. Use /api/verify-otp for OTP verification.');

    return NextResponse.json(
      { error: 'This verification method is deprecated. Please use /api/verify-otp for OTP verification.' },
      { status: 410 }
    );
  } catch (error) {
    console.error('Registration OTP verification error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
