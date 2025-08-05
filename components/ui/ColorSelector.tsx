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
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Palette className="w-5 h-5 text-gold" />
        <label className="text-lg font-medium text-white">
          Colors *
        </label>
      </div>

      {/* Color presets */}
      <div>
        <p className="text-sm text-gray-400 mb-4">Quick add common colors:</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {COLOR_PRESETS.map((preset) => (
            <button
              key={preset.name}
              type="button"
              onClick={() => addPresetColor(preset.name)}
              disabled={colors.includes(preset.name)}
              className="flex items-center gap-3 p-3 bg-black/30 border border-gold/20 rounded-lg text-sm text-gray-300 hover:bg-gold/10 hover:text-gold hover:border-gold/40 focus:outline-none focus:ring-2 focus:ring-gold/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <div
                className="w-4 h-4 rounded-full border-2 border-gray-500 shadow-sm"
                style={{ backgroundColor: preset.value }}
              />
              <span className="truncate font-medium">{preset.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Add custom color input */}
      <div className="flex gap-3">
        <input
          type="text"
          value={newColor}
          onChange={(e) => setNewColor(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Enter custom color name"
          className="flex-1 px-4 py-3 bg-black/30 border border-gold/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 transition-all"
        />
        <button
          type="button"
          onClick={addColor}
          disabled={!newColor.trim() || colors.includes(newColor.trim())}
          className="px-6 py-3 bg-gold text-black rounded-lg hover:bg-gold/90 focus:outline-none focus:ring-2 focus:ring-gold/50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium transition-all shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Add
        </button>
      </div>

      {/* Display selected colors */}
      {colors.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-gray-400">Selected colors:</p>
          <div className="flex flex-wrap gap-2">
            {colors.map((color, index) => (
              <div
                key={index}
                className="flex items-center gap-2 px-3 py-2 bg-charcoal/50 border border-gold/20 rounded-lg text-sm text-white group hover:border-gold/40 transition-all"
              >
                <div
                  className="w-3 h-3 rounded-full border border-gray-500"
                  style={{ backgroundColor: getColorValue(color) }}
                />
                <span className="font-medium">{color}</span>
                <button
                  type="button"
                  onClick={() => removeColor(color)}
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

        {colors.length === 0 && !error && (
          <p className="text-gray-400 text-sm">
            Add at least one color option for this product
          </p>
        )}
      </div>
    </div>
  );
}
