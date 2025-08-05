'use client'

import React, { createContext, useContext, ReactNode, useEffect } from 'react'
import { useCartSync, useCartSyncStatus } from '@/hooks/useCartSync'
import { useCartStore } from '@/store/cartStore'
import { useToast } from '@/hooks/useToast'
import { ToastContainer } from '@/components/ui/Toast'

interface CartSyncContextType {
  isAuthenticated: boolean
  isLoading: boolean
  isSyncing: boolean
  lastSyncTime: number | null
  manualSync: () => Promise<void>
  reloadCart: () => Promise<void>
  hasInitialized: boolean
  isInitializing: boolean
  isCartReady: boolean
}

const CartSyncContext = createContext<CartSyncContextType | undefined>(undefined)

interface CartSyncProviderProps {
  children: ReactNode
}

/**
 * Provider that initializes cart synchronization and provides cart sync status
 * to child components. This should be placed after AuthProvider in the component tree.
 */
export function CartSyncProvider({ children }: CartSyncProviderProps) {
  const cartSync = useCartSync()
  const cartSyncStatus = useCartSyncStatus()
  const { setErrorHandler } = useCartStore()
  const { toasts, error, warning, removeToast } = useToast()

  // Set up error handler for cart store
  useEffect(() => {
    setErrorHandler((message, type = 'error') => {
      if (type === 'error') {
        error(message)
      } else {
        warning(message)
      }
    })
  }, [setErrorHandler, error, warning])

  const value: CartSyncContextType = {
    ...cartSync,
    ...cartSyncStatus,
  }

  return (
    <CartSyncContext.Provider value={value}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </CartSyncContext.Provider>
  )
}

/**
 * Hook to access cart sync context
 */
export function useCartSyncContext() {
  const context = useContext(CartSyncContext)
  
  if (context === undefined) {
    throw new Error('useCartSyncContext must be used within a CartSyncProvider')
  }
  
  return context
}

/**
 * Hook for components that need to show loading states during cart initialization
 */
export function useCartLoadingState() {
  const { isInitializing, isCartReady, isSyncing } = useCartSyncContext()
  
  return {
    isInitializing,
    isCartReady,
    isSyncing,
    showLoadingSpinner: isInitializing || isSyncing
  }
}
