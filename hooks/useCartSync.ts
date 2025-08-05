'use client'

import { useEffect, useRef } from 'react'
import { useAuth } from '@/lib/auth/firebase-auth'
import { useCartStore } from '@/store/cartStore'

/**
 * Hook that handles cart synchronization between frontend store and Firebase backend
 * 
 * Features:
 * - Loads user cart from backend when user signs in
 * - Clears local cart when user signs out (but preserves backend data)
 * - Syncs local cart changes with backend for authenticated users
 * - Handles user switching scenarios
 */
export function useCartSync() {
  const { user, isLoading: authLoading } = useAuth()
  const {
    userId,
    setUserId,
    loadCartFromBackend,
    clearCart,
    syncWithBackend,
    validateAndCleanCart,
    isLoading,
    isSyncing,
    lastSyncTime
  } = useCartStore()
  
  const previousUserId = useRef<string | null>(null)
  const hasInitialized = useRef(false)

  // Handle user authentication state changes
  useEffect(() => {
    if (authLoading) return // Wait for auth to load

    const currentUserId = user?.id || null
    const prevUserId = previousUserId.current

    // User signed in
    if (currentUserId && currentUserId !== prevUserId) {
      console.log('Cart sync: User signed in, loading cart from backend')
      setUserId(currentUserId)
      loadCartFromBackend()
      hasInitialized.current = true
    }
    // User signed out
    else if (!currentUserId && prevUserId) {
      console.log('Cart sync: User signed out, clearing local cart')
      setUserId(null)
      clearCart() // This will clear local cart but preserve backend data
      hasInitialized.current = false
    }
    // User switched (different user signed in)
    else if (currentUserId && prevUserId && currentUserId !== prevUserId) {
      console.log('Cart sync: User switched, loading new user cart')
      setUserId(currentUserId)
      loadCartFromBackend()
    }
    // No user, first load
    else if (!currentUserId && !hasInitialized.current) {
      console.log('Cart sync: No user, using guest cart')
      setUserId(null)
      hasInitialized.current = true
    }

    previousUserId.current = currentUserId
  }, [user?.id, authLoading, setUserId, loadCartFromBackend, clearCart])

  // Periodic sync and validation for authenticated users (every 5 minutes)
  useEffect(() => {
    if (!user?.id || authLoading) return

    const syncInterval = setInterval(async () => {
      const timeSinceLastSync = lastSyncTime ? Date.now() - lastSyncTime : Infinity

      // Only sync if it's been more than 5 minutes since last sync
      if (timeSinceLastSync > 5 * 60 * 1000) {
        console.log('Cart sync: Periodic sync and validation triggered')
        await validateAndCleanCart()
        await syncWithBackend()
      }
    }, 5 * 60 * 1000) // 5 minutes

    return () => clearInterval(syncInterval)
  }, [user?.id, authLoading, syncWithBackend, validateAndCleanCart, lastSyncTime])

  // Validate cart when user returns to the tab (page focus)
  useEffect(() => {
    if (!user?.id || authLoading) return

    const handleFocus = async () => {
      const timeSinceLastSync = lastSyncTime ? Date.now() - lastSyncTime : Infinity

      // Validate cart if it's been more than 1 minute since last sync
      if (timeSinceLastSync > 60 * 1000) {
        console.log('Cart sync: Page focus validation triggered')
        await validateAndCleanCart()
      }
    }

    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [user?.id, authLoading, validateAndCleanCart, lastSyncTime])

  // Manual sync function for components to trigger
  const manualSync = async () => {
    if (user?.id) {
      await syncWithBackend()
    }
  }

  // Force reload cart from backend
  const reloadCart = async () => {
    if (user?.id) {
      await loadCartFromBackend()
    }
  }

  // Validate cart items
  const validateCart = async () => {
    if (user?.id) {
      await validateAndCleanCart()
    }
  }

  return {
    isAuthenticated: !!user?.id,
    isLoading: authLoading || isLoading,
    isSyncing,
    lastSyncTime,
    manualSync,
    reloadCart,
    validateCart,
    hasInitialized: hasInitialized.current
  }
}

/**
 * Hook for components that need to know when cart sync is complete
 * Useful for showing loading states during initial cart load
 */
export function useCartSyncStatus() {
  const { user, isLoading: authLoading } = useAuth()
  const { isLoading, isSyncing } = useCartStore()
  const { hasInitialized } = useCartSync()

  const isInitializing = authLoading || (!hasInitialized && !authLoading)
  const isCartReady = hasInitialized && !isLoading && !authLoading

  return {
    isInitializing,
    isCartReady,
    isSyncing,
    isAuthenticated: !!user?.id
  }
}
