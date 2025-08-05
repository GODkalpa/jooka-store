'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import ProductCard from '@/components/ProductCard'
import JookaHeroDemo from '@/components/ui/jooka-hero-demo'
import FallbackImage from '@/components/ui/FallbackImage'
import { StickyScrollDemo } from '@/components/ui/sticky-scroll-demo'
import ClientOnly from '@/components/ClientOnly'
import MotionWrapper from '@/components/MotionWrapper'

import TestimonialsSection from '@/components/TestimonialsSection'

// Types
interface Product {
  id: string
  name: string
  price: number
  image: string
  category?: string
  slug?: string
  images?: any[]
  category_name?: string
  status?: string
}

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch featured products
  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        setLoading(true)

        // Fetch featured products from API
        const response = await fetch('/api/products?featured=true&status=active&limit=4')
        if (!response.ok) {
          throw new Error('Failed to fetch featured products')
        }
        const result = await response.json()

        // Transform products data for ProductCard component
        const transformedProducts = (result.data || []).map((product: any) => ({
          id: product.id,
          name: product.name,
          price: product.price,
          image: product.images?.[0]?.secure_url || '/placeholder-product.svg',
          category: product.category?.name || product.category_name || 'Uncategorized',
          slug: product.slug,
          images: product.images,
          status: product.status
        }))

        setFeaturedProducts(transformedProducts)

      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
        console.error('Error fetching featured products:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchFeaturedProducts()
  }, [])

  return (
    <div className="min-h-screen" suppressHydrationWarning>
      {/* Hero Section */}
      <ClientOnly fallback={
        <div className="min-h-screen bg-black flex items-center justify-center">
          <div className="text-gold">Loading...</div>
        </div>
      }>
        <JookaHeroDemo />
      </ClientOnly>

      {/* Featured Products Section */}
      <section className="relative py-16 sm:py-20 md:py-24 px-4 sm:px-6 md:px-8 lg:px-12" suppressHydrationWarning>
        {/* Clean Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-black via-black/98 to-black" />

        <div className="relative z-10 max-w-7xl mx-auto">
          <ClientOnly fallback={
            <div className="text-center py-20">
              <div className="text-gold">Loading featured products...</div>
            </div>
          }>
          {/* Section Header */}
          <MotionWrapper
            className="text-center mb-12 sm:mb-16 md:mb-20"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            viewport={{ once: true }}
          >
            <MotionWrapper
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="inline-block"
            >
              <span className="text-sm font-medium tracking-[0.2em] text-gold/60 uppercase mb-4 block" suppressHydrationWarning>
                Curated Excellence
              </span>
            </MotionWrapper>

            <MotionWrapper
              as="h2"
              className="text-5xl md:text-6xl lg:text-7xl font-serif font-light text-gold mb-8 tracking-tight"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              viewport={{ once: true }}
            >
              Featured
              <span className="block text-4xl md:text-5xl lg:text-6xl text-ivory/90 font-light italic" suppressHydrationWarning>
                Collection
              </span>
            </MotionWrapper>

            <MotionWrapper
              initial={{ opacity: 0, width: 0 }}
              whileInView={{ opacity: 1, width: "4rem" }}
              transition={{ duration: 0.8, delay: 0.5 }}
              viewport={{ once: true }}
              className="h-px bg-gradient-to-r from-transparent via-gold to-transparent mx-auto mb-8"
            >
              <div suppressHydrationWarning></div>
            </MotionWrapper>

            <MotionWrapper
              as="p"
              className="text-lg md:text-xl text-ivory/70 max-w-3xl mx-auto leading-relaxed font-light"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              viewport={{ once: true }}
            >
              Discover our carefully curated selection of luxury pieces that embody
              <span className="text-gold/80 font-medium" suppressHydrationWarning> timeless elegance</span> and
              <span className="text-gold/80 font-medium" suppressHydrationWarning> natural beauty</span>.
            </MotionWrapper>
          </MotionWrapper>

          {/* Products Grid */}
          <MotionWrapper
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8 lg:gap-12"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            viewport={{ once: true }}
          >
            {loading ? (
              // Loading state
              Array.from({ length: 4 }).map((_, index) => (
                <MotionWrapper
                  key={`loading-${index}`}
                  className="bg-black/40 backdrop-blur-sm border border-gold/10 rounded-lg aspect-[4/5] flex items-center justify-center"
                  initial={{ opacity: 0, y: 60, scale: 0.9 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{
                    duration: 0.8,
                    delay: 0.9 + index * 0.15,
                    ease: "easeOut"
                  }}
                  viewport={{ once: true }}
                >
                  <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" suppressHydrationWarning></div>
                </MotionWrapper>
              ))
            ) : error ? (
              // Error state
              <MotionWrapper
                className="col-span-full text-center py-12"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
              >
                <p className="text-red-400 mb-4" suppressHydrationWarning>Error loading featured products: {error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="px-6 py-2 bg-gold text-black rounded hover:bg-gold/80 transition-colors"
                >
                  Retry
                </button>
              </MotionWrapper>
            ) : featuredProducts.length === 0 ? (
              // No products state
              <MotionWrapper
                className="col-span-full text-center py-12"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
              >
                <p className="text-ivory/60 mb-4" suppressHydrationWarning>No featured products available</p>
                <Link
                  href="/shop"
                  className="px-6 py-2 bg-gold text-black rounded hover:bg-gold/80 transition-colors"
                >
                  Browse All Products
                </Link>
              </MotionWrapper>
            ) : (
              // Products loaded successfully
              featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))
            )}
          </MotionWrapper>

          {/* Call to Action */}
          <MotionWrapper
            className="text-center mt-12 sm:mt-16 md:mt-20"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.4 }}
            viewport={{ once: true }}
          >
            <Link
              href="/shop"
              className="inline-flex items-center px-8 py-4 text-sm font-medium tracking-[0.1em] text-gold border-2 border-gold/30 hover:border-gold hover:bg-gold hover:text-black transition-all duration-500 uppercase group hover:scale-105 active:scale-95 transform transition-transform"
            >
              <span suppressHydrationWarning>Shop Now</span>
              <span className="ml-2 group-hover:ml-4 transition-all duration-300" suppressHydrationWarning>
                →
              </span>
            </Link>
          </MotionWrapper>
          </ClientOnly>
        </div>
      </section>


      {/* Our Story - Sticky Scroll Section */}
      <ClientOnly fallback={
        <div className="py-20 bg-black text-center">
          <div className="text-gold">Loading story section...</div>
        </div>
      }>
        <StickyScrollDemo />
      </ClientOnly>

      {/* Testimonials Section */}
      <ClientOnly fallback={
        <div className="py-20 bg-black text-center">
          <div className="text-gold">Loading testimonials...</div>
        </div>
      }>
        <TestimonialsSection />
      </ClientOnly>
    </div>
  )
}