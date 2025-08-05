// Individual order API routes
import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth/middleware';
import { FirebaseAdminDatabaseService } from '@/lib/database/firebase-admin-service';
import { z } from 'zod';

const updateOrderStatusSchema = z.object({
  status: z.enum(['pending', 'processing', 'sent for delivery', 'shipped', 'delivered', 'cancelled']),
  adminNotes: z.string().optional(),
  trackingNumber: z.string().optional(),
  trackingUrl: z.string().optional(),
});

async function getOrder(request: NextRequest, context: { params: { id: string } }) {
  const { params } = context;
  const user = (request as any).user;
  const orderId = params.id;

  try {
    const adminDb = new FirebaseAdminDatabaseService();
    const result = await adminDb.getOrder(orderId);
    
    if (result.error) {
      return NextResponse.json(
        { error: result.error },
        { status: 404 }
      );
    }

    const order = result.data;

    // Check if user has permission to view this order
    if (user.role !== 'admin' && order?.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    return NextResponse.json({ data: order });
  } catch (error) {
    console.error('Get order error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch order' },
      { status: 500 }
    );
  }
}

async function updateOrderStatus(request: NextRequest, context: { params: { id: string } }) {
  const { params } = context;
  const orderId = params.id;
  
  try {
    const body = await request.json();
    const validationResult = updateOrderStatusSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.errors },
        { status: 400 }
      );
    }

    const { status, adminNotes, trackingNumber, trackingUrl } = validationResult.data;

    const adminDb = new FirebaseAdminDatabaseService();
    const result = await adminDb.updateOrderStatus(
      orderId,
      status,
      adminNotes,
      trackingNumber,
      trackingUrl
    );
    
    if (result.error) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({ 
      message: 'Order status updated successfully'
    });
  } catch (error) {
    console.error('Update order status error:', error);
    return NextResponse.json(
      { error: 'Failed to update order status' },
      { status: 500 }
    );
  }
}

async function deleteOrder(request: NextRequest, context: { params: { id: string } }) {
  const { params } = context;
  const orderId = params.id;

  try {
    const adminDb = new FirebaseAdminDatabaseService();
    const result = await adminDb.deleteOrder(orderId);

    if (result.error) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({ message: 'Order deleted successfully' });
  } catch (error) {
    console.error('Delete order error:', error);
    return NextResponse.json(
      { error: 'Failed to delete order' },
      { status: 500 }
    );
  }
}

export const GET = withAuth(getOrder);
export const PUT = withAuth(updateOrderStatus, { requireAdmin: true });
export const DELETE = withAuth(deleteOrder, { requireAdmin: true });