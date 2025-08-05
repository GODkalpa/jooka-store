import { Package, Truck, CheckCircle, X, Trash2 } from 'lucide-react';
import Link from 'next/link';
import TableRowActions from '@/components/ui/TableRowActions';
import { api } from '@/lib/api/client';
import { formatPriceWithSymbol } from '@/lib/utils/currency';
import { formatSafeDate } from '@/lib/utils/date';

interface Order {
  id: string;
  user_email: string;
  customer_name?: string;
  customer_phone?: string;
  total_amount: number;
  status: string;
  created_at: string;
  items_count: number;
  shipping_address: any;
  payment_status: string;
}

interface AdminOrdersTableProps {
  orders: Order[];
  onOrderUpdate: () => void;
}

const statusColors = {
  pending: 'bg-yellow-900/20 text-yellow-400 border-yellow-500/20',
  processing: 'bg-blue-900/20 text-blue-400 border-blue-500/20',
  'sent for delivery': 'bg-purple-900/20 text-purple-400 border-purple-500/20',
  shipped: 'bg-purple-900/20 text-purple-400 border-purple-500/20', // Keep for backward compatibility
  delivered: 'bg-green-900/20 text-green-400 border-green-500/20',
  cancelled: 'bg-red-900/20 text-red-400 border-red-500/20',
};

const statusIcons = {
  pending: Package,
  processing: Package,
  'sent for delivery': Truck,
  shipped: Truck, // Keep for backward compatibility
  delivered: CheckCircle,
  cancelled: X,
};

