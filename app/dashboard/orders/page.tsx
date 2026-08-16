'use client';

import { useEffect, useState } from 'react';
import { Search, Package } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/lib/auth/firebase-auth';
import { api } from '@/lib/api/client';
import { formatSafeDate } from '@/lib/utils/date';
import { formatPriceWithSymbol } from '@/lib/utils/currency';

interface OrderItem {
  id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  product_image?: string;
  product_image_url?: string;
}

interface Order {
  id: string;
  total_amount: number;
  status: string;
  created_at: string;
  items_count: number;
  items?: OrderItem[];
}

const statusStyle: Record<string, string> = {
  pending: 'bg-amber-50 text-amber-800 border-amber-200',
  processing: 'bg-blue-50 text-blue-800 border-blue-200',
  'sent for delivery': 'bg-purple-50 text-purple-800 border-purple-200',
  shipped: 'bg-purple-50 text-purple-800 border-purple-200',
  delivered: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  cancelled: 'bg-gray-100 text-gray-600 border-gray-200',
};

const tabs = ['All Orders', 'In Progress', 'Delivered', 'Cancelled'];

export default function OrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All Orders');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function fetchOrders() {
      if (!user) {
        setIsLoading(false);
        return;
      }
      try {
        setIsLoading(true);
        const url = user.id 
          ? `/api/orders?userId=${encodeURIComponent(user.id)}${user.email ? `&email=${encodeURIComponent(user.email)}` : ''}` 
          : '/api/orders';
        const result = await api.get(url);
        setOrders(result.data || []);
      } catch (error) {
        console.error('Failed to fetch orders:', error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchOrders();
  }, [user]);

  const filteredOrders = orders.filter((order) => {
    if (activeTab === 'In Progress') {
      if (['delivered', 'cancelled'].includes(order.status.toLowerCase())) return false;
    } else if (activeTab === 'Delivered') {
      if (order.status.toLowerCase() !== 'delivered') return false;
    } else if (activeTab === 'Cancelled') {
      if (order.status.toLowerCase() !== 'cancelled') return false;
    }

    if (searchQuery && !order.id.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }

    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Orders</h1>
        </div>
        <Link href="/shop" className="text-sm font-semibold text-gray-900 hover:text-[#C8102E] transition-colors">
          Shop new items &rarr;
        </Link>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={
                activeTab === tab
                  ? 'bg-gray-900 text-white font-bold px-4 py-2 rounded-md text-xs transition-colors'
                  : 'text-gray-600 hover:text-gray-900 font-semibold px-4 py-2 rounded-md text-xs transition-colors'
              }
            >
              {tab}
            </button>
          ))}
        </div>
        
        <div className="relative max-w-sm w-full">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search by Order ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-md text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900 transition-colors"
          />
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-200">
        {isLoading ? (
          <div className="p-8 space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-gray-100 animate-pulse rounded-md"></div>
            ))}
          </div>
        ) : filteredOrders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="px-6 py-4 text-sm font-semibold text-gray-900">Order</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-900">Date</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-900">Items</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-900">Total</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-900">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <Link href={`/dashboard/orders/${order.id}`} className="font-mono text-sm text-gray-900 hover:text-[#C8102E] font-medium">
                        #{order.id.slice(0, 8)}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {formatSafeDate(order.created_at)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {order.items_count} item{order.items_count !== 1 ? 's' : ''}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {formatPriceWithSymbol(order.total_amount)}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-sm border ${
                          statusStyle[order.status.toLowerCase()] || statusStyle.pending
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 flex flex-col items-center justify-center text-center border border-dashed border-gray-300 rounded-lg m-6">
            <Package className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-bold text-gray-900 mb-1">No orders found</h3>
            <p className="text-sm text-gray-500 mb-6 max-w-sm">
              {searchQuery ? "We couldn't find any orders matching your search." : "You haven't placed any orders yet. Start shopping to see your orders here."}
            </p>
            <Link href="/shop" className="btn-primary inline-flex">
              Browse store
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}