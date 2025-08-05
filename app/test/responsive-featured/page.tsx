'use client'

import { useState, useEffect } from 'react'
import ProductCard from '@/components/ProductCard'
import { motion } from 'framer-motion'

// Mock product data for testing
const mockProducts = [
  {
    id: '1',
    name: 'Elegant Gold Necklace',
    price: 299.99,
    image: '/placeholder-product.svg',
    category: 'Jewelry'
  },
  {
    id: '2',
    name: 'Luxury Diamond Ring',
    price: 1299.99,
    image: '/placeholder-product.svg',
    category: 'Rings'
  },
  {
    id: '3',
    name: 'Premium Watch Collection',
    price: 899.99,
    image: '/placeholder-product.svg',
    category: 'Watches'
  },
  {
    id: '4',
    name: 'Artisan Crafted Bracelet',
    price: 199.99,
    image: '/placeholder-product.svg',
    category: 'Bracelets'
  }
]

export default function ResponsiveFeaturedTest() {
  const [screenSize, setScreenSize] = useState('')

  useEffect(() => {
    const updateScreenSize = () => {
      const width = window.innerWidth
      if (width < 475) setScreenSize('Mobile (< 475px)')
      else if (width < 640) setScreenSize('XS (475px - 640px)')
      else if (width < 768) setScreenSize('SM (640px - 768px)')
      else if (width < 1024) setScreenSize('MD (768px - 1024px)')
      else if (width < 1280) setScreenSize('LG (1024px - 1280px)')
      else if (width < 1536) setScreenSize('XL (1280px - 1536px)')
      else setScreenSize('2XL (> 1536px)')
    }

    updateScreenSize()
    window.addEventListener('resize', updateScreenSize)
    return () => window.removeEventListener('resize', updateScreenSize)
  }, [])

  return (
    <div className="min-h-screen bg-black text-ivory">
      {/* Header */}
      <div className="bg-charcoal/50 p-4 sm:p-6 border-b border-gold/20">
        <h1 className="text-2xl sm:text-3xl font-serif text-gold mb-2">
          Responsive Featured Collection Test
        </h1>
        <p className="text-ivory/70 text-sm sm:text-base">
          Current screen size: <span className="text-gold font-medium">{screenSize}</span>
        </p>
        <p className="text-ivory/60 text-xs sm:text-sm mt-2">
          Resize your browser window to test different breakpoints
        </p>
      </div>

      {/* Featured Products Section - Exact copy from home page */}
      <section className="relative py-12 sm:py-16 md:py-20 lg:py-24 xl:py-28 px-3 sm:px-4 md:px-6 lg:px-8 xl:px-12">
        <div className="absolute inset-0 bg-gradient-to-b from-black via-black/98 to-black" />

        <div className="relative z-10 max-w-7xl mx-auto">
          {/* Section Header */}
          <motion.div
            className="text-center mb-8 sm:mb-12 md:mb-16 lg:mb-20"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="inline-block"
            >
              <span className="text-xs sm:text-sm font-medium tracking-[0.15em] sm:tracking-[0.2em] text-gold/60 uppercase mb-3 sm:mb-4 block">
                Curated Excellence
              </span>
            </motion.div>

            <motion.h2
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-serif font-light text-gold mb-6 sm:mb-8 tracking-tight leading-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              Featured
              <span className="block text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl text-ivory/90 font-light italic mt-1 sm:mt-2">
                Collection
              </span>
            </motion.h2>

            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: "3rem" }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="h-px bg-gradient-to-r from-transparent via-gold to-transparent mx-auto mb-6 sm:mb-8"
            />

            <motion.p
              className="text-sm sm:text-base md:text-lg lg:text-xl text-ivory/70 max-w-2xl lg:max-w-3xl mx-auto leading-relaxed font-light px-4 sm:px-0"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              Discover our carefully curated selection of luxury pieces that embody
              <span className="text-gold/80 font-medium"> timeless elegance</span> and
              <span className="text-gold/80 font-medium"> natural beauty</span>.
            </motion.p>
          </motion.div>

          {/* Products Grid */}
          <motion.div
            className="featured-grid grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-5 md:gap-6 lg:gap-8 xl:gap-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            {mockProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </motion.div>

          {/* Call to Action */}
          <motion.div
            className="text-center mt-8 sm:mt-12 md:mt-16 lg:mt-20"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.4 }}
          >
            <button className="inline-flex items-center px-6 sm:px-8 py-3 sm:py-4 text-xs sm:text-sm font-medium tracking-[0.1em] text-gold border-2 border-gold/30 hover:border-gold hover:bg-gold hover:text-black transition-all duration-500 uppercase group hover:scale-105 active:scale-95 transform transition-transform tap-target">
              <span>Shop Now</span>
              <span className="ml-2 group-hover:ml-4 transition-all duration-300">
                →
              </span>
            </button>
          </motion.div>
        </div>
      </section>

      {/* Debug Info */}
      <div className="bg-charcoal/30 p-4 sm:p-6 border-t border-gold/20">
        <h3 className="text-lg font-serif text-gold mb-4">Responsive Breakpoints:</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
          <div className="bg-black/40 p-3 rounded border border-gold/10">
            <strong className="text-gold">Mobile:</strong> &lt; 475px<br />
            <span className="text-ivory/70">2 column grid</span>
          </div>
          <div className="bg-black/40 p-3 rounded border border-gold/10">
            <strong className="text-gold">XS:</strong> 475px - 640px<br />
            <span className="text-ivory/70">2 column grid</span>
          </div>
          <div className="bg-black/40 p-3 rounded border border-gold/10">
            <strong className="text-gold">SM:</strong> 640px - 768px<br />
            <span className="text-ivory/70">2 column grid</span>
          </div>
          <div className="bg-black/40 p-3 rounded border border-gold/10">
            <strong className="text-gold">MD:</strong> 768px - 1024px<br />
            <span className="text-ivory/70">2 column grid</span>
          </div>
          <div className="bg-black/40 p-3 rounded border border-gold/10">
            <strong className="text-gold">LG:</strong> 1024px - 1280px<br />
            <span className="text-gold/70">3 column grid</span>
          </div>
          <div className="bg-black/40 p-3 rounded border border-gold/10">
            <strong className="text-gold">XL+:</strong> &gt; 1280px<br />
            <span className="text-gold/70">4 column grid</span>
          </div>
        </div>
      </div>
    </div>
  )
}