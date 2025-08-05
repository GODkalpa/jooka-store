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

  // Handle hydration
  useEffect(() => {
    setIsHydrated(true)
  }, [])

  // Calculate totals with Nepal tax (only after hydration to prevent SSR mismatch)
  const subtotal = isHydrated ? getTotalPrice() : 0
  const taxCalculation = calculateNepalTax(subtotal)
  const { taxAmount, totalWithTax } = taxCalculation

  // Show loading state during hydration or cart initialization
  if (!isHydrated || isInitializing) {
    return (
      <div className="min-h-screen pt-20 md:pt-24 py-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold mx-auto mb-4"></div>
          <p className="text-gray-300">
            {!isHydrated ? 'Loading cart...' : 'Syncing cart...'}
          </p>
        </div>
      </div>
    )
  }

  if (isCartReady && items.length === 0) {
    return (
      <div className="min-h-screen pt-20 md:pt-24 py-16">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <ShoppingBag className="w-24 h-24 text-gold mx-auto mb-6" />
            <h1 className="text-4xl font-serif font-bold text-gold mb-4">
              Your Cart is Empty
            </h1>
            <p className="text-gray-300 text-lg mb-8">
              {isAuthenticated
                ? "Your cart is empty. Discover our beautiful collection and add some items."
                : "Discover our beautiful collection and add some items to your cart."
              }
            </p>
            <Link href="/shop" className="btn-primary">
              Continue Shopping
            </Link>
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-20 md:pt-24 py-8">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex items-center justify-between mb-8"
        >
          <h1 className="text-4xl font-serif font-bold text-gold">
            Shopping Cart
          </h1>

          {/* Sync Status and Controls */}
          {isAuthenticated && (
            <div className="flex items-center gap-4">
              {isSyncing && (
                <div className="flex items-center gap-2 text-gold">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span className="text-sm">Syncing...</span>
                </div>
              )}
              <button
                onClick={manualSync}
                disabled={isSyncing}
                className="flex items-center gap-2 px-3 py-1 text-sm border border-gold/30 rounded-lg hover:border-gold/60 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                Sync Cart
              </button>
            </div>
          )}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item, index) => (
              <motion.div
                key={`${item.id}-${item.size}-${item.color}`}
                className="bg-charcoal/50 rounded-lg p-6 flex flex-col md:flex-row gap-4"
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <div className="relative w-full md:w-32 h-40 md:h-32 rounded-lg overflow-hidden">
                  <Image
                    src={item.colorImageUrl || item.image}
                    alt={`${item.name}${item.color ? ` - ${item.color}` : ''}`}
                    fill
                    className="object-cover"
                  />
                  {/* Color indicator overlay */}
                  {item.color && (
                    <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                      {item.color}
                    </div>
                  )}
                </div>

                <div className="flex-1 space-y-2">
                  <h3 className="text-lg font-semibold text-gold">
                    {item.name}
                  </h3>
                  <div className="flex flex-wrap gap-4 text-sm">
                    {item.size && (
                      <span className="bg-charcoal/50 px-2 py-1 rounded text-gray-300">
                        Size: <span className="text-white font-medium">{item.size}</span>
                      </span>
                    )}
                    {item.color && (
                      <span className="bg-charcoal/50 px-2 py-1 rounded text-gray-300">
                        Color: <span className="text-white font-medium">{item.color}</span>
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-gold font-semibold">
                      {formatPriceWithSymbol(item.price)}
                    </p>
                    <p className="text-sm text-gray-400">
                      Total: <span className="text-gold font-medium">{formatPriceWithSymbol(item.price * item.quantity)}</span>
                    </p>
                  </div>
                </div>

                <div className="flex flex-col md:items-end justify-between">
                  <button
                    onClick={() => removeItem(`${item.id}-${item.size}-${item.color}`)}
                    className="text-red-400 hover:text-red-300 transition-colors mb-4 md:mb-0"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => updateQuantity(`${item.id}-${item.size}-${item.color}`, item.quantity - 1)}
                      className="p-1 border border-gray-600 rounded hover:border-gold transition-colors"
                    >
                      <Minus className="w-4 h-4 text-gold" />
                    </button>
                    <span className="px-3 py-1 text-gold font-semibold">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(`${item.id}-${item.size}-${item.color}`, item.quantity + 1)}
                      className="p-1 border border-gray-600 rounded hover:border-gold transition-colors"
                    >
                      <Plus className="w-4 h-4 text-gold" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}

            <motion.div
              className="flex justify-between items-center pt-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <button
                onClick={clearCart}
                className="text-red-400 hover:text-red-300 transition-colors"
              >
                Clear Cart
              </button>
              <Link href="/shop" className="text-gold hover:text-white transition-colors">
                Continue Shopping
              </Link>
            </motion.div>
          </div>

          {/* Order Summary */}
          <motion.div
            className="bg-charcoal/50 rounded-lg p-6 h-fit"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h2 className="text-2xl font-serif font-bold text-gold mb-6">
              Order Summary
            </h2>

            <div className="space-y-4 mb-6">
              <div className="flex justify-between">
                <span className="text-gray-300">Subtotal</span>
                <span className="text-gold font-semibold">
                  {formatPriceWithSymbol(subtotal)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Shipping</span>
                <span className="text-gold font-semibold">Free</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">VAT (13%)</span>
                <span className="text-gold font-semibold">
                  {formatPriceWithSymbol(taxAmount)}
                </span>
              </div>
              <div className="border-t border-gray-600 pt-4">
                <div className="flex justify-between text-lg">
                  <span className="text-gold font-semibold">Total</span>
                  <span className="text-gold font-bold">
                    {formatPriceWithSymbol(totalWithTax)}
                  </span>
                </div>
              </div>
            </div>

            <Link href="/checkout" className="w-full btn-primary block text-center">
              Proceed to Checkout
            </Link>

            <div className="mt-4 text-center">
              <p className="text-sm text-gray-400">
                Free shipping on orders over ₨ 5,000
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}