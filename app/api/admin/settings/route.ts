import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase/admin';
import { withAuth, AuthenticatedRequest } from '@/lib/auth/middleware';
import { z } from 'zod';

// Schema for admin settings validation
const adminSettingsSchema = z.object({
  // Store Configuration
  store_name: z.string().min(1, 'Store name is required'),
  store_description: z.string().optional(),
  store_email: z.string().email('Valid email is required'),
  store_phone: z.string().optional(),
  store_address: z.object({
    street: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    postal_code: z.string().optional(),
    country: z.string().default('Nepal'),
  }).optional(),
  
  // Tax & Currency Settings
  default_currency: z.string().default('NPR'),
  tax_rate: z.number().min(0).max(1),
  tax_included_in_prices: z.boolean().default(false),
  
  // Shipping Configuration
  free_shipping_threshold: z.number().min(0).default(0),
  default_shipping_rate: z.number().min(0).default(0),
  shipping_zones: z.array(z.string()).default(['Nepal']),
  
  // Notification Settings
  admin_email_notifications: z.boolean().default(true),
  customer_email_notifications: z.boolean().default(true),
  low_stock_threshold: z.number().min(0).default(10),
  notify_low_stock: z.boolean().default(true),
  order_notification_emails: z.array(z.string().email()).default([]),
  
  // Security & Privacy
  require_email_verification: z.boolean().default(true),
  allow_guest_checkout: z.boolean().default(false),
  session_timeout: z.number().min(300).default(3600),
  
  // Display Settings
  products_per_page: z.number().min(6).max(50).default(12),
  featured_products_count: z.number().min(4).max(20).default(8),
  show_out_of_stock: z.boolean().default(true),
  inventory_tracking: z.boolean().default(true),
});

async function getAdminSettings(req: AuthenticatedRequest): Promise<NextResponse> {
  try {
    const { user } = req;

    // Verify user exists and has admin role
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const db = getAdminDb();
    
    // Get admin settings from Firestore
    const settingsDoc = await db.collection('admin_settings').doc('store_config').get();
    
    if (!settingsDoc.exists) {
      // Return default settings if none exist
      const defaultSettings = {
        store_name: 'JOOKA E-commerce',
        store_description: 'Modern e-commerce platform for Nepal',
        store_email: '',
        store_phone: '',
        store_address: {
          street: '',
          city: 'Kathmandu',
          state: 'Bagmati',
          postal_code: '44600',
          country: 'Nepal',
        },
        default_currency: 'NPR',
        tax_rate: 0.13,
        tax_included_in_prices: false,
        free_shipping_threshold: 5000,
        default_shipping_rate: 150,
        shipping_zones: ['Nepal'],
        admin_email_notifications: true,
        customer_email_notifications: true,
        low_stock_threshold: 10,
        notify_low_stock: true,
        order_notification_emails: [],
        require_email_verification: true,
        allow_guest_checkout: false,
        session_timeout: 3600,
        products_per_page: 12,
        featured_products_count: 8,
        show_out_of_stock: true,
        inventory_tracking: true,
      };

      return NextResponse.json({ 
        message: 'Default settings loaded',
        data: defaultSettings 
      });
    }

    const settingsData = settingsDoc.data();

    return NextResponse.json({ 
      message: 'Settings retrieved successfully',
      data: settingsData 
    });
  } catch (error) {
    console.error('Get admin settings error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve settings' },
      { status: 500 }
    );
  }
}

async function updateAdminSettings(req: AuthenticatedRequest): Promise<NextResponse> {
  try {
    const { user } = req;

    // Verify user exists and has admin role
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const body = await req.json();
    
    // Validate the request body
    const validationResult = adminSettingsSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Validation failed', 
          details: validationResult.error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message
          }))
        },
        { status: 400 }
      );
    }

    const db = getAdminDb();
    
    const updateData = {
      ...validationResult.data,
      updated_at: new Date(),
      updated_by: user?.id || 'unknown',
    };

    // Update or create admin settings document
    await db.collection('admin_settings').doc('store_config').set(updateData, { merge: true });

    return NextResponse.json({ 
      message: 'Settings updated successfully',
      data: validationResult.data 
    });
  } catch (error) {
    console.error('Update admin settings error:', error);
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    );
  }
}

export const GET = withAuth(getAdminSettings);
export const PATCH = withAuth(updateAdminSettings);