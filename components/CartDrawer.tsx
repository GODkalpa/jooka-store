'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ShoppingBag, Plus, Minus, Trash2, ArrowRight } from 'lucide-react'
import { useCartStore } from '@/store/cartStore'
import { formatPriceWithSymbol } from '@/lib/utils/currency'

// Free shipping threshold in NPR
const FREE_SHIPPING_THRESHOLD = 5000

export default function CartDrawer() {
  const { items, isDrawerOpen, closeDrawer, updateQuantity, removeItem, getTotalPrice, getTotalItems } = useCartStore()

  const totalPrice = getTotalPrice()
  const totalItems = getTotalItems()
  const progressPercent = Math.min(100, (totalPrice / FREE_SHIPPING_THRESHOLD) * 100)
  const remainingForFreeShipping = FREE_SHIPPING_THRESHOLD - totalPrice

  return (
    <AnimatePresence>
      {isDrawerOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={closeDrawer}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs"
          />

          {/* Drawer Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 bottom-0 z-50 w-full max-w-md bg-canvas border-l border-border-muted shadow-2xl flex flex-col font-sans"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-border-muted bg-surface">
              <div className="flex items-center space-x-2">
                <ShoppingBag className="w-5 h-5 text-black" />
                <h2 className="text-base font-semibold text-black tracking-tight">
                  Shopping Bag ({totalItems})
                </h2>
              </div>
              <button
                onClick={closeDrawer}
                className="p-2 text-neutral-500 hover:text-black transition-colors rounded-full hover:bg-surface-muted"
                aria-label="Close cart drawer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Free Shipping Meter */}
            <div className="px-6 py-3.5 bg-surface-muted border-b border-border-muted">
              {remainingForFreeShipping > 0 ? (
                <p className="text-xs text-neutral-600 font-medium text-center">
                  Add <span className="font-semibold text-black">{formatPriceWithSymbol(remainingForFreeShipping)}</span> more for <span className="font-semibold text-black">FREE Shipping</span> in Nepal!
                </p>
              ) : (
                <p className="text-xs text-emerald-700 font-semibold text-center flex items-center justify-center gap-1">
                  🎉 Congratulations! You unlocked FREE Shipping!
                </p>
              )}
              <div className="w-full bg-neutral-200 h-1.5 rounded-full mt-2 overflow-hidden">
                <div
                  className="bg-black h-full transition-all duration-500 rounded-full"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center py-12 space-y-4">
                  <div className="w-16 h-16 rounded-full bg-surface-muted flex items-center justify-center text-neutral-400">
                    <ShoppingBag className="w-8 h-8 stroke-1" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-base font-medium text-black">Your bag is empty</p>
                    <p className="text-xs text-neutral-500 max-w-[240px]">
                      Discover our curated Capsule Collection essentials.
                    </p>
                  </div>
                  <Link
                    href="/shop"
                    onClick={closeDrawer}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-black text-white text-xs font-medium tracking-widest uppercase hover:bg-neutral-800 transition-colors mt-2"
                  >
                    Explore Shop
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              ) : (
                items.map((item) => {
                  const itemKey = `${item.id}-${item.size || ''}-${item.color || ''}`
                  return (
                    <div
                      key={itemKey}
                      className="flex gap-4 p-3 bg-surface rounded-none border border-border-muted transition-all"
                    >
                      {/* Image Thumbnail */}
                      <div className="relative w-20 aspect-[3/4] bg-surface-muted flex-shrink-0 overflow-hidden">
                        <Image
                          src={item.image || '/placeholder-product.svg'}
                          alt={item.name}
                          fill
                          className="object-cover object-center"
                        />
                      </div>

                      {/* Info & Quantity */}
                      <div className="flex-1 flex flex-col justify-between py-0.5">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="text-sm font-medium text-black line-clamp-1">
                              {item.name}
                            </h3>
                            <div className="flex items-center gap-2 text-xs text-neutral-500 mt-1">
                              {item.size && (
                                <span className="bg-surface-muted px-1.5 py-0.5 border border-border-muted text-[10px] uppercase font-mono">
                                  Size: {item.size}
                                </span>
                              )}
                              {item.color && (
                                <span className="bg-surface-muted px-1.5 py-0.5 border border-border-muted text-[10px]">
                                  {item.color}
                                </span>
                              )}
                            </div>
                          </div>
                          <button
                            onClick={() => removeItem(itemKey)}
                            className="text-neutral-400 hover:text-red-600 transition-colors p-1"
                            title="Remove item"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="flex items-center justify-between mt-3">
                          {/* Quantity selector */}
                          <div className="flex items-center border border-border-muted bg-surface">
                            <button
                              onClick={() => updateQuantity(itemKey, item.quantity - 1)}
                              className="p-1 text-neutral-600 hover:text-black hover:bg-surface-muted transition-colors"
                              aria-label="Decrease quantity"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="px-2.5 text-xs font-medium text-black min-w-[24px] text-center">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(itemKey, item.quantity + 1)}
                              className="p-1 text-neutral-600 hover:text-black hover:bg-surface-muted transition-colors"
                              aria-label="Increase quantity"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>

                          {/* Item Total */}
                          <span className="text-sm font-semibold text-black">
                            {formatPriceWithSymbol(item.price * item.quantity)}
                          </span>
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
            </div>

            {/* Footer Summary & Checkout */}
            {items.length > 0 && (
              <div className="px-6 py-5 border-t border-border-muted bg-surface space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-neutral-500">
                    <span>Subtotal</span>
                    <span className="font-semibold text-black">{formatPriceWithSymbol(totalPrice)}</span>
                  </div>
                  <div className="flex justify-between text-xs text-neutral-500">
                    <span>Shipping</span>
                    <span>{remainingForFreeShipping <= 0 ? 'FREE' : 'Calculated at checkout'}</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold text-black border-t border-border-muted pt-2">
                    <span>Total</span>
                    <span>{formatPriceWithSymbol(totalPrice)}</span>
                  </div>
                </div>

                <div className="space-y-2 pt-1">
                  <Link
                    href="/checkout"
                    onClick={closeDrawer}
                    className="w-full flex items-center justify-center gap-2 py-3.5 bg-black text-white text-xs font-medium tracking-widest uppercase hover:bg-neutral-800 transition-colors shadow-sm"
                  >
                    Proceed to Checkout
                    <ArrowRight className="w-4 h-4" />
                  </Link>

                  <Link
                    href="/cart"
                    onClick={closeDrawer}
                    className="w-full flex items-center justify-center py-2.5 bg-surface text-black border border-border-muted text-xs font-medium tracking-wider uppercase hover:bg-surface-muted transition-colors text-center"
                  >
                    View Shopping Cart
                  </Link>
                </div>

                <p className="text-[10px] text-neutral-400 text-center">
                  🔒 Secure local checkout in Nepal • 7-day easy exchange
                </p>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
