import Link from 'next/link';
import { Wifi, WifiOff, Bell } from 'lucide-react';
import { useAdminOrderNotifications } from '@/lib/realtime/hooks';
import TableRowActions from '@/components/ui/TableRowActions';
import { formatPriceWithSymbol } from '@/lib/utils/currency';
import { formatSafeDate } from '@/lib/utils/date';

interface Order {
  id: string;
  user_email: string;
  total_amount: number;
  status: string;
  created_at: string;
}

interface RecentOrdersTableProps {
  orders: Order[];
}

const statusColors = {
  pending: 'bg-yellow-900/20 text-yellow-400 border-yellow-500/20',
  processing: 'bg-blue-900/20 text-blue-400 border-blue-500/20',
  shipped: 'bg-purple-900/20 text-purple-400 border-purple-500/20',
  delivered: 'bg-green-900/20 text-green-400 border-green-500/20',
  cancelled: 'bg-red-900/20 text-red-400 border-red-500/20',
};

export default function RecentOrdersTable({ orders }: RecentOrdersTableProps) {
  const orderNotifications = useAdminOrderNotifications();
  
  return (
    <div className="bg-charcoal rounded-lg border border-gold/20">
      <div className="px-6 py-4 border-b border-gold/20">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gold">Recent Orders</h3>
          
          {/* Realtime Status */}
          <div className="flex items-center space-x-2">
            {orderNotifications.isConnected ? (
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
            
            {orderNotifications.notifications.length > 0 && (
              <div className="bg-blue-900/20 border border-blue-500/20 rounded px-2 py-1 flex items-center space-x-1">
                <Bell className="w-3 h-3 text-blue-400" />
                <span className="text-xs text-blue-400">
                  {orderNotifications.notifications.length}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gold/20">
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Order ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Customer
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gold/20">
            {orders.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-400">
                  No recent orders found
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr key={order.id} className="hover:bg-gold/5">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                    #{order.id.slice(-8)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {order.user_email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                    {formatPriceWithSymbol(order.total_amount)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${
                      statusColors[order.status as keyof typeof statusColors] || 
                      'bg-gray-900/20 text-gray-400 border-gray-500/20'
                    }`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {formatSafeDate(order.created_at)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <TableRowActions
                      viewHref={`/admin/orders/${order.id}`}
                      size="sm"
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      {orders.length > 0 && (
        <div className="px-6 py-4 border-t border-gold/20">
          <Link
            href="/admin/orders"
            className="text-sm text-gold hover:text-gold/80 transition-colors"
          >
            View all orders →
          </Link>
        </div>
      )}
    </div>
  );
}