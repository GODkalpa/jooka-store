// User settings management API routes
import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth/middleware';
import { getAdminDb } from '@/lib/firebase/admin';
import { z } from 'zod';

// Settings schema
const settingsSchema = z.object({
  email_notifications: z.boolean().optional(),
  sms_notifications: z.boolean().optional(),
  marketing_emails: z.boolean().optional(),
  order_updates: z.boolean().optional(),
  newsletter: z.boolean().optional(),
  two_factor_enabled: z.boolean().optional(),
  privacy_profile: z.enum(['public', 'private']).optional(),
  data_sharing: z.boolean().optional(),
});

async function getSettings(request: NextRequest) {
  const user = (request as any).user;
  
  try {
    const db = getAdminDb();
    
    // Get user settings from profiles collection
    const profileSnapshot = await db.collection('profiles')
      .where('user_id', '==', user.id)
      .get();
    
    let settings = {
      email_notifications: true,
      sms_notifications: false,
      marketing_emails: true,
      order_updates: true,
      newsletter: false,
      two_factor_enabled: false,
      privacy_profile: 'private' as const,
      data_sharing: false,
    };

    if (!profileSnapshot.empty) {
      const profileData = profileSnapshot.docs[0].data();
      settings = {
        email_notifications: profileData.email_notifications ?? settings.email_notifications,
        sms_notifications: profileData.sms_notifications ?? settings.sms_notifications,
        marketing_emails: profileData.marketing_emails ?? settings.marketing_emails,
        order_updates: profileData.order_updates ?? settings.order_updates,
        newsletter: profileData.newsletter ?? settings.newsletter,
        two_factor_enabled: profileData.two_factor_enabled ?? settings.two_factor_enabled,
        privacy_profile: profileData.privacy_profile ?? settings.privacy_profile,
        data_sharing: profileData.data_sharing ?? settings.data_sharing,
      };
    }

    return NextResponse.json({ data: settings });
  } catch (error) {
    console.error('Get settings error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}

async function updateSettings(request: NextRequest) {
  const user = (request as any).user;
  
  try {
    const body = await request.json();
    const validationResult = settingsSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.errors },
        { status: 400 }
      );
    }

    const db = getAdminDb();
    
    // Find or create user profile
    const profileSnapshot = await db.collection('profiles')
      .where('user_id', '==', user.id)
      .get();

    const updateData = {
      ...validationResult.data,
      updated_at: new Date(),
    };

    if (profileSnapshot.empty) {
      // Create new profile with settings
      await db.collection('profiles').add({
        user_id: user.id,
        ...updateData,
        created_at: new Date(),
      });
    } else {
      // Update existing profile
      const profileDoc = profileSnapshot.docs[0];
      await profileDoc.ref.update(updateData);
    }

    return NextResponse.json({ 
      message: 'Settings updated successfully',
      data: validationResult.data 
    });
  } catch (error) {
    console.error('Update settings error:', error);
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    );
  }
}

export const GET = withAuth(getSettings);
export const PATCH = withAuth(updateSettings);