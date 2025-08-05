import { Package, AlertTriangle, Edit, Eye } from 'lucide-react';
import Image from 'next/image';
import TableRowActions from '@/components/ui/TableRowActions';
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

interface InventoryTableProps {
  inventory: InventoryItem[];
  onUpdateInventory: (product: InventoryItem) => void;
  onViewVariants?: (product: InventoryItem) => void;
  onInventoryUpdate: () => void;
}

export default function InventoryTable({ 
  inventory, 
  onUpdateInventory,
  onViewVariants,
  onInventoryUpdate 
}: InventoryTableProps) {
  const getStockStatus = (item: InventoryItem) => {
    // For variant-tracked products, we need to check if ALL variants are out of stock
    // The inventory_count for variant products represents the total across all variants
    // But we should still use the same logic since the total is calculated from variants
    if (item.inventory_count <= 0) {
      return { status: 'out_of_stock', color: 'text-red-400', bg: 'bg-red-900/20', border: 'border-red-500/20' };
    } else if (item.inventory_count <= item.low_stock_threshold) {
      return { status: 'low_stock', color: 'text-yellow-400', bg: 'bg-yellow-900/20', border: 'border-yellow-500/20' };
    } else {
      return { status: 'in_stock', color: 'text-green-400', bg: 'bg-green-900/20', border: 'border-green-500/20' };
    }
  };

  const getStockLabel = (item: InventoryItem) => {
    const stockStatus = getStockStatus(item);
    const labels = {
      out_of_stock: 'Out of Stock',
      low_stock: 'Low Stock',
      in_stock: 'In Stock',
    };
    return labels[stockStatus.status as keyof typeof labels];
  };

  return (
    <div className="bg-charcoal rounded-lg border border-gold/20 overflow-hidden">
      {/* Mobile Card View */}
      <div className="block lg:hidden">
        {inventory.length === 0 ? (
          <div className="px-6 py-8 text-center text-gray-400">
            <Package className="w-12 h-12 mx-auto mb-4 text-gray-600" />
            <p>No inventory items found</p>
          </div>
        ) : (
          <div className="divide-y divide-gold/20">
            {inventory.map((item) => {
              const stockStatus = getStockStatus(item);
              
              return (
                <div key={item.id} className="p-4 hover:bg-gold/5">
                  <div className="flex items-start space-x-3">
                    <div className="w-16 h-16 relative flex-shrink-0">
                      {item.images?.[0]?.secure_url ? (
                        <Image
                          src={item.images[0].secure_url}
                          alt={item.name}
                          fill
                          className="rounded-lg object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-700 rounded-lg flex items-center justify-center">
                          <Package className="w-6 h-6 text-gray-500" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-medium text-white truncate">
                          {item.name}
                        </h3>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${stockStatus.bg} ${stockStatus.color} ${stockStatus.border}`}>
                          {item.inventory_count <= 0 && <Package className="w-3 h-3 mr-1" />}
                          {item.inventory_count > 0 && item.inventory_count <= item.low_stock_threshold && <AlertTriangle className="w-3 h-3 mr-1" />}
                          {getStockLabel(item)}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                        <div>
                          <span className="text-gray-400">Stock:</span>
                          <div className={`text-lg font-bold ${stockStatus.color}`}>
                            {item.inventory_count}
                          </div>
                          <div className="text-xs text-gray-400">
                            Threshold: {item.low_stock_threshold}
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-400">Value:</span>
                          <div className="text-sm font-medium text-white">
                            {formatPriceWithSymbol(item.inventory_count * item.price)}
                          </div>
                          <div className="text-xs text-gray-400">
                            @ {formatPriceWithSymbol(item.price)} each
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="text-xs text-gray-400">
                          {item.category_name || 'Uncategorized'}
                        </div>
                        <TableRowActions
                          onEdit={() => onUpdateInventory(item)}
                          customActions={[
                            {
                              label: 'View Product',
                              icon: Eye,
                              onClick: () => window.open(`/product/${item.slug}`, '_blank'),
                              variant: 'ghost'
                            },
                            ...(item.track_variants && onViewVariants ? [{
                              label: 'Manage Variants',
                              icon: Package,
                              onClick: () => onViewVariants(item),
                              variant: 'primary' as const
                            }] : []),
                            {
                              label: item.track_variants ? 'Quick Adjust Total' : 'Quick Restock',
                              icon: Package,
                              onClick: () => onUpdateInventory(item),
                              variant: 'secondary' as const
                            }
                          ]}
                          size="sm"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Desktop Table View */}
      <div className="hidden lg:block overflow-x-auto overflow-y-visible">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gold/20 bg-gold/5">
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Product
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Current Stock
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Threshold
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Value
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Category
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gold/20">
            {inventory.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-gray-400">
                  <Package className="w-12 h-12 mx-auto mb-4 text-gray-600" />
                  <p>No inventory items found</p>
                </td>
              </tr>
            ) : (
              inventory.map((item) => {
                const stockStatus = getStockStatus(item);
                
                return (
                  <tr key={item.id} className="hover:bg-gold/5">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-12 h-12 relative mr-4 flex-shrink-0">
                          {item.images?.[0]?.secure_url ? (
                            <Image
                              src={item.images[0].secure_url}
                              alt={item.name}
                              fill
                              className="rounded-lg object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gray-700 rounded-lg flex items-center justify-center">
                              <Package className="w-6 h-6 text-gray-500" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm font-medium text-white truncate">
                            {item.name}
                          </div>
                          <div className="text-sm text-gray-400 truncate">{item.slug}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className={`text-lg font-bold ${stockStatus.color}`}>
                        {item.inventory_count}
                      </div>
                      <div className="text-xs text-gray-400">
                        {item.track_variants ? 'total across variants' : 'units'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-300">
                        {item.low_stock_threshold}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${stockStatus.bg} ${stockStatus.color} ${stockStatus.border}`}>
                        {item.inventory_count <= 0 && <Package className="w-3 h-3 mr-1" />}
                        {item.inventory_count > 0 && item.inventory_count <= item.low_stock_threshold && <AlertTriangle className="w-3 h-3 mr-1" />}
                        {getStockLabel(item)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-white">
                        {formatPriceWithSymbol(item.inventory_count * item.price)}
                      </div>
                      <div className="text-xs text-gray-400">
                        @ {formatPriceWithSymbol(item.price)} each
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-300">
                      {item.category_name || 'Uncategorized'}
                    </td>
                    <td className="px-6 py-4">
                      <TableRowActions
                        onEdit={() => onUpdateInventory(item)}
                        customActions={[
                          {
                            label: 'View Product',
                            icon: Eye,
                            onClick: () => window.open(`/product/${item.slug}`, '_blank'),
                            variant: 'ghost'
                          },
                          ...(item.track_variants && onViewVariants ? [{
                            label: 'Manage Variants',
                            icon: Package,
                            onClick: () => onViewVariants(item),
                            variant: 'primary' as const
                          }] : []),
                          {
                            label: item.track_variants ? 'Quick Adjust Total' : 'Quick Restock',
                            icon: Package,
                            onClick: () => onUpdateInventory(item),
                            variant: 'secondary' as const
                          }
                        ]}
                        size="sm"
                      />
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}