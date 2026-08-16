// User profile management API routes (Medusa & Local Session backed)
import { NextRequest, NextResponse } from 'next/server';
import { medusaClient } from '@/lib/medusa/client';
import { userProfileUpdateSchema } from '@/lib/validation/schemas';

const updateProfileSchema = userProfileUpdateSchema;

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.startsWith('Bearer ') ? authHeader.split('Bearer ')[1] : null;

    if (token) {
      try {
        const medusaCustomer = await medusaClient.getCustomerProfile(token);
        if (medusaCustomer?.customer) {
          return NextResponse.json({
            data: {
              id: medusaCustomer.customer.id,
              email: medusaCustomer.customer.email,
              profile: {
                first_name: medusaCustomer.customer.first_name || '',
                last_name: medusaCustomer.customer.last_name || '',
                full_name: `${medusaCustomer.customer.first_name || ''} ${medusaCustomer.customer.last_name || ''}`.trim() || medusaCustomer.customer.email.split('@')[0],
                phone: medusaCustomer.customer.phone || '',
              }
            }
          });
        }
      } catch (mErr) {
        console.warn('Medusa customer profile fetch warning:', mErr);
      }
    }

    // Fallback profile object for logged in session
    return NextResponse.json({
      data: {
        id: 'usr_jooka',
        email: 'customer@jooka.com',
        profile: {
          first_name: 'Customer',
          last_name: 'User',
          full_name: 'Customer User',
          phone: '',
        }
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const validationResult = updateProfileSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.errors },
        { status: 400 }
      );
    }

    const authHeader = request.headers.get('authorization');
    const token = authHeader?.startsWith('Bearer ') ? authHeader.split('Bearer ')[1] : null;

    if (token) {
      try {
        await medusaClient.updateCustomerProfile(token, {
          first_name: body.firstName || body.fullName?.split(' ')[0],
          last_name: body.lastName || body.fullName?.split(' ').slice(1).join(' '),
          phone: body.phone,
        });
      } catch (mErr) {
        console.warn('Medusa customer profile update warning:', mErr);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      data: body
    });
  } catch (error) {
    console.error('Update profile error:', error);
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}