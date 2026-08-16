// Admin Product Variant Service (Safe Fallback Mode for Medusa)
import type {
  ProductVariant,
  CreateProductVariantData,
  VariantInventoryUpdate,
  VariantStockCheck,
  ApiResponse
} from '@/types/firebase';

export class AdminVariantService {
  async getProductVariants(productId: string): Promise<ApiResponse<ProductVariant[]>> {
    return { data: [], success: true };
  }

  async getProductVariantsWithStock(productId: string): Promise<ApiResponse<any[]>> {
    return { data: [], success: true };
  }

  async getVariant(productId: string, color: string, size: string): Promise<ApiResponse<ProductVariant | null>> {
    return { data: null, success: true };
  }

  async createProductVariants(productId: string, colors: string[], sizes: string[], defaultInventory?: number, defaultThreshold?: number): Promise<ApiResponse<ProductVariant[]>> {
    return { data: [], success: true };
  }

  async createProductVariantsWithInventory(productId: string, colors: string[], sizes: string[], inventoryData: Record<string, number>, defaultThreshold?: number): Promise<ApiResponse<ProductVariant[]>> {
    return { data: [], success: true };
  }

  async updateVariantInventory(update: VariantInventoryUpdate): Promise<ApiResponse<any>> {
    return { success: true };
  }

  async checkVariantStock(checks: VariantStockCheck[]): Promise<ApiResponse<any>> {
    return { data: { available: true, unavailable_variants: [], variant_stock: {} }, success: true };
  }

  async reserveVariantStock(reservations: VariantStockCheck[]): Promise<ApiResponse<boolean>> {
    return { data: true, success: true };
  }
}

export const adminVariantService = new AdminVariantService();