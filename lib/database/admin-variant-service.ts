// Admin Product Variant Service for server-side operations
import { getAdminDb } from '@/lib/firebase/admin';
import { Timestamp } from 'firebase-admin/firestore';
import type {
  ProductVariant,
  CreateProductVariantData,
  VariantInventoryUpdate,
  VariantStockCheck,
  ApiResponse
} from '@/types/firebase';

export class AdminVariantService {
  private db = getAdminDb();

  // Get all variants for a product
  async getProductVariants(productId: string): Promise<ApiResponse<ProductVariant[]>> {
    try {
      // Simplified query without orderBy to avoid index requirements
      // We can sort client-side if needed
      const variantsSnapshot = await this.db.collection('product_variants')
        .where('product_id', '==', productId)
        .get();

      const variants = variantsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as ProductVariant[];

      // Sort client-side by color then size
      variants.sort((a, b) => {
        if (a.color !== b.color) {
          return a.color.localeCompare(b.color);
        }
        return a.size.localeCompare(b.size);
      });

      return { data: variants, success: true };
    } catch (error) {
      console.error('Error fetching product variants:', error);
      return { error: (error as Error).message, success: false };
    }
  }

  // Get variants with stock status
  async getProductVariantsWithStock(productId: string): Promise<ApiResponse<any[]>> {
    try {
      const variantsResult = await this.getProductVariants(productId);
      
      if (variantsResult.error || !variantsResult.data) {
        return variantsResult;
      }

      const variantsWithStock = variantsResult.data.map(variant => ({
        ...variant,
        available_stock: variant.inventory_count,
        is_low_stock: variant.inventory_count <= variant.low_stock_threshold && variant.inventory_count > 0,
        is_out_of_stock: variant.inventory_count <= 0
      }));

      return { data: variantsWithStock, success: true };
    } catch (error) {
      console.error('Error fetching product variants with stock:', error);
      return { error: (error as Error).message, success: false };
    }
  }

  // Get specific variant
  async getVariant(productId: string, color: string, size: string): Promise<ApiResponse<ProductVariant | null>> {
    try {
      const variantsSnapshot = await this.db.collection('product_variants')
        .where('product_id', '==', productId)
        .where('color', '==', color)
        .where('size', '==', size)
        .limit(1)
        .get();

      const variant = variantsSnapshot.docs.length > 0 
        ? { id: variantsSnapshot.docs[0].id, ...variantsSnapshot.docs[0].data() } as ProductVariant
        : null;

      return { data: variant, success: true };
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
      const batch = this.db.batch();
      const createdVariants: ProductVariant[] = [];

      // Generate all color-size combinations
      for (const color of colors) {
        for (const size of sizes) {
          const sku = `${productId}-${color.toUpperCase()}-${size.toUpperCase()}`;
          
          const variantRef = this.db.collection('product_variants').doc();
          const variantData = {
            product_id: productId,
            color,
            size,
            sku,
            inventory_count: defaultInventory,
            low_stock_threshold: defaultThreshold,
            is_active: true,
            created_at: new Date(),
            updated_at: new Date()
          };

          try {
            batch.set(variantRef, variantData);
            
            const variant = {
              id: variantRef.id,
              product_id: variantData.product_id,
              color: variantData.color,
              size: variantData.size,
              sku: variantData.sku,
              inventory_count: variantData.inventory_count,
              low_stock_threshold: variantData.low_stock_threshold,
              is_active: variantData.is_active,
              created_at: variantData.created_at,
              updated_at: variantData.updated_at
            } as unknown as ProductVariant; // Cast to handle Timestamp type mismatch
            createdVariants.push(variant);
          } catch (error) {
            console.error('Error adding variant to batch:', error);
            throw error;
          }
        }
      }

      try {
        await batch.commit();
        console.log('Successfully committed batch with variants:', {
          variantCount: createdVariants.length,
          variants: createdVariants.map(v => ({
            id: v.id,
            sku: v.sku,
            inventory: v.inventory_count
          }))
        });
        return { data: createdVariants, success: true };
      } catch (error) {
        console.error('Error committing batch:', error);
        return { error: `Failed to commit variants batch: ${(error as Error).message}`, success: false };
      }
    } catch (error) {
      console.error('Error in createProductVariantsWithInventory:', error);
      return { error: `Failed to create variants: ${(error as Error).message}`, success: false };
    }
  }

