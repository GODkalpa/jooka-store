import Link from 'next/link';
import { Eye, Package } from 'lucide-react';
import { formatPriceWithSymbol } from '@/lib/utils/currency';
import { formatSafeDate } from '@/lib/utils/date';

interface Order {
  id: string;
  total_amount: number;
  status: string;
  created_at: string;
  items_count?: number;
}

interface RecentOrdersCustomerProps {
  orders: Order[];
}

const statusColors = {
  pending: 'bg-yellow-900/20 text-yellow-400 border-yellow-500/20',
  processing: 'bg-blue-900/20 text-blue-400 border-blue-500/20',
  shipped: 'bg-purple-900/20 text-purple-400 border-purple-500/20',
  delivered: 'bg-green-900/20 text-green-400 border-green-500/20',
  cancelled: 'bg-red-900/20 text-red-400 border-red-500/20',
};

export default function RecentOrdersCustomer({ orders }: RecentOrdersCustomerProps) {
  return (
    <div className="bg-charcoal rounded-lg border border-gold/20">
      <div className="px-6 py-4 border-b border-gold/20">
        <h3 className="text-lg font-semibold text-gold">Recent Orders</h3>
      </div>
      
      <div className="p-6">
        {orders.length === 0 ? (
          <div className="text-center py-8">
            <Package className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 mb-4">You haven't placed any orders yet</p>
            <Link
              href="/shop"
              className="btn-primary inline-block"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className="flex items-center justify-between p-4 bg-black/50 rounded-lg border border-gold/10 hover:border-gold/30 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium text-white">
                      Order #{order.id.slice(-8)}
                    </h4>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${
                      statusColors[order.status as keyof typeof statusColors] || 
                      'bg-gray-900/20 text-gray-400 border-gray-500/20'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-400">
                    <span>{formatSafeDate(order.created_at)}</span>
                    <span className="text-white font-medium">
                      {formatPriceWithSymbol(order.total_amount)}
                    </span>
                  </div>
                </div>
                <div className="ml-4">
                  <Link
                    href={`/dashboard/orders/${order.id}`}
                    className="text-gold hover:text-gold/80 transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}
            
            <div className="pt-4 border-t border-gold/20">
              <Link
                href="/dashboard/orders"
                className="text-sm text-gold hover:text-gold/80 transition-colors"
              >
                View all orders →
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}