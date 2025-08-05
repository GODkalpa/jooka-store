import Link from 'next/link';
import { AlertTriangle, Package, Wifi, WifiOff } from 'lucide-react';
import { useLowStockAlerts } from '@/lib/realtime/hooks';
import { useEffect } from 'react';

interface Product {
  id: string;
  name: string;
  inventory_count: number;
  low_stock_threshold: number;
}

interface LowStockAlertProps {
  products: Product[];
}

export default function LowStockAlert({ products }: LowStockAlertProps) {
  const lowStockAlerts = useLowStockAlerts();

  // Show realtime indicator if we have realtime alerts
  const hasRealtimeAlerts = lowStockAlerts.alerts.length > 0;
  return (
    <div className="bg-charcoal rounded-lg border border-gold/20">
      <div className="px-6 py-4 border-b border-gold/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <AlertTriangle className="w-5 h-5 text-yellow-400 mr-2" />
            <h3 className="text-lg font-semibold text-gold">Low Stock Alert</h3>
          </div>
          
          {/* Realtime Status */}
          <div className="flex items-center space-x-2">
            {lowStockAlerts.isConnected ? (
              <>
                <Wifi className="w-3 h-3 text-green-400" />
                <span className="text-xs text-green-400">Live</span>
              </>
            ) : (
              <>
                <WifiOff className="w-3 h-3 text-red-400" />
                <span className="text-xs text-red-400">Offline</span>
              </>
            )}
            
            {hasRealtimeAlerts && (
              <div className="bg-yellow-900/20 border border-yellow-500/20 rounded px-2 py-1">
                <span className="text-xs text-yellow-400">
                  {lowStockAlerts.alerts.length} new
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="p-6">
        {products.length === 0 ? (
          <div className="text-center py-8">
            <Package className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">All products are well stocked!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {products.slice(0, 5).map((product) => (
              <div
                key={product.id}
                className="flex items-center justify-between p-3 bg-yellow-900/10 border border-yellow-500/20 rounded-lg"
              >
                <div>
                  <p className="text-sm font-medium text-white">{product.name}</p>
                  <p className="text-xs text-gray-400">
                    {product.inventory_count} left (threshold: {product.low_stock_threshold})
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold text-yellow-400">
                    {product.inventory_count}
                  </span>
                </div>
              </div>
            ))}
            
            {products.length > 5 && (
              <p className="text-sm text-gray-400 text-center">
                +{products.length - 5} more items need attention
              </p>
            )}
            
            <div className="pt-4 border-t border-gold/20 space-y-2">
              {hasRealtimeAlerts && (
                <button
                  onClick={lowStockAlerts.clearAlerts}
                  className="block w-full text-center py-1 px-4 bg-yellow-900/10 text-yellow-400 rounded-md hover:bg-yellow-900/20 transition-colors text-xs"
                >
                  Clear Realtime Alerts
                </button>
              )}
              <Link
                href="/admin/inventory"
                className="block w-full text-center py-2 px-4 bg-gold/10 text-gold rounded-md hover:bg-gold/20 transition-colors text-sm"
              >
                Manage Inventory
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}