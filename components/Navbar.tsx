'use client'

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/lib/auth/firebase-auth';
import { ShoppingCart } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { cn } from '@/lib/utils';

interface NavLink {
  label: string;
  href: string;
}

interface NavbarProps {
  logoSrc?: string;
  logoAlt?: string;
  navLinks?: NavLink[];
  className?: string;
}

const defaultNavLinks: NavLink[] = [
  { label: 'HOME', href: '/' },
  { label: 'SHOP', href: '/shop' },
  { label: 'CART', href: '/cart' },
  { label: 'LOGIN', href: '/auth/signin' },
  { label: 'SIGN UP', href: '/auth/signup' },
];

// Helper component for navigation links - matching MinimalistHero style
const NavLink = ({ href, children }: { href: string; children: React.ReactNode }) => (
  <Link
    href={href}
    className="text-sm font-medium tracking-widest text-foreground/60 transition-colors hover:text-foreground"
  >
    {children}
  </Link>
);

const Navbar = ({
  logoSrc = "/logo.png",
  logoAlt = "Jooka Logo",
  navLinks = defaultNavLinks,
  className = ""
}: NavbarProps) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const { user, isLoading, isAuthenticated, logout } = useAuth();
  const { getTotalItems } = useCartStore();

  // Handle hydration to prevent cart count mismatch
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Debug: Log authentication state
  console.log('Navbar Auth State:', { user, isLoading, isAuthenticated });

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  // Dynamic navigation links based on authentication status (excluding cart)
  const getNavLinks = () => {
    const baseLinks = [
      { label: 'HOME', href: '/' },
      { label: 'SHOP', href: '/shop' },
    ];

    if (user) {
      // Authenticated user links
      const userRole = user.role;
      const userLinks = [
        ...baseLinks,
        {
          label: userRole === 'admin' ? 'ADMIN' : 'DASHBOARD',
          href: userRole === 'admin' ? '/admin/dashboard' : '/dashboard'
        },
      ];
      return userLinks;
    } else {
      // Unauthenticated user links (show LOGIN/SIGNUP even when loading)
      return [
        ...baseLinks,
        { label: 'LOGIN', href: '/auth/signin' },
        { label: 'SIGN UP', href: '/auth/signup' },
      ];
    }
  };

  const handleSignOut = async () => {
    await logout();
    closeMobileMenu();
  };

  const dynamicNavLinks = getNavLinks();
  // Only get cart count after hydration to prevent SSR mismatch
  const cartItemCount = isHydrated ? getTotalItems() : 0;

  // Cart Icon Component
  const CartIcon = () => (
    <Link href="/cart" className="relative group">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: (dynamicNavLinks.length + 1) * 0.1 }}
        className="relative p-2 hover:bg-foreground/5 rounded-lg transition-colors"
      >
        <ShoppingCart className="w-6 h-6 text-foreground/60 group-hover:text-foreground transition-colors" />
        {cartItemCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 bg-gold text-black text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center min-w-[20px]"
          >
            {cartItemCount > 99 ? '99+' : cartItemCount}
          </motion.span>
        )}
      </motion.div>
    </Link>
  );

  return (
    <>
      {/* Main Navbar - Matching MinimalistHero header styling exactly */}
      <header className={cn(
        'fixed top-0 left-0 right-0 z-50 flex w-full items-center justify-between overflow-hidden bg-background px-6 py-4 font-sans md:px-8 md:py-6',
        className
      )}>
        <div className="z-30 flex w-full max-w-7xl items-center justify-between mx-auto">
          {/* Logo - Using image instead of text */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center"
          >
            <Link href="/" className="hover:opacity-80 transition-opacity">
              <Image
                src={logoSrc}
                alt={logoAlt}
                width={120}
                height={40}
                className="h-8 w-auto md:h-10"
                priority
              />
            </Link>
          </motion.div>

          {/* Desktop Navigation - Matching MinimalistHero styling */}
          <div className="hidden items-center md:flex">
            {/* Main Navigation Links */}
            <div className="flex items-center space-x-8">
              {dynamicNavLinks.map((link, index) => (
                <motion.div
                  key={link.label}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <NavLink href={link.href}>
                    {link.label}
                  </NavLink>
                </motion.div>
              ))}

              {/* Sign Out Button for Authenticated Users */}
              {user && (
                <motion.button
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: dynamicNavLinks.length * 0.1 }}
                  onClick={handleSignOut}
                  className="text-sm font-medium tracking-widest text-foreground/60 transition-colors hover:text-foreground"
                >
                  SIGN OUT
                </motion.button>
              )}
            </div>

            {/* Cart Icon - Positioned on the right */}
            <div className="ml-8 pl-8 border-l border-foreground/10">
              <CartIcon />
            </div>
          </div>

          {/* Mobile Cart Icon and Menu Button */}
          <div className="flex items-center space-x-4 md:hidden">
            {/* Mobile Cart Icon */}
            <Link href="/cart" className="relative">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                className="relative p-2"
              >
                <ShoppingCart className="w-6 h-6 text-foreground/60" />
                {cartItemCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 bg-gold text-black text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center min-w-[20px]"
                  >
                    {cartItemCount > 99 ? '99+' : cartItemCount}
                  </motion.span>
                )}
              </motion.div>
            </Link>

            {/* Mobile Menu Button */}
            <motion.button
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="flex flex-col space-y-1.5"
              onClick={toggleMobileMenu}
              aria-label="Toggle mobile menu"
            >
              <motion.span
                className="block h-0.5 w-6 bg-foreground transition-all duration-300"
                animate={isMobileMenuOpen ? { rotate: 45, y: 6 } : { rotate: 0, y: 0 }}
              />
              <motion.span
                className="block h-0.5 w-6 bg-foreground transition-all duration-300"
                animate={isMobileMenuOpen ? { opacity: 0 } : { opacity: 1 }}
              />
              <motion.span
                className="block h-0.5 w-5 bg-foreground transition-all duration-300"
                animate={isMobileMenuOpen ? { rotate: -45, y: -6, width: 24 } : { rotate: 0, y: 0, width: 20 }}
              />
            </motion.button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden animate-fade-in"
          onClick={closeMobileMenu}
        />
      )}

      {/* Mobile Menu Panel */}
      {isMobileMenuOpen && (
        <div className="fixed top-0 right-0 bottom-0 z-50 w-80 max-w-[85vw] bg-background border-l border-foreground/20 md:hidden animate-slide-in-right">

            {/* Mobile Menu Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-foreground/20">
              <Image
                src={logoSrc}
                alt={logoAlt}
                width={100}
                height={32}
                className="h-6 w-auto"
              />
              <button
                onClick={closeMobileMenu}
                className="p-2 text-foreground hover:text-foreground/80 transition-colors"
                aria-label="Close mobile menu"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Mobile Menu Links */}
            <div className="flex flex-col px-6 py-4 space-y-6">
              {dynamicNavLinks.map((link, index) => (
                <div
                  key={link.label}
                  className="opacity-0 animate-fade-in-right"
                  style={{
                    animationDelay: `${index * 0.1}s`,
                    animationFillMode: 'forwards'
                  }}
                >
                  <Link
                    href={link.href}
                    onClick={closeMobileMenu}
                    className="block text-lg font-medium tracking-widest text-foreground/60 hover:text-foreground transition-colors duration-300 py-2"
                  >
                    {link.label}
                  </Link>
                </div>
              ))}

              {/* Mobile Cart Link */}
              <div
                className="opacity-0 animate-fade-in-right"
                style={{
                  animationDelay: `${dynamicNavLinks.length * 0.1}s`,
                  animationFillMode: 'forwards'
                }}
              >
                <Link
                  href="/cart"
                  onClick={closeMobileMenu}
                  className="flex items-center justify-between text-lg font-medium tracking-widest text-foreground/60 hover:text-foreground transition-colors duration-300 py-2"
                >
                  <span>CART</span>
                  {cartItemCount > 0 && (
                    <span className="bg-gold text-black text-sm font-bold rounded-full w-6 h-6 flex items-center justify-center">
                      {cartItemCount > 99 ? '99+' : cartItemCount}
                    </span>
                  )}
                </Link>
              </div>
              
              {/* Mobile Sign Out Button */}
              {user && (
                <button
                  onClick={handleSignOut}
                  className="block text-lg font-medium tracking-widest text-foreground/60 hover:text-foreground transition-colors duration-300 py-2 text-left opacity-0 animate-fade-in-right"
                  style={{
                    animationDelay: `${(dynamicNavLinks.length + 1) * 0.1}s`,
                    animationFillMode: 'forwards'
                  }}
                >
                  SIGN OUT
                </button>
              )}
            </div>
          </div>
        )}

      {/* Spacer to prevent content from hiding behind fixed navbar */}
      <div className="h-10 md:h-12"></div>
    </>
  );
};

export default Navbar;