export default function AdminOrdersTable({ orders, onOrderUpdate }: AdminOrdersTableProps) {

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      await api.put(`/api/orders/${orderId}`, { status: newStatus });
      onOrderUpdate();
      alert('Order status updated successfully!');
    } catch (error) {
      console.error('Failed to update order status:', error);
      alert('Failed to update order status. Please try again.');
    }
  };

  const getNextStatus = (currentStatus: string) => {
    const statusFlow = {
      pending: 'processing',
      processing: 'sent for delivery',
      'sent for delivery': 'delivered',
      shipped: 'delivered', // Keep for backward compatibility
      delivered: 'delivered', // No next status
      cancelled: 'cancelled', // No next status
    };
    return statusFlow[currentStatus as keyof typeof statusFlow];
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      pending: 'Mark as Processing',
      processing: 'Send for Delivery',
      'sent for delivery': 'Mark as Delivered',
      shipped: 'Mark as Delivered', // Keep for backward compatibility
      delivered: 'Already Delivered',
      cancelled: 'Order Cancelled',
    };
    return labels[status as keyof typeof labels];
  };

  const handleDelete = async (orderId: string, orderNumber: string) => {
    if (!confirm(`Are you sure you want to delete order "${orderNumber}"? This action cannot be undone.`)) return;

    try {
      await api.delete(`/api/orders/${orderId}`);
      onOrderUpdate();
      alert('Order deleted successfully!');
    } catch (error) {
      console.error('Failed to delete order:', error);
      alert('Failed to delete order. Please try again.');
    }
  };

  return (
    <div className="bg-charcoal rounded-lg border border-gold/20 overflow-hidden">
      {/* Mobile Card View */}
      <div className="block lg:hidden">
        {orders.length === 0 ? (
          <div className="px-6 py-8 text-center text-gray-400">
            <Package className="w-12 h-12 mx-auto mb-4 text-gray-600" />
            <p>No orders found</p>
          </div>
        ) : (
          <div className="divide-y divide-gold/20">
            {orders.map((order) => {
              const StatusIcon = statusIcons[order.status as keyof typeof statusIcons] || Package;
              const nextStatus = getNextStatus(order.status);
              
              return (
                <div key={order.id} className="p-4 hover:bg-gold/5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="text-sm font-medium text-white">
                        #{order.id.slice(-8)}
                      </div>
                      <div className="text-sm text-gray-300">
                        {order.customer_name || 'Unknown Customer'}
                      </div>
                      {order.shipping_address && (
                        <div className="text-xs text-gray-500">
                          {order.shipping_address.city}, {order.shipping_address.state}
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-white">
                        {formatPriceWithSymbol(order.total_amount)}
                      </div>
                      <div className="text-xs text-gray-400">
                        {order.items_count || 0} items
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mb-3">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                      statusColors[order.status as keyof typeof statusColors] || 
                      'bg-gray-900/20 text-gray-400 border-gray-500/20'
                    }`}>
                      <StatusIcon className="w-3 h-3 mr-1" />
                      {order.status}
                    </span>
                    
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      order.payment_status === 'paid'
                        ? 'bg-green-900/20 text-green-400'
                        : order.payment_status === 'pending'
                        ? 'bg-yellow-900/20 text-yellow-400'
                        : order.payment_status === 'cancelled'
                        ? 'bg-gray-900/20 text-gray-400'
                        : 'bg-red-900/20 text-red-400'
                    }`}>
                      {order.payment_status || 'pending'}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-gray-400">
                      {formatSafeDate(order.created_at)}
                    </div>
                    <TableRowActions
                      viewHref={`/admin/orders/${order.id}`}
                      onDelete={() => handleDelete(order.id, order.id.slice(0, 8))}
                      customActions={[
                        ...(nextStatus && nextStatus !== order.status ? [{
                          label: getStatusLabel(order.status),
                          icon: StatusIcon,
                          onClick: () => handleStatusChange(order.id, nextStatus),
                          variant: 'secondary' as const
                        }] : []),
                        ...(order.status !== 'cancelled' ? [{
                          label: 'Cancel Order',
                          icon: X,
                          onClick: () => handleStatusChange(order.id, 'cancelled'),
                          variant: 'danger' as const
                        }] : [])
                      ]}
                      size="sm"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Desktop Table View */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full min-w-[1200px]">
          <thead className="sticky top-0 z-10">
            <tr className="border-b border-gold/20 bg-gold/5">
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider min-w-[120px]">
                Order ID
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider min-w-[200px]">
                Customer
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider min-w-[80px]">
                Items
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider min-w-[100px]">
                Total
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider min-w-[120px]">
                Status
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider min-w-[100px]">
                Payment
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider min-w-[100px]">
                Date
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider min-w-[200px]">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gold/20">
            {orders.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-8 text-center text-gray-400">
                  <Package className="w-12 h-12 mx-auto mb-4 text-gray-600" />
                  <p>No orders found</p>
                </td>
              </tr>
            ) : (
              orders.map((order) => {
                const StatusIcon = statusIcons[order.status as keyof typeof statusIcons] || Package;
                const nextStatus = getNextStatus(order.status);
                
                return (
                  <tr key={order.id} className="hover:bg-gold/5">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-white">
                        #{order.id.slice(-8)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-300">
                        {order.customer_name || 'Unknown Customer'}
                      </div>
                      {order.shipping_address && (
                        <div className="text-xs text-gray-500">
                          {order.shipping_address.city}, {order.shipping_address.state}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      <div className="flex items-center gap-2">
                        <span>{order.items_count || 0} items</span>
                        {order.items_count > 0 && (
                          <div className="w-2 h-2 bg-gold/50 rounded-full"></div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                      {formatPriceWithSymbol(order.total_amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                        statusColors[order.status as keyof typeof statusColors] || 
                        'bg-gray-900/20 text-gray-400 border-gray-500/20'
                      }`}>
                        <StatusIcon className="w-3 h-3 mr-1" />
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        order.payment_status === 'paid'
                          ? 'bg-green-900/20 text-green-400'
                          : order.payment_status === 'pending'
                          ? 'bg-yellow-900/20 text-yellow-400'
                          : order.payment_status === 'cancelled'
                          ? 'bg-gray-900/20 text-gray-400'
                          : 'bg-red-900/20 text-red-400'
                      }`}>
                        {order.payment_status || 'pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {formatSafeDate(order.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <TableRowActions
                        viewHref={`/admin/orders/${order.id}`}
                        onDelete={() => handleDelete(order.id, order.id.slice(0, 8))}
                        customActions={[
                          ...(nextStatus && nextStatus !== order.status ? [{
                            label: getStatusLabel(order.status),
                            icon: StatusIcon,
                            onClick: () => handleStatusChange(order.id, nextStatus),
                            variant: 'secondary' as const
                          }] : []),
                          ...(order.status !== 'cancelled' ? [{
                            label: 'Cancel Order',
                            icon: X,
                            onClick: () => handleStatusChange(order.id, 'cancelled'),
                            variant: 'danger' as const
                          }] : [])
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