import { useState, useEffect } from 'react';
import { Star, Package } from 'lucide-react';
import SafeImage from '@/components/ui/SafeImage';
import TableRowActions from '@/components/ui/TableRowActions';
import { api } from '@/lib/api/client';
import { formatPriceWithSymbol } from '@/lib/utils/currency';
import { formatSafeDate } from '@/lib/utils/date';

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  compare_price?: number;
  inventory_count: number;
  track_variants?: boolean;
  status: 'active' | 'inactive' | 'out_of_stock';
  featured: boolean;
  category_name?: string;
  images: any[];
  created_at: string;
}

interface ProductsTableProps {
  products: Product[];
  onProductUpdate: () => void;
}

const statusColors = {
  active: 'bg-green-900/20 text-green-400 border-green-500/20',
  inactive: 'bg-gray-900/20 text-gray-400 border-gray-500/20',
  out_of_stock: 'bg-red-900/20 text-red-400 border-red-500/20',
};

export default function ProductsTable({ products, onProductUpdate }: ProductsTableProps) {
  const [variantInventories, setVariantInventories] = useState<{ [key: string]: number }>({});

  // Fetch variant inventories for products that track variants - optimized with batch requests
  useEffect(() => {
    const fetchVariantInventories = async () => {
      const variantProducts = products.filter(p => p.track_variants);
      if (variantProducts.length === 0) return;

      const inventories: { [key: string]: number } = {};

      // Batch requests to avoid overwhelming the server
      const batchSize = 5;
      for (let i = 0; i < variantProducts.length; i += batchSize) {
        const batch = variantProducts.slice(i, i + batchSize);

        await Promise.allSettled(
          batch.map(async (product) => {
            try {
              const response = await fetch(`/api/products/${product.id}/variants`, {
                signal: AbortSignal.timeout(5000) // 5 second timeout
              });
              if (response.ok) {
                const result = await response.json();
                const totalInventory = result.data?.reduce((sum: number, variant: any) =>
                  sum + (variant.inventory_count || 0), 0) || 0;
                inventories[product.id] = totalInventory;
              }
            } catch (error) {
              // Silently fail for individual products to not block the UI
              console.warn(`Failed to fetch variants for product ${product.id}`);
            }
          })
        );

        // Small delay between batches to prevent overwhelming the server
        if (i + batchSize < variantProducts.length) {
          await new Promise(resolve => setTimeout(resolve, 50));
        }
      }

      setVariantInventories(inventories);
    };

    if (products.length > 0) {
      // Debounce to prevent excessive calls when products change rapidly
      const timeoutId = setTimeout(fetchVariantInventories, 200);
      return () => clearTimeout(timeoutId);
    }
  }, [products]);

  const getDisplayInventory = (product: Product) => {
    if (product.track_variants && variantInventories[product.id] !== undefined) {
      return variantInventories[product.id];
    }
    return product.inventory_count;
  };

  const handleStatusChange = async (productId: string, newStatus: string) => {
    try {
      await api.put(`/api/products/${productId}`, { status: newStatus });
      onProductUpdate();
      alert('Product status updated successfully!');
    } catch (error) {
      console.error('Failed to update product status:', error);
      const errorMessage = error instanceof Error ? error.message : 'Please try again.';
      alert(`Failed to update product status: ${errorMessage}`);
    }
  };

  const handleFeaturedToggle = async (productId: string, featured: boolean) => {
    try {
      await api.put(`/api/products/${productId}`, { featured: !featured });
      onProductUpdate();
      alert(`Product ${!featured ? 'featured' : 'unfeatured'} successfully!`);
    } catch (error) {
      console.error('Failed to update product featured status:', error);
      const errorMessage = error instanceof Error ? error.message : 'Please try again.';
      alert(`Failed to update product featured status: ${errorMessage}`);
    }
  };

  const handleDelete = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      console.log(`Attempting to delete product: ${productId}`);
      const response = await api.delete(`/api/products/${productId}`);
      console.log('Delete response:', response);
      onProductUpdate();
      alert('Product deleted successfully!');
    } catch (error) {
      console.error('Failed to delete product:', error);
      const errorMessage = error instanceof Error ? error.message : 'Please try again.';
      console.error('Error details:', {
        message: errorMessage,
        status: (error as any)?.status,
        code: (error as any)?.code
      });
      alert(`Failed to delete product: ${errorMessage}`);
    }
  };

  return (
    <div className="bg-charcoal rounded-lg border border-gold/20 overflow-hidden">
      {/* Mobile Card View */}
      <div className="block md:hidden">
        {products.length === 0 ? (
          <div className="px-4 sm:px-6 py-8 text-center text-gray-400">
            <Package className="w-12 h-12 mx-auto mb-4 text-gray-600" />
            <p className="text-sm sm:text-base">No products found</p>
          </div>
        ) : (
          <div className="divide-y divide-gold/20">
            {products.map((product) => (
              <div key={product.id} className="p-3 sm:p-4 hover:bg-gold/5 relative overflow-visible">
                <div className="flex items-start gap-3 sm:gap-4">
                  {/* Product Image */}
                  <div className="w-14 h-14 sm:w-16 sm:h-16 relative flex-shrink-0">
                    <SafeImage
                      src={product.images?.[0]?.secure_url || ''}
                      alt={product.name}
                      fill
                      className="rounded-lg object-cover"
                      fallbackIcon={<Package className="w-5 h-5 sm:w-6 sm:h-6 text-gray-500" />}
                      fallbackClassName="w-full h-full bg-gray-700 rounded-lg flex items-center justify-center"
                    />
                  </div>
                  
                  {/* Product Details */}
                  <div className="flex-1 min-w-0">
                    {/* Header with name, status and actions */}
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-start min-w-0 flex-1">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-sm sm:text-base font-medium text-white truncate">
                              {product.name}
                            </h3>
                            {product.featured && (
                              <Star className="w-3 h-3 sm:w-4 sm:h-4 text-gold flex-shrink-0" fill="currentColor" />
                            )}
                          </div>
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`inline-flex px-2 py-1 rounded-md text-xs font-medium border ${statusColors[product.status]}`}>
                              {product.status.replace('_', ' ')}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Actions - positioned at top right */}
                      <div className="flex-shrink-0 self-start">
                        <TableRowActions
                          viewHref={`/product/${product.slug}`}
                          editHref={`/admin/products/${product.id}/edit`}
                          onToggleFeatured={() => handleFeaturedToggle(product.id, product.featured)}
                          onToggleStatus={() => handleStatusChange(
                            product.id,
                            product.status === 'active' ? 'inactive' : 'active'
                          )}
                          onDelete={() => handleDelete(product.id)}
                          isFeatured={product.featured}
                          isActive={product.status === 'active'}
                          size="sm"
                        />
                      </div>
                    </div>

                    {/* Product Details Grid */}
                    <div className="grid grid-cols-2 gap-x-3 gap-y-2 text-xs sm:text-sm text-gray-400">
                      <div className="flex flex-col">
                        <span className="text-gray-500 text-xs mb-1">Price</span>
                        <div>
                          <span className="text-white font-medium">
                            {formatPriceWithSymbol(product.price)}
                          </span>
                          {product.compare_price && (
                            <span className="ml-2 line-through text-xs text-gray-500">
                              {formatPriceWithSymbol(product.compare_price)}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex flex-col">
                        <span className="text-gray-500 text-xs mb-1">Inventory</span>
                        <div className={`font-medium ${getDisplayInventory(product) <= 10
                          ? 'text-red-400'
                          : getDisplayInventory(product) <= 50
                            ? 'text-yellow-400'
                            : 'text-green-400'
                          }`}>
                          {getDisplayInventory(product)} units
                        </div>
                      </div>
                      
                      <div className="flex flex-col">
                        <span className="text-gray-500 text-xs mb-1">Category</span>
                        <div className="truncate">{product.category_name || 'Uncategorized'}</div>
                      </div>
                      
                      <div className="flex flex-col">
                        <span className="text-gray-500 text-xs mb-1">Created</span>
                        <div>{formatSafeDate(product.created_at)}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto overflow-y-visible">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gold/20 bg-gold/5">
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Product
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Price
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Inventory
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider hidden lg:table-cell">
                Category
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider hidden xl:table-cell">
                Created
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gold/20">
            {products.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-gray-400">
                  <Package className="w-12 h-12 mx-auto mb-4 text-gray-600" />
                  <p>No products found</p>
                </td>
              </tr>
            ) : (
              products.map((product) => (
                <tr key={product.id} className="hover:bg-gold/5">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="w-12 h-12 relative mr-4 flex-shrink-0">
                        <SafeImage
                          src={product.images?.[0]?.secure_url || ''}
                          alt={product.name}
                          fill
                          className="rounded-lg object-cover"
                          fallbackIcon={<Package className="w-6 h-6 text-gray-500" />}
                          fallbackClassName="w-full h-full bg-gray-700 rounded-lg flex items-center justify-center"
                        />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center">
                          <div className="text-sm font-medium text-white truncate">
                            {product.name}
                          </div>
                          {product.featured && (
                            <Star className="w-4 h-4 text-gold ml-2 flex-shrink-0" fill="currentColor" />
                          )}
                        </div>
                        <div className="text-sm text-gray-400 truncate">{product.slug}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-white font-medium">
                      {formatPriceWithSymbol(product.price)}
                    </div>
                    {product.compare_price && (
                      <div className="text-sm text-gray-400 line-through">
                        {formatPriceWithSymbol(product.compare_price)}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className={`text-sm font-medium ${getDisplayInventory(product) <= 10
                      ? 'text-red-400'
                      : getDisplayInventory(product) <= 50
                        ? 'text-yellow-400'
                        : 'text-green-400'
                      }`}>
                      {getDisplayInventory(product)} units
                      {product.track_variants && (
                        <div className="text-xs text-gray-500">
                          (from variants)
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusColors[product.status]
                      }`}>
                      {product.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-300 hidden lg:table-cell">
                    {product.category_name || 'Uncategorized'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-300 hidden xl:table-cell">
                    {formatSafeDate(product.created_at)}
                  </td>
                  <td className="px-6 py-4">
                    <TableRowActions
                      viewHref={`/product/${product.slug}`}
                      editHref={`/admin/products/${product.id}/edit`}
                      onToggleFeatured={() => handleFeaturedToggle(product.id, product.featured)}
                      onToggleStatus={() => handleStatusChange(
                        product.id,
                        product.status === 'active' ? 'inactive' : 'active'
                      )}
                      onDelete={() => handleDelete(product.id)}
                      isFeatured={product.featured}
                      isActive={product.status === 'active'}
                      size="sm"
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}