'use client';

import { useState } from 'react';
import { X, Plus, Minus, RotateCcw, Save } from 'lucide-react';

interface InventoryItem {
  id: string;
  name: string;
  inventory_count: number;
  low_stock_threshold: number;
}

interface InventoryUpdateModalProps {
  product: InventoryItem;
  onClose: () => void;
  onSuccess: () => void;
}

export default function InventoryUpdateModal({ 
  product, 
  onClose, 
  onSuccess 
}: InventoryUpdateModalProps) {
  const [quantityChange, setQuantityChange] = useState('');
  const [transactionType, setTransactionType] = useState<'restock' | 'adjustment' | 'return'>('restock');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const change = parseInt(quantityChange);
    if (isNaN(change) || change === 0) {
      setError('Please enter a valid quantity change');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/admin/inventory', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: product.id,
          quantityChange: change,
          transactionType,
          notes,
        }),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || 'Failed to update inventory');
      }

      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const getNewQuantity = () => {
    const change = parseInt(quantityChange) || 0;
    return Math.max(0, product.inventory_count + change);
  };

  const getTransactionIcon = () => {
    switch (transactionType) {
      case 'restock':
        return <Plus className="w-4 h-4" />;
      case 'adjustment':
        return <RotateCcw className="w-4 h-4" />;
      case 'return':
        return <Plus className="w-4 h-4" />;
      default:
        return <RotateCcw className="w-4 h-4" />;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-charcoal rounded-lg border border-gold/20 w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gold/20">
          <h2 className="text-xl font-semibold text-gold">Update Inventory</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gold transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Product Info */}
        <div className="p-6 border-b border-gold/20">
          <h3 className="text-lg font-medium text-white mb-2">{product.name}</h3>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">Current Stock:</span>
            <span className="text-white font-medium">{product.inventory_count} units</span>
          </div>
          <div className="flex items-center justify-between text-sm mt-1">
            <span className="text-gray-400">Low Stock Threshold:</span>
            <span className="text-white">{product.low_stock_threshold} units</span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-900/20 border border-red-500 rounded-lg p-4">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Transaction Type */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Transaction Type
            </label>
            <select
              value={transactionType}
              onChange={(e) => setTransactionType(e.target.value as any)}
              className="w-full px-4 py-2 bg-black border border-gold/20 rounded-md text-white focus:outline-none focus:border-gold"
            >
              <option value="restock">Restock (Add inventory)</option>
              <option value="adjustment">Adjustment (Add/Remove)</option>
              <option value="return">Return (Add returned items)</option>
            </select>
          </div>

          {/* Quantity Change */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Quantity Change
            </label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                {getTransactionIcon()}
              </div>
              <input
                type="number"
                required
                value={quantityChange}
                onChange={(e) => setQuantityChange(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-black border border-gold/20 rounded-md text-white placeholder-gray-400 focus:outline-none focus:border-gold"
                placeholder="Enter quantity change (+ or -)"
              />
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Use positive numbers to add, negative to remove
            </p>
          </div>

          {/* New Quantity Preview */}
          {quantityChange && (
            <div className="bg-gold/10 border border-gold/20 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-300">New Quantity:</span>
                <span className="text-lg font-bold text-gold">
                  {getNewQuantity()} units
                </span>
              </div>
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Notes (Optional)
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-4 py-2 bg-black border border-gold/20 rounded-md text-white placeholder-gray-400 focus:outline-none focus:border-gold resize-none"
              placeholder="Add notes about this inventory change..."
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gold/20">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 text-gray-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary flex items-center"
            >
              <Save className="w-4 h-4 mr-2" />
              {loading ? 'Updating...' : 'Update Inventory'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}