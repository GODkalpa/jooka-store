'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Minus, Plus, Heart, Share2, ChevronRight, Star } from 'lucide-react'
import { useCartStore } from '@/store/cartStore'
import ProductCard from '@/components/ProductCard'
import { formatPriceWithSymbol } from '@/lib/utils/currency'
import { formatNPR } from '@/lib/utils/nepal'

// Types
interface Product {
  id: string
  name: string
  price: number
  inventory_count?: number
  track_variants?: boolean
  images: Array<{
    id: string;
    secure_url: string;
    alt_text?: string;
    is_primary?: boolean;
    color?: string;
    order?: number;
  }>
  description?: string
  short_description?: string
  colors?: string[]
  sizes?: string[]
  category?: {
    id: string
    name: string
  }
  category_name?: string
  status: string
  featured: boolean
  slug: string
}

interface RelatedProduct {
  id: string
  name: string
  price: number
  image: string
  category?: string
}

export default function ProductPage({ params }: { params: { id: string } }) {
  const [product, setProduct] = useState<Product | null>(null)
  const [relatedProducts, setRelatedProducts] = useState<RelatedProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedImage, setSelectedImage] = useState(0)
  const [selectedSize, setSelectedSize] = useState('')
  const [selectedColor, setSelectedColor] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [variantStock, setVariantStock] = useState<{[key: string]: number}>({})
  const [checkingStock, setCheckingStock] = useState(false)

  const addItem = useCartStore((state) => state.addItem)

  // Check variant stock when color and size are selected
  const checkVariantStock = async (productId: string, color: string, size: string) => {
    if (!color || !size) return

    setCheckingStock(true)
    try {
      const response = await fetch('/api/variants', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          checks: [{
            product_id: productId,
            color,
            size,
            requested_quantity: 1
          }]
        }),
      })

      if (response.ok) {
        const result = await response.json()
        const variantKey = `${productId}-${color}-${size}`
        setVariantStock(prev => ({
          ...prev,
          [variantKey]: result.data?.variant_stock?.[variantKey] || 0
        }))
      }
    } catch (error) {
      console.error('Failed to check variant stock:', error)
    } finally {
      setCheckingStock(false)
    }
  }

  // Helper function to get images for the selected color
  const getImagesForColor = (color: string | null) => {
    if (!product?.images) {
      return []
    }

    // Filter out blob URLs and invalid images
    const validImages = product.images.filter(img =>
      img.secure_url &&
      !img.secure_url.startsWith('blob:') &&
      img.secure_url !== ''
    )



    // If no valid images, return placeholder
    if (validImages.length === 0) {
      return [{
        id: 'placeholder',
        secure_url: '/placeholder-product.svg',
        alt_text: product.name || 'Product image',
        is_primary: true,
        order: 0,
        color: color || undefined
      }]
    }

    // If no color selected, return all valid images
    if (!color) return validImages

    // Filter images for the specific color, fallback to general images if none found
    const colorImages = validImages.filter(img =>
      img.color === color || (!img.color && color === selectedColor)
    )

    // If no color-specific images found, return general images (no color assigned)
    if (colorImages.length === 0) {
      return validImages.filter(img => !img.color)
    }

    return colorImages
  }

  // Get current images based on selected color
  const currentImages = getImagesForColor(selectedColor)

  // Get the primary image for the selected color
  const getPrimaryImageForColor = (color: string | null) => {
    const images = getImagesForColor(color)
    const primaryImage = images.find(img => img.is_primary)
    return primaryImage || images[0] || product?.images?.[0]
  }

  // Get current variant stock
  const getCurrentVariantStock = () => {
    if (!product) return null
    
    // If product doesn't track variants, use main inventory
    if (!product.track_variants) {
      return product.inventory_count || 0
    }
    
    // If tracking variants but no color/size selected, return null
    if (!selectedColor || !selectedSize) return null
    
    const variantKey = `${product.id}-${selectedColor}-${selectedSize}`
    return variantStock[variantKey]
  }

  // Check if current variant is available
  const isCurrentVariantAvailable = () => {
    if (!product) return false
    
    // If not tracking variants, check main inventory
    if (!product.track_variants) {
      const mainStock = product.inventory_count || 0
      return mainStock >= quantity
    }
    
    // If tracking variants, check variant stock
    const stock = getCurrentVariantStock()
    return stock == null || stock >= quantity // null/undefined means not checked yet, assume available
  }

  // Fetch product data
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true)
        setError(null)

        // Fetch the specific product
        const productResponse = await fetch(`/api/products/${params.id}`)
        if (!productResponse.ok) {
          throw new Error('Product not found')
        }
        const productResult = await productResponse.json()
        setProduct(productResult)

        // Fetch related products (same category, excluding current product)
        const relatedResponse = await fetch(`/api/products?status=active&limit=3`)
        if (relatedResponse.ok) {
          const relatedResult = await relatedResponse.json()
          const transformedRelated = (relatedResult.data || [])
            .filter((p: any) => p.id !== params.id)
            .slice(0, 3)
            .map((p: any) => ({
              id: p.id,
              name: p.name,
              price: p.price,
              image: p.images?.[0]?.secure_url || '/placeholder-product.svg',
              category: p.category?.name || p.category_name || 'Uncategorized'
            }))
          setRelatedProducts(transformedRelated)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load product')
      } finally {
        setLoading(false)
      }
    }

    fetchProduct()
  }, [params.id])

  // Reset selected image when color changes
  useEffect(() => {
    setSelectedImage(0)
  }, [selectedColor])

  // Check variant stock when both color and size are selected
  useEffect(() => {
    if (product && product.track_variants && selectedColor && selectedSize) {
      checkVariantStock(product.id, selectedColor, selectedSize)
    }
  }, [product, selectedColor, selectedSize])

  const handleAddToCart = async () => {
    if (!product) return

    // Check stock availability first
    if (!product.track_variants) {
      // No variant tracking - check main inventory
      const mainStock = product.inventory_count || 0
      if (mainStock < quantity) {
        alert(`Only ${mainStock} items available`)
        return
      }
    } else {
      // Variant tracking enabled
      const requiresSize = product.sizes && product.sizes.length > 0
      const requiresColor = product.colors && product.colors.length > 0

      if (requiresSize && !selectedSize) {
        alert('Please select a size')
        return
      }

      if (requiresColor && !selectedColor) {
        alert('Please select a color')
        return
      }

      // Check variant stock availability
      if (selectedColor && selectedSize) {
        const currentStock = getCurrentVariantStock()
        if (typeof currentStock === 'number' && currentStock < quantity) {
          alert(`Only ${currentStock} items available for ${selectedColor} ${selectedSize}`)
          return
        }
      }
    }

    // Get the appropriate image for the selected color
    const primaryImage = getPrimaryImageForColor(selectedColor)
    const imageUrl = primaryImage?.secure_url || '/placeholder-product.svg'

    // Add items to cart (the store will handle backend sync)
    for (let i = 0; i < quantity; i++) {
      await addItem({
        id: product.id,
        name: product.name,
        price: product.price,
        image: imageUrl,
        size: selectedSize || undefined,
        color: selectedColor || undefined,
        colorImageUrl: imageUrl, // Store the color-specific image URL
        variantKey: `${product.id}-${selectedSize || ''}-${selectedColor || ''}`,
      })
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold mx-auto mb-4"></div>
              <p className="text-gold">Loading product...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (error || !product) {
    return (
      <div className="min-h-screen pt-20 md:pt-24 py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <p className="text-red-400 mb-4">{error || 'Product not found'}</p>
              <button
                onClick={() => window.history.back()}
                className="px-6 py-2 bg-gold text-black rounded hover:bg-gold/80 transition-colors"
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-20 md:pt-24 py-4 md:py-8">
      <div className="container mx-auto px-4">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center space-x-2 text-sm text-gray-400 mb-6">
          <Link href="/" className="hover:text-gold transition-colors">Home</Link>
          <ChevronRight className="w-4 h-4" />
          <Link href="/shop" className="hover:text-gold transition-colors">Shop</Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-gold">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
          {/* Product Images */}
          <div className="space-y-6">
            <motion.div
              className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-charcoal shadow-2xl"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
            >
              <Image
                src={currentImages[selectedImage]?.secure_url || currentImages[0]?.secure_url || '/placeholder-product.svg'}
                alt={`${product.name}${selectedColor ? ` - ${selectedColor}` : ''}`}
                fill
                className="object-cover hover:scale-105 transition-transform duration-500"
              />

              {/* Image overlay with zoom indicator */}
              <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors duration-300 flex items-center justify-center opacity-0 hover:opacity-100">
                <div className="bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                  Click to zoom
                </div>
              </div>
            </motion.div>

            {currentImages && currentImages.length > 1 && (
              <div className="flex space-x-3 overflow-x-auto pb-2">
                {currentImages.map((image, index) => (
                  <button
                    key={image.id || index}
                    onClick={() => setSelectedImage(index)}
                    className={`relative w-24 h-28 flex-shrink-0 rounded-xl overflow-hidden border-3 transition-all duration-300 ${
                      selectedImage === index
                        ? 'border-gold shadow-lg shadow-gold/25 scale-105'
                        : 'border-gray-600 hover:border-gold/50'
                    }`}
                  >
                    <Image
                      src={image.secure_url}
                      alt={`${product.name} ${selectedColor ? selectedColor : 'variant'} ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <motion.div
            className="space-y-8"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {/* Product Header */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-gold/80 text-sm uppercase tracking-wider font-medium">
                  {product.category?.name || product.category_name || 'Uncategorized'}
                </p>
                <div className="flex items-center space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-gold text-gold" />
                  ))}
                  <span className="text-sm text-gray-400 ml-2">(4.8) 124 reviews</span>
                </div>
              </div>

              <h1 className="text-4xl md:text-5xl font-serif font-bold text-gold leading-tight">
                {product.name}
              </h1>

              <div className="flex items-center space-x-4">
                <p className="text-3xl md:text-4xl font-bold text-gold">
                  {formatPriceWithSymbol(product.price)}
                </p>
                <div className="flex items-center space-x-2">
                  <span className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-sm font-medium">
                    In Stock
                  </span>
                  <span className="bg-gold/20 text-gold px-3 py-1 rounded-full text-sm font-medium">
                    Free Shipping
                  </span>
                </div>
              </div>
            </div>

            {/* Product Description */}
            <div className="bg-charcoal/50 rounded-xl p-6 border border-gray-700">
              <h3 className="text-xl font-serif font-semibold text-gold mb-4">Product Description</h3>
              {product.description && (
                <p className="text-gray-300 leading-relaxed text-lg">
                  {product.description}
                </p>
              )}
              {product.short_description && !product.description && (
                <p className="text-gray-300 leading-relaxed text-lg">
                  {product.short_description}
                </p>
              )}
            </div>



            {/* Size Selection */}
            {product.sizes && product.sizes.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-serif font-semibold text-gold">Size</h3>
                  <button className="text-sm text-gold hover:text-white transition-colors underline">
                    Size Guide
                  </button>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`px-4 py-3 border-2 rounded-xl font-semibold transition-all duration-300 ${
                        selectedSize === size
                          ? 'border-gold bg-gold text-black shadow-lg shadow-gold/25'
                          : 'border-gray-600 text-gray-300 hover:border-gold hover:text-gold'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Enhanced Color Selection with Image Previews */}
            {product.colors && product.colors.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-serif font-semibold text-gold">Color</h3>
                  {selectedColor && (
                    <span className="text-sm text-gray-400">
                      Showing: <span className="text-gold font-medium">{selectedColor}</span>
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-3">
                  {product.colors.map((color) => {
                    const colorImages = getImagesForColor(color)
                    const previewImage = colorImages.find(img => img.is_primary) || colorImages[0]

                    return (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        className={`group relative overflow-hidden border-2 rounded-xl transition-all duration-300 ${
                          selectedColor === color
                            ? 'border-gold shadow-lg shadow-gold/25 scale-105'
                            : 'border-gray-600 hover:border-gold/50 hover:scale-102'
                        }`}
                      >
                        {/* Color preview image */}
                        {previewImage && (
                          <div className="w-16 h-16 relative">
                            <Image
                              src={previewImage.secure_url}
                              alt={`${product.name} - ${color}`}
                              fill
                              className="object-cover"
                            />
                            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                          </div>
                        )}

                        {/* Color name */}
                        <div className={`px-3 py-2 text-sm font-semibold transition-colors ${
                          selectedColor === color
                            ? 'bg-gold text-black'
                            : 'bg-charcoal/80 text-gray-300 group-hover:text-gold'
                        }`}>
                          {color}
                        </div>

                        {/* Selected indicator */}
                        {selectedColor === color && (
                          <div className="absolute top-1 right-1 w-3 h-3 bg-gold rounded-full border-2 border-black" />
                        )}
                      </button>
                    )
                  })}
                </div>

                {/* Image count indicator */}
                {selectedColor && (
                  <div className="text-xs text-gray-400">
                    {currentImages.length} image{currentImages.length !== 1 ? 's' : ''} available for {selectedColor}
                  </div>
                )}
              </div>
            )}

            {/* Quantity */}
            <div className="space-y-4">
              <h3 className="text-xl font-serif font-semibold text-gold">Quantity</h3>
              <div className="flex items-center space-x-6">
                <div className="flex items-center border-2 border-gray-600 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-3 hover:bg-gold hover:text-black transition-all duration-300"
                  >
                    <Minus className="w-5 h-5" />
                  </button>
                  <span className="px-6 py-3 text-gold font-semibold text-lg min-w-[60px] text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-3 hover:bg-gold hover:text-black transition-all duration-300"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
                <div className="text-sm">
                  {product.track_variants ? (
                    // Variant tracking enabled
                    selectedColor && selectedSize ? (
                      checkingStock ? (
                        <p className="text-gray-400">Checking availability...</p>
                      ) : (
                        (() => {
                          const stock = getCurrentVariantStock()
                          if (stock == null) {
                            return <p className="text-gray-400">Select variant to check availability</p>
                          } else if (stock === 0) {
                            return <p className="text-red-400">Out of stock for this variant</p>
                          } else if (stock <= 5 && stock > 0) {
                            return <p className="text-yellow-400">Only <span className="font-semibold">{stock} items</span> left for {selectedColor} {selectedSize}</p>
                          } else {
                            return <p className="text-green-400"><span className="font-semibold">{stock} items</span> available for {selectedColor} {selectedSize}</p>
                          }
                        })()
                      )
                    ) : (
                      <p className="text-gray-400">Select color and size to check availability</p>
                    )
                  ) : (
                    // No variant tracking - use main inventory
                    (() => {
                      const stock = product.inventory_count || 0
                      if (stock === 0) {
                        return <p className="text-red-400">Out of stock</p>
                      } else if (stock <= 5) {
                        return <p className="text-yellow-400">Only <span className="font-semibold">{stock} items</span> left in stock</p>
                      } else {
                        return <p className="text-green-400"><span className="font-semibold">{stock} items</span> available</p>
                      }
                    })()
                  )}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-6">
              <div className="space-y-4">
                <button
                  onClick={handleAddToCart}
                  disabled={!isCurrentVariantAvailable()}
                  className={`w-full px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-[1.02] ${
                    !isCurrentVariantAvailable()
                      ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                      : 'bg-gold text-black hover:bg-gold/90 hover:shadow-lg hover:shadow-gold/25'
                  }`}
                >
                  {(() => {
                    if (!product.track_variants) {
                      // No variant tracking - check main inventory
                      const stock = product.inventory_count || 0
                      return stock === 0 ? 'Out of Stock' : `Add to Cart - ${formatNPR(product.price * quantity)}`
                    } else {
                      // Variant tracking enabled
                      if (selectedColor && selectedSize) {
                        const stock = getCurrentVariantStock()
                        return stock === 0 ? 'Out of Stock' : `Add to Cart - ${formatPriceWithSymbol(product.price * quantity)}`
                      } else {
                        return `Add to Cart - ${formatPriceWithSymbol(product.price * quantity)}`
                      }
                    }
                  })()}
                </button>

                <button className="w-full bg-transparent border-2 border-gold text-gold px-8 py-4 rounded-xl font-bold text-lg hover:bg-gold hover:text-black transition-all duration-300">
                  Buy Now
                </button>
              </div>

              <div className="flex justify-center space-x-8">
                <button className="flex flex-col items-center space-y-1 text-gold hover:text-white transition-colors group">
                  <div className="p-3 rounded-full border border-gold group-hover:bg-gold group-hover:text-black transition-all duration-300">
                    <Heart className="w-5 h-5" />
                  </div>
                  <span className="text-sm">Wishlist</span>
                </button>
                <button className="flex flex-col items-center space-y-1 text-gold hover:text-white transition-colors group">
                  <div className="p-3 rounded-full border border-gold group-hover:bg-gold group-hover:text-black transition-all duration-300">
                    <Share2 className="w-5 h-5" />
                  </div>
                  <span className="text-sm">Share</span>
                </button>
              </div>
            </div>

          </motion.div>
        </div>

        {/* Product Specifications */}
        <div className="mt-16 bg-charcoal/30 rounded-2xl p-8 border border-gray-700">
          <h2 className="text-3xl font-serif font-bold text-gold mb-8 text-center">
            Product Specifications
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="flex justify-between py-3 border-b border-gray-600">
                <span className="text-gray-400">Material</span>
                <span className="text-white font-medium">100% Premium Cotton</span>
              </div>
              <div className="flex justify-between py-3 border-b border-gray-600">
                <span className="text-gray-400">Fit</span>
                <span className="text-white font-medium">Regular Fit</span>
              </div>
              <div className="flex justify-between py-3 border-b border-gray-600">
                <span className="text-gray-400">Care Instructions</span>
                <span className="text-white font-medium">Machine Washable</span>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between py-3 border-b border-gray-600">
                <span className="text-gray-400">Brand</span>
                <span className="text-white font-medium">JOOKA</span>
              </div>
              <div className="flex justify-between py-3 border-b border-gray-600">
                <span className="text-gray-400">Country of Origin</span>
                <span className="text-white font-medium">Made in Nepal</span>
              </div>
              <div className="flex justify-between py-3 border-b border-gray-600">
                <span className="text-gray-400">SKU</span>
                <span className="text-white font-medium">{product.id}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="mt-20">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-serif font-bold text-gold mb-4">
                You May Also Like
              </h2>
              <p className="text-gray-400 text-lg">
                Discover more premium products from our collection
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {relatedProducts.map((relatedProduct) => (
                <ProductCard key={relatedProduct.id} product={relatedProduct} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}