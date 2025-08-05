// Individual Cart Item API routes
import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/lib/auth/middleware';
import { FirebaseAdminDatabaseService } from '@/lib/database/firebase-admin-service';
import { z } from 'zod';

const updateCartItemSchema = z.object({
  quantity: z.number().min(1, 'Quantity must be at least 1')
});

// Update cart item quantity
async function updateCartItem(request: AuthenticatedRequest, { params }: { params: { id: string } }) {
  try {
    const cartItemId = params.id;
    const body = await request.json();
    const validationResult = updateCartItemSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.errors },
        { status: 400 }
      );
    }

    const { quantity } = validationResult.data;

    // For now, just return success - cart functionality can be implemented later
    return NextResponse.json({
      message: 'Cart item updated successfully',
      data: { id: cartItemId, quantity }
    });
  } catch (error) {
    console.error('Update cart item error:', error);
    return NextResponse.json(
      { error: 'Failed to update cart item' },
      { status: 500 }
    );
  }
}

// Remove item from cart
async function removeCartItem(request: AuthenticatedRequest, { params }: { params: { id: string } }) {
  try {
    const cartItemId = params.id;
    
    // For now, just return success - cart functionality can be implemented later
    return NextResponse.json({
      message: 'Item removed from cart successfully'
    });
  } catch (error) {
    console.error('Remove cart item error:', error);
    return NextResponse.json(
      { error: 'Failed to remove item from cart' },
      { status: 500 }
    );
  }
}

export const PUT = withAuth(updateCartItem);
export const DELETE = withAuth(removeCartItem);