'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { Star, Quote, ChevronLeft, ChevronRight } from 'lucide-react'
import FallbackImage from '@/components/ui/FallbackImage'

interface Testimonial {
  id: string
  name: string
  role: string
  location: string
  image: string
  rating: number
  quote: string
  product: string
}

const testimonials: Testimonial[] = [
  {
    id: '1',
    name: 'Isabella Chen',
    role: 'Fashion Director',
    location: 'New York',
    image: '/placeholder-testimonial.svg',
    rating: 5,
    quote: 'JOOKA has redefined luxury for me. Every piece tells a story of exceptional craftsmanship and timeless elegance. The attention to detail is simply unmatched.',
    product: 'Silk Evening Dress'
  },
  {
    id: '2',
    name: 'Sophia Martinez',
    role: 'Creative Executive',
    location: 'Los Angeles',
    image: '/placeholder-testimonial.svg',
    rating: 5,
    quote: 'The quality and sophistication of JOOKA pieces are extraordinary. I feel confident and elegant every time I wear their designs. Truly investment pieces.',
    product: 'Cashmere Blazer'
  },
  {
    id: '3',
    name: 'Emma Thompson',
    role: 'Art Curator',
    location: 'London',
    image: '/placeholder-testimonial.svg',
    rating: 5,
    quote: 'JOOKA understands the modern woman. Their designs are both contemporary and timeless, perfect for my lifestyle. The natural elegance is evident in every detail.',
    product: 'Pearl Necklace'
  }
]

const StarRating = ({ rating }: { rating: number }) => {
  return (
    <div className="flex space-x-1">
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          className={`w-4 h-4 ${
            i < rating ? 'text-gold fill-gold' : 'text-gold/30'
          }`}
        />
      ))}
    </div>
  )
}

export default function TestimonialsSection() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)

  useEffect(() => {
    if (!isAutoPlaying) return

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [isAutoPlaying])

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length)
    setIsAutoPlaying(false)
  }

  const prevTestimonial = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length)
    setIsAutoPlaying(false)
  }

  const currentTestimonial = testimonials[currentIndex]

  return (
    <section className="relative py-24 px-8 md:px-12">
      {/* Clean Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-black/98 to-black" />

      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Section Header */}
        <motion.div
          className="text-center mb-20"
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
            Testimonials
          </motion.span>
          
          <motion.h2
            className="text-5xl md:text-6xl lg:text-7xl font-serif font-light text-gold mb-8 tracking-tight"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            viewport={{ once: true }}
          >
            What Our
            <span className="block text-4xl md:text-5xl lg:text-6xl text-ivory/90 font-light italic">
              Clients Say
            </span>
          </motion.h2>
          
          <motion.div
            initial={{ opacity: 0, width: 0 }}
            whileInView={{ opacity: 1, width: "4rem" }}
            transition={{ duration: 0.8, delay: 0.5 }}
            viewport={{ once: true }}
            className="h-px bg-gradient-to-r from-transparent via-gold to-transparent mx-auto"
          />
        </motion.div>

        {/* Testimonial Carousel */}
        <div className="relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="text-center"
            >
              {/* Quote Icon */}
              <motion.div
                className="flex justify-center mb-8"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <Quote className="w-12 h-12 text-gold/30" />
              </motion.div>

              {/* Quote */}
              <motion.blockquote
                className="text-2xl md:text-3xl lg:text-4xl font-serif font-light text-ivory leading-relaxed max-w-4xl mx-auto mb-12"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.3 }}
              >
                "{currentTestimonial.quote}"
              </motion.blockquote>

              {/* Customer Info */}
              <motion.div
                className="flex flex-col md:flex-row items-center justify-center space-y-6 md:space-y-0 md:space-x-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
              >
                {/* Customer Photo */}
                <div className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-gold/30">
                  <Image
                    src={currentTestimonial.image}
                    alt={currentTestimonial.name}
                    fill
                    className="object-cover"
                  />
                </div>

                {/* Customer Details */}
                <div className="text-center md:text-left space-y-2">
                  <h4 className="text-xl font-serif font-medium text-gold">
                    {currentTestimonial.name}
                  </h4>
                  <p className="text-ivory/70 font-light">
                    {currentTestimonial.role} • {currentTestimonial.location}
                  </p>
                  <StarRating rating={currentTestimonial.rating} />
                  <p className="text-sm text-gold/60 font-medium">
                    Purchased: {currentTestimonial.product}
                  </p>
                </div>
              </motion.div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation Buttons */}
          <div className="flex justify-center items-center space-x-4 mt-12">
            <motion.button
              onClick={prevTestimonial}
              className="p-3 rounded-full border border-gold/30 hover:border-gold hover:bg-gold/10 transition-all duration-300"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <ChevronLeft className="w-5 h-5 text-gold" />
            </motion.button>

            {/* Dots Indicator */}
            <div className="flex space-x-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setCurrentIndex(index)
                    setIsAutoPlaying(false)
                  }}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    index === currentIndex ? 'bg-gold w-8' : 'bg-gold/30'
                  }`}
                />
              ))}
            </div>

            <motion.button
              onClick={nextTestimonial}
              className="p-3 rounded-full border border-gold/30 hover:border-gold hover:bg-gold/10 transition-all duration-300"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <ChevronRight className="w-5 h-5 text-gold" />
            </motion.button>
          </div>
        </div>
      </div>
    </section>
  )
}
