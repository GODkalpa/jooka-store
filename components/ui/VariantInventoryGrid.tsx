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
    <div className="space-y-6">
      {/* Bulk Actions */}
      <div className="flex items-center gap-4 p-4 bg-black/20 rounded-lg border border-gold/10">
        <div className="flex items-center gap-2">
          <Package className="w-4 h-4 text-gold" />
          <span className="text-sm font-medium text-white">Bulk Set:</span>
        </div>
        <input
          type="number"
          min="0"
          value={bulkValue}
          onChange={(e) => setBulkValue(e.target.value)}
          placeholder="Enter quantity"
          className="px-3 py-2 bg-black/50 border border-gold/30 rounded-lg text-white text-sm placeholder-gray-400 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/20 w-32"
        />
        <button
          type="button"
          onClick={applyBulkInventory}
          disabled={!bulkValue || parseInt(bulkValue) < 0}
          className="px-4 py-2 bg-gold/20 text-gold rounded-lg text-sm font-medium hover:bg-gold/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Apply to All
        </button>
        <div className="ml-auto text-sm text-gray-400">
          Total: <span className="text-white font-medium">{getTotalInventory()}</span> units
        </div>
      </div>

      {/* Inventory Grid */}
      <div className="overflow-x-auto">
        <div className="min-w-full">
          {/* Header */}
          <div className="grid gap-2 mb-2" style={{ gridTemplateColumns: `120px repeat(${sizes.length}, 1fr) 80px` }}>
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
            <div key={color} className="grid gap-2 mb-2" style={{ gridTemplateColumns: `120px repeat(${sizes.length}, 1fr) 80px` }}>
              {/* Color Label */}
              <div className="flex items-center gap-2 p-2 bg-black/20 rounded-lg border border-gold/10">
                <div 
                  className="w-4 h-4 rounded-full border border-white/20"
                  style={{ backgroundColor: color.toLowerCase() }}
                />
                <span className="text-sm font-medium text-white capitalize">{color}</span>
              </div>

              {/* Size Inputs */}
              {sizes.map(size => (
                <div key={`${color}-${size}`} className="relative">
                  <input
                    type="number"
                    min="0"
                    value={getInventoryValue(color, size)}
                    onChange={(e) => updateInventory(color, size, parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-black/50 border border-gold/30 rounded-lg text-white text-sm text-center focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/20"
                    placeholder="0"
                  />
                  <div className="absolute inset-y-0 right-1 flex flex-col">
                    <button
                      type="button"
                      onClick={() => updateInventory(color, size, getInventoryValue(color, size) + 1)}
                      className="flex-1 flex items-center justify-center text-gray-400 hover:text-gold transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => updateInventory(color, size, getInventoryValue(color, size) - 1)}
                      className="flex-1 flex items-center justify-center text-gray-400 hover:text-gold transition-colors"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}

              {/* Color Total */}
              <div className="flex items-center justify-center p-2 bg-gold/10 rounded-lg border border-gold/20">
                <span className="text-sm font-medium text-gold">{getColorTotal(color)}</span>
              </div>
            </div>
          ))}

          {/* Size Totals Row */}
          <div className="grid gap-2 mt-4 pt-4 border-t border-gold/20" style={{ gridTemplateColumns: `120px repeat(${sizes.length}, 1fr) 80px` }}>
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

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-gradient-to-r from-charcoal/40 to-charcoal/20 rounded-lg border border-gold/20">
        <div className="text-center">
          <div className="text-2xl font-bold text-gold">{colors.length * sizes.length}</div>
          <div className="text-sm text-gray-400">Total Variants</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-gold">{getTotalInventory()}</div>
          <div className="text-sm text-gray-400">Total Units</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-gold">
            {colors.length * sizes.length > 0 ? Math.round(getTotalInventory() / (colors.length * sizes.length)) : 0}
          </div>
          <div className="text-sm text-gray-400">Avg per Variant</div>
        </div>
      </div>
    </div>
  );
}