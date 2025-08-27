'use client';

import { useState } from 'react';
import { Package, Plus, Minus } from 'lucide-react';

interface VariantInventoryGridProps {
  colors: string[];
  sizes: string[];
  inventoryData: {[key: string]: number};
  onChange: (inventoryData: {[key: string]: number}) => void;
}

export default function VariantInventoryGrid({ 
  colors, 
  sizes, 
  inventoryData, 
  onChange 
}: VariantInventoryGridProps) {
  const [bulkValue, setBulkValue] = useState('');

  const getVariantKey = (color: string, size: string) => `${color}-${size}`;
  
  const getInventoryValue = (color: string, size: string) => {
    const key = getVariantKey(color, size);
    return inventoryData[key] || 0;
  };

  const updateInventory = (color: string, size: string, value: number) => {
    const key = getVariantKey(color, size);
    const newValue = Math.max(0, value);
    onChange({
      ...inventoryData,
      [key]: newValue
    });
  };

  const applyBulkInventory = () => {
    const value = parseInt(bulkValue) || 0;
    if (value < 0) return;

    const newInventoryData: {[key: string]: number} = {};
    colors.forEach(color => {
      sizes.forEach(size => {
        const key = getVariantKey(color, size);
        newInventoryData[key] = value;
      });
    });
    
    onChange(newInventoryData);
    setBulkValue('');
  };

  const getTotalInventory = () => {
    return Object.values(inventoryData).reduce((sum, value) => sum + value, 0);
  };

  const getColorTotal = (color: string) => {
    return sizes.reduce((sum, size) => sum + getInventoryValue(color, size), 0);
  };

  const getSizeTotal = (size: string) => {
    return colors.reduce((sum, color) => sum + getInventoryValue(color, size), 0);
  };

  return (
    <div className="space-y-4 xs:space-y-5 sm:space-y-6">
      {/* Bulk Actions */}
      <div className="bg-gradient-to-r from-charcoal/40 to-charcoal/20 rounded-lg border border-gold/20 p-4 space-y-3">
        <div className="flex items-center gap-3">
          <Package className="w-5 h-5 text-gold" />
          <span className="text-sm font-medium text-white">Bulk Set Inventory</span>
        </div>
        
        <div className="grid grid-cols-1 gap-3">
          <div className="space-y-2">
            <label className="text-xs text-gray-400">Enter quantity for all variants:</label>
            <input
              type="number"
              min="0"
              value={bulkValue}
              onChange={(e) => setBulkValue(e.target.value)}
              placeholder="0"
              className="w-full px-4 py-3 bg-black/50 border border-gold/30 rounded-lg text-white text-center text-lg font-medium placeholder-gray-400 focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 transition-all"
            />
          </div>
          
          <button
            type="button"
            onClick={applyBulkInventory}
            disabled={!bulkValue || parseInt(bulkValue) < 0}
            className="w-full px-4 py-3 bg-gradient-to-r from-gold to-gold/90 text-black rounded-lg text-sm font-semibold hover:from-gold/90 hover:to-gold/80 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
          >
            Apply to All Variants
          </button>
          
          <div className="text-center pt-2 border-t border-gold/20">
            <div className="text-lg font-bold text-gold">{getTotalInventory()}</div>
            <div className="text-xs text-gray-400">total units across all variants</div>
          </div>
        </div>
      </div>

      {/* Mobile Card Layout */}
      <div className="block sm:hidden space-y-4">
        {colors.map(color => (
          <div key={color} className="bg-gradient-to-br from-charcoal/60 to-charcoal/40 rounded-xl border border-gold/20 overflow-hidden">
            {/* Color Header */}
            <div className="bg-black/30 px-4 py-3 border-b border-gold/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-6 h-6 rounded-full border-2 border-white/30 shadow-lg flex-shrink-0"
                    style={{ backgroundColor: color.toLowerCase() }}
                  />
                  <span className="text-base font-semibold text-white capitalize">{color}</span>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-gold">{getColorTotal(color)}</div>
                  <div className="text-xs text-gray-400">total units</div>
                </div>
              </div>
            </div>
            
            {/* Size Controls */}
            <div className="p-4 space-y-4">
              {sizes.map(size => (
                <div key={`${color}-${size}`} className="bg-black/20 rounded-lg border border-gold/10 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-sm font-medium text-gray-300">Size {size}</div>
                    <div className="text-sm text-gold font-medium">{getInventoryValue(color, size)} units</div>
                  </div>
                  <div className="space-y-3">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gold bg-black/50 rounded-lg py-2 border border-gold/30">
                        {getInventoryValue(color, size)}
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => updateInventory(color, size, getInventoryValue(color, size) - 1)}
                        className="h-12 bg-gradient-to-br from-red-600/30 to-red-700/20 border border-red-500/40 rounded-lg flex items-center justify-center text-red-300 hover:text-red-200 hover:border-red-400/60 transition-all shadow-sm active:scale-95 font-semibold"
                        disabled={getInventoryValue(color, size) === 0}
                      >
                        <Minus className="w-5 h-5" />
                      </button>
                      <input
                        type="number"
                        min="0"
                        value={getInventoryValue(color, size)}
                        onChange={(e) => updateInventory(color, size, parseInt(e.target.value) || 0)}
                        className="h-12 px-2 bg-black/60 border border-gold/40 rounded-lg text-white text-center text-lg font-bold focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/30 transition-all"
                        placeholder="0"
                      />
                      <button
                        type="button"
                        onClick={() => updateInventory(color, size, getInventoryValue(color, size) + 1)}
                        className="h-12 bg-gradient-to-br from-green-600/30 to-green-700/20 border border-green-500/40 rounded-lg flex items-center justify-center text-green-300 hover:text-green-200 hover:border-green-400/60 transition-all shadow-sm active:scale-95 font-semibold"
                      >
                        <Plus className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Grid Layout */}
      <div className="hidden sm:block">
        <div className="overflow-x-auto">
          <div className="min-w-full">
            {/* Header */}
            <div className="grid gap-2 mb-2" style={{ gridTemplateColumns: `140px repeat(${sizes.length}, minmax(80px, 1fr)) 80px` }}>
              <div className="text-sm font-medium text-gray-400 p-2">Color / Size</div>
              {sizes.map(size => (
                <div key={size} className="text-sm font-medium text-gray-400 p-2 text-center">
                  {size}
                </div>
              ))}
              <div className="text-sm font-medium text-gray-400 p-2 text-center">Total</div>
            </div>

            {/* Color Rows */}
            {colors.map(color => (
              <div key={color} className="grid gap-2 mb-2" style={{ gridTemplateColumns: `140px repeat(${sizes.length}, minmax(80px, 1fr)) 80px` }}>
                {/* Color Label */}
                <div className="flex items-center gap-2 p-2 bg-black/20 rounded-lg border border-gold/10">
                  <div 
                    className="w-4 h-4 rounded-full border border-white/20 flex-shrink-0"
                    style={{ backgroundColor: color.toLowerCase() }}
                  />
                  <span className="text-sm font-medium text-white capitalize truncate">{color}</span>
                </div>

                {/* Size Inputs */}
                {sizes.map(size => (
                  <div key={`${color}-${size}`} className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => updateInventory(color, size, getInventoryValue(color, size) - 1)}
                      className="w-6 h-6 bg-black/50 border border-gold/30 rounded flex items-center justify-center text-gray-400 hover:text-gold hover:border-gold/50 transition-colors flex-shrink-0"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <input
                      type="number"
                      min="0"
                      value={getInventoryValue(color, size)}
                      onChange={(e) => updateInventory(color, size, parseInt(e.target.value) || 0)}
                      className="flex-1 min-w-0 px-2 py-1.5 bg-black/50 border border-gold/30 rounded-lg text-white text-sm text-center focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/20"
                      placeholder="0"
                    />
                    <button
                      type="button"
                      onClick={() => updateInventory(color, size, getInventoryValue(color, size) + 1)}
                      className="w-6 h-6 bg-black/50 border border-gold/30 rounded flex items-center justify-center text-gray-400 hover:text-gold hover:border-gold/50 transition-colors flex-shrink-0"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                ))}

                {/* Color Total */}
                <div className="flex items-center justify-center p-2 bg-gold/10 rounded-lg border border-gold/20">
                  <span className="text-sm font-medium text-gold">{getColorTotal(color)}</span>
                </div>
              </div>
            ))}

            {/* Size Totals Row */}
            <div className="grid gap-2 mt-4 pt-4 border-t border-gold/20" style={{ gridTemplateColumns: `140px repeat(${sizes.length}, minmax(80px, 1fr)) 80px` }}>
              <div className="text-sm font-medium text-gray-400 p-2">Total</div>
              {sizes.map(size => (
                <div key={size} className="flex items-center justify-center p-2 bg-gold/10 rounded-lg border border-gold/20">
                  <span className="text-sm font-medium text-gold">{getSizeTotal(size)}</span>
                </div>
              ))}
              <div className="flex items-center justify-center p-2 bg-gradient-to-r from-gold/20 to-gold/10 rounded-lg border border-gold/30">
                <span className="text-sm font-bold text-gold">{getTotalInventory()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 xs:grid-cols-3 gap-3 xs:gap-4 p-3 xs:p-4 bg-gradient-to-r from-charcoal/40 to-charcoal/20 rounded-md xs:rounded-lg border border-gold/20">
        <div className="text-center">
          <div className="text-lg xs:text-xl sm:text-2xl font-bold text-gold">{colors.length * sizes.length}</div>
          <div className="text-xs xs:text-sm text-gray-400">Total Variants</div>
        </div>
        <div className="text-center">
          <div className="text-lg xs:text-xl sm:text-2xl font-bold text-gold">{getTotalInventory()}</div>
          <div className="text-xs xs:text-sm text-gray-400">Total Units</div>
        </div>
        <div className="text-center">
          <div className="text-lg xs:text-xl sm:text-2xl font-bold text-gold">
            {colors.length * sizes.length > 0 ? Math.round(getTotalInventory() / (colors.length * sizes.length)) : 0}
          </div>
          <div className="text-xs xs:text-sm text-gray-400">Avg per Variant</div>
        </div>
      </div>
    </div>
  );
}