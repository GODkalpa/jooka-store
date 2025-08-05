'use client'

import { ReactLenis } from 'lenis/react'
import { ReactNode } from 'react'

interface SmoothScrollWrapperProps {
  children: ReactNode
}

export default function SmoothScrollWrapper({ children }: SmoothScrollWrapperProps) {
  return (
    <ReactLenis root>
      {children}
    </ReactLenis>
  )
}
