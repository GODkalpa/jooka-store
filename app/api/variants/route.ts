// Variant Management API routes
import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/lib/auth/middleware';
import { adminVariantService } from '@/lib/database/admin-variant-service';
import { z } from 'zod';

const stockCheckSchema = z.object({
  checks: z.array(z.object({
    product_id: z.string(),
    color: z.string(),
    size: z.string(),
    requested_quantity: z.number().min(1)
  }))
});

const inventoryUpdateSchema = z.object({
  product_id: z.string(),
  color: z.string(),
  size: z.string(),
  quantity_change: z.number(),
  transaction_type: z.enum(['restock', 'adjustment', 'return', 'sale']),
  notes: z.string().optional()
});

// Check variant stock availability
async function checkVariantStock(request: NextRequest) {
  try {
    const body = await request.json();
    const validationResult = stockCheckSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.errors },
        { status: 400 }
      );
    }

    const result = await adminVariantService.checkVariantStock(validationResult.data.checks);

    if (result.error) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: result.data });
  } catch (error) {
    console.error('Check variant stock error:', error);
    return NextResponse.json(
      { error: 'Failed to check variant stock' },
      { status: 500 }
    );
  }
}

// Update variant inventory
async function updateVariantInventory(request: AuthenticatedRequest) {
  try {
    const body = await request.json();
    const validationResult = inventoryUpdateSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.errors },
        { status: 400 }
      );
    }

    const result = await adminVariantService.updateVariantInventory(validationResult.data);

    if (result.error) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Variant inventory updated successfully',
      data: result.data
    });
  } catch (error) {
    console.error('Update variant inventory error:', error);
    return NextResponse.json(
      { error: 'Failed to update variant inventory' },
      { status: 500 }
    );
  }
}

export const POST = checkVariantStock;
export const PUT = withAuth(updateVariantInventory, { requireAdmin: true });