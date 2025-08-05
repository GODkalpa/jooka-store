'use client';

import { useState } from 'react';
import { Plus, X, Ruler } from 'lucide-react';

interface SizeSelectorProps {
  sizes: string[];
  onChange: (sizes: string[]) => void;
  error?: string;
}

// Common size presets for quick selection
const SIZE_PRESETS = {
  clothing: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
  shoes: ['6', '6.5', '7', '7.5', '8', '8.5', '9', '9.5', '10', '10.5', '11', '11.5', '12'],
  numeric: ['28', '30', '32', '34', '36', '38', '40', '42', '44', '46'],
};

export default function SizeSelector({ sizes, onChange, error }: SizeSelectorProps) {
  const [newSize, setNewSize] = useState('');
  const [selectedPreset, setSelectedPreset] = useState<keyof typeof SIZE_PRESETS | ''>('');

  const addSize = () => {
    const trimmedSize = newSize.trim();
    if (trimmedSize && !sizes.includes(trimmedSize)) {
      // Validate size name (basic validation)
      if (trimmedSize.length < 1) {
        return; // Too short
      }
      if (trimmedSize.length > 20) {
        return; // Too long
      }
      onChange([...sizes, trimmedSize]);
      setNewSize('');
    }
  };

  const removeSize = (sizeToRemove: string) => {
    onChange(sizes.filter(size => size !== sizeToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addSize();
    }
  };

  const applyPreset = (presetKey: keyof typeof SIZE_PRESETS) => {
    const presetSizes = SIZE_PRESETS[presetKey];
    // Add only sizes that aren't already selected
    const newSizes = presetSizes.filter(size => !sizes.includes(size));
    onChange([...sizes, ...newSizes]);
    setSelectedPreset('');
  };

  const addPresetSize = (size: string) => {
    if (!sizes.includes(size)) {
      onChange([...sizes, size]);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Ruler className="w-5 h-5 text-gold" />
        <label className="text-lg font-medium text-white">
          Sizes *
        </label>
      </div>

      {/* Size presets */}
      <div>
        <p className="text-sm text-gray-400 mb-4">Quick add common sizes:</p>
        <div className="grid grid-cols-1 gap-3 mb-6">
          <button
            type="button"
            onClick={() => applyPreset('clothing')}
            className="flex items-center justify-between p-4 bg-black/30 border border-gold/20 rounded-lg text-sm text-gray-300 hover:bg-gold/10 hover:text-gold hover:border-gold/40 focus:outline-none focus:ring-2 focus:ring-gold/50 transition-all"
          >
            <span className="font-medium">Clothing Sizes</span>
            <span className="text-sm text-gray-400">XS, S, M, L, XL, XXL</span>
          </button>
          <button
            type="button"
            onClick={() => applyPreset('shoes')}
            className="flex items-center justify-between p-4 bg-black/30 border border-gold/20 rounded-lg text-sm text-gray-300 hover:bg-gold/10 hover:text-gold hover:border-gold/40 focus:outline-none focus:ring-2 focus:ring-gold/50 transition-all"
          >
            <span className="font-medium">Shoe Sizes</span>
            <span className="text-sm text-gray-400">6-12</span>
          </button>
          <button
            type="button"
            onClick={() => applyPreset('numeric')}
            className="flex items-center justify-between p-4 bg-black/30 border border-gold/20 rounded-lg text-sm text-gray-300 hover:bg-gold/10 hover:text-gold hover:border-gold/40 focus:outline-none focus:ring-2 focus:ring-gold/50 transition-all"
          >
            <span className="font-medium">Numeric Sizes</span>
            <span className="text-sm text-gray-400">28-46</span>
          </button>
        </div>
      </div>

      {/* Add custom size input */}
      <div className="flex gap-3">
        <input
          type="text"
          value={newSize}
          onChange={(e) => setNewSize(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Enter custom size (e.g., XL, 42, 10.5)"
          className="flex-1 px-4 py-3 bg-black/30 border border-gold/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 transition-all"
        />
        <button
          type="button"
          onClick={addSize}
          disabled={!newSize.trim() || sizes.includes(newSize.trim())}
          className="px-6 py-3 bg-gold text-black rounded-lg hover:bg-gold/90 focus:outline-none focus:ring-2 focus:ring-gold/50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium transition-all shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Add
        </button>
      </div>

      {/* Display selected sizes */}
      {sizes.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-gray-400">Selected sizes:</p>
          <div className="flex flex-wrap gap-2">
            {sizes.map((size, index) => (
              <div
                key={index}
                className="flex items-center gap-2 px-3 py-2 bg-charcoal/50 border border-gold/20 rounded-lg text-sm text-white group hover:border-gold/40 transition-all"
              >
                <span className="font-medium">{size}</span>
                <button
                  type="button"
                  onClick={() => removeSize(size)}
                  className="text-gray-400 hover:text-red-400 focus:outline-none opacity-0 group-hover:opacity-100 transition-all"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Validation and help messages */}
      <div className="space-y-1">
        {error && (
          <p className="text-red-400 text-sm flex items-center gap-1">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {error}
          </p>
        )}

        {sizes.length === 0 && !error && (
          <p className="text-gray-400 text-sm">
            Add at least one size option for this product
          </p>
        )}
      </div>
    </div>
  );
}
