import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/lib/auth/middleware';
import { z } from 'zod';

const adminSettingsSchema = z.object({
  store_name: z.string().min(1, 'Store name is required'),
  store_description: z.string().optional(),
  store_email: z.string().email('Valid email is required').optional(),
  store_phone: z.string().optional(),
  default_currency: z.string().default('NPR'),
  tax_rate: z.number().min(0).max(1).default(0.13),
  tax_included_in_prices: z.boolean().default(false),
  free_shipping_threshold: z.number().min(0).default(3500),
  default_shipping_rate: z.number().min(0).default(100),
  shipping_zones: z.array(z.string()).default(['Nepal']),
});

let currentSettings = {
  store_name: 'JOOKA Store Nepal',
  store_description: 'Luxury streetwear and outerwear catalog in Nepal',
  store_email: 'orders@jookawear.com',
  store_phone: '+977-9800000000',
  default_currency: 'NPR',
  tax_rate: 0.13,
  tax_included_in_prices: false,
  free_shipping_threshold: 3500,
  default_shipping_rate: 100,
  shipping_zones: ['Inside Kathmandu Valley', 'Outside Valley'],
};

async function getAdminSettings(req: AuthenticatedRequest): Promise<NextResponse> {
  return NextResponse.json({
    message: 'Settings retrieved successfully',
    data: currentSettings,
  });
}

async function updateAdminSettings(req: AuthenticatedRequest): Promise<NextResponse> {
  try {
    const body = await req.json();
    const validationResult = adminSettingsSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.errors },
        { status: 400 }
      );
    }

    currentSettings = { ...currentSettings, ...validationResult.data };

    return NextResponse.json({
      message: 'Settings updated successfully',
      data: currentSettings,
    });
  } catch (error) {
    console.error('Update admin settings error:', error);
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    );
  }
}

export const GET = withAuth(getAdminSettings, { requireAdmin: true });
export const PATCH = withAuth(updateAdminSettings, { requireAdmin: true });