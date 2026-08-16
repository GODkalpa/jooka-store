import Link from 'next/link';
import { Package, ChevronRight } from 'lucide-react';
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

const statusStyle: Record<string, string> = {
  pending: 'bg-amber-50 text-amber-800 border-amber-200',
  processing: 'bg-blue-50 text-blue-800 border-blue-200',
  'sent for delivery': 'bg-purple-50 text-purple-800 border-purple-200',
  shipped: 'bg-purple-50 text-purple-800 border-purple-200',
  delivered: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  cancelled: 'bg-gray-100 text-gray-600 border-gray-200',
};

export default function RecentOrdersCustomer({ orders }: RecentOrdersCustomerProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-900">Recent orders</h2>
        {orders.length > 0 && (
          <Link
            href="/dashboard/orders"
            className="text-xs font-semibold text-gray-400 hover:text-gray-900 transition-colors flex items-center gap-1"
          >
            View all
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        )}
      </div>

      {orders.length === 0 ? (
        <div className="bg-white rounded-lg border border-dashed border-gray-300 px-6 py-12 text-center">
          <Package className="w-8 h-8 text-gray-300 mx-auto mb-3" strokeWidth={1.5} />
          <p className="text-sm font-semibold text-gray-900 mb-1">No orders yet</p>
          <p className="text-sm text-gray-500 mb-5 max-w-sm mx-auto">
            When you place an order, it will appear here with tracking&nbsp;status.
          </p>
          <Link href="/shop" className="btn-primary inline-flex">
            Start shopping
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-100 overflow-hidden">
          {/* Column headers */}
          <div className="hidden sm:grid sm:grid-cols-[1fr_100px_100px_28px] gap-4 px-5 py-2.5 bg-gray-50/80 border-b border-gray-100 text-xs font-semibold text-gray-400 uppercase tracking-wider">
            <span>Order</span>
            <span className="text-right">Total</span>
            <span className="text-center">Status</span>
            <span />
          </div>

          {/* Rows */}
          <div className="divide-y divide-gray-100">
            {orders.slice(0, 5).map((order) => (
              <Link
                key={order.id}
                href={`/dashboard/orders/${order.id}`}
                className="grid grid-cols-1 sm:grid-cols-[1fr_100px_100px_28px] gap-1 sm:gap-4 items-center px-5 py-3.5 hover:bg-gray-50/60 transition-colors group"
              >
                <div className="flex items-baseline gap-2 min-w-0">
                  <span className="text-sm font-semibold text-gray-900 font-mono tracking-tight">
                    #{order.id.slice(-8).toUpperCase()}
                  </span>
                  <span className="text-xs text-gray-400 truncate">
                    {formatSafeDate(order.created_at)}
                    {order.items_count
                      ? ` · ${order.items_count} item${order.items_count > 1 ? 's' : ''}`
                      : ''}
                  </span>
                </div>

                <span className="text-sm font-semibold text-gray-900 sm:text-right">
                  {formatPriceWithSymbol(order.total_amount)}
                </span>

                <span className="sm:flex sm:justify-center">
                  <span
                    className={`inline-flex text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-sm border ${
                      statusStyle[order.status] ||
                      'bg-gray-100 text-gray-600 border-gray-200'
                    }`}
                  >
                    {order.status}
                  </span>
                </span>

                <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 transition-colors hidden sm:block justify-self-end" />
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}