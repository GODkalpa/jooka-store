'use client'

import Link from 'next/link'
import JookaLogo from '@/components/JookaLogo'
import { Instagram, Facebook, Mail, MapPin, Phone, ShieldCheck } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="w-full bg-[#111827] text-gray-300 font-sans border-t border-gray-800">

      {/* Main Footer Links - Full Width */}
      <div className="w-full px-4 sm:px-6 lg:px-12 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand Info & Official Logo */}
          <div className="lg:col-span-2 space-y-4">
            <JookaLogo size="lg" />
            <p className="text-xs sm:text-sm text-gray-400 leading-relaxed max-w-md">
              Contemporary Nepali streetwear, heavyweight outerwear, denim, and refined capsule collections.
            </p>
            
            <div className="p-4 bg-gray-900/80 rounded-lg border border-gray-800 space-y-1.5 max-w-md">
              <div className="flex items-center gap-2 text-white font-semibold text-xs uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4 text-[#C8102E]" />
                <span>JOOKA Collective</span>
              </div>
              <p className="text-[11px] text-gray-400 leading-relaxed">
                Receive early access to seasonal capsule drops, archive previews, and priority Kathmandu Valley dispatch.
              </p>
            </div>
          </div>

          {/* Collections */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-white mb-4">
              Collections
            </h4>
            <ul className="space-y-2.5 text-xs text-gray-400">
              <li><Link href="/shop" className="hover:text-white transition-colors">All Garments</Link></li>
              <li><Link href="/shop?category=Shirts" className="hover:text-white transition-colors">Shirts & Tees</Link></li>
              <li><Link href="/shop?category=Sweatshirts" className="hover:text-white transition-colors">Sweatshirts & Fleece</Link></li>
              <li><Link href="/shop?category=Pants" className="hover:text-white transition-colors">Tailored Pants</Link></li>
              <li><Link href="/shop?category=Merch" className="hover:text-white transition-colors">Accessories & Merch</Link></li>
              <li><Link href="/shop?sale=true" className="text-[#C8102E] font-semibold hover:underline">Sale & Archive</Link></li>
            </ul>
          </div>

          {/* Customer Support */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-white mb-4">
              Client Services
            </h4>
            <ul className="space-y-2.5 text-xs text-gray-400">
              <li><Link href="/shipping-returns" className="hover:text-white transition-colors">Shipping & Courier Zones</Link></li>
              <li><Link href="/shipping-returns" className="hover:text-white transition-colors">7-Day Exchanges</Link></li>
              <li><Link href="/contact" className="hover:text-white transition-colors">Support & Inquiries</Link></li>
              <li><Link href="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms-of-service" className="hover:text-white transition-colors">Terms of Service</Link></li>
              <li><Link href="/cart" className="hover:text-white transition-colors">Shopping Bag</Link></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-white mb-4">
              Capsule Alerts
            </h4>
            <p className="text-xs text-gray-400 mb-3 leading-relaxed">
              Subscribe for release drops, lookbook previews, and promo codes.
            </p>
            <form onSubmit={(e) => e.preventDefault()} className="space-y-2">
              <input
                type="email"
                placeholder="Enter email address"
                className="w-full px-3.5 py-2.5 bg-gray-900 border border-gray-700 rounded-md text-xs text-white placeholder-gray-500 focus:outline-none focus:border-white"
              />
              <button
                type="submit"
                className="w-full py-2.5 bg-[#C8102E] hover:bg-[#A60C24] text-white text-xs font-semibold uppercase tracking-wider rounded-md transition-colors shadow-xs"
              >
                Join List
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-12 pt-6 flex flex-col sm:flex-row justify-between items-center text-xs text-gray-500 gap-4">
          <div className="flex flex-wrap items-center gap-4">
            <p>© 2026 JOOKA Store Nepal. All rights reserved.</p>
            <span className="hidden sm:inline">•</span>
            <Link href="/privacy-policy" className="hover:text-gray-300">Privacy</Link>
            <Link href="/terms-of-service" className="hover:text-gray-300">Terms</Link>
            <Link href="/shipping-returns" className="hover:text-gray-300">Delivery & Returns</Link>
          </div>
          <div className="flex space-x-4">
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="p-2 bg-gray-900 hover:bg-gray-800 rounded-md text-gray-300 transition-colors" aria-label="Instagram"><Instagram className="w-4 h-4" /></a>
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="p-2 bg-gray-900 hover:bg-gray-800 rounded-md text-gray-300 transition-colors" aria-label="Facebook"><Facebook className="w-4 h-4" /></a>
          </div>
        </div>
      </div>
    </footer>
  )
}