'use client'

import { useEffect, useState } from 'react'

interface ClientOnlyProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  /**
   * Delay before showing content to prevent hydration mismatches
   * Useful for animations that start immediately
   */
  delay?: number
}

export default function ClientOnly({
  children,
  fallback = null,
  delay = 0
}: ClientOnlyProps) {
  const [hasMounted, setHasMounted] = useState(false)

  useEffect(() => {
    if (delay > 0) {
      const timer = setTimeout(() => setHasMounted(true), delay)
      return () => clearTimeout(timer)
    } else {
      setHasMounted(true)
    }
  }, [delay])

  if (!hasMounted) {
    return <>{fallback}</>
  }

  return <div suppressHydrationWarning>{children}</div>
}
