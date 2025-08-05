// API route to set up the first admin user (development only)
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database';
import { sendOTPEmail } from '@/lib/firebase/auth';

export async function POST(request: NextRequest) {
    // Only allow in development
    if (process.env.NODE_ENV !== 'development') {
        return NextResponse.json(
            { error: 'This endpoint is only available in development' },
            { status: 403 }
        );
    }

    try {
        const { email } = await request.json();

        if (!email) {
            return NextResponse.json(
                { error: 'Email is required' },
                { status: 400 }
            );
        }

        // Check if any admin users already exist
        const existingAdmins = await db.getUsers({ role: 'admin', limit: 1 });

        if (existingAdmins.data.length > 0) {
            return NextResponse.json(
                { error: 'Admin users already exist. Use the promote-user endpoint instead.' },
                { status: 400 }
            );
        }

        // Send OTP to the email first to verify it's valid
        console.log('Attempting to send OTP to:', email);
        const otpResult = await sendOTPEmail(email);
        console.log('OTP result:', otpResult);

        if (!otpResult.success) {
            console.error('OTP sending failed:', otpResult.error);

            // Provide more specific error messages
            let userFriendlyError = otpResult.error || 'Unknown error';

            if (otpResult.error?.includes('noImplementation')) {
                userFriendlyError = 'Email authentication is not enabled in Firebase. Please enable Email link (passwordless sign-in) in your Firebase Console.';
            } else if (otpResult.error?.includes('configuration-not-found')) {
                userFriendlyError = 'Firebase email authentication is not properly configured. Please check your Firebase project settings.';
            } else if (otpResult.error?.includes('invalid-email')) {
                userFriendlyError = 'Please enter a valid email address.';
            }

            return NextResponse.json(
                {
                    error: `Failed to send OTP: ${userFriendlyError}`,
                    details: otpResult.error // Include technical details for debugging
                },
                { status: 400 }
            );
        }

        return NextResponse.json({
            message: 'Admin setup email sent successfully! Check your email and click the link to complete the setup.',
            email,
            success: true,
            isAdminSetup: true
        });

    } catch (error) {
        console.error('Setup admin error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}