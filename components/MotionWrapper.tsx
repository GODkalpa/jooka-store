'use client'

import { motion, MotionProps } from 'framer-motion'
import { useEffect, useState } from 'react'

interface MotionWrapperProps extends MotionProps {
  children: React.ReactNode
  as?: keyof typeof motion
  fallback?: React.ReactNode
  className?: string
}

/**
 * A wrapper component that prevents hydration mismatches with Framer Motion
 * by only rendering motion components after client-side hydration is complete
 */
export default function MotionWrapper({
  children,
  as = 'div',
  fallback,
  ...motionProps
}: MotionWrapperProps) {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  // During SSR and initial hydration, render a static version
  if (!isMounted) {
    if (fallback) {
      return <>{fallback}</>
    }

    // Render a static version without motion props but keep all other props
    const Component = as as keyof JSX.IntrinsicElements
    const {
      initial,
      animate,
      exit,
      transition,
      variants,
      whileHover,
      whileTap,
      whileInView,
      whileFocus,
      whileDrag,
      viewport,
      onAnimationStart,
      onAnimationComplete,
      onUpdate,
      onDragStart,
      onDragEnd,
      onHoverStart,
      onHoverEnd,
      onTapStart,
      onTap,
      onTapCancel,
      onPan,
      onPanStart,
      onPanEnd,
      ...staticProps
    } = motionProps

    // Ensure we don't pass motion-specific props to the static component
    // This prevents React warnings about unknown props
    const cleanProps = Object.keys(staticProps).reduce((acc, key) => {
      // Keep common DOM props and valid event handlers
      if (
        key === 'className' ||
        key === 'style' ||
        key === 'id' ||
        key.startsWith('data-') ||
        key.startsWith('aria-') ||
        // Keep valid DOM event handlers
        key.startsWith('onMouse') ||
        key.startsWith('onFocus') ||
        key.startsWith('onKeyDown') ||
        key.startsWith('onKeyUp') ||
        key.startsWith('onInput') ||
        key.startsWith('onChange')
      ) {
        acc[key] = staticProps[key as keyof typeof staticProps]
      }
      return acc
    }, {} as Record<string, any>)

    return (
      <Component {...cleanProps} suppressHydrationWarning>
        {children}
      </Component>
    )
  }

  // After hydration, render the full motion component
  const MotionComponent = motion[as]
  return (
    <MotionComponent {...motionProps} suppressHydrationWarning>
      {children}
    </MotionComponent>
  )
}
