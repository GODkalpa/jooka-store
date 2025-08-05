import { MotionConfig } from 'framer-motion'

// Motion configuration for SSR compatibility
export const motionConfig = {
  // Reduce motion for users who prefer it
  reducedMotion: "user",
  // Disable animations during SSR
  nonce: undefined,
}

// Custom motion variants that work well with SSR
export const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
}

export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 }
}

export const scaleIn = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.9 }
}

export const slideInLeft = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 }
}

export const slideInRight = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 20 }
}

// Transition presets
export const transitions = {
  default: { duration: 0.6, ease: "easeOut" },
  fast: { duration: 0.3, ease: "easeOut" },
  slow: { duration: 1, ease: "easeOut" },
  spring: { type: "spring", stiffness: 100, damping: 15 }
}
