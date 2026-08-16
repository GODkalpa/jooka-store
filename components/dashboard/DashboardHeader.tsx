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
    <div className="mb-8 font-sans text-black">
      {/* Breadcrumb Navigation */}
      {showBackToWebsite && (
        <div className="flex items-center space-x-2 text-xs text-neutral-500 mb-3 font-medium">
          <Link 
            href="/" 
            className="flex items-center hover:text-black transition-colors"
          >
            <Home className="w-3.5 h-3.5 mr-1" />
            Home
          </Link>
          <span>/</span>
          <Link 
            href="/shop" 
            className="flex items-center hover:text-black transition-colors"
          >
            <Store className="w-3.5 h-3.5 mr-1" />
            Shop
          </Link>
          <span>/</span>
          <span className="text-black font-semibold">
            {isAdmin ? 'Admin Portal' : 'My Account'}
          </span>
        </div>
      )}

      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border-muted pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-black">{title}</h1>
          {subtitle && (
            <p className="text-xs text-neutral-500 mt-1">{subtitle}</p>
          )}
        </div>

        {/* Quick Actions */}
        <div className="flex items-center space-x-2.5">
          <Link
            href="/"
            className="flex items-center px-3.5 py-2 text-xs font-semibold bg-white border border-border-muted hover:border-black rounded-md transition-colors text-black shadow-xs"
          >
            <ArrowLeft className="w-3.5 h-3.5 mr-2" />
            Website
          </Link>
          <Link
            href="/shop"
            className="flex items-center px-3.5 py-2 text-xs font-semibold bg-black hover:bg-neutral-800 rounded-md transition-colors text-white uppercase tracking-wider shadow-xs"
          >
            <Store className="w-3.5 h-3.5 mr-2" />
            Shop
          </Link>
        </div>
      </div>
    </div>
  )
}