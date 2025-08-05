// Product Variants API routes
import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/lib/auth/middleware';
import { adminVariantService } from '@/lib/database/admin-variant-service';
import { z } from 'zod';

const createVariantSchema = z.object({
    color: z.string().min(1, 'Color is required'),
    size: z.string().min(1, 'Size is required'),
    inventory_count: z.number().min(0).default(0),
    low_stock_threshold: z.number().min(0).default(5),
    price_adjustment: z.number().optional(),
    is_active: z.boolean().default(true)
});

const updateVariantSchema = z.object({
    inventory_count: z.number().min(0).optional(),
    low_stock_threshold: z.number().min(0).optional(),
    price_adjustment: z.number().optional(),
    is_active: z.boolean().optional()
});

const bulkUpdateSchema = z.object({
    variants: z.array(z.object({
        color: z.string(),
        size: z.string(),
        inventory_count: z.number().min(0)
    }))
});

// Get all variants for a product
async function getProductVariants(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const productId = params.id;
        const { searchParams } = new URL(request.url);
        const includeStock = searchParams.get('includeStock') === 'true';

        // Use the appropriate method based on whether stock info is needed
        const result = includeStock 
            ? await adminVariantService.getProductVariantsWithStock(productId)
            : await adminVariantService.getProductVariants(productId);

        if (result.error) {
            return NextResponse.json(
                { error: result.error },
                { status: 500 }
            );
        }

        return NextResponse.json({ data: result.data });
    } catch (error) {
        console.error('Get product variants error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch product variants' },
            { status: 500 }
        );
    }
}

// Create a new variant for a product
async function createProductVariant(request: AuthenticatedRequest, { params }: { params: { id: string } }) {
    try {
        const productId = params.id;
        const body = await request.json();
        const validationResult = createVariantSchema.safeParse(body);

        if (!validationResult.success) {
            return NextResponse.json(
                { error: 'Validation failed', details: validationResult.error.errors },
                { status: 400 }
            );
        }

        const variantData = {
            product_id: productId,
            ...validationResult.data,
            sku: `${productId}-${validationResult.data.color.toUpperCase()}-${validationResult.data.size.toUpperCase()}`
        };

        const result = await adminVariantService.createProductVariants(
            productId,
            [validationResult.data.color],
            [validationResult.data.size],
            validationResult.data.inventory_count,
            validationResult.data.low_stock_threshold
        );

        if (result.error) {
            return NextResponse.json(
                { error: result.error },
                { status: 500 }
            );
        }

        return NextResponse.json({
            message: 'Product variant created successfully',
            data: result.data[0]
        }, { status: 201 });
    } catch (error) {
        console.error('Create product variant error:', error);
        return NextResponse.json(
            { error: 'Failed to create product variant' },
            { status: 500 }
        );
    }
}

// Bulk update variant inventories
async function bulkUpdateVariants(request: AuthenticatedRequest, { params }: { params: { id: string } }) {
    try {
        const productId = params.id;
        const body = await request.json();
        const validationResult = bulkUpdateSchema.safeParse(body);

        if (!validationResult.success) {
            return NextResponse.json(
                { error: 'Validation failed', details: validationResult.error.errors },
                { status: 400 }
            );
        }

        const updates = validationResult.data.variants.map(variant => ({
            product_id: productId,
            color: variant.color,
            size: variant.size,
            quantity_change: variant.inventory_count, // This will be set as absolute value
            transaction_type: 'adjustment' as const,
            notes: 'Bulk inventory update'
        }));

        // First get current variants to calculate the actual change needed
        const currentVariantsResult = await adminVariantService.getProductVariants(productId);
        if (currentVariantsResult.error) {
            return NextResponse.json(
                { error: currentVariantsResult.error },
                { status: 500 }
            );
        }

        // Update each variant individually
        const updatedVariants = [];
        for (const update of updates) {
            const currentVariant = currentVariantsResult.data?.find(v =>
                v.color === update.color && v.size === update.size
            );

            if (currentVariant) {
                const quantityChange = update.inventory_count - currentVariant.inventory_count;
                const updateResult = await adminVariantService.updateVariantInventory({
                    product_id: productId,
                    color: update.color,
                    size: update.size,
                    quantity_change: quantityChange,
                    transaction_type: 'adjustment',
                    notes: 'Bulk inventory update'
                });

                if (updateResult.data) {
                    updatedVariants.push(updateResult.data);
                }
            }
        }

        const result = { data: updatedVariants, success: true };

        if (result.error) {
            return NextResponse.json(
                { error: result.error },
                { status: 500 }
            );
        }

        return NextResponse.json({
            message: 'Variants updated successfully',
            data: result.data
        });
    } catch (error) {
        console.error('Bulk update variants error:', error);
        return NextResponse.json(
            { error: 'Failed to update variants' },
            { status: 500 }
        );
    }
}

export const GET = getProductVariants;
export const POST = withAuth(createProductVariant, { requireAdmin: true });
export const PUT = withAuth(bulkUpdateVariants, { requireAdmin: true });