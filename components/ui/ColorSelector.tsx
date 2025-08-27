'use client';

import { useState } from 'react';
import { Plus, X, Palette } from 'lucide-react';

interface ColorSelectorProps {
  colors: string[];
  onChange: (colors: string[]) => void;
  error?: string;
}

// Common color presets for quick selection
const COLOR_PRESETS = [
  { name: 'Black', value: '#000000' },
  { name: 'White', value: '#FFFFFF' },
  { name: 'Navy', value: '#1E3A8A' },
  { name: 'Gray', value: '#6B7280' },
  { name: 'Red', value: '#DC2626' },
  { name: 'Blue', value: '#2563EB' },
  { name: 'Green', value: '#059669' },
  { name: 'Brown', value: '#92400E' },
];

// Function to get a color value for display
const getColorValue = (colorName: string): string => {
  const preset = COLOR_PRESETS.find(p => p.name.toLowerCase() === colorName.toLowerCase());
  return preset?.value || '#6B7280'; // Default to gray if not found
};

export default function ColorSelector({ colors, onChange, error }: ColorSelectorProps) {
  const [newColor, setNewColor] = useState('');

  const addColor = () => {
    const trimmedColor = newColor.trim();
    if (trimmedColor && !colors.includes(trimmedColor)) {
      // Validate color name (basic validation)
      if (trimmedColor.length < 2) {
        return; // Too short
      }
      if (trimmedColor.length > 50) {
        return; // Too long
      }
      onChange([...colors, trimmedColor]);
      setNewColor('');
    }
  };

  const addPresetColor = (colorName: string) => {
    if (!colors.includes(colorName)) {
      onChange([...colors, colorName]);
    }
  };

  const removeColor = (colorToRemove: string) => {
    onChange(colors.filter(color => color !== colorToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addColor();
    }
  };

  return (
    <div className="space-y-4 xs:space-y-5 sm:space-y-6">
      <div className="flex items-center gap-2 xs:gap-3">
        <Palette className="w-4 h-4 xs:w-5 xs:h-5 text-gold" />
        <label className="text-sm xs:text-base sm:text-lg font-medium text-white">
          Colors *
        </label>
      </div>

      {/* Color presets */}
      <div>
        <p className="text-xs xs:text-sm text-gray-400 mb-3 xs:mb-4">Quick add common colors:</p>
        <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 xs:gap-3 mb-4 xs:mb-5 sm:mb-6">
          {COLOR_PRESETS.map((preset) => (
            <button
              key={preset.name}
              type="button"
              onClick={() => addPresetColor(preset.name)}
              disabled={colors.includes(preset.name)}
              className="flex items-center gap-2 xs:gap-3 p-2.5 xs:p-3 bg-black/30 border border-gold/20 rounded-md xs:rounded-lg text-xs xs:text-sm text-gray-300 hover:bg-gold/10 hover:text-gold hover:border-gold/40 focus:outline-none focus:ring-2 focus:ring-gold/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <div
                className="w-3 h-3 xs:w-4 xs:h-4 rounded-full border-2 border-gray-500 shadow-sm flex-shrink-0"
                style={{ backgroundColor: preset.value }}
              />
              <span className="truncate font-medium">{preset.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Add custom color input */}
      <div className="flex flex-col xs:flex-row gap-2 xs:gap-3">
        <input
          type="text"
          value={newColor}
          onChange={(e) => setNewColor(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Enter custom color name"
          className="flex-1 px-3 xs:px-4 py-2.5 xs:py-3 bg-black/30 border border-gold/30 rounded-md xs:rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 transition-all text-xs xs:text-sm"
        />
        <button
          type="button"
          onClick={addColor}
          disabled={!newColor.trim() || colors.includes(newColor.trim())}
          className="px-4 xs:px-5 sm:px-6 py-2.5 xs:py-3 bg-gold text-black rounded-md xs:rounded-lg hover:bg-gold/90 focus:outline-none focus:ring-2 focus:ring-gold/50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 xs:gap-2 font-medium transition-all shadow-sm text-xs xs:text-sm whitespace-nowrap"
        >
          <Plus className="w-3 h-3 xs:w-4 xs:h-4" />
          Add
        </button>
      </div>

      {/* Display selected colors */}
      {colors.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-gray-400">Selected colors:</p>
          <div className="flex flex-wrap gap-1.5 xs:gap-2">
            {colors.map((color, index) => (
              <div
                key={index}
                className="flex items-center gap-1.5 xs:gap-2 px-2.5 xs:px-3 py-1.5 xs:py-2 bg-charcoal/50 border border-gold/20 rounded-md xs:rounded-lg text-xs xs:text-sm text-white group hover:border-gold/40 transition-all"
              >
                <div
                  className="w-2.5 h-2.5 xs:w-3 xs:h-3 rounded-full border border-gray-500 flex-shrink-0"
                  style={{ backgroundColor: getColorValue(color) }}
                />
                <span className="font-medium truncate">{color}</span>
                <button
                  type="button"
                  onClick={() => removeColor(color)}
                  className="text-gray-400 hover:text-red-400 focus:outline-none opacity-0 group-hover:opacity-100 transition-all ml-1 flex-shrink-0"
                >
                  <X className="w-2.5 h-2.5 xs:w-3 xs:h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Validation and help messages */}
      <div className="space-y-1">
        {error && (
          <p className="text-red-400 text-xs xs:text-sm flex items-center gap-1">
            <svg className="w-3 h-3 xs:w-4 xs:h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {error}
          </p>
        )}

        {colors.length === 0 && !error && (
          <p className="text-gray-400 text-xs xs:text-sm">
            Add at least one color option for this product
          </p>
        )}
      </div>
    </div>
  );
}
