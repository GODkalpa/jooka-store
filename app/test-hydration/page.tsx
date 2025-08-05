'use client'

import React from 'react'
import MotionWrapper from '@/components/MotionWrapper'
import JookaHeroDemo from '@/components/ui/jooka-hero-demo'
import ClientOnly from '@/components/ClientOnly'
import { useCartStore } from '@/store/cartStore'

export default function TestHydrationPage() {
  const addItem = useCartStore((state) => state.addItem)

  const handleAddTestItem = () => {
    addItem({
      id: 'test-item-' + Date.now(),
      name: 'Test Product',
      price: 1000,
      image: '/placeholder-product.svg',
    })
  }

  return (
    <div className="min-h-screen bg-black text-gold">
      <h1 className="text-3xl font-bold text-center py-8">Hydration Test Page</h1>

      <div className="container mx-auto px-4 mb-8">
        <div className="text-center">
          <button
            onClick={handleAddTestItem}
            className="bg-gold text-black px-6 py-3 rounded-lg font-semibold hover:bg-gold/90 transition-colors"
          >
            Add Test Item to Cart
          </button>
          <p className="text-gray-400 text-sm mt-2">
            Click this button to test if adding items to cart causes hydration errors
          </p>
        </div>
      </div>

      <ClientOnly fallback={<div>Loading hero...</div>}>
        <JookaHeroDemo />
      </ClientOnly>

      <div className="container mx-auto py-12">
        <ClientOnly fallback={<div>Loading content...</div>}>
          <MotionWrapper
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-2xl font-semibold mb-4">Motion Component Test</h2>
            <p className="text-ivory/70">
              This page tests that hydration errors are properly handled.
            </p>
          </MotionWrapper>
        </ClientOnly>
      </div>
    </div>
  )
}
