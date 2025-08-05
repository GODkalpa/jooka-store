'use client';

import { useEffect, useState } from 'react';
import { Search, Filter, Eye, Package, Truck, CheckCircle, X } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/lib/auth/firebase-auth';
import { api } from '@/lib/api/client';
import { formatSafeDate } from '@/lib/utils/date';

// Utility function to format NPR currency
const formatNPR = (amount: number): string => {
  return `NPR ${amount.toLocaleString('en-NP', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

interface OrderItem {
  id: string;
  product_id: string;
  product_name: string;
  product_slug: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  selected_color?: string;
  selected_size?: string;
  product_image?: string; // Changed from product_image_url to product_image
  product_image_url?: string; // Keep both for backward compatibility
  product_snapshot?: any;
}

interface Order {
  id: string;
  total_amount: number;
  status: string;
  created_at: string;
  items_count: number;
  shipping_address: any;
  items?: OrderItem[];
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

export default function CustomerOrders() {
  const { user, firebaseUser } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    if (user && firebaseUser) {
      fetchOrders();
    }
  }, [user, firebaseUser]);

  const fetchOrders = async () => {
    try {
      if (!user || !firebaseUser) {
        throw new Error('User not authenticated');
      }

      const result = await api.get('/api/orders');
      setOrders(result.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

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
      <div>
        <h1 className="text-3xl font-bold text-gold">Order History</h1>
        <p className="text-gray-400 mt-1">Track and manage your orders</p>
      </div>

      {/* Filters */}
      <div className="bg-charcoal rounded-lg p-6 border border-gold/20">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search orders by ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-black border border-gold/20 rounded-md text-white placeholder-gray-400 focus:outline-none focus:border-gold"
            />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="pl-10 pr-8 py-2 bg-black border border-gold/20 rounded-md text-white focus:outline-none focus:border-gold appearance-none"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {filteredOrders.length === 0 ? (
          <div className="bg-charcoal rounded-lg border border-gold/20 p-12 text-center">
            <Package className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">No orders found</h3>
            <p className="text-gray-400 mb-6">
              {orders.length === 0 
                ? "You haven't placed any orders yet" 
                : "No orders match your search criteria"
              }
            </p>
            <Link href="/shop" className="btn-primary">
              Start Shopping
            </Link>
          </div>
        ) : (
          filteredOrders.map((order) => {
            const StatusIcon = statusIcons[order.status as keyof typeof statusIcons] || Package;

            return (
              <div
                key={order.id}
                className="bg-charcoal rounded-lg border border-gold/20 p-6 hover:border-gold/40 transition-colors"
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-medium text-white">
                      Order #{order.id.slice(-8)}
                    </h3>
                    <p className="text-sm text-gray-400">
                      Placed on {formatSafeDate(order.created_at)}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex items-center px-3 py-1 text-sm font-semibold rounded-full border ${
                      statusColors[order.status as keyof typeof statusColors] ||
                      'bg-gray-900/20 text-gray-400 border-gray-500/20'
                    }`}>
                      <StatusIcon className="w-3 h-3 mr-1" />
                      {order.status}
                    </span>
                  </div>
                </div>

                {/* Product Preview */}
                {order.items && order.items.length > 0 && (
                  <div className="mb-4">
                    <div className="flex items-center gap-3 overflow-x-auto pb-2">
                      {order.items.slice(0, 3).map((item) => (
                        <div key={item.id} className="flex-shrink-0 relative">
                          <div className="w-12 h-12 rounded-lg overflow-hidden border border-gold/20">
                            <Image
                              src={item.product_image || item.product_image_url || '/placeholder-product.svg'}
                              alt={`${item.product_name}${item.selected_color ? ` - ${item.selected_color}` : ''}`}
                              width={48}
                              height={48}
                              className="object-cover w-full h-full"
                            />
                          </div>
                          {item.quantity > 1 && (
                            <div className="absolute -top-1 -right-1 bg-gold text-black text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                              {item.quantity}
                            </div>
                          )}
                        </div>
                      ))}
                      {order.items.length > 3 && (
                        <div className="flex-shrink-0 w-12 h-12 rounded-lg border border-gold/20 bg-charcoal/50 flex items-center justify-center">
                          <span className="text-xs text-gold font-medium">
                            +{order.items.length - 3}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Variant Summary */}
                    <div className="flex flex-wrap gap-2 mt-2">
                      {order.items.slice(0, 2).map((item) => (
                        <div key={item.id} className="text-xs text-gray-400">
                          <span className="text-white font-medium">{item.product_name}</span>
                          {(item.selected_color || item.selected_size) && (
                            <span className="ml-1">
                              ({[item.selected_color, item.selected_size].filter(Boolean).join(', ')})
                            </span>
                          )}
                        </div>
                      ))}
                      {order.items.length > 2 && (
                        <span className="text-xs text-gray-400">
                          and {order.items.length - 2} more item{order.items.length - 2 !== 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-6 text-sm text-gray-400">
                    <span>{order.items_count || 0} items</span>
                    <span className="text-white font-medium">
                      Total: {formatNPR(order.total_amount)}
                    </span>
                  </div>
                  <Link
                    href={`/dashboard/orders/${order.id}`}
                    className="flex items-center text-gold hover:text-gold/80 transition-colors"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View Details
                  </Link>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}