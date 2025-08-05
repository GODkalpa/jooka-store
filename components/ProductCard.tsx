'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { ShoppingCart } from 'lucide-react'
import { useCartStore } from '@/store/cartStore'
import FallbackImage from '@/components/ui/FallbackImage'
import { formatPriceWithSymbol } from '@/lib/utils/currency'

interface Product {
  id: string
  name: string
  price: number
  image: string
  category?: string
}

interface ProductCardProps {
  product: Product
}

export default function ProductCard({ product }: ProductCardProps) {
  const addItem = useCartStore((state) => state.addItem)

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault()
    await addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
    })
  }

  return (
    <motion.div
      className="group relative bg-black/40 backdrop-blur-sm border border-gold/10 hover:border-gold/30 transition-all duration-500 overflow-hidden hover:-translate-y-2 hover:scale-[1.02] transform"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      viewport={{ once: true }}
    >
      {/* Image Container */}
      <div className="relative aspect-[4/5] overflow-hidden">
        <Link href={`/product/${product.id}`}>
          <FallbackImage
            src={product.image}
            alt={product.name}
            fallbackSrc="/placeholder-product.svg"
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
          />
        </Link>

        {/* Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-transparent" />

        {/* Category Badge */}
        {product.category && (
          <div className="absolute top-4 left-4 bg-black/70 backdrop-blur-sm px-3 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
            <span className="text-gold/90 text-xs font-medium tracking-wider uppercase">
              {product.category}
            </span>
          </div>
        )}

        {/* Quick Add Button */}
        <button
          onClick={handleAddToCart}
          className="absolute bottom-4 right-4 bg-gold/90 hover:bg-gold text-black p-3 rounded-full backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 active:scale-95 shadow-lg transform scale-90 group-hover:scale-100"
        >
          <ShoppingCart className="w-4 h-4" />
        </button>

        {/* Hover Overlay with Product Info */}
        <div className="absolute inset-x-0 bottom-0 p-6 text-white opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-4 group-hover:translate-y-0">
          <div className="space-y-2">
            <h3 className="text-lg font-serif font-medium text-gold">
              {product.name}
            </h3>
            <p className="text-sm text-ivory/80 font-light">
              Premium quality craftsmanship
            </p>
          </div>
        </div>
      </div>

      {/* Product Info */}
      <Link href={`/product/${product.id}`}>
        <div className="p-6 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-ivory font-serif font-medium text-lg group-hover:text-gold transition-colors duration-300">
              {product.name}
            </h3>
            <div className="w-2 h-2 bg-gold rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-0 group-hover:scale-100" />
          </div>

          <div className="flex items-center justify-between">
            <p className="text-gold font-semibold text-xl tracking-wide">
              {formatPriceWithSymbol(product.price)}
            </p>
            <span className="text-ivory/60 text-sm opacity-0 group-hover:opacity-100 transition-all duration-300 transform -translate-x-2 group-hover:translate-x-0">
              View Details →
            </span>
          </div>

          {/* Decorative Line */}
          <div className="h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 transform scale-x-0 group-hover:scale-x-100" />
        </div>
      </Link>
    </motion.div>
  )
}