// Product Variant Service for JOOKA E-commerce Platform
import {
  where,
  orderBy,
  Timestamp,
  writeBatch,
  doc
} from 'firebase/firestore';
import {
  getDocument,
  getDocuments,
  addDocument,
  updateDocument,
  batchWrite,
  COLLECTIONS
} from '@/lib/firebase/firestore';
import { db as getDb } from '@/lib/firebase/config';
import type {
  ProductVariant,
  ProductVariantWithStock,
  CreateProductVariantData,
  VariantInventoryUpdate,
  VariantStockCheck,
  ApiResponse
} from '@/types/firebase';

export class VariantService {

  // Get all variants for a product
  async getProductVariants(productId: string): Promise<ApiResponse<ProductVariant[]>> {
    try {
      const variants = await getDocuments<ProductVariant>(
        COLLECTIONS.PRODUCT_VARIANTS,
        [
          where('product_id', '==', productId),
          orderBy('color', 'asc'),
          orderBy('size', 'asc')
        ]
      );

      return { data: variants, success: true };
    } catch (error) {
      return { error: (error as Error).message, success: false };
    }
  }

  // Get variants with stock status
  async getProductVariantsWithStock(productId: string): Promise<ApiResponse<ProductVariantWithStock[]>> {
    try {
      const variants = await getDocuments<ProductVariant>(
        COLLECTIONS.PRODUCT_VARIANTS,
        [
          where('product_id', '==', productId),
          orderBy('color', 'asc'),
          orderBy('size', 'asc')
        ]
      );

      const variantsWithStock: ProductVariantWithStock[] = variants.map(variant => ({
        ...variant,
        available_stock: variant.inventory_count,
        is_low_stock: variant.inventory_count <= variant.low_stock_threshold && variant.inventory_count > 0,
        is_out_of_stock: variant.inventory_count <= 0
      }));

      return { data: variantsWithStock, success: true };
    } catch (error) {
      return { error: (error as Error).message, success: false };
    }
  }

  // Get specific variant
  async getVariant(productId: string, color: string, size: string): Promise<ApiResponse<ProductVariant | null>> {
    try {
      const variants = await getDocuments<ProductVariant>(
        COLLECTIONS.PRODUCT_VARIANTS,
        [
          where('product_id', '==', productId),
          where('color', '==', color),
          where('size', '==', size)
        ]
      );

      return { data: variants[0] || null, success: true };
    } catch (error) {
      return { error: (error as Error).message, success: false };
    }
  }

  // Check variant stock availability
  async checkVariantStock(checks: VariantStockCheck[]): Promise<ApiResponse<{
    available: boolean;
    unavailable_variants: VariantStockCheck[];
    variant_stock: { [key: string]: number };
  }>> {
    try {
      const unavailableVariants: VariantStockCheck[] = [];
      const variantStock: { [key: string]: number } = {};

      for (const check of checks) {
        const variantResult = await this.getVariant(check.product_id, check.color, check.size);

        if (!variantResult.data) {
          unavailableVariants.push(check);
          continue;
        }

        const variant = variantResult.data;
        const variantKey = `${check.product_id}-${check.color}-${check.size}`;
        variantStock[variantKey] = variant.inventory_count;

        if (variant.inventory_count < check.requested_quantity) {
          unavailableVariants.push(check);
        }
      }

      return {
        data: {
          available: unavailableVariants.length === 0,
          unavailable_variants: unavailableVariants,
          variant_stock: variantStock
        },
        success: true
      };
    } catch (error) {
      return { error: (error as Error).message, success: false };
    }
  }

  // Create variants for a product
  async createProductVariants(
    productId: string,
    colors: string[],
    sizes: string[],
    defaultInventory: number = 0,
    defaultThreshold: number = 5
  ): Promise<ApiResponse<ProductVariant[]>> {
    try {
      const variants: CreateProductVariantData[] = [];

      // Generate all color-size combinations
      for (const color of colors) {
        for (const size of sizes) {
          const sku = `${productId}-${color.toUpperCase()}-${size.toUpperCase()}`;

          variants.push({
            product_id: productId,
            color,
            size,
            sku,
            inventory_count: defaultInventory,
            low_stock_threshold: defaultThreshold,
            is_active: true
          });
        }
      }

      // Batch create variants
      const operations = variants.map(variant => ({
        type: 'add' as const,
        collection: COLLECTIONS.PRODUCT_VARIANTS,
        data: variant
      }));

      await batchWrite(operations);

      // Return created variants
      const createdVariants = await this.getProductVariants(productId);
      return createdVariants;
    } catch (error) {
      return { error: (error as Error).message, success: false };
    }
  }

  // Update variant inventory
  async updateVariantInventory(update: VariantInventoryUpdate): Promise<ApiResponse<ProductVariant>> {
    try {
      const variantResult = await this.getVariant(update.product_id, update.color, update.size);

      if (!variantResult.data) {
        return { error: 'Variant not found', success: false };
      }

      const variant = variantResult.data;
      const newInventoryCount = Math.max(0, variant.inventory_count + update.quantity_change);

      await updateDocument<ProductVariant>(COLLECTIONS.PRODUCT_VARIANTS, variant.id, {
        inventory_count: newInventoryCount,
        updated_at: Timestamp.now()
      });

      // Log inventory transaction (optional - for audit trail)
      await this.logInventoryTransaction({
        variant_id: variant.id,
        product_id: update.product_id,
        color: update.color,
        size: update.size,
        old_quantity: variant.inventory_count,
        new_quantity: newInventoryCount,
        quantity_change: update.quantity_change,
        transaction_type: update.transaction_type,
        notes: update.notes
      });

      const updatedVariant = await getDocument<ProductVariant>(COLLECTIONS.PRODUCT_VARIANTS, variant.id);
      return { data: updatedVariant!, success: true };
    } catch (error) {
      return { error: (error as Error).message, success: false };
    }
  }

