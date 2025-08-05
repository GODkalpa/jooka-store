'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import FallbackImage from '@/components/ui/FallbackImage'

interface Category {
  id: string
  name: string
  description: string
  image: string
  href: string
  featured?: boolean
}

const categories: Category[] = [
  {
    id: '1',
    name: 'Dresses',
    description: 'Elegant evening wear and sophisticated day dresses crafted from the finest materials',
    image: '/placeholder-category.svg',
    href: '/shop?category=dresses',
    featured: true
  },
  {
    id: '2',
    name: 'Outerwear',
    description: 'Luxurious coats and blazers that define modern sophistication',
    image: '/placeholder-category.svg',
    href: '/shop?category=outerwear'
  },
  {
    id: '3',
    name: 'Accessories',
    description: 'Timeless pieces that complete your elegant ensemble',
    image: '/placeholder-category.svg',
    href: '/shop?category=accessories'
  },
  {
    id: '4',
    name: 'Bags',
    description: 'Handcrafted leather goods that embody luxury and functionality',
    image: '/placeholder-category.svg',
    href: '/shop?category=bags'
  }
]

const CategoryCard = ({ category, index }: { category: Category; index: number }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 60 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: index * 0.15 }}
      viewport={{ once: true }}
      className="group relative overflow-hidden"
    >
      <Link href={category.href}>
        <div className="relative aspect-[4/5] overflow-hidden bg-black/10">
          <Image
            src={category.image}
            alt={category.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
          />

          {/* Clean Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />

          {/* Content */}
          <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-8">
            <div className="space-y-3 opacity-0 animate-fade-in-up" style={{ animationDelay: `${index * 0.15 + 0.3}s`, animationFillMode: 'forwards' }}>
              {/* Category Badge */}
              <div className="inline-block hover:scale-105 transition-transform duration-200">
                <span className="text-xs font-medium tracking-[0.15em] text-gold/90 uppercase bg-black/40 backdrop-blur-sm px-3 py-1.5 border border-gold/20">
                  Category
                </span>
              </div>

              {/* Category Name */}
              <h3 className="text-2xl md:text-3xl font-serif font-light text-ivory group-hover:text-gold transition-colors duration-300">
                {category.name}
              </h3>

              {/* Description */}
              <p className="text-ivory/80 font-light leading-relaxed group-hover:text-ivory transition-colors duration-300 text-sm md:text-base max-w-sm">
                {category.description}
              </p>

              {/* CTA */}
              <div className="flex items-center space-x-2 text-gold/80 group-hover:text-gold transition-all duration-300 pt-2 group-hover:translate-x-1">
                <span className="text-xs font-medium tracking-wide uppercase">
                  Explore Collection
                </span>
                <ArrowRight className="w-3 h-3" />
              </div>
            </div>
          </div>

          {/* Subtle Border Effect */}
          <div className="absolute inset-0 border border-gold/0 group-hover:border-gold/20 transition-colors duration-300" />
        </div>
      </Link>
    </motion.div>
  )
}

export default function CategoriesShowcase() {
  return (
    <section className="relative py-24 px-8 md:px-12">
      {/* Clean Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-black/98 to-black" />

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Section Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <motion.span
            className="text-sm font-medium tracking-[0.2em] text-gold/60 uppercase mb-4 block"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            Discover
          </motion.span>

          <motion.h2
            className="text-5xl md:text-6xl lg:text-7xl font-serif font-light text-gold mb-8 tracking-tight"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            viewport={{ once: true }}
          >
            Our
            <span className="block text-4xl md:text-5xl lg:text-6xl text-ivory/90 font-light italic">
              Categories
            </span>
          </motion.h2>

          <motion.div
            initial={{ opacity: 0, width: 0 }}
            whileInView={{ opacity: 1, width: "4rem" }}
            transition={{ duration: 0.8, delay: 0.5 }}
            viewport={{ once: true }}
            className="h-px bg-gradient-to-r from-transparent via-gold to-transparent mx-auto mb-8"
          />

          <motion.p
            className="text-lg md:text-xl text-ivory/70 max-w-3xl mx-auto leading-relaxed font-light"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            viewport={{ once: true }}
          >
            Each category tells a story of
            <span className="text-gold/80 font-medium"> craftsmanship</span>,
            <span className="text-gold/80 font-medium"> elegance</span>, and
            <span className="text-gold/80 font-medium"> timeless design</span>.
          </motion.p>
        </motion.div>

        {/* Categories Grid - Fixed 2x2 Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {categories.map((category, index) => (
            <CategoryCard key={category.id} category={category} index={index} />
          ))}
        </div>
      </div>
    </section>
  )
}
