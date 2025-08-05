'use client'

import Link from 'next/link'
import { ArrowLeft, Home, Store } from 'lucide-react'

interface DashboardHeaderProps {
  title: string
  subtitle?: string
  showBackToWebsite?: boolean
  isAdmin?: boolean
}

export default function DashboardHeader({ 
  title, 
  subtitle, 
  showBackToWebsite = true,
  isAdmin = false 
}: DashboardHeaderProps) {
  return (
    <div className="mb-8">
      {/* Breadcrumb Navigation */}
      {showBackToWebsite && (
        <div className="flex items-center space-x-2 text-sm text-gray-400 mb-4">
          <Link 
            href="/" 
            className="flex items-center hover:text-gold transition-colors"
          >
            <Home className="w-4 h-4 mr-1" />
            Home
          </Link>
          <span>/</span>
          <Link 
            href="/shop" 
            className="flex items-center hover:text-gold transition-colors"
          >
            <Store className="w-4 h-4 mr-1" />
            Shop
          </Link>
          <span>/</span>
          <span className="text-gold">
            {isAdmin ? 'Admin Dashboard' : 'My Account'}
          </span>
        </div>
      )}

      {/* Page Title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gold mb-2">{title}</h1>
          {subtitle && (
            <p className="text-gray-400">{subtitle}</p>
          )}
        </div>

        {/* Quick Actions */}
        <div className="flex items-center space-x-3">
          <Link
            href="/"
            className="flex items-center px-3 py-2 text-sm bg-gold/10 hover:bg-gold/20 border border-gold/30 rounded-lg transition-colors text-gold"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Website
          </Link>
          <Link
            href="/shop"
            className="flex items-center px-3 py-2 text-sm bg-gold hover:bg-gold/90 rounded-lg transition-colors text-black font-medium"
          >
            <Store className="w-4 h-4 mr-2" />
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  )
}