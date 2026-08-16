'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Minus, Plus, ChevronRight } from 'lucide-react'
import { useCartStore } from '@/store/cartStore'
import ProductCard from '@/components/ProductCard'
import SizingModal from '@/components/ui/SizingModal'
import { formatPriceWithSymbol } from '@/lib/utils/currency'

interface Variant {
  id: string
  title: string
  sku: string
  color: string
  size: string
  price: number
  inventory_quantity: number
}

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
  variants?: Variant[]
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
  const [isSizingModalOpen, setIsSizingModalOpen] = useState(false)

  const addItem = useCartStore((state) => state.addItem)

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true)
        setError(null)

        const productResponse = await fetch(`/api/products/${params.id}`)
        if (!productResponse.ok) {
          throw new Error('Product not found')
        }
        const productResult = await productResponse.json()
        setProduct(productResult)

        // Select default size & color if available and sync main photo
        if (productResult.sizes?.length) setSelectedSize(productResult.sizes[0])
        if (productResult.colors?.length) {
          const defaultColor = productResult.colors[0]
          setSelectedColor(defaultColor)

          // Sync initial image index to match default color
          if (productResult.images?.length) {
            const matchedIndex = productResult.images.findIndex(
              (img: any) =>
                img.color?.toLowerCase() === defaultColor.toLowerCase() ||
                img.secure_url?.toLowerCase().includes(defaultColor.toLowerCase())
            )
            if (matchedIndex !== -1) {
              setSelectedImage(matchedIndex)
            } else {
              const colorIdx = productResult.colors?.findIndex((c: string) => c.toLowerCase() === defaultColor.toLowerCase())
              if (colorIdx !== undefined && colorIdx !== -1 && productResult.images[colorIdx]) {
                setSelectedImage(colorIdx)
              }
            }
          }
        }

        // Fetch related products
        const relatedResponse = await fetch(`/api/products?status=active&limit=4`)
        if (relatedResponse.ok) {
          const relatedResult = await relatedResponse.json()
          const transformedRelated = (relatedResult.data || [])
            .filter((p: any) => p.id !== params.id)
            .slice(0, 4)
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

  // Compute active variant matching selected color & size
  const activeVariant = product?.variants?.find(
    (v) =>
      (selectedColor ? v.color?.toLowerCase() === selectedColor.toLowerCase() : true) &&
      (selectedSize ? v.size?.toLowerCase() === selectedSize.toLowerCase() : true)
  ) || product?.variants?.[0]

  const currentPrice = activeVariant?.price || product?.price || 0
  const currentStock = activeVariant?.inventory_quantity ?? 100

  // Handle color change and automatically switch main image to match selected color
  const handleColorChange = (color: string) => {
    setSelectedColor(color)

    if (!product?.images?.length) return

    // 1. Try to find image with matching color field or URL containing color name
    const matchedIndex = product.images.findIndex(
      (img) =>
        img.color?.toLowerCase() === color.toLowerCase() ||
        img.secure_url?.toLowerCase().includes(color.toLowerCase())
    )

    if (matchedIndex !== -1) {
      setSelectedImage(matchedIndex)
    } else {
      // 2. Fallback: match by color option array index
      const colorIdx = product.colors?.findIndex((c) => c.toLowerCase() === color.toLowerCase())
      if (colorIdx !== undefined && colorIdx !== -1 && product.images[colorIdx]) {
        setSelectedImage(colorIdx)
      }
    }
  }

  const handleAddToCart = async () => {
    if (!product) return

    const imageUrl = product.images?.[selectedImage]?.secure_url || product.images?.[0]?.secure_url || '/placeholder-product.svg'

    for (let i = 0; i < quantity; i++) {
      await addItem({
        id: product.id,
        name: product.name,
        price: currentPrice,
        image: imageUrl,
        size: selectedSize || undefined,
        color: selectedColor || undefined,
        colorImageUrl: imageUrl,
        variantKey: activeVariant?.id || `${product.id}-${selectedSize || ''}-${selectedColor || ''}`,
      })
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-canvas flex items-center justify-center py-20 font-sans">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs font-medium text-neutral-600 uppercase tracking-wider">Loading garment details...</p>
        </div>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-canvas flex items-center justify-center py-20 font-sans">
        <div className="text-center space-y-4 max-w-sm px-4">
          <p className="text-sm text-red-600 font-medium">{error || 'Product not found'}</p>
          <button
            onClick={() => window.history.back()}
            className="px-6 py-2.5 bg-black text-white text-xs font-medium uppercase tracking-wider hover:bg-neutral-800 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    )
  }

  const mainImages = product.images?.length ? product.images : [{ id: '1', secure_url: '/placeholder-product.svg' }]

  return (
    <div className="min-h-screen bg-canvas text-black font-sans pt-6 pb-20">
      {/* Sizing Modal */}
      <SizingModal isOpen={isSizingModalOpen} onClose={() => setIsSizingModalOpen(false)} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-xs text-neutral-500 mb-8">
          <Link href="/" className="hover:text-black transition-colors">Home</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link href="/shop" className="hover:text-black transition-colors">Shop</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-black font-medium line-clamp-1">{product.name}</span>
        </nav>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Left Column: Image Gallery (7 Cols) */}
          <div className="lg:col-span-7 flex flex-col md:flex-row-reverse gap-4">
            {/* Main Featured Image */}
            <div className="relative flex-1 aspect-square md:aspect-[4/5] bg-white border border-neutral-200 rounded-xl overflow-hidden p-2 sm:p-4 shadow-sm">
              <Image
                src={mainImages[selectedImage]?.secure_url || '/placeholder-product.svg'}
                alt={product.name}
                fill
                className="object-contain object-center p-2 transition-all duration-300"
                priority
              />
            </div>

            {/* Thumbnails */}
            {mainImages.length > 1 && (
              <div className="flex md:flex-col gap-3 overflow-x-auto md:overflow-y-auto max-h-[500px] flex-shrink-0">
                {mainImages.map((img, idx) => (
                  <button
                    key={img.id || idx}
                    onClick={() => {
                      setSelectedImage(idx)
                      if (product?.colors?.[idx]) {
                        setSelectedColor(product.colors[idx])
                      }
                    }}
                    className={`relative w-16 h-20 bg-white border rounded-md transition-all flex-shrink-0 p-1 ${
                      selectedImage === idx ? 'border-black ring-1 ring-black shadow-sm' : 'border-neutral-200 hover:border-neutral-400'
                    }`}
                  >
                    <Image
                      src={img.secure_url}
                      alt={`${product.name} preview ${idx + 1}`}
                      fill
                      className="object-contain p-0.5"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Product Specs & Buying (5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="border-b border-neutral-200 pb-6 space-y-3">
              <span className="text-[10px] font-medium tracking-[0.25em] text-neutral-400 uppercase">
                {product.category?.name || product.category_name || 'COLLECTION 01'}
              </span>
              <h1 className="text-2xl sm:text-3xl font-light tracking-wide text-neutral-900 uppercase">
                {product.name}
              </h1>
              <div className="pt-1 flex items-baseline justify-between">
                <div>
                  <p className="text-xl font-normal text-neutral-900 tracking-wide">
                    {formatPriceWithSymbol(currentPrice)}
                  </p>
                  <p className="text-[11px] text-neutral-400 font-light mt-0.5 tracking-wider uppercase">
                    Taxes included • Free Nepal shipping over ₨ 5,000
                  </p>
                </div>

                {/* Stock Badge */}
                <div>
                  {currentStock > 0 ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-medium text-[11px]">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      {currentStock} in stock
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 font-medium text-[11px]">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                      Out of Stock
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="text-xs text-neutral-600 leading-relaxed font-light tracking-wide">
              {product.description || product.short_description || 'Minimalist relaxed silhouette constructed with premium heavyweight cotton. Features subtle tailored drop shoulders and pre-shrunk finish.'}
            </div>

            {/* Color Selector */}
            {product.colors && product.colors.length > 0 && (
              <div className="space-y-3 pt-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-[11px] font-medium text-neutral-900 uppercase tracking-widest">
                    COLOR: <span className="text-neutral-500 font-normal">{selectedColor}</span>
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {product.colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => handleColorChange(color)}
                      className={`px-4 py-2 text-[11px] font-medium uppercase tracking-wider transition-all border ${
                        selectedColor === color
                          ? 'bg-black text-white border-black shadow-sm'
                          : 'bg-white text-neutral-700 border-neutral-200 hover:border-black'
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Size Selector */}
            <div className="space-y-3 pt-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-[11px] font-medium text-neutral-900 uppercase tracking-widest">
                  SIZE: <span className="text-neutral-500 font-normal">{selectedSize}</span>
                </span>
                <button
                  onClick={() => setIsSizingModalOpen(true)}
                  className="text-[11px] text-neutral-500 hover:text-black border-b border-neutral-300 pb-0.5 font-light uppercase tracking-wider"
                >
                  SIZING GUIDE
                </button>
              </div>

              <div className="grid grid-cols-4 gap-2">
                {(product.sizes?.length ? product.sizes : ['S', 'M', 'L', 'XL']).map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`py-3 text-[11px] font-medium uppercase tracking-widest transition-colors border ${
                      selectedSize === size
                        ? 'bg-black text-white border-black'
                        : 'bg-white text-neutral-700 border-neutral-200 hover:border-black'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity Selector */}
            <div className="space-y-2 pt-2">
              <span className="text-[11px] font-medium text-neutral-900 uppercase tracking-widest block">QUANTITY</span>
              <div className="flex items-center space-x-4">
                <div className="flex items-center border border-neutral-200 bg-white">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-2.5 text-neutral-600 hover:text-black transition-colors"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="px-4 py-1.5 text-xs font-medium text-black min-w-[36px] text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-2.5 text-neutral-600 hover:text-black transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="space-y-3 pt-4 border-t border-neutral-200">
              <button
                onClick={handleAddToCart}
                disabled={currentStock <= 0}
                className={`w-full py-4 text-white text-[11px] font-medium tracking-[0.2em] uppercase transition-colors shadow-sm ${
                  currentStock > 0 ? 'bg-black hover:bg-neutral-800' : 'bg-neutral-300 cursor-not-allowed'
                }`}
              >
                {currentStock > 0 ? `ADD TO BAG — ${formatPriceWithSymbol(currentPrice * quantity)}` : 'OUT OF STOCK'}
              </button>
            </div>

            {/* Guarantees */}
            <div className="space-y-2 pt-4 border-t border-neutral-100 text-[11px] text-neutral-500 font-light tracking-wide">
              <p className="flex items-center gap-2">
                <span>•</span>
                <span>Complimentary Shipping in Nepal on orders over ₨ 5,000</span>
              </p>
              <p className="flex items-center gap-2">
                <span>•</span>
                <span>7-Day Sizing Exchange Guarantee</span>
              </p>
              <p className="flex items-center gap-2">
                <span>•</span>
                <span>Handcrafted & Inspected in Nepal</span>
              </p>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="mt-24 pt-16 border-t border-neutral-200">
            <div className="text-center mb-12">
              <span className="text-[10px] font-medium tracking-[0.25em] text-neutral-400 uppercase block mb-1">
                COMPLEMENTARY STYLES
              </span>
              <h2 className="text-xl font-light tracking-[0.15em] text-neutral-900 uppercase">
                YOU MAY ALSO LIKE
              </h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
              {relatedProducts.map((relProduct) => (
                <ProductCard key={relProduct.id} product={relProduct} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}