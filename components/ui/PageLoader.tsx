'use client'

import { memo } from 'react'

interface PageLoaderProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const PageLoader = memo(function PageLoader({ size = 'md', className = '' }: PageLoaderProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8', 
    lg: 'h-12 w-12'
  }

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className={`animate-spin rounded-full border-b-2 border-gold ${sizeClasses[size]}`} />
    </div>
  )
})

export default PageLoader