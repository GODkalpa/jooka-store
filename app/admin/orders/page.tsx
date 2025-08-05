'use client';

import { useEffect, useState } from 'react';
import { Search, Filter, Eye, Package, Truck, CheckCircle, Wifi, WifiOff, Bell } from 'lucide-react';
import Link from 'next/link';
import AdminOrdersTable from '@/components/dashboard/AdminOrdersTable';
import { useAdminOrderNotifications } from '@/lib/realtime/hooks';
import { api } from '@/lib/api/client';

interface Order {
  id: string;
  user_email: string;
  total_amount: number;
  status: string;
  created_at: string;
  items_count: number;
  shipping_address: any;
  payment_status: string;
}

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    processing: 0,
    shipped: 0,
    delivered: 0,
  });

  // Realtime order notifications
  const orderNotifications = useAdminOrderNotifications();

  useEffect(() => {
    fetchOrders();
  }, []);

  // Refetch orders when new order notifications arrive
  useEffect(() => {
    if (orderNotifications.notifications.length > 0) {
      fetchOrders();
    }
  }, [orderNotifications.notifications]);

  const fetchOrders = async () => {
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.append('status', statusFilter);

      const result = await api.get(`/api/admin/orders?${params.toString()}`);
      setOrders(result.data || []);

      // Calculate stats
      const orderStats = (result.data || []).reduce((acc: any, order: Order) => {
        acc.total++;
        acc[order.status] = (acc[order.status] || 0) + 1;
        return acc;
      }, { total: 0, pending: 0, processing: 0, shipped: 0, delivered: 0 });

      setStats(orderStats);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.user_email.toLowerCase().includes(searchTerm.toLowerCase());
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
    <div className="space-y-6 min-h-full">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gold">Order Management</h1>
          <p className="text-gray-400 mt-1">Track and manage customer orders</p>
        </div>

        {/* Realtime Status and Notifications */}
        <div className="flex items-center space-x-4 flex-shrink-0">
          <div className="flex items-center space-x-2">
            {orderNotifications.isConnected ? (
              <>
                <Wifi className="w-4 h-4 text-green-400" />
                <span className="text-sm text-green-400 hidden sm:inline">Live Orders</span>
              </>
            ) : (
              <>
                <WifiOff className="w-4 h-4 text-red-400" />
                <span className="text-sm text-red-400 hidden sm:inline">Offline</span>
              </>
            )}
          </div>

          {orderNotifications.notifications.length > 0 && (
            <div className="flex items-center space-x-2">
              <div className="bg-blue-900/20 border border-blue-500/20 rounded-lg px-3 py-1 flex items-center space-x-2">
                <Bell className="w-3 h-3 text-blue-400" />
                <span className="text-xs text-blue-400">
                  {orderNotifications.notifications.length} new order{orderNotifications.notifications.length > 1 ? 's' : ''}
                </span>
              </div>
              <button
                onClick={orderNotifications.clearNotifications}
                className="text-xs text-gray-400 hover:text-gold transition-colors"
              >
                Clear
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-charcoal rounded-lg p-4 border border-gold/20">
          <div className="flex items-center">
            <Package className="w-8 h-8 text-blue-400 mr-3" />
            <div>
              <p className="text-sm text-gray-400">Total Orders</p>
              <p className="text-xl font-bold text-white">{stats.total}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-charcoal rounded-lg p-4 border border-gold/20">
          <div className="flex items-center">
            <Package className="w-8 h-8 text-yellow-400 mr-3" />
            <div>
              <p className="text-sm text-gray-400">Pending</p>
              <p className="text-xl font-bold text-white">{stats.pending}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-charcoal rounded-lg p-4 border border-gold/20">
          <div className="flex items-center">
            <Package className="w-8 h-8 text-blue-400 mr-3" />
            <div>
              <p className="text-sm text-gray-400">Processing</p>
              <p className="text-xl font-bold text-white">{stats.processing}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-charcoal rounded-lg p-4 border border-gold/20">
          <div className="flex items-center">
            <Truck className="w-8 h-8 text-purple-400 mr-3" />
            <div>
              <p className="text-sm text-gray-400">Shipped</p>
              <p className="text-xl font-bold text-white">{stats.shipped}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-charcoal rounded-lg p-4 border border-gold/20">
          <div className="flex items-center">
            <CheckCircle className="w-8 h-8 text-green-400 mr-3" />
            <div>
              <p className="text-sm text-gray-400">Delivered</p>
              <p className="text-xl font-bold text-white">{stats.delivered}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-charcoal rounded-lg p-6 border border-gold/20">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative min-w-0">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search orders by ID or customer email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-black border border-gold/20 rounded-md text-white placeholder-gray-400 focus:outline-none focus:border-gold"
            />
          </div>

          {/* Status Filter */}
          <div className="relative flex-shrink-0">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="pl-10 pr-8 py-2 bg-black border border-gold/20 rounded-md text-white focus:outline-none focus:border-gold appearance-none min-w-[150px]"
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

      {/* Orders Table */}
      <div className="overflow-hidden">
        <AdminOrdersTable orders={filteredOrders} onOrderUpdate={fetchOrders} />
      </div>
    </div>
  );
}