  // Bulk update variant inventories
  async bulkUpdateVariantInventory(updates: VariantInventoryUpdate[]): Promise<ApiResponse<ProductVariant[]>> {
    try {
      const db = getDb();
      const batch = writeBatch(db);
      const updatedVariants: ProductVariant[] = [];

      for (const update of updates) {
        const variantResult = await this.getVariant(update.product_id, update.color, update.size);

        if (!variantResult.data) {
          continue; // Skip if variant not found
        }

        const variant = variantResult.data;
        const newInventoryCount = Math.max(0, variant.inventory_count + update.quantity_change);

        const variantRef = doc(db, COLLECTIONS.PRODUCT_VARIANTS, variant.id);
        batch.update(variantRef, {
          inventory_count: newInventoryCount,
          updated_at: Timestamp.now()
        });

        updatedVariants.push({
          ...variant,
          inventory_count: newInventoryCount
        });
      }

      await batch.commit();

      return { data: updatedVariants, success: true };
    } catch (error) {
      return { error: (error as Error).message, success: false };
    }
  }

  // Reserve variant stock (for order processing)
  async reserveVariantStock(reservations: VariantStockCheck[]): Promise<ApiResponse<boolean>> {
    try {
      // First check if all variants have sufficient stock
      const stockCheck = await this.checkVariantStock(reservations);

      if (!stockCheck.data?.available) {
        return {
          error: `Insufficient stock for variants: ${stockCheck.data?.unavailable_variants.map(v => `${v.color}-${v.size}`).join(', ')}`,
          success: false
        };
      }

      // Reserve stock by reducing inventory
      const updates: VariantInventoryUpdate[] = reservations.map(reservation => ({
        product_id: reservation.product_id,
        color: reservation.color,
        size: reservation.size,
        quantity_change: -reservation.requested_quantity,
        transaction_type: 'sale' as const,
        notes: 'Stock reserved for order'
      }));

      const result = await this.bulkUpdateVariantInventory(updates);
      return { data: result.success, success: result.success };
    } catch (error) {
      return { error: (error as Error).message, success: false };
    }
  }

  // Get low stock variants across all products
  async getLowStockVariants(threshold?: number): Promise<ApiResponse<ProductVariantWithStock[]>> {
    try {
      // Get all variants
      const allVariants = await getDocuments<ProductVariant>(
        COLLECTIONS.PRODUCT_VARIANTS,
        [where('is_active', '==', true)]
      );

      // Filter for low stock variants
      const lowStockVariants = allVariants.filter(variant => {
        const effectiveThreshold = threshold || variant.low_stock_threshold;
        return variant.inventory_count <= effectiveThreshold && variant.inventory_count > 0;
      });

      const variantsWithStock: ProductVariantWithStock[] = lowStockVariants.map(variant => ({
        ...variant,
        available_stock: variant.inventory_count,
        is_low_stock: true,
        is_out_of_stock: false
      }));

      return { data: variantsWithStock, success: true };
    } catch (error) {
      return { error: (error as Error).message, success: false };
    }
  }

  // Get out of stock variants
  async getOutOfStockVariants(): Promise<ApiResponse<ProductVariantWithStock[]>> {
    try {
      const outOfStockVariants = await getDocuments<ProductVariant>(
        COLLECTIONS.PRODUCT_VARIANTS,
        [
          where('is_active', '==', true),
          where('inventory_count', '==', 0)
        ]
      );

      const variantsWithStock: ProductVariantWithStock[] = outOfStockVariants.map(variant => ({
        ...variant,
        available_stock: 0,
        is_low_stock: false,
        is_out_of_stock: true
      }));

      return { data: variantsWithStock, success: true };
    } catch (error) {
      return { error: (error as Error).message, success: false };
    }
  }

  // Delete all variants for a product
  async deleteProductVariants(productId: string): Promise<ApiResponse<void>> {
    try {
      const variants = await getDocuments<ProductVariant>(
        COLLECTIONS.PRODUCT_VARIANTS,
        [where('product_id', '==', productId)]
      );

      const operations = variants.map(variant => ({
        type: 'delete' as const,
        collection: COLLECTIONS.PRODUCT_VARIANTS,
        id: variant.id
      }));

      await batchWrite(operations);
      return { success: true };
    } catch (error) {
      return { error: (error as Error).message, success: false };
    }
  }

  // Calculate total product inventory from variants
  async calculateProductInventory(productId: string): Promise<ApiResponse<number>> {
    try {
      const variants = await getDocuments<ProductVariant>(
        COLLECTIONS.PRODUCT_VARIANTS,
        [where('product_id', '==', productId)]
      );

      const totalInventory = variants.reduce((sum, variant) => sum + variant.inventory_count, 0);
      return { data: totalInventory, success: true };
    } catch (error) {
      return { error: (error as Error).message, success: false };
    }
  }

  // Private method to log inventory transactions
  private async logInventoryTransaction(transaction: {
    variant_id: string;
    product_id: string;
    color: string;
    size: string;
    old_quantity: number;
    new_quantity: number;
    quantity_change: number;
    transaction_type: string;
    notes?: string;
  }): Promise<void> {
    try {
      await addDocument('inventory_transactions', {
        ...transaction,
        created_at: Timestamp.now()
      });
    } catch (error) {
      console.warn('Failed to log inventory transaction:', error);
      // Don't throw error as this is just for logging
    }
  }
}

// Export singleton instance
export const variantService = new VariantService();