import { CartItem, BackendCartItem } from '@/store/cartStore';
import { api } from '@/lib/api/client';

export interface OrderCartItem {
  product_id: string;
  quantity: number;
  selected_color?: string;
  selected_size?: string;
  product_image_url?: string;
  variant_key?: string;
}

/**
 * Converts cart store items to the format expected by the order API
 */
export function convertCartItemsForOrder(cartItems: CartItem[]): OrderCartItem[] {
  return cartItems.map(item => ({
    product_id: item.id,
    quantity: item.quantity,
    selected_color: item.color,
    selected_size: item.size,
    product_image_url: item.colorImageUrl || item.image,
    variant_key: item.variantKey || `${item.id}-${item.size || ''}-${item.color || ''}`
  }));
}

/**
 * Generates a unique variant key for a cart item
 */
export function generateVariantKey(productId: string, size?: string, color?: string): string {
  return `${productId}-${size || ''}-${color || ''}`;
}

/**
 * Validates that required variants are selected for a product
 */
export function validateProductVariants(
  product: { colors?: string[], sizes?: string[] },
  selectedColor?: string,
  selectedSize?: string
): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Check if color is required and selected
  if (product.colors && product.colors.length > 0 && !selectedColor) {
    errors.push('Please select a color');
  }
  
  // Check if size is required and selected
  if (product.sizes && product.sizes.length > 0 && !selectedSize) {
    errors.push('Please select a size');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Gets the primary image URL for a specific color variant
 */
export function getPrimaryImageForColor(
  images: any[],
  color?: string
): string | undefined {
  if (!images || images.length === 0) return undefined;
  
  // Filter images for the specific color
  const colorImages = images.filter(img => 
    img.color === color || (!img.color && !color)
  );
  
  // Find primary image for this color
  const primaryImage = colorImages.find(img => img.is_primary || img.isPrimary);
  if (primaryImage) {
    return primaryImage.secure_url || primaryImage.secureUrl;
  }
  
  // Fallback to first image for this color
  if (colorImages.length > 0) {
    return colorImages[0].secure_url || colorImages[0].secureUrl;
  }
  
  // Final fallback to any primary image
  const anyPrimary = images.find(img => img.is_primary || img.isPrimary);
  if (anyPrimary) {
    return anyPrimary.secure_url || anyPrimary.secureUrl;
  }
  
  // Last resort: first image
  return images[0]?.secure_url || images[0]?.secureUrl;
}

/**
 * Groups cart items by product for display purposes
 */
export function groupCartItemsByProduct(cartItems: CartItem[]) {
  const grouped: { [productId: string]: CartItem[] } = {};
  
  cartItems.forEach(item => {
    if (!grouped[item.id]) {
      grouped[item.id] = [];
    }
    grouped[item.id].push(item);
  });
  
  return grouped;
}

/**
 * Calculates the total price for cart items
 */
export function calculateCartTotal(cartItems: CartItem[]): number {
  return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
}

/**
 * Calculates the total quantity for cart items
 */
export function calculateCartQuantity(cartItems: CartItem[]): number {
  return cartItems.reduce((total, item) => total + item.quantity, 0);
}

/**
 * Formats variant information for display
 */
export function formatVariantInfo(item: CartItem): string {
  const parts: string[] = [];
  
  if (item.size) {
    parts.push(`Size: ${item.size}`);
  }
  
  if (item.color) {
    parts.push(`Color: ${item.color}`);
  }
  
  return parts.join(', ');
}

/**
 * Checks if two cart items represent the same variant
 */
export function isSameVariant(item1: CartItem, item2: CartItem): boolean {
  return (
    item1.id === item2.id &&
    item1.size === item2.size &&
    item1.color === item2.color
  );
}

// ============================================================================
// CART API INTEGRATION UTILITIES
// ============================================================================

/**
 * Converts backend cart items to frontend cart format
 */
export function convertBackendToFrontendCart(backendItems: BackendCartItem[]): CartItem[] {
  return backendItems.map((item) => {
    // Find the appropriate image for the selected color or primary image
    const selectedImage = item.product.images.find(img =>
      img.color === item.selected_color && img.secure_url
    ) || item.product.images.find(img => img.is_primary) || item.product.images[0]

    return {
      id: item.product_id,
      name: item.product.name,
      price: item.product.price,
      image: selectedImage?.secure_url || '/placeholder-product.svg',
      quantity: item.quantity,
      size: item.selected_size,
      color: item.selected_color,
      colorImageUrl: selectedImage?.secure_url,
      variantKey: `${item.product_id}-${item.selected_size || ''}-${item.selected_color || ''}`
    }
  })
}

/**
 * Converts frontend cart item to backend API format for adding to cart
 */
export function convertFrontendToBackendCartItem(item: CartItem) {
  return {
    product_id: item.id,
    quantity: item.quantity,
    selected_color: item.color,
    selected_size: item.size,
    product_image_url: item.colorImageUrl || item.image
  }
}

/**
 * Retry utility for API calls
 */
async function retryApiCall<T>(
  fn: () => Promise<T>,
  maxRetries: number = 2,
  delay: number = 1000
): Promise<T> {
  let lastError: Error

  for (let i = 0; i <= maxRetries; i++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error as Error

      // Don't retry on authentication errors (401, 403)
      if (error && typeof error === 'object' && 'status' in error) {
        const status = (error as any).status
        if (status === 401 || status === 403) {
          throw error
        }
      }

      // Don't retry on the last attempt
      if (i === maxRetries) {
        break
      }

      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay * (i + 1)))
    }
  }

  throw lastError!
}

