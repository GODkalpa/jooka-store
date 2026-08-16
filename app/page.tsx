'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import ProductCard from '@/components/ProductCard'
import { ArrowRight, ChevronRight, Clock } from 'lucide-react'

interface Product {
  id: string
  name: string
  price: number
  originalPrice?: number
  image: string
  category?: string
  slug?: string
  badge?: string
}

// Category Navigation - Matched with Brand Catalog
const CATEGORY_CIRCLES = [
  { name: 'Shirts', image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=400&q=80', href: '/shop?category=Shirts', badge: 'Tees & Shirts' },
  { name: 'Sweatshirts', image: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=400&q=80', href: '/shop?category=Sweatshirts', badge: 'Hoodies & Fleece' },
  { name: 'Pants', image: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=400&q=80', href: '/shop?category=Pants', badge: 'Tailored Trousers' },
  { name: 'Merch', image: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=400&q=80', href: '/shop?category=Merch', badge: 'Caps & Accessories' },
  { name: 'Sale & Archive', image: 'https://images.unsplash.com/photo-1544923246-77307dd654cb?w=400&q=80', href: '/shop?sale=true', badge: 'Seasonal Archive' },
];

const JOOKA_FEATURED_PRODUCTS: Product[] = [
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
    badge: 'Archive Release'
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
    badge: 'Core Collection'
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

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([])
  const [activeTab, setActiveTab] = useState<'all' | 'outerwear' | 'fleece' | 'archive'>('all')
  const [loading, setLoading] = useState(true)

  // Countdown timer
  const [timeLeft, setTimeLeft] = useState({ hours: 8, minutes: 24, seconds: 40 })

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 }
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 }
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 }
        return { hours: 12, minutes: 0, seconds: 0 }
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/products?limit=8')
        if (response.ok) {
          const result = await response.json()
          if (result.data && result.data.length > 0) {
            const transformed = result.data.map((p: any, idx: number) => ({
              id: p.id,
              name: p.name,
              price: p.price,
              originalPrice: Math.round(p.price * 1.4),
              image: p.images?.[0]?.secure_url || JOOKA_FEATURED_PRODUCTS[idx % JOOKA_FEATURED_PRODUCTS.length].image,
              category: p.category?.name || 'Capsule Collection',
              badge: idx % 2 === 0 ? 'Limited Edition' : 'Core Release',
            }))
            setFeaturedProducts(transformed)
          } else {
            setFeaturedProducts(JOOKA_FEATURED_PRODUCTS)
          }
        } else {
          setFeaturedProducts(JOOKA_FEATURED_PRODUCTS)
        }
      } catch (err) {
        setFeaturedProducts(JOOKA_FEATURED_PRODUCTS)
      } finally {
        setLoading(false)
      }
    }

    fetchFeaturedProducts()
  }, [])

  const filteredProducts = featuredProducts.filter((product) => {
    if (activeTab === 'outerwear') return product.category?.toLowerCase().includes('outerwear')
    if (activeTab === 'fleece') return product.category?.toLowerCase().includes('sweat') || product.name.toLowerCase().includes('hoodie') || product.name.toLowerCase().includes('fleece')
    if (activeTab === 'archive') return product.price < 3500
    return true
  })

  return (
    <div className="w-full min-h-screen bg-white font-sans text-gray-900 pb-16">
      
      {/* 1. Sleek Architectural Countdown Timer */}
      <section className="w-full bg-[#111827] text-white py-2.5 px-4 sm:px-6 lg:px-12 border-b border-gray-800">
        <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div className="flex items-center gap-2.5 text-xs text-gray-300 tracking-wide font-medium">
            <span className="bg-[#C8102E] text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-sm">
              CAPSULE RELEASE
            </span>
            <span>Extra 20% off selected outerwear & fleece with code: <strong className="text-white tracking-widest font-bold">JOOKA20</strong></span>
          </div>

          <div className="flex items-center gap-2.5 text-xs text-gray-300 font-medium bg-gray-900/80 border border-gray-800 px-3.5 py-1.5 rounded-md">
            <Clock className="w-3.5 h-3.5 text-gray-400 shrink-0" />
            <span className="text-[11px] uppercase tracking-wider text-gray-400 font-mono">CLOSES IN:</span>
            <span className="font-mono text-xs text-white font-bold tracking-widest">
              {String(timeLeft.hours).padStart(2, '0')}h : {String(timeLeft.minutes).padStart(2, '0')}m : {String(timeLeft.seconds).padStart(2, '0')}s
            </span>
          </div>
        </div>
      </section>

      {/* 2. Hero Editorial Lookbook Grid */}
      <section className="w-full px-4 sm:px-6 lg:px-12 pt-6 pb-12">
        <div className="w-full grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Hero Lookbook Tile */}
          <div className="lg:col-span-2 relative min-h-[460px] sm:min-h-[540px] bg-[#111827] rounded-2xl overflow-hidden flex items-end p-8 sm:p-14 group">
            <Image
              src="https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1400&q=90"
              alt="JOOKA Winter Capsule"
              fill
              className="object-cover object-center filter brightness-[0.82] group-hover:scale-105 transition-transform duration-700 ease-out"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-950/95 via-gray-950/40 to-transparent" />

            <div className="relative z-10 text-white space-y-4 max-w-2xl">
              <div className="inline-flex items-center bg-[#C8102E] text-white px-3 py-1 font-semibold text-[11px] uppercase tracking-widest rounded-sm shadow-sm">
                EDITION 01 • WINTER CAPSULE
              </div>
              
              <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight">
                Contemporary Tailoring. <br />
                <span className="text-gray-300 font-light">Heavyweight Craft.</span>
              </h1>
              
              <p className="text-sm text-gray-300 font-normal leading-relaxed max-w-lg">
                High-density outerwear, pre-shrunk cotton fleece, and relaxed tailored silhouettes designed for the modern wardrobe in Nepal.
              </p>

              <div className="pt-2 flex flex-wrap gap-4">
                <Link
                  href="/shop"
                  className="px-8 py-3.5 bg-[#C8102E] hover:bg-[#A60C24] text-white text-xs font-semibold uppercase tracking-wider rounded-lg transition-all shadow-sm"
                >
                  Explore Collection
                </Link>
                <Link
                  href="/shop?category=Sweatshirts"
                  className="px-8 py-3.5 bg-white text-gray-900 hover:bg-gray-100 text-xs font-semibold uppercase tracking-wider rounded-lg transition-all shadow-sm"
                >
                  Heavyweight Fleece
                </Link>
              </div>
            </div>
          </div>

          {/* Side Lookbook Tiles */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-6">
            
            {/* Side Card 1 */}
            <div className="relative min-h-[255px] bg-[#F9FAFB] border border-[#E5E7EB] rounded-2xl p-7 flex flex-col justify-between overflow-hidden group">
              <div className="space-y-2 relative z-10">
                <span className="bg-gray-200 text-gray-900 text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-sm">
                  PROMO ARCHIVE
                </span>
                <h3 className="text-2xl font-bold text-gray-900 leading-tight">
                  Seasonal Archive <br />
                  <span className="text-[#C8102E]">20% Off Selection</span>
                </h3>
                <p className="text-xs text-gray-600 font-normal">
                  Apply code <strong className="bg-gray-200 px-1.5 py-0.5 rounded text-gray-900 font-mono font-bold">JOOKA20</strong> at checkout on qualifying capsule pieces.
                </p>
              </div>

              <div className="pt-4 relative z-10">
                <Link
                  href="/shop?sale=true"
                  className="inline-flex items-center gap-1 text-xs font-bold text-[#C8102E] hover:underline"
                >
                  <span>Shop Archive Pieces</span>
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Side Card 2 */}
            <div className="relative min-h-[255px] bg-[#111827] text-white rounded-2xl p-7 flex flex-col justify-between overflow-hidden group border border-gray-800">
              <Image
                src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&q=80"
                alt="Outerwear Release"
                fill
                className="object-cover opacity-40 group-hover:scale-105 transition-transform duration-500"
              />
              <div className="relative z-10 space-y-2">
                <span className="bg-gray-800 text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-sm">
                  OUTERWEAR
                </span>
                <h3 className="text-2xl font-bold text-white leading-tight">
                  Heavy Outerwear & Coats
                </h3>
                <p className="text-xs text-gray-300 font-light">
                  Structured shoulders and durable fabrics built for cold climates.
                </p>
              </div>

              <div className="pt-4 relative z-10">
                <Link
                  href="/shop?category=Shirts"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-white hover:text-gray-300"
                >
                  <span>Discover Jackets</span>
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* 3. Curated Categories */}
      <section className="w-full px-4 sm:px-6 lg:px-12 py-12 border-t border-gray-100">
        <div className="w-full flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
              Curated Categories
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 font-normal mt-0.5">Explore tailored silhouettes & core essentials</p>
          </div>
          <Link href="/shop" className="text-xs font-semibold text-[#C8102E] hover:underline flex items-center gap-1">
            <span>View All Garments</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="flex md:grid md:grid-cols-5 gap-4 sm:gap-6 overflow-x-auto md:overflow-x-visible pb-4 pt-1 -mx-4 px-4 sm:-mx-6 sm:px-6 md:mx-0 md:px-0 text-center mobile-scroll snap-x snap-mandatory md:snap-none">
          {CATEGORY_CIRCLES.map((cat) => (
            <Link key={cat.name} href={cat.href} className="group flex flex-col items-center flex-shrink-0 w-28 sm:w-32 md:w-auto snap-start">
              <div className="relative w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 lg:w-36 lg:h-36 rounded-full overflow-hidden border border-gray-200 group-hover:border-gray-900 transition-all shadow-xs group-hover:shadow-md mb-2.5 sm:mb-3 flex-shrink-0">
                <Image
                  src={cat.image}
                  alt={cat.name}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-500"
                />
              </div>
              <span className="text-xs sm:text-sm font-semibold text-gray-900 group-hover:text-[#C8102E] transition-colors whitespace-nowrap md:whitespace-normal">
                {cat.name}
              </span>
              <span className="text-[10px] sm:text-xs font-medium text-gray-500 mt-0.5 whitespace-nowrap md:whitespace-normal">
                {cat.badge}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* 4. Tabbed Product Showcase */}
      <section className="w-full px-4 sm:px-6 lg:px-12 py-12 border-t border-gray-100">
        <div className="w-full flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-gray-200 pb-4 mb-8 gap-4">
          <div>
            <span className="text-[10px] font-bold tracking-[0.2em] text-[#C8102E] uppercase block mb-1">
              CURATED RELEASES
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
              Featured Garments & Editions
            </h2>
          </div>

          {/* Navigation Filter Tabs */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm font-semibold">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-4 py-2 rounded-md transition-colors text-xs uppercase tracking-wider ${activeTab === 'all' ? 'bg-[#111827] text-white font-bold' : 'text-gray-600 hover:text-gray-900 bg-gray-100'}`}
            >
              All Releases
            </button>
            <button
              onClick={() => setActiveTab('outerwear')}
              className={`px-4 py-2 rounded-md transition-colors text-xs uppercase tracking-wider ${activeTab === 'outerwear' ? 'bg-[#111827] text-white font-bold' : 'text-gray-600 hover:text-gray-900 bg-gray-100'}`}
            >
              Outerwear
            </button>
            <button
              onClick={() => setActiveTab('fleece')}
              className={`px-4 py-2 rounded-md transition-colors text-xs uppercase tracking-wider ${activeTab === 'fleece' ? 'bg-[#111827] text-white font-bold' : 'text-gray-600 hover:text-gray-900 bg-gray-100'}`}
            >
              Heavy Fleece
            </button>
            <button
              onClick={() => setActiveTab('archive')}
              className={`px-4 py-2 rounded-md transition-colors text-xs uppercase tracking-wider ${activeTab === 'archive' ? 'bg-[#C8102E] text-white font-bold' : 'text-gray-600 hover:text-gray-900 bg-gray-100'}`}
            >
              Archive Specials
            </button>
          </div>
        </div>

        {/* Product Grid */}
        <div className="w-full grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-6">
          {loading ? (
            Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="bg-gray-100 aspect-[3/4] rounded-lg animate-pulse" />
            ))
          ) : (
            filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))
          )}
        </div>
      </section>

    </div>
  )
}