import { NextRequest, NextResponse } from 'next/server';
import { FirebaseAdminDatabaseService } from '@/lib/database/firebase-admin-service';
import { withAuth, AuthenticatedRequest } from '@/lib/auth/middleware';
import { z } from 'zod';

// Use admin service for server-side operations
const adminDb = new FirebaseAdminDatabaseService();

const updateProductSchema = z.object({
  name: z.string().min(1).optional(),
  slug: z.string().min(1).optional(),
  description: z.string().optional(),
  shortDescription: z.string().optional(),
  price: z.number().min(0).optional(),
  comparePrice: z.number().min(0).optional(),
  costPrice: z.number().min(0).optional(),
  categoryId: z.string().optional(),
  inventoryCount: z.number().min(0).optional(),
  trackInventory: z.boolean().optional(),
  trackVariants: z.boolean().optional(),
  allowBackorder: z.boolean().optional(),
  weight: z.number().min(0).optional(),
  dimensions: z.object({
    length: z.number().min(0),
    width: z.number().min(0),
    height: z.number().min(0),
  }).optional(),
  images: z.array(z.object({
    id: z.string(),
    secure_url: z.string(),
    publicId: z.string().optional(),
    width: z.number().optional(),
    height: z.number().optional(),
    format: z.string().optional(),
    color: z.string().optional(),
    is_primary: z.boolean(),
  })).optional(),
  colors: z.array(z.string()).optional(),
  sizes: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  status: z.enum(['active', 'inactive', 'out_of_stock']).optional(),
  featured: z.boolean().optional(),
});

async function getProduct(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const productId = params.id;
    const result = await adminDb.getProduct(productId);

    if (result.error) {
      return NextResponse.json(
        { error: result.error },
        { status: result.error === 'Product not found' ? 404 : 500 }
      );
    }

    return NextResponse.json(result.data);
  } catch (error) {
    console.error('Get product error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch product' },
      { status: 500 }
    );
  }
}

async function updateProduct(request: AuthenticatedRequest, { params }: { params: { id: string } }) {
  try {
    const productId = params.id;
    const body = await request.json();
    
    const validationResult = updateProductSchema.safeParse(body);

    if (!validationResult.success) {
      console.error('Product update validation failed:', validationResult.error.errors);
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.errors },
        { status: 400 }
      );
    }

    // Convert camelCase to snake_case for database
    const updateData: any = {};
    const data = validationResult.data;

    if (data.name !== undefined) updateData.name = data.name;
    if (data.slug !== undefined) updateData.slug = data.slug;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.shortDescription !== undefined) updateData.short_description = data.shortDescription;
    if (data.price !== undefined) updateData.price = data.price;
    if (data.comparePrice !== undefined) updateData.compare_price = data.comparePrice;
    if (data.costPrice !== undefined) updateData.cost_price = data.costPrice;
    if (data.categoryId !== undefined) updateData.category_id = data.categoryId;
    if (data.inventoryCount !== undefined) updateData.inventory_count = data.inventoryCount;
    if (data.trackInventory !== undefined) updateData.track_inventory = data.trackInventory;
    if (data.trackVariants !== undefined) updateData.track_variants = data.trackVariants;
    if (data.allowBackorder !== undefined) updateData.allow_backorder = data.allowBackorder;
    if (data.weight !== undefined) updateData.weight = data.weight;
    if (data.dimensions !== undefined) updateData.dimensions = data.dimensions;
    if (data.images !== undefined) updateData.images = data.images;
    if (data.colors !== undefined) updateData.colors = data.colors;
    if (data.sizes !== undefined) updateData.sizes = data.sizes;
    if (data.tags !== undefined) updateData.tags = data.tags;
    if (data.metaTitle !== undefined) updateData.meta_title = data.metaTitle;
    if (data.metaDescription !== undefined) updateData.meta_description = data.metaDescription;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.featured !== undefined) updateData.featured = data.featured;

    const result = await adminDb.updateProduct(productId, updateData);

    if (result.error) {
      return NextResponse.json(
        { error: result.error },
        { status: result.error === 'Product not found after update' ? 404 : 500 }
      );
    }

    return NextResponse.json({
      message: 'Product updated successfully',
      data: result.data
    });
  } catch (error) {
    console.error('Update product error:', error);
    return NextResponse.json(
      { error: 'Failed to update product' },
      { status: 500 }
    );
  }
}

async function deleteProduct(request: AuthenticatedRequest, { params }: { params: { id: string } }) {
  try {
    const productId = params.id;
    
    // Check if user is admin
    if (request.user?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }
    
    // Check if product exists first
    const existingProduct = await adminDb.getProduct(productId);
    if (existingProduct.error) {
      return NextResponse.json(
        { error: existingProduct.error },
        { status: existingProduct.error === 'Product not found' ? 404 : 500 }
      );
    }

    const result = await adminDb.deleteProduct(productId);

    if (result.error) {
      console.error('Delete product failed:', result.error);
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Product deleted successfully'
    });
  } catch (error) {
    console.error('Delete product error:', error);
    return NextResponse.json(
      { error: 'Failed to delete product' },
      { status: 500 }
    );
  }
}

export const GET = getProduct; // Public endpoint
export const PUT = withAuth(updateProduct); // Protected endpoint
export const DELETE = withAuth(deleteProduct); // Protected endpoint