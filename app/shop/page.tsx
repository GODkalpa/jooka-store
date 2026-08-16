'use client'

import { useState, useEffect } from 'react'
import ProductCard from '@/components/ProductCard'
import SizingModal from '@/components/ui/SizingModal'
import { Search, Ruler } from 'lucide-react'

interface Product {
  id: string
  name: string
  price: number
  originalPrice?: number
  image: string
  category?: string
  slug?: string
  images?: any[]
  status?: string
  badge?: string
}

interface Category {
  id: string
  name: string
  slug: string
}

const JOOKA_CATALOG_PRODUCTS: Product[] = [
  {
    id: 'mock-1',
    name: 'JOOKA Heavyweight Utility Puffer Jacket',
    price: 4999,
    originalPrice: 8499,
    image: 'https://images.unsplash.com/photo-1544923246-77307dd654cb?w=600&q=80',
    category: 'Outerwear',
    badge: 'Limited Edition'
  },
  {
    id: 'mock-2',
    name: 'JOOKA Luxe Oversized Fleece Hoodie',
    price: 2999,
    originalPrice: 4999,
    image: 'https://images.unsplash.com/photo-1509967419530-da38b4704bc6?w=600&q=80',
    category: 'Sweatshirts',
    badge: 'Heavyweight 450 GSM'
  },
  {
    id: 'mock-3',
    name: 'JOOKA Vintage Washed Heavy Denim Jacket',
    price: 3899,
    originalPrice: 6200,
    image: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=600&q=80',
    category: 'Outerwear',
    badge: 'Archive Piece'
  },
  {
    id: 'mock-4',
    name: 'JOOKA Premium Drop Shoulder Graphic Tee',
    price: 1699,
    originalPrice: 2999,
    image: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=600&q=80',
    category: 'Shirts',
    badge: 'Pre-Shrunk Cotton'
  },
  {
    id: 'mock-5',
    name: 'JOOKA Tailored Relaxed Fit Cargo Pants',
    price: 3299,
    originalPrice: 5499,
    image: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=600&q=80',
    category: 'Pants',
    badge: 'Custom Hardware'
  },
  {
    id: 'mock-6',
    name: 'JOOKA Classic Wool Blend Oversized Coat',
    price: 6499,
    originalPrice: 10999,
    image: 'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=600&q=80',
    category: 'Outerwear',
    badge: 'Winter Capsule'
  },
  {
    id: 'mock-7',
    name: 'JOOKA Streetwear Essential Crewneck Sweater',
    price: 2499,
    originalPrice: 3999,
    image: 'https://images.unsplash.com/photo-1620799140408-edc0dcb6d633?w=600&q=80',
    category: 'Sweatshirts',
    badge: 'Core Edition'
  },
  {
    id: 'mock-8',
    name: 'JOOKA Urban Explorer Waterproof Parka',
    price: 5499,
    originalPrice: 8999,
    image: 'https://images.unsplash.com/photo-1548883354-7622d03aca27?w=600&q=80',
    category: 'Outerwear',
    badge: 'Technical Shell'
  }
];

