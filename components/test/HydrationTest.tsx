'use client'

import Link from 'next/link'
import MotionWrapper from '@/components/MotionWrapper'

/**
 * Test component to verify hydration issues are resolved
 * This component tests the specific pattern that was causing the hydration error:
 * Link > MotionWrapper > span
 */
export default function HydrationTest() {
  return (
    <div className="p-8 bg-black text-white">
      <h2 className="text-2xl mb-4 text-gold">Hydration Test</h2>
      
      {/* Test 1: Simple MotionWrapper */}
      <MotionWrapper
        className="mb-4 p-4 border border-gold/30"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <p>Test 1: Simple MotionWrapper - Should render without hydration errors</p>
      </MotionWrapper>
      
      {/* Test 2: Link with MotionWrapper (the problematic pattern) */}
      <div className="mb-4">
        <p className="mb-2">Test 2: Link with MotionWrapper inside (fixed pattern):</p>
        <Link
          href="/test"
          className="inline-flex items-center px-4 py-2 border border-gold/30 hover:border-gold transition-colors"
        >
          <span>Test Link</span>
          <span className="ml-2 transition-transform group-hover:translate-x-1">→</span>
        </Link>
      </div>
      
      {/* Test 3: MotionWrapper with Link inside */}
      <div className="mb-4">
        <p className="mb-2">Test 3: MotionWrapper containing Link (safe pattern):</p>
        <MotionWrapper
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Link
            href="/test"
            className="inline-flex items-center px-4 py-2 border border-gold/30 hover:border-gold transition-colors"
          >
            <span>Safe Link Pattern</span>
            <span className="ml-2">→</span>
          </Link>
        </MotionWrapper>
      </div>
      
      {/* Test 4: Multiple nested MotionWrappers */}
      <div className="mb-4">
        <p className="mb-2">Test 4: Nested MotionWrappers:</p>
        <MotionWrapper
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <MotionWrapper
            as="span"
            className="inline-block p-2 bg-gold/10"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            Nested Motion Components
          </MotionWrapper>
        </MotionWrapper>
      </div>
    </div>
  )
}
