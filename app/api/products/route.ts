// Products API routes
import { NextRequest, NextResponse } from 'next/server';
import { FirebaseAdminDatabaseService } from '@/lib/database/firebase-admin-service';
import { adminVariantService } from '@/lib/database/admin-variant-service';
import { withAuth, AuthenticatedRequest } from '@/lib/auth/middleware';
import { z } from 'zod';

// Use admin service for server-side operations
const adminDb = new FirebaseAdminDatabaseService();

const createProductSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  slug: z.string().min(1, 'Product slug is required'),
  description: z.string().optional(),
  shortDescription: z.string().optional(),
  price: z.number().min(0, 'Price must be positive'),
  comparePrice: z.number().min(0).optional(),
  costPrice: z.number().min(0).optional(),
  categoryId: z.string().optional(),
  inventoryCount: z.number().min(0).default(0),
  trackInventory: z.boolean().default(true),
  trackVariants: z.boolean().default(true),
  variantInventory: z.record(z.string(), z.number().min(0)).optional(),
  allowBackorder: z.boolean().default(false),
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
  })).default([]),
  colors: z.array(z.string()).min(1, 'At least one color is required'),
  sizes: z.array(z.string()).min(1, 'At least one size is required'),
  tags: z.array(z.string()).default([]),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  status: z.enum(['active', 'inactive', 'out_of_stock']).default('active'),
  featured: z.boolean().default(false),
});

async function getProducts(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('categoryId') || undefined;
    const status = searchParams.get('status') || undefined;
    const featured = searchParams.get('featured') === 'true' ? true : undefined;
    const search = searchParams.get('search') || undefined;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const result = await adminDb.getProducts({
      categoryId,
      status,
      featured,
      search,
      page,
      limit
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Get products error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

async function createProduct(request: AuthenticatedRequest) {
  try {
    const body = await request.json();
    const validationResult = createProductSchema.safeParse(body);

    if (!validationResult.success) {
      console.error('Product validation failed:', validationResult.error.errors);
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.errors },
        { status: 400 }
      );
    }

    console.log('Product validation successful:', {
      colorsCount: validationResult.data.colors.length,
      sizesCount: validationResult.data.sizes.length,
      imagesCount: validationResult.data.images.length,
    });

    const productData = {
      name: validationResult.data.name,
      slug: validationResult.data.slug,
      description: validationResult.data.description || undefined,
      short_description: validationResult.data.shortDescription || undefined,
      price: validationResult.data.price,
      compare_price: validationResult.data.comparePrice || undefined,
      cost_price: validationResult.data.costPrice || undefined,
      category_id: validationResult.data.categoryId || undefined,
      inventory_count: validationResult.data.inventoryCount,
      track_inventory: validationResult.data.trackInventory,
      track_variants: validationResult.data.trackVariants,
      allow_backorder: validationResult.data.allowBackorder,
      weight: validationResult.data.weight || undefined,
      dimensions: validationResult.data.dimensions || undefined,
      images: validationResult.data.images,
      colors: validationResult.data.colors,
      sizes: validationResult.data.sizes,
      tags: validationResult.data.tags,
      meta_title: validationResult.data.metaTitle || undefined,
      meta_description: validationResult.data.metaDescription || undefined,
      seo_keywords: [],
      status: validationResult.data.status,
      featured: validationResult.data.featured,
    };

    const result = await adminDb.createProduct(productData);

    if (result.error) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }

    // If track_variants is enabled, create variants for all color/size combinations
    if (validationResult.data.trackVariants && result.data) {
      try {
        console.log('Creating variants with inventory:', {
          totalInventory: validationResult.data.inventoryCount,
          colors: validationResult.data.colors,
          sizes: validationResult.data.sizes,
          hasVariantInventory: !!validationResult.data.variantInventory
        });

        // Initialize variant inventory data from the form
        let variantInventoryData: Record<string, number> = {};
        
        console.log('Processing variant inventory data');
        
        // Create inventory data for each variant
        validationResult.data.colors.forEach(color => {
          validationResult.data.sizes.forEach(size => {
            // Use the same key format as the VariantInventoryGrid component
            const variantKey = `${color}-${size}`;
            // Get inventory from variantInventory if provided, otherwise default to 0
            const inventory = 
              validationResult.data.variantInventory ? 
              (validationResult.data.variantInventory[variantKey] || 0) : 0;
            
            variantInventoryData[variantKey] = inventory;
            console.log(`Setting inventory for ${variantKey}:`, inventory);
          });
        });
        
        console.log('Final variantInventoryData:', variantInventoryData);
        
        const variantResult = await adminVariantService.createProductVariantsWithInventory(
          result.data.id,
          validationResult.data.colors,
          validationResult.data.sizes,
          variantInventoryData,
          5 // default low stock threshold
        );

        if (variantResult.error) {
          console.warn('Failed to create product variants:', variantResult.error);
          // Don't fail the product creation, just log the warning
        } else {
          console.log(`Created ${variantResult.data?.length || 0} variants for product ${result.data.id}`);
          
          // Update the main product's inventory count to reflect total variant inventory
          const totalVariantInventory = Object.values(variantInventoryData).reduce((sum, count) => sum + count, 0);
          
          try {
            await adminDb.updateProduct(result.data.id, {
              inventory_count: totalVariantInventory
            });
            console.log(`Updated product inventory count to ${totalVariantInventory}`);
          } catch (updateError) {
            console.warn('Failed to update product inventory count:', updateError);
          }
        }
      } catch (error) {
        console.warn('Error creating product variants:', error);
        // Don't fail the product creation
      }
    }

    return NextResponse.json({
      message: 'Product created successfully',
      data: result.data
    }, { status: 201 });
  } catch (error) {
    console.error('Create product error:', error);
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    );
  }
}

export const GET = getProducts; // Public endpoint

// Protected POST endpoint for creating products
export const POST = withAuth(createProduct);