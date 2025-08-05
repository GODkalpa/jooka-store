'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Instagram, Twitter, Facebook, Mail, MapPin, Phone } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="relative bg-black border-t border-gold/10">
      {/* Clean Background */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/98 to-black" />

      <div className="relative z-10 max-w-7xl mx-auto px-8 md:px-12 py-16">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-16">
          {/* Brand Section */}
          <motion.div
            className="lg:col-span-2"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <motion.h3
              className="text-4xl md:text-5xl font-serif font-light text-gold mb-4 tracking-tight"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
            >
              JOOKA
            </motion.h3>

            <motion.p
              className="text-xl text-ivory/60 mb-6 font-light italic"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              Natural Elegance
            </motion.p>

            <motion.div
              initial={{ opacity: 0, width: 0 }}
              whileInView={{ opacity: 1, width: "4rem" }}
              transition={{ duration: 0.8, delay: 0.3 }}
              viewport={{ once: true }}
              className="h-px bg-gradient-to-r from-gold via-gold/50 to-transparent mb-6"
            />

            <motion.p
              className="text-ivory/70 text-lg leading-relaxed font-light max-w-md"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
            >
              Luxury fashion designed with timeless sophistication and sustainable practices.
              Each piece embodies our commitment to craftsmanship and natural beauty.
            </motion.p>

            {/* Contact Info */}
            <motion.div
              className="mt-8 space-y-3"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              viewport={{ once: true }}
            >
              <div className="flex items-center space-x-3 text-ivory/60">
                <MapPin className="w-4 h-4 text-gold/70" />
                <span className="text-sm font-light">Dharan, Nepal</span>
              </div>
              <div className="flex items-center space-x-3 text-ivory/60">
                <Mail className="w-4 h-4 text-gold/70" />
                <span className="text-sm font-light">hello@jooka.com</span>
              </div>
              <div className="flex items-center space-x-3 text-ivory/60">
                <Phone className="w-4 h-4 text-gold/70" />
                <span className="text-sm font-light">+977 123 456 789</span>
              </div>
            </motion.div>
          </motion.div>

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <h4 className="text-gold font-serif font-medium text-lg mb-6 tracking-wide">Shop</h4>
            <ul className="space-y-4">
              {['Shop All', 'Dresses', 'Outerwear', 'Accessories', 'New Arrivals'].map((item, index) => (
                <li
                  key={item}
                  className="opacity-0 animate-fade-in-left"
                  style={{
                    animationDelay: `${0.3 + index * 0.1}s`,
                    animationFillMode: 'forwards'
                  }}
                >
                  <Link
                    href={`/shop${item === 'Shop All' ? '' : `?category=${item.toLowerCase()}`}`}
                    className="text-ivory/70 hover:text-gold transition-colors duration-300 text-sm font-light tracking-wide group"
                  >
                    <span className="group-hover:translate-x-1 transition-transform duration-300 inline-block">
                      {item}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Customer Care */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: true }}
          >
            <h4 className="text-gold font-serif font-medium text-lg mb-6 tracking-wide">Customer Care</h4>
            <ul className="space-y-4">
              {['Size Guide', 'Returns', 'Privacy Policy', 'Contact'].map((item, index) => (
                <li
                  key={item}
                  className="opacity-0 animate-fade-in-left"
                  style={{
                    animationDelay: `${0.4 + index * 0.1}s`,
                    animationFillMode: 'forwards'
                  }}
                >
                  <Link
                    href={`/${item.toLowerCase().replace(' ', '-')}`}
                    className="text-ivory/70 hover:text-gold transition-colors duration-300 text-sm font-light tracking-wide group"
                  >
                    <span className="group-hover:translate-x-1 transition-transform duration-300 inline-block">
                      {item}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>

        {/* Newsletter Section */}
        <motion.div
          className="border-t border-gold/10 mt-16 pt-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
        >
          <div className="text-center max-w-2xl mx-auto">
            <motion.h4
              className="text-2xl md:text-3xl font-serif font-light text-gold mb-4"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              viewport={{ once: true }}
            >
              Stay in Touch
            </motion.h4>

            <motion.p
              className="text-ivory/60 text-lg mb-8 font-light"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              viewport={{ once: true }}
            >
              Subscribe to receive updates on new collections and exclusive offers.
            </motion.p>

            <motion.div
              className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}
              viewport={{ once: true }}
            >
              <input
                type="email"
                placeholder="Enter your email address"
                className="flex-1 px-6 py-4 bg-black/50 border border-gold/20 text-ivory placeholder-ivory/40 focus:outline-none focus:border-gold/50 transition-colors duration-300 text-sm font-light tracking-wide"
              />
              <motion.button
                className="px-8 py-4 bg-gold/10 border border-gold/30 text-gold hover:bg-gold hover:text-black transition-all duration-300 text-sm font-medium tracking-[0.1em] uppercase"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Subscribe
              </motion.button>
            </motion.div>
          </div>
        </motion.div>

        {/* Bottom Section */}
        <motion.div
          className="border-t border-gold/10 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          viewport={{ once: true }}
        >
          {/* Social Links */}
          <div className="flex space-x-6 mb-6 md:mb-0">
            {[
              { icon: Instagram, href: '#', label: 'Instagram' },
              { icon: Twitter, href: '#', label: 'Twitter' },
              { icon: Facebook, href: '#', label: 'Facebook' }
            ].map((social, index) => (
              <div
                key={social.label}
                className="opacity-0 animate-fade-in-up"
                style={{
                  animationDelay: `${0.9 + index * 0.1}s`,
                  animationFillMode: 'forwards'
                }}
              >
                <a
                  href={social.href}
                  className="text-gold/60 hover:text-gold transition-all duration-300 p-2 hover:scale-110 hover:-translate-y-0.5 active:scale-95 transform inline-block"
                  aria-label={social.label}
                >
                  <social.icon className="w-5 h-5" />
                </a>
              </div>
            ))}
          </div>

          {/* Copyright */}
          <motion.p
            className="text-ivory/50 text-sm font-light tracking-wide"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 1 }}
            viewport={{ once: true }}
          >
            © 2024 JOOKA. All rights reserved.
          </motion.p>
        </motion.div>
      </div>
    </footer>
  )
}