/**
 * Cart API service functions with error handling and retry logic
 */
export const cartApi = {
  /**
   * Get user's cart from backend
   */
  async getCart(): Promise<{ items: BackendCartItem[]; itemCount: number; subtotal: number; total: number } | null> {
    try {
      const response = await retryApiCall(() => api.get('/api/cart'))
      return response.data
    } catch (error) {
      console.error('Failed to get cart:', error)
      return null
    }
  },

  /**
   * Add item to backend cart with product availability check
   */
  async addToCart(item: CartItem): Promise<{ success: boolean; error?: string }> {
    try {
      // First check if product is still available
      const productResponse = await api.get(`/api/products/${item.id}`)
      const product = productResponse

      if (!product) {
        return { success: false, error: 'Product no longer available' }
      }

      if (product.stock !== undefined && product.stock < item.quantity) {
        return { success: false, error: `Only ${product.stock} items available in stock` }
      }

      await retryApiCall(() => api.post('/api/cart', convertFrontendToBackendCartItem(item)))
      return { success: true }
    } catch (error) {
      console.error('Failed to add item to cart:', error)
      return { success: false, error: 'Failed to add item to cart' }
    }
  },

  /**
   * Update cart item quantity in backend
   */
  async updateCartItem(cartItemId: string, quantity: number): Promise<boolean> {
    try {
      await retryApiCall(() => api.put(`/api/cart/${cartItemId}`, { quantity }))
      return true
    } catch (error) {
      console.error('Failed to update cart item:', error)
      return false
    }
  },

  /**
   * Remove item from backend cart
   */
  async removeFromCart(cartItemId: string): Promise<boolean> {
    try {
      await retryApiCall(() => api.delete(`/api/cart/${cartItemId}`))
      return true
    } catch (error) {
      console.error('Failed to remove item from cart:', error)
      return false
    }
  },

  /**
   * Clear entire backend cart
   */
  async clearCart(): Promise<boolean> {
    try {
      await retryApiCall(() => api.delete('/api/cart'))
      return true
    } catch (error) {
      console.error('Failed to clear cart:', error)
      return false
    }
  },

  /**
   * Sync entire cart to backend (clear and re-add all items) with validation
   */
  async syncCartToBackend(items: CartItem[]): Promise<{ success: boolean; errors: string[] }> {
    const errors: string[] = []

    try {
      // Clear existing cart
      await retryApiCall(() => api.delete('/api/cart'))

      // Add each item with validation
      for (const item of items) {
        const result = await this.addToCart(item)
        if (!result.success && result.error) {
          errors.push(`${item.name}: ${result.error}`)
        }
      }

      return { success: errors.length === 0, errors }
    } catch (error) {
      console.error('Failed to sync cart to backend:', error)
      return { success: false, errors: ['Failed to sync cart to backend'] }
    }
  },

  /**
   * Validate cart items against current product availability
   */
  async validateCartItems(items: CartItem[]): Promise<{ validItems: CartItem[]; invalidItems: Array<{ item: CartItem; reason: string }> }> {
    const validItems: CartItem[] = []
    const invalidItems: Array<{ item: CartItem; reason: string }> = []

    for (const item of items) {
      try {
        const productResponse = await api.get(`/api/products/${item.id}`)
        const product = productResponse

        if (!product) {
          invalidItems.push({ item, reason: 'Product no longer available' })
          continue
        }

        if (product.stock !== undefined && product.stock < item.quantity) {
          // Adjust quantity to available stock
          if (product.stock > 0) {
            validItems.push({ ...item, quantity: product.stock })
          } else {
            invalidItems.push({ item, reason: 'Out of stock' })
          }
          continue
        }

        // Check if selected variants are still available
        if (item.color && product.colors && !product.colors.includes(item.color)) {
          invalidItems.push({ item, reason: `Color "${item.color}" no longer available` })
          continue
        }

        if (item.size && product.sizes && !product.sizes.includes(item.size)) {
          invalidItems.push({ item, reason: `Size "${item.size}" no longer available` })
          continue
        }

        validItems.push(item)
      } catch (error) {
        console.error(`Failed to validate item ${item.id}:`, error)
        invalidItems.push({ item, reason: 'Unable to verify availability' })
      }
    }

    return { validItems, invalidItems }
  }
}
