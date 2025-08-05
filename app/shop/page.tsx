'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import ProductCard from '@/components/ProductCard'
import { Filter, Grid, List, Search, SlidersHorizontal } from 'lucide-react'

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

interface Category {
  id: string
  name: string
  slug: string
}

export default function ShopPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [showFilters, setShowFilters] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [sortBy, setSortBy] = useState('featured')
  const [searchQuery, setSearchQuery] = useState('')

  // Fetch products and categories
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        // Fetch products
        const productsResponse = await fetch('/api/products?status=active')
        if (!productsResponse.ok) {
          throw new Error('Failed to fetch products')
        }
        const productsResult = await productsResponse.json()

        // Transform products data for ProductCard component
        const transformedProducts = (productsResult.data || []).map((product: any) => ({
          id: product.id,
          name: product.name,
          price: product.price,
          image: product.images?.[0]?.secure_url || '/placeholder-product.svg',
          category: product.category?.name || product.category_name || 'Uncategorized',
          slug: product.slug,
          images: product.images,
          status: product.status
        }))

        setProducts(transformedProducts)

        // Fetch categories
        const categoriesResponse = await fetch('/api/categories')
        if (categoriesResponse.ok) {
          const categoriesResult = await categoriesResponse.json()
          setCategories(categoriesResult.data || [])
        }

      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
        console.error('Error fetching data:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Initialize smooth scrolling
  useEffect(() => {
    const initLenis = async () => {
      const Lenis = (await import('lenis')).default
      const lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
      })

      function raf(time: number) {
        lenis.raf(time)
        requestAnimationFrame(raf)
      }

      requestAnimationFrame(raf)
    }

    initLenis()
  }, [])

  // Create category options from fetched categories
  const categoryOptions = ['All', ...categories.map(cat => cat.name)]

  // Filter and sort products
  let filteredProducts = selectedCategory === 'All'
    ? products
    : products.filter(product => product.category === selectedCategory)

  // Apply search filter
  if (searchQuery) {
    filteredProducts = filteredProducts.filter(product =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.category?.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }

  // Apply sorting
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return a.price - b.price
      case 'price-high':
        return b.price - a.price
      case 'name':
        return a.name.localeCompare(b.name)
      default:
        return 0 // featured order
    }
  })

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen pt-20 md:pt-24 bg-black flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-gold">Loading products...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen pt-20 md:pt-24 bg-black flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-red-400">Error: {error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-gold text-black rounded hover:bg-gold/80 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
        {/* Enhanced Header Section */}
        <section className="relative py-16 md:py-24 overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-black">
            <div className="absolute bottom-0 left-0 right-0 top-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:54px_54px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
          </div>

          <div className="container mx-auto px-4 relative z-10">
            <motion.div
              className="text-center space-y-8"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: "easeOut" }}
            >
              {/* Subtitle */}
              <motion.span
                className="inline-block text-sm font-medium tracking-[0.3em] text-gold/60 uppercase"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                Collection
              </motion.span>

              {/* Main Title */}
              <motion.div
                className="space-y-4"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif font-light tracking-tight leading-[110%] text-gold">
                  Shop
                  <span className="block text-3xl md:text-4xl lg:text-5xl text-ivory/90 font-light italic mt-2">
                    Luxury Collection
                  </span>
                </h1>

                {/* Decorative Line */}
                <motion.div
                  className="h-px bg-gradient-to-r from-transparent via-gold to-transparent w-24 mx-auto"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 1, delay: 0.8 }}
                />
              </motion.div>

              {/* Description */}
              <motion.p
                className="text-lg md:text-xl text-ivory/70 font-light tracking-wide max-w-3xl mx-auto leading-relaxed"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
              >
                Discover our complete range of luxury fashion pieces, each designed to embody natural elegance and timeless sophistication. Every item tells a story of exceptional craftsmanship.
              </motion.p>

              {/* Stats or Additional Info */}
              <motion.div
                className="flex flex-wrap justify-center gap-8 md:gap-12 pt-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 1 }}
              >
                <div className="text-center">
                  <div className="text-2xl md:text-3xl font-serif font-light text-gold">50+</div>
                  <div className="text-sm text-ivory/60 tracking-wider uppercase">Pieces</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl md:text-3xl font-serif font-light text-gold">4</div>
                  <div className="text-sm text-ivory/60 tracking-wider uppercase">Categories</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl md:text-3xl font-serif font-light text-gold">100%</div>
                  <div className="text-sm text-ivory/60 tracking-wider uppercase">Premium</div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </section>

        <div className="container mx-auto px-4 pb-8">
          {/* Enhanced Filters Section */}
          <motion.section
            className="mb-16"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
          {/* Filter Header */}
          <div className="flex items-center justify-between mb-8">
            <motion.div
              className="space-y-2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <h2 className="text-2xl md:text-3xl font-serif font-light text-gold">
                {sortedProducts.length} Products
              </h2>
              <p className="text-ivory/60 text-sm tracking-wide">
                Curated for excellence
              </p>
            </motion.div>

            {/* Mobile Filter Toggle */}
            <motion.button
              onClick={() => setShowFilters(!showFilters)}
              className="md:hidden flex items-center space-x-3 px-4 py-2 border border-gold/30 rounded-full text-gold hover:border-gold hover:bg-gold/10 transition-all duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Filter className="w-4 h-4" />
              <span className="text-sm font-medium tracking-wide">Filters</span>
            </motion.button>
          </div>

          {/* Filter Categories */}
          <motion.div
            className={`${showFilters ? 'block' : 'hidden'} md:block`}
            initial={{ opacity: 0, height: 0 }}
            animate={{
              opacity: showFilters ? 1 : 0,
              height: showFilters ? 'auto' : 0
            }}
            transition={{ duration: 0.4 }}
          >
            <div className="space-y-8">
              {/* Search and Controls */}
              <motion.div
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                {/* Search - Full width on mobile, spans 2 cols on tablet */}
                <div className="relative sm:col-span-2 lg:col-span-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gold/60" />
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-black/40 border border-gold/20 rounded-full text-ivory placeholder-ivory/40 focus:border-gold focus:outline-none transition-all duration-300 text-sm md:text-base"
                    style={{ minHeight: '44px' }} // Ensure 44px minimum touch target
                  />
                </div>

                {/* Sort */}
                <div className="relative">
                  <SlidersHorizontal className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gold/60 pointer-events-none" />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-black/40 border border-gold/20 rounded-full text-ivory focus:border-gold focus:outline-none transition-all duration-300 cursor-pointer text-sm md:text-base appearance-none"
                    style={{ minHeight: '44px' }} // Ensure 44px minimum touch target
                  >
                    <option value="featured">Featured</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="name">Name: A to Z</option>
                  </select>
                </div>

                {/* View Toggle */}
                <div className="flex items-center justify-center sm:justify-start space-x-3">
                  <span className="text-xs text-ivory/60 uppercase tracking-wider hidden sm:block">View:</span>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-3 rounded-full border transition-all duration-300 ${
                        viewMode === 'grid'
                          ? 'bg-gold text-black border-gold'
                          : 'border-gold/30 text-gold hover:border-gold'
                      }`}
                      style={{ minHeight: '44px', minWidth: '44px' }} // Ensure 44px minimum touch target
                    >
                      <Grid className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-3 rounded-full border transition-all duration-300 ${
                        viewMode === 'list'
                          ? 'bg-gold text-black border-gold'
                          : 'border-gold/30 text-gold hover:border-gold'
                      }`}
                      style={{ minHeight: '44px', minWidth: '44px' }} // Ensure 44px minimum touch target
                    >
                      <List className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>

              {/* Category Label */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
              >
                <span className="text-sm font-medium tracking-[0.2em] text-gold/60 uppercase block mb-4">
                  Categories
                </span>
              </motion.div>

              {/* Category Buttons */}
              <div className="flex flex-wrap gap-2 sm:gap-3 justify-center sm:justify-start">
                {categoryOptions.map((category, index) => (
                  <motion.button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`group relative px-4 sm:px-6 py-2 sm:py-3 rounded-full border-2 transition-all duration-500 overflow-hidden text-sm sm:text-base ${
                      selectedCategory === category
                        ? 'bg-gold text-black border-gold shadow-lg shadow-gold/20'
                        : 'border-gold/30 text-gold hover:border-gold hover:bg-gold/5'
                    }`}
                    style={{ minHeight: '44px' }} // Ensure 44px minimum touch target
                    initial={{ opacity: 0, y: 20, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{
                      duration: 0.5,
                      delay: 0.5 + index * 0.1,
                      ease: "easeOut"
                    }}
                    whileHover={{
                      scale: 1.05,
                      y: -2
                    }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {/* Background Animation */}
                    <motion.div
                      className="absolute inset-0 bg-gold"
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{
                        scale: selectedCategory === category ? 1 : 0,
                        opacity: selectedCategory === category ? 1 : 0
                      }}
                      transition={{ duration: 0.3 }}
                    />

                    {/* Text */}
                    <span className="relative z-10 text-sm font-medium tracking-wide">
                      {category}
                    </span>

                    {/* Hover Effect */}
                    <motion.div
                      className="absolute inset-0 bg-gold/10 rounded-full"
                      initial={{ scale: 0, opacity: 0 }}
                      whileHover={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.2 }}
                    />
                  </motion.button>
                ))}
              </div>

              {/* Decorative Line */}
              <motion.div
                className="h-px bg-gradient-to-r from-transparent via-gold/20 to-transparent mt-8"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 1, delay: 0.8 }}
              />
            </div>
          </motion.div>
        </motion.section>

        {/* Enhanced Products Grid */}
        <motion.section
          className="space-y-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          {/* Grid Container */}
          <motion.div
            className={`grid gap-6 md:gap-8 lg:gap-10 ${
              viewMode === 'grid'
                ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                : 'grid-cols-1 max-w-4xl mx-auto'
            }`}
            layout
            transition={{ duration: 0.6, ease: "easeInOut" }}
          >
            {sortedProducts.map((product, index) => (
              <motion.div
                key={`${selectedCategory}-${product.id}`}
                className="group"
                initial={{
                  opacity: 0,
                  y: 60,
                  scale: 0.9,
                  rotateX: 10
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                  scale: 1,
                  rotateX: 0
                }}
                exit={{
                  opacity: 0,
                  y: -30,
                  scale: 0.9,
                  transition: { duration: 0.3 }
                }}
                transition={{
                  duration: 0.8,
                  delay: index * 0.1,
                  ease: "easeOut",
                  type: "spring",
                  stiffness: 100,
                  damping: 15
                }}
                layout
                layoutId={product.id}
                whileHover={{
                  y: -8,
                  transition: { duration: 0.3, ease: "easeOut" }
                }}
              >
                <ProductCard product={product} />
              </motion.div>
            ))}
          </motion.div>

          {/* Empty State */}
          {sortedProducts.length === 0 && (
            <motion.div
              className="text-center py-20"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="space-y-4">
                <div className="w-16 h-16 mx-auto bg-gold/10 rounded-full flex items-center justify-center">
                  <Filter className="w-8 h-8 text-gold/60" />
                </div>
                <h3 className="text-xl font-serif text-gold">No products found</h3>
                <p className="text-ivory/60 max-w-md mx-auto">
                  Try adjusting your filters to discover more luxury pieces from our collection.
                </p>
              </div>
            </motion.div>
          )}
        </motion.section>

        {/* Enhanced Load More Section */}
        <motion.div
          className="text-center mt-20 space-y-8"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          {/* Decorative Line */}
          <motion.div
            className="h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent w-32 mx-auto"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 1, delay: 0.8 }}
          />

          {/* Load More Button */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <button className="group relative px-8 py-4 text-sm font-medium tracking-[0.1em] text-gold border-2 border-gold/30 hover:border-gold hover:bg-gold hover:text-black transition-all duration-500 uppercase overflow-hidden">
              {/* Background Animation */}
              <motion.div
                className="absolute inset-0 bg-gold"
                initial={{ scale: 0, opacity: 0 }}
                whileHover={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3 }}
              />

              {/* Text */}
              <span className="relative z-10 flex items-center">
                Load More Products
                <motion.span
                  className="ml-2 group-hover:ml-4 transition-all duration-300"
                  initial={{ x: 0 }}
                  whileHover={{ x: 4 }}
                >
                  →
                </motion.span>
              </span>
            </button>
          </motion.div>

          {/* Additional Info */}
          <motion.p
            className="text-ivory/50 text-sm tracking-wide"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 1 }}
          >
            Showing {sortedProducts.length} of 50+ luxury pieces
          </motion.p>
        </motion.div>

        {/* Floating Action Elements - Responsive positioning */}
        <motion.div
          className="fixed bottom-4 right-4 sm:bottom-8 sm:right-8 z-50 space-y-4"
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 1.2 }}
        >
          {/* Scroll to Top */}
          <motion.button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="w-12 h-12 sm:w-14 sm:h-14 bg-gold/90 hover:bg-gold text-black rounded-full shadow-lg backdrop-blur-sm flex items-center justify-center transition-all duration-300 hover:scale-110"
            style={{ minHeight: '44px', minWidth: '44px' }} // Ensure 44px minimum touch target
            whileHover={{ scale: 1.1, y: -2 }}
            whileTap={{ scale: 0.95 }}
          >
            <motion.div
              animate={{ y: [0, -2, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="text-lg sm:text-xl"
            >
              ↑
            </motion.div>
          </motion.button>
        </motion.div>
      </div>
    </div>
  )
}