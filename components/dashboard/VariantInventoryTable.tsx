import { useState, useEffect } from 'react';
import { Package, AlertTriangle, Edit, Eye, Plus, Minus } from 'lucide-react';
import Image from 'next/image';
import { ProductVariantWithStock } from '@/types/firebase';

interface VariantInventoryTableProps {
  productId: string;
  productName: string;
  productImages: any[];
  onVariantUpdate: () => void;
}

export default function VariantInventoryTable({ 
  productId, 
  productName, 
  productImages,
  onVariantUpdate 
}: VariantInventoryTableProps) {
  const [variants, setVariants] = useState<ProductVariantWithStock[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingVariant, setEditingVariant] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<{ [key: string]: number }>({});

  useEffect(() => {
    fetchVariants();
  }, [productId]);

  const fetchVariants = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/products/${productId}/variants?includeStock=true`);
      if (!response.ok) {
        throw new Error('Failed to fetch variants');
      }

      const result = await response.json();
      console.log('Fetched variants with stock data:', result.data);
      setVariants(result.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const getVariantImage = (color: string) => {
    // Find image for this color or use primary image
    const colorImage = productImages.find(img => img.color === color);
    const primaryImage = productImages.find(img => img.is_primary);
    return colorImage || primaryImage || productImages[0];
  };

  const getStockStatusColor = (variant: ProductVariantWithStock) => {
    if (variant.is_out_of_stock) {
      return 'text-red-400 bg-red-900/20 border-red-500/20';
    } else if (variant.is_low_stock) {
      return 'text-yellow-400 bg-yellow-900/20 border-yellow-500/20';
    } else {
      return 'text-green-400 bg-green-900/20 border-green-500/20';
    }
  };

  const getStockStatusLabel = (variant: ProductVariantWithStock) => {
    console.log('Stock status for variant:', {
      color: variant.color,
      size: variant.size,
      inventory_count: variant.inventory_count,
      low_stock_threshold: variant.low_stock_threshold,
      is_out_of_stock: variant.is_out_of_stock,
      is_low_stock: variant.is_low_stock
    });
    
    if (variant.is_out_of_stock) return 'Out of Stock';
    if (variant.is_low_stock) return 'Low Stock';
    return 'In Stock';
  };

  const handleEditStart = (variantId: string, currentStock: number) => {
    setEditingVariant(variantId);
    setEditValues({ [variantId]: currentStock });
  };

  const handleEditCancel = () => {
    setEditingVariant(null);
    setEditValues({});
  };

  const handleEditSave = async (variant: ProductVariantWithStock) => {
    try {
      const newStock = editValues[variant.id];
      const quantityChange = newStock - variant.inventory_count;

      if (quantityChange === 0) {
        handleEditCancel();
        return;
      }

      const response = await fetch('/api/variants', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          product_id: variant.product_id,
          color: variant.color,
          size: variant.size,
          quantity_change: quantityChange,
          transaction_type: 'adjustment',
          notes: `Manual inventory adjustment via admin panel`
        }),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || 'Failed to update variant inventory');
      }

      handleEditCancel();
      fetchVariants();
      onVariantUpdate();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update inventory');
    }
  };

  const handleQuickAdjust = async (variant: ProductVariantWithStock, change: number) => {
    try {
      const response = await fetch('/api/variants', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          product_id: variant.product_id,
          color: variant.color,
          size: variant.size,
          quantity_change: change,
          transaction_type: change > 0 ? 'restock' : 'adjustment',
          notes: `Quick ${change > 0 ? 'restock' : 'adjustment'} via admin panel`
        }),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || 'Failed to update variant inventory');
      }

      fetchVariants();
      onVariantUpdate();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update inventory');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900/20 border border-red-500 rounded-lg p-4">
        <p className="text-red-400">Error: {error}</p>
      </div>
    );
  }

  if (variants.length === 0) {
    return (
      <div className="bg-charcoal rounded-lg border border-gold/20 p-8 text-center">
        <Package className="w-12 h-12 mx-auto mb-4 text-gray-600" />
        <p className="text-gray-400">No variants found for this product</p>
        <p className="text-sm text-gray-500 mt-2">
          Variants are automatically created when a product has colors and sizes defined.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold text-gold">Variant Inventory</h3>
          <p className="text-gray-400 text-sm">Manage stock levels for each color and size combination</p>
        </div>
        <div className="text-sm text-gray-400">
          {variants.length} variant{variants.length !== 1 ? 's' : ''} total
        </div>
      </div>

      <div className="bg-charcoal rounded-lg border border-gold/20 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gold/20 bg-gold/5">
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Variant
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  SKU
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Stock
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Threshold
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gold/20">
              {variants.map((variant) => {
                const variantImage = getVariantImage(variant.color);
                const isEditing = editingVariant === variant.id;

                return (
                  <tr key={variant.id} className="hover:bg-gold/5">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-12 h-12 relative mr-4">
                          {variantImage?.secure_url ? (
                            <Image
                              src={variantImage.secure_url}
                              alt={`${productName} - ${variant.color}`}
                              fill
                              className="rounded-lg object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gray-700 rounded-lg flex items-center justify-center">
                              <Package className="w-6 h-6 text-gray-500" />
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-white">
                            {variant.color} / {variant.size}
                          </div>
                          <div className="text-xs text-gray-400">{productName}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-300 font-mono">
                        {variant.sku || `${productId}-${variant.color.toUpperCase()}-${variant.size.toUpperCase()}`}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {isEditing ? (
                        <div className="flex items-center space-x-2">
                          <input
                            type="number"
                            min="0"
                            value={editValues[variant.id] || 0}
                            onChange={(e) => setEditValues({
                              ...editValues,
                              [variant.id]: parseInt(e.target.value) || 0
                            })}
                            className="w-20 px-2 py-1 bg-black border border-gold/30 rounded text-white text-sm"
                          />
                          <button
                            onClick={() => handleEditSave(variant)}
                            className="text-green-400 hover:text-green-300 p-1"
                            title="Save"
                          >
                            ✓
                          </button>
                          <button
                            onClick={handleEditCancel}
                            className="text-red-400 hover:text-red-300 p-1"
                            title="Cancel"
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <span className={`text-lg font-bold ${
                            variant.is_out_of_stock ? 'text-red-400' :
                            variant.is_low_stock ? 'text-yellow-400' : 'text-green-400'
                          }`}>
                            {variant.inventory_count}
                          </span>
                          <div className="flex space-x-1">
                            <button
                              onClick={() => handleQuickAdjust(variant, -1)}
                              disabled={variant.inventory_count <= 0}
                              className="w-6 h-6 bg-red-600/20 text-red-400 rounded hover:bg-red-600/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                              title="Remove 1"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => handleQuickAdjust(variant, 1)}
                              className="w-6 h-6 bg-green-600/20 text-green-400 rounded hover:bg-green-600/30 flex items-center justify-center"
                              title="Add 1"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-300">
                        {variant.low_stock_threshold}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStockStatusColor(variant)}`}>
                        {variant.is_out_of_stock && <Package className="w-3 h-3 mr-1" />}
                        {variant.is_low_stock && <AlertTriangle className="w-3 h-3 mr-1" />}
                        {getStockStatusLabel(variant)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEditStart(variant.id, variant.inventory_count)}
                          className="text-gold hover:text-gold/80 p-1"
                          title="Edit Stock"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleQuickAdjust(variant, 10)}
                          className="text-green-400 hover:text-green-300 p-1 text-xs"
                          title="Quick Restock +10"
                        >
                          +10
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-charcoal/50 rounded-lg p-4 border border-gold/20">
          <div className="text-sm text-gray-400">Total Variants</div>
          <div className="text-2xl font-bold text-white">{variants.length}</div>
        </div>
        <div className="bg-charcoal/50 rounded-lg p-4 border border-gold/20">
          <div className="text-sm text-gray-400">Total Stock</div>
          <div className="text-2xl font-bold text-green-400">
            {variants.reduce((sum, v) => sum + v.inventory_count, 0)}
          </div>
        </div>
        <div className="bg-charcoal/50 rounded-lg p-4 border border-gold/20">
          <div className="text-sm text-gray-400">Low Stock</div>
          <div className="text-2xl font-bold text-yellow-400">
            {variants.filter(v => v.is_low_stock).length}
          </div>
        </div>
        <div className="bg-charcoal/50 rounded-lg p-4 border border-gold/20">
          <div className="text-sm text-gray-400">Out of Stock</div>
          <div className="text-2xl font-bold text-red-400">
            {variants.filter(v => v.is_out_of_stock).length}
          </div>
        </div>
      </div>
    </div>
  );
}