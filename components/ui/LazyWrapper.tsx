'use client'

import { Suspense, lazy, ComponentType } from 'react'
import PageLoader from './PageLoader'

interface LazyWrapperProps {
  fallback?: React.ReactNode
  className?: string
}

export function createLazyComponent<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  fallback?: React.ReactNode
) {
  const LazyComponent = lazy(importFn)
  
  return function WrappedComponent(props: React.ComponentProps<T> & LazyWrapperProps) {
    const { fallback: customFallback, className, ...componentProps } = props
    
    return (
      <Suspense fallback={customFallback || <PageLoader className={className} />}>
        <LazyComponent {...(componentProps as any)} />
      </Suspense>
    )
  }
}

export default function LazyWrapper({ 
  children, 
  fallback, 
  className = "h-32" 
}: { 
  children: React.ReactNode
  fallback?: React.ReactNode
  className?: string
}) {
  return (
    <Suspense fallback={fallback || <PageLoader className={className} />}>
      {children}
    </Suspense>
  )
}