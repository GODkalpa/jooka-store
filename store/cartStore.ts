import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { cartApi, convertBackendToFrontendCart } from '@/lib/utils/cart'

export interface CartItem {
  id: string
  name: string
  price: number
  image: string
  quantity: number
  size?: string
  color?: string
  // Enhanced fields for better variant tracking
  colorImageUrl?: string // Specific image URL for the selected color
  variantKey?: string // Unique key for this specific variant combination
}

// Backend cart item format (from API)
export interface BackendCartItem {
  id: string
  user_id: string
  product_id: string
  quantity: number
  selected_color?: string
  selected_size?: string
  product: {
    id: string
    name: string
    price: number
    images: Array<{
      secure_url: string
      is_primary?: boolean
      color?: string
    }>
  }
}

interface CartStore {
  items: CartItem[]
  isLoading: boolean
  isSyncing: boolean
  lastSyncTime: number | null
  userId: string | null

  // Basic cart operations
  addItem: (item: Omit<CartItem, 'quantity'>) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  getTotalPrice: () => number
  getTotalItems: () => number

  // Backend sync operations
  setUserId: (userId: string | null) => void
  syncWithBackend: () => Promise<void>
  loadCartFromBackend: () => Promise<void>
  saveCartToBackend: () => Promise<void>
  setLoading: (loading: boolean) => void
  setSyncing: (syncing: boolean) => void

  // Internal state management
  setItems: (items: CartItem[]) => void
  mergeWithBackendCart: (backendItems: BackendCartItem[]) => void
  validateAndCleanCart: () => Promise<void>

  // Error handling
  onError?: (message: string, type?: 'error' | 'warning') => void
  setErrorHandler: (handler: (message: string, type?: 'error' | 'warning') => void) => void
}

