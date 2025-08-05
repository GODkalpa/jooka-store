'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  TrendingUp,
  Users,
  Package,
  ShoppingCart,
  AlertTriangle,
  DollarSign,
  Wifi,
  WifiOff,
  ArrowLeft,
  Store
} from 'lucide-react';
import StatsCard from '@/components/dashboard/StatsCard';
import RecentOrdersTable from '@/components/dashboard/RecentOrdersTable';
import { formatPriceWithSymbol } from '@/lib/utils/currency';
import LowStockAlert from '@/components/dashboard/LowStockAlert';
import { useRealtimeDashboard, useAdminOrderNotifications, useLowStockAlerts } from '@/lib/realtime/hooks';

interface DashboardData {
  stats: {
    totalUsers: number;
    totalOrders: number;
    totalRevenue: number;
    avgOrderValue: number;
    lowStockCount: number;
  };
  recentOrders: any[];
  lowStockProducts: any[];
  sales: {
    summary: any;
    daily_sales: any[];
    top_products: any[];
  };
}

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Realtime hooks
  const realtimeDashboard = useRealtimeDashboard();
  const orderNotifications = useAdminOrderNotifications();
  const lowStockAlerts = useLowStockAlerts();

  useEffect(() => {
    // Delay initial data fetch to allow page to render first
    const timeoutId = setTimeout(() => {
      fetchDashboardData();
    }, 100);

    // Set up auto-refresh every 60 seconds (reduced frequency)
    const interval = setInterval(() => {
      fetchDashboardData(true);
    }, 60000);

    return () => {
      clearTimeout(timeoutId);
      clearInterval(interval);
    };
  }, []);

  // Refetch data when realtime updates occur
  useEffect(() => {
    if (realtimeDashboard.lastUpdate) {
      fetchDashboardData(true);
    }
  }, [realtimeDashboard.lastUpdate]);

  const fetchDashboardData = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const response = await fetch('/api/admin/dashboard', {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();

      if (!result.data) {
        throw new Error('No data received from server');
      }

      setData(result.data);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Dashboard fetch error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while fetching dashboard data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    fetchDashboardData(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900/20 border border-red-500 rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-red-400 mb-2">Dashboard Error</h3>
            <p className="text-red-300">{error}</p>
            <p className="text-sm text-gray-400 mt-2">
              Unable to load dashboard data. Please check your connection and try again.
            </p>
          </div>
          <button
            onClick={() => fetchDashboardData()}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gold mb-2">Admin Dashboard</h1>
            <p className="text-gray-400">Welcome back! Here's what's happening with your store.</p>
            {lastUpdated && (
              <p className="text-xs text-gray-500 mt-1">
                Last updated: {lastUpdated.toLocaleTimeString()}
              </p>
            )}
          </div>

          {/* Quick Website Navigation */}
          <div className="flex items-center space-x-3">
            <Link
              href="/"
              className="flex items-center px-3 py-2 text-sm bg-gold/10 hover:bg-gold/20 border border-gold/30 rounded-lg transition-colors text-gold"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">View Website</span>
              <span className="sm:hidden">Website</span>
            </Link>
            <Link
              href="/shop"
              className="flex items-center px-3 py-2 text-sm bg-gold hover:bg-gold/90 rounded-lg transition-colors text-black font-medium"
            >
              <Store className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Shop</span>
              <span className="sm:hidden">Shop</span>
            </Link>
          </div>
        </div>

        {/* Controls and Status */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Refresh Button */}
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center space-x-2 px-3 py-2 bg-gold/10 hover:bg-gold/20 border border-gold/30 rounded-lg transition-colors disabled:opacity-50"
          >
            <TrendingUp className={`w-4 h-4 text-gold ${refreshing ? 'animate-spin' : ''}`} />
            <span className="text-sm text-gold">
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </span>
          </button>

          {/* Realtime Connection Status */}
          <div className="flex items-center space-x-2 px-3 py-2 bg-charcoal/50 rounded-lg border border-gold/20">
            {realtimeDashboard.isConnected ? (
              <>
                <Wifi className="w-4 h-4 text-green-400" />
                <span className="text-sm text-green-400">Live</span>
              </>
            ) : (
              <>
                <WifiOff className="w-4 h-4 text-red-400" />
                <span className="text-sm text-red-400">Offline</span>
              </>
            )}
          </div>
          
          {/* New Order Notifications */}
          {orderNotifications.notifications.length > 0 && (
            <div className="bg-blue-900/20 border border-blue-500/20 rounded-lg px-3 py-2">
              <span className="text-xs text-blue-400">
                {orderNotifications.notifications.length} new order{orderNotifications.notifications.length > 1 ? 's' : ''}
              </span>
            </div>
          )}
          
          {/* Low Stock Alerts */}
          {lowStockAlerts.alerts.length > 0 && (
            <div className="bg-yellow-900/20 border border-yellow-500/20 rounded-lg px-3 py-2">
              <span className="text-xs text-yellow-400">
                {lowStockAlerts.alerts.length} stock alert{lowStockAlerts.alerts.length > 1 ? 's' : ''}
              </span>
            </div>
          )}
          
          {realtimeDashboard.lastUpdate && (
            <div className="text-xs text-gray-400 px-3 py-2">
              Updated: {realtimeDashboard.lastUpdate.toLocaleTimeString()}
            </div>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatsCard
          title="Total Users"
          value={data.stats.totalUsers.toString()}
          icon={Users}
          trend={data.stats.totalUsers > 0 ? "Active users" : "No users yet"}
          trendUp={data.stats.totalUsers > 0}
        />
        <StatsCard
          title="Total Orders"
          value={data.stats.totalOrders.toString()}
          icon={ShoppingCart}
          trend="+12%"
          trendUp={true}
        />
        <StatsCard
          title="Total Revenue"
          value={formatPriceWithSymbol(data.stats.totalRevenue)}
          icon={DollarSign}
          trend="+8%"
          trendUp={true}
        />
        <StatsCard
          title="Low Stock Items"
          value={data.stats.lowStockCount.toString()}
          icon={AlertTriangle}
          trend={data.stats.lowStockCount > 0 ? "Attention needed" : "All good"}
          trendUp={false}
        />
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">
        {/* Recent Orders */}
        <div className="xl:col-span-2">
          <RecentOrdersTable orders={data.recentOrders} />
        </div>

        {/* Low Stock Alert */}
        <div>
          <LowStockAlert products={data.lowStockProducts} />
        </div>
      </div>
    </div>
  );
}