// User profile management API routes
import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth, getAdminDb } from '@/lib/firebase/admin';
import { z } from 'zod';
import { userProfileUpdateSchema } from '@/lib/validation/schemas';
import { convertObjectDates } from '@/lib/utils/date';

// Use centralized validation schema
const updateProfileSchema = userProfileUpdateSchema;

async function getProfile(request: NextRequest) {
  try {
    // Get user from Firebase Auth token
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    let decodedToken;

    try {
      decodedToken = await getAdminAuth().verifyIdToken(token);
    } catch (authError) {
      console.error('Auth token verification failed:', authError);
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const userId = decodedToken.uid;
    const db = getAdminDb();

    // Get user document
    const userDoc = await db.collection('users').doc(userId).get();
    if (!userDoc.exists) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userData = convertObjectDates({ id: userDoc.id, ...userDoc.data() });

    // Get user profile
    const profileSnapshot = await db.collection('profiles')
      .where('user_id', '==', userId)
      .limit(1)
      .get();

    const profile = profileSnapshot.empty ? null : convertObjectDates({
      id: profileSnapshot.docs[0].id,
      ...profileSnapshot.docs[0].data()
    });

    const userWithProfile = {
      ...userData,
      profile
    };

    return NextResponse.json({ data: userWithProfile });
  } catch (error) {
    console.error('Get profile error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}

async function updateProfile(request: NextRequest) {
  try {
    // Get user from Firebase Auth token
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    let decodedToken;

    try {
      decodedToken = await getAdminAuth().verifyIdToken(token);
    } catch (authError) {
      console.error('Auth token verification failed:', authError);
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const userId = decodedToken.uid;
    const body = await request.json();
    const validationResult = updateProfileSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.errors },
        { status: 400 }
      );
    }

    const updateData: any = {
      updated_at: new Date()
    };

    // Handle both legacy and enhanced profile updates
    if (validationResult.data.fullName) {
      updateData.full_name = validationResult.data.fullName;
      // Also split into first and last name for backward compatibility
      const nameParts = validationResult.data.fullName.trim().split(' ');
      updateData.first_name = nameParts[0] || '';
      updateData.last_name = nameParts.slice(1).join(' ') || '';
    } else {
      if (validationResult.data.firstName) updateData.first_name = validationResult.data.firstName;
      if (validationResult.data.lastName) updateData.last_name = validationResult.data.lastName;
    }

    if (validationResult.data.phone) updateData.phone = validationResult.data.phone;
    if (validationResult.data.dateOfBirth) updateData.date_of_birth = validationResult.data.dateOfBirth;

    // Remove undefined values
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === undefined) {
        delete updateData[key];
      }
    });

    const db = getAdminDb();

    // Find existing profile
    const profileSnapshot = await db.collection('profiles')
      .where('user_id', '==', userId)
      .limit(1)
      .get();

    let profileData;

    if (profileSnapshot.empty) {
      // Create new profile
      const newProfileData = {
        user_id: userId,
        created_at: new Date(),
        ...updateData
      };

      const profileRef = await db.collection('profiles').add(newProfileData);
      profileData = { id: profileRef.id, ...newProfileData };
    } else {
      // Update existing profile
      const profileDoc = profileSnapshot.docs[0];
      await profileDoc.ref.update(updateData);
      profileData = { id: profileDoc.id, ...profileDoc.data(), ...updateData };
    }

    return NextResponse.json({
      message: 'Profile updated successfully',
      data: profileData
    });
  } catch (error) {
    console.error('Update profile error:', error);
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}

export const GET = getProfile;
export const PUT = updateProfile;