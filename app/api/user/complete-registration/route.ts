// Complete user registration API route
import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth/middleware';
import { db } from '@/lib/database/index';
import { validateUserRegistration } from '@/lib/validation/schemas';
import type { EnhancedRegistrationData } from '@/types/firebase';

async function completeRegistration(request: NextRequest) {
  const user = (request as any).user;
  
  try {
    const body = await request.json();
    
    // Validate the registration data
    const validation = validateUserRegistration(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid registration data', details: validation.error.errors },
        { status: 400 }
      );
    }

    const { fullName, phone } = validation.data;
    
    // Split full name into first and last name
    const nameParts = fullName.trim().split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    // Create or update user profile
    const profileData = {
      first_name: firstName,
      last_name: lastName,
      full_name: fullName,
      phone: phone,
    };

    const result = await db.updateUserProfile(user.id, profileData);
    
    if (result.error) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({ 
      message: 'Registration completed successfully',
      data: result.data 
    });
  } catch (error) {
    console.error('Complete registration error:', error);
    return NextResponse.json(
      { error: 'Failed to complete registration' },
      { status: 500 }
    );
  }
}

export const POST = withAuth(completeRegistration);
