'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Star, ShoppingBag, Heart } from 'lucide-react'
import { useCartStore } from '@/store/cartStore'
import FallbackImage from '@/components/ui/FallbackImage'
import { formatPriceWithSymbol } from '@/lib/utils/currency'

interface Product {
  id: string
  name: string
  price: number
  originalPrice?: number
  image: string
  category?: string
  images?: any[]
  colors?: string[]
  badge?: string
  rating?: number
  reviewsCount?: number
}

interface ProductCardProps {
  product: Product
}

export default function ProductCard({ product }: ProductCardProps) {
  const addItem = useCartStore((state) => state.addItem)
  const [isSaved, setIsSaved] = useState(false)

  const originalPrice = product.originalPrice || Math.round(product.price * 1.35)
  const discountPercent = Math.round(((originalPrice - product.price) / originalPrice) * 100)

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    await addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
    })
  }

  return (
    <div className="group relative flex flex-col bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-md hover:border-gray-300 transition-all duration-200">
      {/* Product Image Container */}
      <div className="relative aspect-[3/4] w-full bg-gray-50 overflow-hidden">
        <Link href={`/product/${product.id}`} className="block w-full h-full">
          <FallbackImage
            src={product.image}
            alt={product.name}
            fallbackSrc="/placeholder-product.svg"
            fill
            className="object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
          />
        </Link>

        {/* Discount / Capsule Badge */}
        {discountPercent > 0 ? (
          <div className="absolute top-2.5 left-2.5 z-10">
            <span className="bg-[#C8102E] text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-xs shadow-xs">
              {discountPercent}% OFF
            </span>
          </div>
        ) : product.badge ? (
          <div className="absolute top-2.5 left-2.5 z-10">
            <span className="bg-[#111827] text-white text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-xs shadow-xs">
              {product.badge}
            </span>
          </div>
        ) : null}

        {/* Wishlist Button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            setIsSaved(!isSaved);
          }}
          className="absolute top-2.5 right-2.5 p-2 bg-white/90 backdrop-blur-xs rounded-full text-gray-700 hover:text-[#C8102E] hover:bg-white transition-colors z-10 shadow-xs"
          aria-label="Save item"
        >
          <Heart className={`w-3.5 h-3.5 ${isSaved ? 'fill-[#C8102E] text-[#C8102E]' : ''}`} />
        </button>

        {/* Quick Add Overlay */}
        <div className="absolute inset-x-0 bottom-0 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-2.5">
          <button
            onClick={handleAddToCart}
            className="w-full py-2.5 bg-[#111827] hover:bg-[#C8102E] text-white text-xs font-semibold uppercase tracking-wider rounded-md flex items-center justify-center gap-2 shadow-sm transition-colors"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            Add to Bag
          </button>
        </div>
      </div>

      {/* Product Info Section */}
      <div className="p-3.5 flex flex-col flex-1 justify-between space-y-2">
        <div>
          <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest block mb-1">
            {product.category || 'CAPSULE 01'}
          </span>

          <Link href={`/product/${product.id}`}>
            <h3 className="text-xs font-semibold text-gray-900 group-hover:text-[#C8102E] transition-colors line-clamp-1">
              {product.name}
            </h3>
          </Link>
        </div>

        {/* Pricing */}
        <div className="pt-1 flex items-baseline gap-2">
          <span className="text-sm font-bold text-[#111827]">
            {formatPriceWithSymbol(product.price)}
          </span>
          {originalPrice > product.price && (
            <span className="text-xs text-gray-400 line-through font-normal">
              {formatPriceWithSymbol(originalPrice)}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}