// Helper function to generate item key
function getItemKey(item: CartItem | Omit<CartItem, 'quantity'>): string {
  return `${item.id}-${item.size || ''}-${item.color || ''}`
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isLoading: false,
      isSyncing: false,
      lastSyncTime: null,
      userId: null,
      onError: undefined,

      // Basic cart operations
      addItem: async (item) => {
        const itemKey = getItemKey(item)
        const existingItem = get().items.find(
          (cartItem) => getItemKey(cartItem) === itemKey
        )

        if (existingItem) {
          set((state) => ({
            items: state.items.map((cartItem) =>
              getItemKey(cartItem) === itemKey
                ? { ...cartItem, quantity: cartItem.quantity + 1 }
                : cartItem
            ),
          }))
        } else {
          set((state) => ({
            items: [...state.items, { ...item, quantity: 1, variantKey: itemKey }],
          }))
        }

        // Sync with backend if user is authenticated
        const { userId } = get()
        if (userId) {
          const newItem = { ...item, quantity: 1, variantKey: itemKey }
          const result = await cartApi.addToCart(newItem)

          if (!result.success) {
            // Revert the local change if backend sync failed
            set((state) => ({
              items: state.items.filter(cartItem => getItemKey(cartItem) !== itemKey)
            }))

            // Show user notification
            const { onError } = get()
            if (onError) {
              onError(result.error || 'Failed to add item to cart', 'error')
            }
          }
        }
      },

      removeItem: async (itemKey) => {
        const { userId, items } = get()
        const itemToRemove = items.find(item => getItemKey(item) === itemKey)

        set((state) => ({
          items: state.items.filter((item) => getItemKey(item) !== itemKey),
        }))

        // Sync with backend if user is authenticated
        if (userId && itemToRemove) {
          await get().saveCartToBackend()
        }
      },

      updateQuantity: async (itemKey, quantity) => {
        if (quantity <= 0) {
          await get().removeItem(itemKey)
          return
        }

        set((state) => ({
          items: state.items.map((item) =>
            getItemKey(item) === itemKey
              ? { ...item, quantity }
              : item
          ),
        }))

        // Sync with backend if user is authenticated
        const { userId } = get()
        if (userId) {
          await get().saveCartToBackend()
        }
      },

      clearCart: async () => {
        const { userId } = get()

        set({ items: [] })

        // Clear backend cart if user is authenticated
        if (userId) {
          await cartApi.clearCart()
        }
      },

      getTotalPrice: () => {
        return get().items.reduce((total, item) => total + item.price * item.quantity, 0)
      },

      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0)
      },

      // Backend sync operations
      setUserId: (userId) => {
        set({ userId })
      },

      setLoading: (loading) => {
        set({ isLoading: loading })
      },

      setSyncing: (syncing) => {
        set({ isSyncing: syncing })
      },

      setItems: (items) => {
        set({ items, lastSyncTime: Date.now() })
      },

      loadCartFromBackend: async () => {
        const { userId } = get()
        if (!userId) return

        set({ isLoading: true })
        try {
          const backendCart = await cartApi.getCart()

          if (backendCart?.items) {
            const frontendItems = convertBackendToFrontendCart(backendCart.items)
            set({
              items: frontendItems,
              lastSyncTime: Date.now(),
              isLoading: false
            })
          } else {
            set({ items: [], lastSyncTime: Date.now(), isLoading: false })
          }
        } catch (error) {
          console.error('Failed to load cart from backend:', error)
          set({ isLoading: false })
          // Don't clear local cart on error - keep local state
        }
      },

      saveCartToBackend: async () => {
        const { userId, items } = get()
        if (!userId) return

        set({ isSyncing: true })
        try {
          await cartApi.syncCartToBackend(items)
          set({ lastSyncTime: Date.now(), isSyncing: false })
        } catch (error) {
          console.error('Failed to save cart to backend:', error)
          set({ isSyncing: false })
        }
      },

      syncWithBackend: async () => {
        const { userId, items } = get()
        if (!userId) return

        set({ isSyncing: true })
        try {
          // Load backend cart
          const backendCart = await cartApi.getCart()

          if (backendCart?.items && backendCart.items.length > 0) {
            // Merge local cart with backend cart
            get().mergeWithBackendCart(backendCart.items)
          } else if (items.length > 0) {
            // Backend is empty but we have local items - save to backend
            await get().saveCartToBackend()
          }

          set({ lastSyncTime: Date.now(), isSyncing: false })
        } catch (error) {
          console.error('Failed to sync with backend:', error)
          set({ isSyncing: false })
        }
      },

      mergeWithBackendCart: (backendItems) => {
        const { items: localItems } = get()
        const backendFrontendItems = convertBackendToFrontendCart(backendItems)

        // Create a map of backend items by variant key
        const backendMap = new Map<string, CartItem>()
        backendFrontendItems.forEach(item => {
          const key = getItemKey(item)
          backendMap.set(key, item)
        })

        // Create a map of local items by variant key
        const localMap = new Map<string, CartItem>()
        localItems.forEach(item => {
          const key = getItemKey(item)
          localMap.set(key, item)
        })

        // Merge: backend takes precedence, but include local-only items
        const mergedItems: CartItem[] = []

        // Add all backend items (they take precedence)
        backendFrontendItems.forEach(item => {
          mergedItems.push(item)
        })

        // Add local items that don't exist in backend
        localItems.forEach(localItem => {
          const key = getItemKey(localItem)
          if (!backendMap.has(key)) {
            mergedItems.push(localItem)
          }
        })

        set({ items: mergedItems, lastSyncTime: Date.now() })

        // Save merged cart to backend if we added local items
        if (mergedItems.length > backendFrontendItems.length) {
          get().saveCartToBackend()
        }
      },

      validateAndCleanCart: async () => {
        const { items, userId } = get()
        if (!userId || items.length === 0) return

        try {
          const { validItems, invalidItems } = await cartApi.validateCartItems(items)

          if (invalidItems.length > 0) {
            console.log('Removing invalid cart items:', invalidItems)

            // Update local cart with only valid items
            set({ items: validItems })

            // Sync cleaned cart to backend
            if (validItems.length !== items.length) {
              await get().saveCartToBackend()
            }

            // Show user notifications about removed items
            const { onError } = get()
            if (onError && invalidItems.length > 0) {
              if (invalidItems.length === 1) {
                onError(`Removed ${invalidItems[0].item.name}: ${invalidItems[0].reason}`, 'warning')
              } else {
                onError(`Removed ${invalidItems.length} unavailable items from cart`, 'warning')
              }
            }
          }
        } catch (error) {
          console.error('Failed to validate cart items:', error)
          const { onError } = get()
          if (onError) {
            onError('Failed to validate cart items', 'error')
          }
        }
      },

      setErrorHandler: (handler) => {
        set({ onError: handler })
      },
    }),
    {
      name: 'jooka-cart-storage',
      // Only persist basic cart data, not loading states
      partialize: (state) => ({
        items: state.items,
        userId: state.userId,
        lastSyncTime: state.lastSyncTime,
      }),
    }
  )
)