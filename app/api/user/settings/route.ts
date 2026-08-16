// User settings management API routes
import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/lib/auth/middleware';
import { z } from 'zod';

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

async function getSettings(request: AuthenticatedRequest) {
  const settings = {
    email_notifications: true,
    sms_notifications: false,
    marketing_emails: true,
    order_updates: true,
    newsletter: false,
    two_factor_enabled: false,
    privacy_profile: 'private' as const,
    data_sharing: false,
  };

  return NextResponse.json({ data: settings });
}

async function updateSettings(request: AuthenticatedRequest) {
  try {
    const body = await request.json();
    const validationResult = settingsSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json({
      message: 'Settings updated successfully',
      data: validationResult.data,
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