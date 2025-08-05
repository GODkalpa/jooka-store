// Admin inventory management API routes
import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth/middleware';
import { db } from '@/lib/database/index';
import { z } from 'zod';

const updateInventorySchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  quantityChange: z.number(),
  transactionType: z.enum(['restock', 'adjustment', 'return']),
  notes: z.string().optional(),
});

async function getLowStockProducts(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const threshold = parseInt(searchParams.get('threshold') || '10');

    const result = await db.getLowStockProducts(threshold);
    
    if (result.error) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: result.data });
  } catch (error) {
    console.error('Get low stock products error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch low stock products' },
      { status: 500 }
    );
  }
}

async function updateInventory(request: NextRequest) {
  const user = (request as any).user;
  
  try {
    const body = await request.json();
    const validationResult = updateInventorySchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.errors },
        { status: 400 }
      );
    }

    const { productId, quantityChange, transactionType, notes } = validationResult.data;

    const result = await db.updateProductInventory(
      productId,
      quantityChange,
      transactionType,
      undefined, // referenceId
      undefined, // referenceType
      notes,
      user.id
    );
    
    if (result.error) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({ 
      message: 'Inventory updated successfully'
    });
  } catch (error) {
    console.error('Update inventory error:', error);
    return NextResponse.json(
      { error: 'Failed to update inventory' },
      { status: 500 }
    );
  }
}

export const GET = withAuth(getLowStockProducts, { requireAdmin: true });
export const POST = withAuth(updateInventory, { requireAdmin: true });