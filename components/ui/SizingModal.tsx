'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Ruler, CheckCircle2 } from 'lucide-react'

interface SizingModalProps {
  isOpen: boolean
  onClose: () => void
  category?: string
}

export default function SizingModal({ isOpen, onClose, category = 'Tops' }: SizingModalProps) {
  const [unit, setUnit] = React.useState<'cm' | 'in'>('cm')

  const topSizes = [
    { size: 'S', chest: unit === 'cm' ? '96 - 100' : '38 - 39.5', length: unit === 'cm' ? '68' : '26.8', shoulder: unit === 'cm' ? '44' : '17.3' },
    { size: 'M', chest: unit === 'cm' ? '102 - 106' : '40 - 41.5', length: unit === 'cm' ? '71' : '28.0', shoulder: unit === 'cm' ? '46' : '18.1' },
    { size: 'L', chest: unit === 'cm' ? '108 - 112' : '42.5 - 44', length: unit === 'cm' ? '74' : '29.1', shoulder: unit === 'cm' ? '48' : '18.9' },
    { size: 'XL', chest: unit === 'cm' ? '114 - 118' : '45 - 46.5', length: unit === 'cm' ? '77' : '30.3', shoulder: unit === 'cm' ? '50' : '19.7' },
  ]

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-xs"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="relative z-10 w-full max-w-lg bg-surface border border-border-muted shadow-2xl p-6 sm:p-8 font-sans"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border-muted pb-4">
              <div className="flex items-center space-x-2">
                <Ruler className="w-5 h-5 text-black" />
                <h3 className="text-base font-semibold text-black tracking-tight">
                  Flat-Lay Sizing Guide
                </h3>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 text-neutral-400 hover:text-black transition-colors rounded-full hover:bg-surface-muted"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Subheader & Unit Switch */}
            <div className="flex items-center justify-between my-4">
              <p className="text-xs text-neutral-500">
                All garments are measured laid flat across a smooth surface.
              </p>
              <div className="flex border border-border-muted rounded-none overflow-hidden bg-surface-muted p-0.5">
                <button
                  onClick={() => setUnit('cm')}
                  className={`px-2.5 py-1 text-[11px] font-medium transition-all ${
                    unit === 'cm' ? 'bg-black text-white' : 'text-neutral-600 hover:text-black'
                  }`}
                >
                  CM
                </button>
                <button
                  onClick={() => setUnit('in')}
                  className={`px-2.5 py-1 text-[11px] font-medium transition-all ${
                    unit === 'in' ? 'bg-black text-white' : 'text-neutral-600 hover:text-black'
                  }`}
                >
                  INCH
                </button>
              </div>
            </div>

            {/* Measurement Table */}
            <div className="overflow-x-auto border border-border-muted my-4">
              <table className="w-full text-left text-xs">
                <thead className="bg-surface-muted border-b border-border-muted font-semibold text-black uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-2.5 px-3">Size</th>
                    <th className="py-2.5 px-3">Chest Width ({unit})</th>
                    <th className="py-2.5 px-3">Body Length ({unit})</th>
                    <th className="py-2.5 px-3">Shoulder ({unit})</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-muted text-neutral-700">
                  {topSizes.map((row) => (
                    <tr key={row.size} className="hover:bg-surface-muted/50 transition-colors">
                      <td className="py-2.5 px-3 font-bold text-black">{row.size}</td>
                      <td className="py-2.5 px-3">{row.chest}</td>
                      <td className="py-2.5 px-3">{row.length}</td>
                      <td className="py-2.5 px-3">{row.shoulder}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* How to measure tip */}
            <div className="bg-surface-muted p-3.5 border border-border-muted space-y-1.5 text-xs text-neutral-600">
              <div className="flex items-center gap-1.5 font-semibold text-black">
                <CheckCircle2 className="w-4 h-4 text-black" />
                <span>How to Measure Your Favorite Garment:</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                Take a similar garment that fits you well, lay it flat on a table, and measure across the chest from armpit to armpit, then double it to compare with our chest chart above.
              </p>
            </div>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="w-full mt-5 py-3 bg-black text-white text-xs font-medium tracking-widest uppercase hover:bg-neutral-800 transition-colors"
            >
              Got It
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
