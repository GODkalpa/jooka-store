'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Minus, Plus, Trash2, ShoppingBag, RefreshCw } from 'lucide-react'
import { useCartStore } from '@/store/cartStore'
import { useCartSyncContext } from '@/lib/context/CartSyncProvider'
import { formatPriceWithSymbol, calculateNepalTax } from '@/lib/utils/currency'

export default function CartPage() {
  const { items, updateQuantity, removeItem, getTotalPrice, clearCart } = useCartStore()
  const { isInitializing, isCartReady, isSyncing, manualSync, isAuthenticated } = useCartSyncContext()
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    setIsHydrated(true)
  }, [])

  const subtotal = isHydrated ? getTotalPrice() : 0
  const taxCalculation = calculateNepalTax(subtotal)
  const { taxAmount, totalWithTax } = taxCalculation

  if (!isHydrated || isInitializing) {
    return (
      <div className="min-h-screen bg-canvas pt-20 md:pt-24 py-8 flex items-center justify-center font-sans">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs text-neutral-600 font-medium uppercase tracking-wider">
            {!isHydrated ? 'Loading cart...' : 'Syncing cart...'}
          </p>
        </div>
      </div>
    )
  }

  if (isCartReady && items.length === 0) {
    return (
      <div className="min-h-screen bg-canvas pt-20 md:pt-24 py-16 font-sans">
        <div className="max-w-md mx-auto px-4 text-center space-y-4">
          <ShoppingBag className="w-16 h-16 text-black mx-auto stroke-1" />
          <h1 className="text-2xl font-bold text-black tracking-tight">
            Your Shopping Bag is Empty
          </h1>
          <p className="text-xs text-neutral-500 leading-relaxed">
            Discover our curated Capsule Edition essentials and find your perfect fit.
          </p>
          <Link href="/shop" className="inline-block px-6 py-3 bg-black text-white text-xs font-medium uppercase tracking-widest hover:bg-neutral-800 transition-colors">
            Explore Collection
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-canvas pt-8 pb-20 font-sans text-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8 border-b border-border-muted pb-4">
          <h1 className="text-2xl font-bold text-black tracking-tight">
            Shopping Bag ({items.length})
          </h1>

          {isAuthenticated && (
            <div className="flex items-center gap-4">
              {isSyncing && (
                <div className="flex items-center gap-2 text-xs text-neutral-500">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Syncing...</span>
                </div>
              )}
              <button
                onClick={manualSync}
                disabled={isSyncing}
                className="flex items-center gap-2 px-3 py-1.5 text-xs bg-surface border border-border-muted hover:border-black transition-colors"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                Sync
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => {
              const itemKey = `${item.id}-${item.size || ''}-${item.color || ''}`
              return (
                <div
                  key={itemKey}
                  className="bg-surface border border-border-muted p-4 flex flex-col sm:flex-row gap-4 items-start sm:items-center"
                >
                  <div className="relative w-24 aspect-[3/4] bg-surface-muted border border-border-muted overflow-hidden flex-shrink-0">
                    <Image
                      src={item.colorImageUrl || item.image || '/placeholder-product.svg'}
                      alt={item.name}
                      fill
                      className="object-cover"
                    />
                  </div>

                  <div className="flex-1 space-y-1">
                    <h3 className="text-sm font-semibold text-black">
                      {item.name}
                    </h3>
                    <div className="flex gap-2 text-xs text-neutral-500">
                      {item.size && <span className="bg-surface-muted px-1.5 py-0.5 border border-border-muted text-[10px] uppercase font-mono">Size: {item.size}</span>}
                      {item.color && <span className="bg-surface-muted px-1.5 py-0.5 border border-border-muted text-[10px]">{item.color}</span>}
                    </div>
                    <p className="text-sm font-semibold text-black pt-1">
                      {formatPriceWithSymbol(item.price)}
                    </p>
                  </div>

                  <div className="flex items-center justify-between w-full sm:w-auto gap-6 pt-2 sm:pt-0">
                    <div className="flex items-center border border-border-muted bg-surface">
                      <button
                        onClick={() => updateQuantity(itemKey, item.quantity - 1)}
                        className="p-1.5 text-neutral-600 hover:text-black hover:bg-surface-muted transition-colors"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="px-3 text-xs font-semibold text-black">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(itemKey, item.quantity + 1)}
                        className="p-1.5 text-neutral-600 hover:text-black hover:bg-surface-muted transition-colors"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <div className="text-right">
                      <p className="text-sm font-bold text-black">
                        {formatPriceWithSymbol(item.price * item.quantity)}
                      </p>
                      <button
                        onClick={() => removeItem(itemKey)}
                        className="text-xs text-neutral-400 hover:text-red-600 transition-colors mt-1"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}

            <div className="flex justify-between items-center pt-4">
              <button
                onClick={clearCart}
                className="text-xs text-neutral-500 hover:text-red-600 transition-colors"
              >
                Clear Entire Bag
              </button>
              <Link href="/shop" className="text-xs font-medium text-black hover:underline">
                ← Continue Shopping
              </Link>
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-surface border border-border-muted p-6 h-fit space-y-6">
            <h2 className="text-base font-bold text-black tracking-tight border-b border-border-muted pb-3">
              Order Summary
            </h2>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between text-neutral-600">
                <span>Subtotal</span>
                <span className="font-semibold text-black">{formatPriceWithSymbol(subtotal)}</span>
              </div>
              <div className="flex justify-between text-neutral-600">
                <span>Delivery (Nepal)</span>
                <span className="font-semibold text-black">{subtotal >= 5000 ? 'FREE' : 'Calculated at checkout'}</span>
              </div>
              <div className="flex justify-between text-neutral-600">
                <span>VAT (13%)</span>
                <span className="font-semibold text-black">{formatPriceWithSymbol(taxAmount)}</span>
              </div>
              <div className="border-t border-border-muted pt-3 flex justify-between text-sm font-bold text-black">
                <span>Estimated Total</span>
                <span>{formatPriceWithSymbol(totalWithTax)}</span>
              </div>
            </div>

            <Link
              href="/checkout"
              className="w-full py-3.5 bg-black text-white text-xs font-medium tracking-widest uppercase hover:bg-neutral-800 transition-colors text-center block shadow-sm"
            >
              Proceed to Checkout
            </Link>

            <p className="text-[11px] text-neutral-400 text-center">
              🔒 Fast Nepal delivery • 7-day easy size exchange
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}