export default function ShopPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [sortBy, setSortBy] = useState('featured')
  const [searchQuery, setSearchQuery] = useState('')
  const [isSizingModalOpen, setIsSizingModalOpen] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const productsResponse = await fetch('/api/products?status=active')
        if (productsResponse.ok) {
          const productsResult = await productsResponse.json()
          if (productsResult.data && productsResult.data.length > 0) {
            const transformedProducts = productsResult.data.map((product: any, idx: number) => ({
              id: product.id,
              name: product.name,
              price: product.price,
              originalPrice: Math.round(product.price * 1.4),
              image: product.images?.[0]?.secure_url || JOOKA_CATALOG_PRODUCTS[idx % JOOKA_CATALOG_PRODUCTS.length].image,
              category: product.category?.name || 'Capsule 01',
              badge: idx % 2 === 0 ? 'Limited Edition' : 'Core Release',
            }))
            setProducts(transformedProducts)
          } else {
            setProducts(JOOKA_CATALOG_PRODUCTS)
          }
        } else {
          setProducts(JOOKA_CATALOG_PRODUCTS)
        }

        const categoriesResponse = await fetch('/api/categories')
        if (categoriesResponse.ok) {
          const categoriesResult = await categoriesResponse.json()
          setCategories(categoriesResult.data || [])
        }
      } catch (err) {
        setProducts(JOOKA_CATALOG_PRODUCTS)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const categoryOptions = ['All', 'Shirts', 'Sweatshirts', 'Pants', 'Merch']

  let filteredProducts = selectedCategory === 'All'
    ? products
    : products.filter(product => product.category?.toLowerCase().includes(selectedCategory.toLowerCase()))

  if (searchQuery) {
    filteredProducts = filteredProducts.filter(product =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.category?.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return a.price - b.price
      case 'price-high':
        return b.price - a.price
      case 'name':
        return a.name.localeCompare(b.name)
      default:
        return 0
    }
  })

  return (
    <div className="w-full min-h-screen bg-white font-sans text-gray-900 pb-20">
      <SizingModal isOpen={isSizingModalOpen} onClose={() => setIsSizingModalOpen(false)} />

      {/* Header Banner - Full Width */}
      <section className="w-full bg-[#111827] text-white py-14 px-4 sm:px-6 lg:px-12 text-center border-b border-gray-800">
        <div className="max-w-4xl mx-auto space-y-3">
          <div className="inline-flex items-center bg-[#C8102E] text-white px-3.5 py-1 font-semibold text-[10px] uppercase tracking-widest rounded-sm">
            EDITION 01 • GARMENT CATALOG
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
            All Garments & Releases
          </h1>
          <p className="text-xs sm:text-sm text-gray-300 font-normal leading-relaxed max-w-xl mx-auto">
            Explore heavyweight cottons, structured outerwear, and essential tailored silhouettes.
          </p>

          <div className="pt-2">
            <button
              onClick={() => setIsSizingModalOpen(true)}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-300 hover:text-white underline"
            >
              <Ruler className="w-4 h-4" />
              <span>Flat-Lay Sizing Guide</span>
            </button>
          </div>
        </div>
      </section>

      <div className="w-full px-4 sm:px-6 lg:px-12 py-8">
        {/* Category Filter Pills & Controls */}
        <div className="w-full flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 sm:gap-6 mb-8 pb-4 border-b border-gray-200">
          <div className="flex flex-wrap items-center gap-2">
            {categoryOptions.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-3.5 sm:px-4 py-2 text-xs font-semibold uppercase tracking-wider rounded-md transition-colors ${
                  selectedCategory === category
                    ? 'bg-[#111827] text-white shadow-xs'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Search & Sort Controls */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 w-full md:w-auto">
            <div className="relative w-full sm:w-56 border border-gray-200 bg-gray-50 rounded-md px-3.5 py-1.5 flex items-center">
              <input
                type="text"
                placeholder="Search garments..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent text-xs text-gray-900 focus:outline-none placeholder-gray-400"
              />
              <Search className="w-3.5 h-3.5 text-gray-400 shrink-0 ml-1" />
            </div>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-gray-100 border border-gray-200 text-xs font-semibold text-gray-700 rounded-md px-3.5 py-2 focus:outline-none cursor-pointer"
            >
              <option value="featured">Sort: Featured</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="name">Name: A to Z</option>
            </select>
          </div>
        </div>

        {/* Count Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-widest">
            Showing {sortedProducts.length} Garments
          </h2>
          <span className="text-xs font-semibold text-[#C8102E] uppercase tracking-wider">
            Capsule Edition
          </span>
        </div>

        {/* Product Grid */}
        {loading ? (
          <div className="w-full grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="bg-gray-100 aspect-[3/4] rounded-lg animate-pulse" />
            ))}
          </div>
        ) : sortedProducts.length === 0 ? (
          <div className="text-center py-20 text-xs text-gray-500 font-semibold uppercase tracking-wider">
            No products match your search selection
          </div>
        ) : (
          <div className="w-full grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-6">
            {sortedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}