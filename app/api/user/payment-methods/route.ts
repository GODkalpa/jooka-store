// User payment methods API routes (COD only for now)
import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth/middleware';

async function getPaymentMethods(request: NextRequest) {
  const user = (request as any).user;
  
  try {
    // For now, we only support Cash on Delivery (COD)
    // This endpoint is prepared for future payment method integrations
    const paymentMethods = [
      {
        id: 'cod',
        type: 'cash_on_delivery',
        name: 'Cash on Delivery',
        description: 'Pay with cash when your order is delivered',
        is_default: true,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];

    return NextResponse.json({ 
      data: paymentMethods,
      message: 'Currently only Cash on Delivery (COD) is supported'
    });
  } catch (error) {
    console.error('Get payment methods error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payment methods' },
      { status: 500 }
    );
  }
}

async function createPaymentMethod(request: NextRequest) {
  // For future implementation when we add online payment methods
  return NextResponse.json(
    { error: 'Adding payment methods is not supported yet. We currently only accept Cash on Delivery (COD).' },
    { status: 501 }
  );
}

export const GET = withAuth(getPaymentMethods);
export const POST = withAuth(createPaymentMethod);
