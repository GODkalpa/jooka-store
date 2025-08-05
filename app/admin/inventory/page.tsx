'use client';

import { useEffect, useState } from 'react';
import { Search, AlertTriangle, Package, RotateCcw, Wifi, WifiOff, List } from 'lucide-react';
import InventoryTable from '@/components/dashboard/InventoryTable';
import InventoryUpdateModal from '@/components/dashboard/InventoryUpdateModal';
import VariantInventoryTable from '@/components/dashboard/VariantInventoryTable';
import { useInventoryUpdates } from '@/lib/realtime/hooks';
import { formatPriceWithSymbol } from '@/lib/utils/currency';

interface InventoryItem {
  id: string;
  name: string;
  slug: string;
  inventory_count: number;
  low_stock_threshold: number;
  track_variants?: boolean;
  status: string;
  price: number;
  category_name?: string;
  images: any[];
  last_updated: string;
}

export default function AdminInventory() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<InventoryItem | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'variants'>('list');
  const [selectedProductForVariants, setSelectedProductForVariants] = useState<InventoryItem | null>(null);
  const [stats, setStats] = useState({
    totalProducts: 0,
    lowStock: 0,
    outOfStock: 0,
    totalValue: 0,
  });

  // Realtime inventory updates
  const inventoryUpdates = useInventoryUpdates();

  useEffect(() => {
    fetchInventory();
  }, []);

  // Refetch inventory when realtime updates occur
  useEffect(() => {
    if (inventoryUpdates.updates.length > 0) {
      fetchInventory();
    }
  }, [inventoryUpdates.updates]);

  const fetchInventory = async () => {
    try {
      // Fetch all products for inventory management
      const response = await fetch('/api/products?limit=1000');
      if (!response.ok) {
        throw new Error('Failed to fetch inventory');
      }
      const result = await response.json();
      const products = result.data || [];
      setInventory(products);

      // Calculate stats - need to handle variant-based products differently
      const inventoryStats = { totalProducts: 0, lowStock: 0, outOfStock: 0, totalValue: 0 };

      // Process each product and fetch variant data if needed
      for (const product of products) {
        inventoryStats.totalProducts++;

        if (product.track_variants) {
          // For variant-based products, fetch variant data to get accurate stock counts
          try {
            const variantResponse = await fetch(`/api/products/${product.id}/variants?includeStock=true`);
            if (variantResponse.ok) {
              const variantResult = await variantResponse.json();
              const variants = variantResult.data || [];
              
              // Calculate total inventory from variants
              const totalVariantInventory = variants.reduce((sum: number, variant: any) => 
                sum + (variant.inventory_count || 0), 0);
              
              inventoryStats.totalValue += totalVariantInventory * product.price;

              // Check stock status based on variants
              const outOfStockVariants = variants.filter((v: any) => v.is_out_of_stock).length;
              const lowStockVariants = variants.filter((v: any) => v.is_low_stock).length;
              
              // If all variants are out of stock, count as out of stock
              if (variants.length > 0 && outOfStockVariants === variants.length) {
                inventoryStats.outOfStock++;
              } 
              // If any variants are low stock (but not all out of stock), count as low stock
              else if (lowStockVariants > 0) {
                inventoryStats.lowStock++;
              }
            } else {
              // Fallback to product inventory if variant fetch fails
              inventoryStats.totalValue += product.inventory_count * product.price;
              if (product.inventory_count <= 0) {
                inventoryStats.outOfStock++;
              } else if (product.inventory_count <= product.low_stock_threshold) {
                inventoryStats.lowStock++;
              }
            }
          } catch (variantError) {
            // Fallback to product inventory if variant fetch fails
            inventoryStats.totalValue += product.inventory_count * product.price;
            if (product.inventory_count <= 0) {
              inventoryStats.outOfStock++;
            } else if (product.inventory_count <= product.low_stock_threshold) {
              inventoryStats.lowStock++;
            }
          }
        } else {
          // For non-variant products, use the product's inventory_count
          inventoryStats.totalValue += product.inventory_count * product.price;

          if (product.inventory_count <= 0) {
            inventoryStats.outOfStock++;
          } else if (product.inventory_count <= product.low_stock_threshold) {
            inventoryStats.lowStock++;
          }
        }
      }

      setStats(inventoryStats);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateInventory = (product: InventoryItem) => {
    setSelectedProduct(product);
    setShowUpdateModal(true);
  };

  const handleViewVariants = (product: InventoryItem) => {
    setSelectedProductForVariants(product);
    setViewMode('variants');
  };

  const handleBackToList = () => {
    setSelectedProductForVariants(null);
    setViewMode('list');
  };

  const filteredInventory = inventory.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gold">
                {viewMode === 'variants' && selectedProductForVariants
                  ? `${selectedProductForVariants.name} - Variant Inventory`
                  : 'Inventory Management'
                }
              </h1>
              <p className="text-gray-400 mt-1">
                {viewMode === 'variants'
                  ? 'Manage stock levels for each color and size combination'
                  : 'Monitor and manage product stock levels'
                }
              </p>
            </div>
            {viewMode === 'variants' && (
              <button
                onClick={handleBackToList}
                className="flex items-center gap-2 px-4 py-2 bg-charcoal border border-gold/30 text-gold rounded-lg hover:bg-gold/10 transition-colors"
              >
                <List className="w-4 h-4" />
                Back to List
              </button>
            )}
          </div>
        </div>

        {/* Realtime Status and Controls */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            {inventoryUpdates.isConnected ? (
              <>
                <Wifi className="w-4 h-4 text-green-400" />
                <span className="text-sm text-green-400">Live Updates</span>
              </>
            ) : (
              <>
                <WifiOff className="w-4 h-4 text-red-400" />
                <span className="text-sm text-red-400">Offline</span>
              </>
            )}
          </div>

          {inventoryUpdates.updates.length > 0 && (
            <div className="bg-blue-900/20 border border-blue-500/20 rounded-lg px-3 py-1">
              <span className="text-xs text-blue-400">
                {inventoryUpdates.updates.length} recent update{inventoryUpdates.updates.length > 1 ? 's' : ''}
              </span>
            </div>
          )}

          <button
            onClick={fetchInventory}
            className="flex items-center space-x-2 px-3 py-1 bg-gold/10 text-gold rounded-md hover:bg-gold/20 transition-colors text-sm"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-charcoal rounded-lg p-6 border border-gold/20">
          <div className="flex items-center">
            <Package className="w-8 h-8 text-blue-400 mr-3" />
            <div>
              <p className="text-sm text-gray-400">Total Products</p>
              <p className="text-2xl font-bold text-white">{stats.totalProducts}</p>
            </div>
          </div>
        </div>

        <div className="bg-charcoal rounded-lg p-6 border border-gold/20">
          <div className="flex items-center">
            <AlertTriangle className="w-8 h-8 text-yellow-400 mr-3" />
            <div>
              <p className="text-sm text-gray-400">Low Stock</p>
              <p className="text-2xl font-bold text-white">{stats.lowStock}</p>
            </div>
          </div>
        </div>

        <div className="bg-charcoal rounded-lg p-6 border border-gold/20">
          <div className="flex items-center">
            <Package className="w-8 h-8 text-red-400 mr-3" />
            <div>
              <p className="text-sm text-gray-400">Out of Stock</p>
              <p className="text-2xl font-bold text-white">{stats.outOfStock}</p>
            </div>
          </div>
        </div>

        <div className="bg-charcoal rounded-lg p-6 border border-gold/20">
          <div className="flex items-center">
            <Package className="w-8 h-8 text-green-400 mr-3" />
            <div>
              <p className="text-sm text-gray-400">Total Value</p>
              <p className="text-2xl font-bold text-white">{formatPriceWithSymbol(stats.totalValue)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-charcoal rounded-lg p-6 border border-gold/20">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search products by name or slug..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-black border border-gold/20 rounded-md text-white placeholder-gray-400 focus:outline-none focus:border-gold"
          />
        </div>
      </div>

      {/* Inventory Content */}
      {viewMode === 'variants' && selectedProductForVariants ? (
        <VariantInventoryTable
          productId={selectedProductForVariants.id}
          productName={selectedProductForVariants.name}
          productImages={selectedProductForVariants.images}
          onVariantUpdate={fetchInventory}
        />
      ) : (
        <InventoryTable
          inventory={filteredInventory}
          onUpdateInventory={handleUpdateInventory}
          onViewVariants={handleViewVariants}
          onInventoryUpdate={fetchInventory}
        />
      )}

      {/* Update Inventory Modal */}
      {showUpdateModal && selectedProduct && (
        <InventoryUpdateModal
          product={selectedProduct}
          onClose={() => {
            setShowUpdateModal(false);
            setSelectedProduct(null);
          }}
          onSuccess={() => {
            setShowUpdateModal(false);
            setSelectedProduct(null);
            fetchInventory();
          }}
        />
      )}
    </div>
  );
}