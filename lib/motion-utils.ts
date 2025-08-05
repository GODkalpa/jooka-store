/**
 * Utility functions for handling Framer Motion components safely
 * to prevent hydration mismatches in Next.js applications
 */

import { MotionProps } from 'framer-motion'

/**
 * Filters out motion-specific props from a props object
 * to create a clean props object for static rendering
 */
export function filterMotionProps(props: MotionProps & Record<string, any>) {
  const {
    // Animation props
    initial,
    animate,
    exit,
    transition,
    variants,
    
    // Gesture props
    whileHover,
    whileTap,
    whileFocus,
    whileDrag,
    whileInView,
    
    // Event handlers
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
    onViewportEnter,
    onViewportLeave,
    
    // Layout props
    layout,
    layoutId,
    layoutDependency,
    layoutScroll,
    
    // Viewport props
    viewport,
    
    // Drag props
    drag,
    dragConstraints,
    dragElastic,
    dragMomentum,
    dragPropagation,
    dragSnapToOrigin,
    dragTransition,
    
    // Style props that might cause hydration issues
    style: motionStyle,
    
    ...staticProps
  } = props

  return staticProps
}

/**
 * Safe motion variants that work well with SSR
 */
export const safeMotionVariants = {
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 }
  },
  
  fadeInUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  },
  
  fadeInDown: {
    initial: { opacity: 0, y: -20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 20 }
  },
  
  slideInLeft: {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 }
  },
  
  slideInRight: {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 20 }
  },
  
  scaleIn: {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.9 }
  },
  
  staggerContainer: {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  }
}

/**
 * Safe transition configurations
 */
export const safeTransitions = {
  smooth: { duration: 0.3, ease: "easeOut" },
  bouncy: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  spring: { type: "spring", stiffness: 300, damping: 30 },
  slow: { duration: 0.8, ease: "easeInOut" }
}