  // Create variants with specific inventory data
  async createProductVariantsWithInventory(
    productId: string,
    colors: string[],
    sizes: string[],
    inventoryData: {[key: string]: number},
    defaultThreshold: number = 5
  ): Promise<ApiResponse<ProductVariant[]>> {
    try {
      if (!productId || !colors.length || !sizes.length) {
        console.error('Invalid input data:', { productId, colorsCount: colors.length, sizesCount: sizes.length });
        return { error: 'Invalid input data', success: false };
      }

      console.log('Creating variants with inventory data:', {
        productId,
        colors,
        sizes,
        inventoryData,
        inventoryDataKeys: Object.keys(inventoryData)
      });

      // Log expected variant keys for debugging
      colors.forEach(color => {
        sizes.forEach(size => {
          const key = `${color}-${size}`;
          console.log(`Expected variant key: ${key}, Inventory: ${inventoryData[key] || 0}`);
        });
      });

      const batch = this.db.batch();
      const createdVariants: ProductVariant[] = [];

      // Generate all color-size combinations
      for (const color of colors) {
        for (const size of sizes) {
          const sku = `${productId}-${color.toUpperCase()}-${size.toUpperCase()}`;
          const variantKey = `${color}-${size}`;
          const inventoryCount = inventoryData[variantKey] || 0;
          
          console.log('Creating variant:', {
            sku,
            variantKey,
            inventoryCount,
            hasInventoryData: variantKey in inventoryData
          });
          
          const variantRef = this.db.collection('product_variants').doc();
          const now = Timestamp.now();
          const variantData = {
            product_id: productId,
            color,
            size,
            sku,
            inventory_count: inventoryCount,
            low_stock_threshold: defaultThreshold,
            is_active: true,
            created_at: now,
            updated_at: now
          };

          console.log('Creating variant:', {
            sku,
            color,
            size,
            inventoryCount,
            variantRef: variantRef.id
          });

          try {
            batch.set(variantRef, variantData);
          } catch (error) {
            console.error('Error adding variant to batch:', error);
            throw error;
          }
          
          createdVariants.push({
            id: variantRef.id,
            ...variantData
          } as ProductVariant);
        }
      }

      await batch.commit();

      return { data: createdVariants, success: true };
    } catch (error) {
      return { error: (error as Error).message, success: false };
    }
  }

  // Update variant inventory
  async updateVariantInventory(update: VariantInventoryUpdate): Promise<ApiResponse<ProductVariant>> {
    try {
      const variantResult = await this.getVariant(update.product_id, update.color, update.size);
      
      if (variantResult.error || !variantResult.data) {
        return { error: 'Variant not found', success: false };
      }

      const variant = variantResult.data;
      const newInventoryCount = Math.max(0, variant.inventory_count + update.quantity_change);

      await this.db.collection('product_variants').doc(variant.id).update({
        inventory_count: newInventoryCount,
        updated_at: new Date()
      });

      // Log inventory transaction
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

      const updatedVariant: ProductVariant = {
        ...variant,
        inventory_count: newInventoryCount
      };

      return { data: updatedVariant, success: true };
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
      const batch = this.db.batch();

      for (const reservation of reservations) {
        const variantResult = await this.getVariant(reservation.product_id, reservation.color, reservation.size);
        
        if (variantResult.data) {
          const variant = variantResult.data;
          const newInventoryCount = Math.max(0, variant.inventory_count - reservation.requested_quantity);

          const variantRef = this.db.collection('product_variants').doc(variant.id);
          batch.update(variantRef, {
            inventory_count: newInventoryCount,
            updated_at: new Date()
          });
        }
      }

      await batch.commit();

      return { data: true, success: true };
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
      await this.db.collection('inventory_transactions').add({
        ...transaction,
        created_at: new Date()
      });
    } catch (error) {
      console.warn('Failed to log inventory transaction:', error);
      // Don't throw error as this is just for logging
    }
  }
}

// Export singleton instance
export const adminVariantService = new AdminVariantService();