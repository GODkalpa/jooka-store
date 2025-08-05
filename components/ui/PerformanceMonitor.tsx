'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

export default function PerformanceMonitor() {
  const pathname = usePathname()

  useEffect(() => {
    if (typeof window === 'undefined') return

    const startTime = performance.now()
    
    // Monitor page load performance
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'navigation') {
          const navEntry = entry as PerformanceNavigationTiming
          console.log(`🚀 Page Load Performance for ${pathname}:`, {
            domContentLoaded: Math.round(navEntry.domContentLoadedEventEnd - navEntry.domContentLoadedEventStart),
            loadComplete: Math.round(navEntry.loadEventEnd - navEntry.loadEventStart),
            totalTime: Math.round(navEntry.loadEventEnd - (navEntry as any).navigationStart)
          })
        }
      }
    })

    observer.observe({ entryTypes: ['navigation'] })

    // Monitor route changes
    const routeChangeTime = performance.now()
    const timeoutId = setTimeout(() => {
      const endTime = performance.now()
      console.log(`⚡ Route transition to ${pathname}: ${Math.round(endTime - routeChangeTime)}ms`)
    }, 0)

    return () => {
      observer.disconnect()
      clearTimeout(timeoutId)
    }
  }, [pathname])

  // Only render in development
  if (process.env.NODE_ENV !== 'development') {
    return null
  }

  return null
}