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

    if (!email || !otpCode) {
      return NextResponse.json(
        { error: 'Email and OTP code are required' },
        { status: 400 }
      );
    }

    console.log('Verifying OTP for registration:', email);

    // Verify OTP using the service
    const verificationResult = PendingRegistrationService.verifyOTP(email, otpCode);
    if (!verificationResult.success) {
      return NextResponse.json(
        { error: verificationResult.error },
        { status: 400 }
      );
    }

    // Get the registration data
    const registration = PendingRegistrationService.get(email);
    if (!registration) {
      return NextResponse.json(
        { error: 'Registration data not found' },
        { status: 404 }
      );
    }

    console.log('OTP verified successfully, creating user account...');

    // OTP verified - now create the user account
    const { fullName, email: userEmail, phone, password } = registration.data;

    // Create user with Firebase Auth
    const authResult = await createUserWithEmailPassword(userEmail, password);

    if (!authResult.success) {
      console.error('Failed to create user account:', authResult.error);
      return NextResponse.json(
        { error: authResult.error || 'Failed to create account' },
        { status: 500 }
      );
    }

    console.log('User account created successfully for:', userEmail);

    // Create user profile in database using Admin SDK
    try {
      console.log('Creating user document in Firestore...');
      const userResult = await createUserDocument(authResult.user!.uid, {
        email: userEmail,
        role: 'customer' // Only customers can register through this flow
      });

      if (userResult.success) {
        console.log('User document created, updating profile...');
        // Update user profile with additional information
        await updateUserProfile(authResult.user!.uid, {
          full_name: fullName,
          phone: phone,
          email: userEmail
        });
        console.log('User profile updated successfully');
      } else {
        console.error('Failed to create user document:', userResult.error);
      }
    } catch (dbError) {
      console.error('Failed to create user profile:', dbError);
      // User is created in Firebase but profile creation failed
      // This is not a critical error, user can complete profile later
    }

    // Clean up pending registration
    PendingRegistrationService.delete(email);

    console.log('Registration completed successfully for:', userEmail);

    return NextResponse.json({
      message: 'Registration completed successfully! You are now signed in.',
      email: userEmail,
      userId: authResult.user!.uid
    });

  } catch (error) {
    console.error('Registration OTP verification error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
