'use client'

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import JookaLogo from '@/components/JookaLogo';
import { useAuth } from '@/lib/auth/firebase-auth';
import { ShoppingBag, Search, User, Heart, Menu, X, MapPin, Sparkles, Star } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { cn } from '@/lib/utils';

interface NavbarProps {
  className?: string;
}

const CATEGORIES = [
  { name: 'All Collection', href: '/shop' },
  { name: 'Shirts', href: '/shop?category=Shirts' },
  { name: 'Sweatshirts', href: '/shop?category=Sweatshirts' },
  { name: 'Pants', href: '/shop?category=Pants' },
  { name: 'Merch', href: '/shop?category=Merch' },
  { name: 'Sale & Archive', href: '/shop?sale=true', isRed: true },
];

export default function Navbar({ className = '' }: NavbarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isHydrated, setIsHydrated] = useState(false);
  const { user, logout } = useAuth();
  const { getTotalItems, openDrawer } = useCartStore();

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const cartItemCount = isHydrated ? getTotalItems() : 0;

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/shop?search=${encodeURIComponent(searchQuery)}`;
    }
  };

  return (
    <>
      {/* 1. Top Announcement Bar - Full Width */}
      <div className="w-full bg-[#111827] text-white py-2 px-4 sm:px-6 lg:px-12 text-xs font-medium tracking-wide text-center flex items-center justify-between gap-3 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <span className="hidden sm:inline-flex items-center bg-[#C8102E] text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-sm">
            PROMO
          </span>
          <span className="text-gray-200 text-xs tracking-wide">
            Complimentary Nepal delivery over ₨ 3,000 | Extra 20% off code: <strong className="text-white font-bold tracking-widest">JOOKA20</strong>
          </span>
        </div>

        <div className="hidden lg:flex items-center gap-4 text-[11px] text-gray-300">
          <span>Kathmandu Valley Dispatch</span>
          <span>•</span>
          <Link href="/shipping-returns" className="hover:text-white underline transition-colors">Track Order</Link>
        </div>
      </div>

      {/* 2. Top Utility Sub-Header - Full Width */}
      <div className="w-full bg-[#F9FAFB] border-b border-gray-200 py-1.5 px-4 sm:px-6 lg:px-12 text-xs text-gray-600 font-medium hidden md:block">
        <div className="w-full flex items-center justify-between">
          <div className="flex items-center gap-5">
            <span className="flex items-center gap-1.5 text-gray-700">
              <MapPin className="w-3.5 h-3.5 text-[#C8102E]" />
              <span>Deliver to Nepal: <strong className="text-gray-900 font-semibold">Kathmandu Valley</strong></span>
            </span>
            <span className="text-gray-300">|</span>
            <Link href="/shipping-returns" className="hover:text-gray-900 transition-colors">
              Delivery Zones
            </Link>
            <span className="text-gray-300">|</span>
            <Link href="/shipping-returns" className="hover:text-gray-900 transition-colors">
              7-Day Exchanges
            </Link>
          </div>

          <div className="flex items-center gap-5">
            <Link href="/shipping-returns" className="hover:text-gray-900 transition-colors">
              Support & Help
            </Link>
            <span className="text-gray-300">|</span>
            {user ? (
              <div className="flex items-center gap-2">
                <Link href={user.role === 'admin' ? '/admin/dashboard' : '/dashboard'} className="font-semibold text-gray-900 hover:text-[#C8102E]">
                  Hi, {user.profile?.full_name || user.profile?.first_name || user.email?.split('@')[0]}
                </Link>
                <button
                  onClick={async () => {
                    await logout();
                    window.location.reload();
                  }}
                  className="text-[11px] text-gray-400 hover:text-[#C8102E] font-normal transition-colors"
                >
                  (Sign Out)
                </button>
              </div>
            ) : (
              <Link href="/auth/signin" className="hover:text-[#C8102E] font-semibold text-gray-900">
                Sign In / Register
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* 3. Main Header Bar - Full Width Edge-to-Edge */}
      <header className={cn("w-full bg-white border-b border-gray-200 sticky top-0 z-40 shadow-xs", className)}>
        <div className="w-full px-4 sm:px-6 lg:px-12 py-3.5 flex items-center justify-between gap-4 sm:gap-6">
          {/* Mobile Menu Trigger & Official Gold Logo */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 text-gray-800 hover:text-black"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            <JookaLogo size="md" />
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearchSubmit} className="hidden md:flex flex-1 max-w-2xl mx-6 items-center">
            <div className="flex w-full bg-gray-100 border border-gray-200 rounded-lg overflow-hidden focus-within:bg-white focus-within:border-gray-900 transition-all">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-transparent text-xs font-semibold text-gray-700 px-4 py-2.5 border-r border-gray-200 focus:outline-none cursor-pointer"
              >
                <option value="All">All Categories</option>
                <option value="Shirts">Shirts</option>
                <option value="Sweatshirts">Sweatshirts</option>
                <option value="Pants">Pants</option>
                <option value="Merch">Merch</option>
              </select>

              <input
                type="text"
                placeholder="Search clothing, outerwear, deals..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2.5 text-xs text-gray-900 placeholder-gray-400 bg-transparent focus:outline-none"
              />

              <button
                type="submit"
                className="bg-gray-900 hover:bg-[#C8102E] text-white px-5 flex items-center justify-center transition-colors"
                aria-label="Search"
              >
                <Search className="w-4 h-4" />
              </button>
            </div>
          </form>

          {/* User Actions */}
          <div className="flex items-center gap-5 sm:gap-6">
            <Link
              href={user ? (user.role === 'admin' ? '/admin/dashboard' : '/dashboard') : '/auth/signin'}
              className="hidden sm:flex flex-col items-center text-gray-700 hover:text-gray-900 transition-colors"
            >
              <User className="w-5 h-5" />
              <span className="text-[11px] font-medium mt-0.5">Account</span>
            </Link>

            <Link
              href="/shop"
              className="hidden sm:flex flex-col items-center text-gray-700 hover:text-gray-900 transition-colors"
            >
              <Heart className="w-5 h-5" />
              <span className="text-[11px] font-medium mt-0.5">Saved</span>
            </Link>

            {/* Shopping Bag CTA */}
            <button
              onClick={() => openDrawer()}
              className="flex items-center gap-2.5 bg-gray-900 hover:bg-[#C8102E] text-white px-5 py-2.5 rounded-lg transition-colors shadow-xs"
              aria-label="Open Shopping Bag"
            >
              <div className="relative">
                <ShoppingBag className="w-5 h-5" />
                {cartItemCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-[#C8102E] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {cartItemCount}
                  </span>
                )}
              </div>
              <span className="text-xs font-semibold hidden xs:block">
                Bag ({cartItemCount})
              </span>
            </button>
          </div>
        </div>

        {/* 4. Category Mega-Menu Bar - Full Width */}
        <nav className="w-full border-t border-gray-100 bg-white hidden lg:block">
          <div className="w-full px-4 sm:px-6 lg:px-12 flex items-center justify-between text-xs font-semibold text-gray-700">
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.name}
                href={cat.href}
                className={cn(
                  "py-3.5 px-4 border-b-2 border-transparent transition-all hover:border-gray-900 hover:text-gray-900",
                  cat.isRed ? "text-[#C8102E] font-bold hover:border-[#C8102E]" : ""
                )}
              >
                {cat.name}
              </Link>
            ))}
          </div>
        </nav>
      </header>

      {/* Mobile Search & Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 top-32 z-50 bg-white p-6 space-y-6 lg:hidden overflow-y-auto border-t border-gray-200">
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 text-xs bg-gray-100 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:border-gray-900"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          </form>

          <div className="flex flex-col space-y-3 font-semibold text-sm border-t border-gray-100 pt-4">
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.name}
                href={cat.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={cn(
                  "py-2 px-1 border-b border-gray-50 flex items-center justify-between",
                  cat.isRed ? "text-[#C8102E] font-bold" : "text-gray-800"
                )}
              >
                <span>{cat.name}</span>
                <span>→</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </>
  );
}