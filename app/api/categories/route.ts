// Categories API routes
import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth/middleware';
import { db } from '@/lib/database/index';
import { z } from 'zod';

const createCategorySchema = z.object({
  name: z.string().min(1, 'Category name is required'),
  slug: z.string().min(1, 'Category slug is required'),
  description: z.string().optional(),
  imageUrl: z.string().optional(),
  parentId: z.string().optional(),
  sortOrder: z.number().default(0),
  isActive: z.boolean().default(true),
});

async function getCategories(request: NextRequest) {
  try {
    const result = await db.getCategories();
    
    if (result.error) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: result.data });
  } catch (error) {
    console.error('Get categories error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}

async function createCategory(request: NextRequest) {
  try {
    const body = await request.json();
    const validationResult = createCategorySchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.errors },
        { status: 400 }
      );
    }

    const categoryData = {
      name: validationResult.data.name,
      slug: validationResult.data.slug,
      description: validationResult.data.description || null,
      image_url: validationResult.data.imageUrl || null,
      parent_id: validationResult.data.parentId || null,
      sort_order: validationResult.data.sortOrder,
      is_active: validationResult.data.isActive,
    };

    const result = await db.createCategory(categoryData);
    
    if (result.error) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({ 
      message: 'Category created successfully',
      data: result.data 
    }, { status: 201 });
  } catch (error) {
    console.error('Create category error:', error);
    return NextResponse.json(
      { error: 'Failed to create category' },
      { status: 500 }
    );
  }
}

export const GET = getCategories; // Public endpoint
export const POST = withAuth(createCategory, { requireAdmin: true });