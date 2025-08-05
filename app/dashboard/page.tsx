'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/firebase-auth';
import {
  ShoppingBag,
  Package,
  MapPin,
  Bell,
  ArrowLeft,
  Store
} from 'lucide-react';
import StatsCard from '@/components/dashboard/StatsCard';
import RecentOrdersCustomer from '@/components/dashboard/RecentOrdersCustomer';
import QuickActions from '@/components/dashboard/QuickActions';
import { api } from '@/lib/api/client';

interface DashboardData {
  user: any;
  recentOrders: any[];
  cart: {
    items: any[];
    itemCount: number;
  };
  addresses: any[];
  paymentMethods: any[];
  notifications: any[];
  stats: {
    totalOrders: number;
    cartItems: number;
    savedAddresses: number;
    unreadNotifications: number;
  };
}

export default function CustomerDashboard() {
  const { user, firebaseUser, isLoading: authLoading } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Only fetch dashboard data when auth is loaded and user is available
    if (!authLoading && user && firebaseUser) {
      // Delay data fetching slightly to allow page to render first
      const timeoutId = setTimeout(() => {
        fetchDashboardData();
      }, 50);
      return () => clearTimeout(timeoutId);
    }
  }, [authLoading, user, firebaseUser]);

  const fetchDashboardData = async () => {
    try {
      if (!user || !firebaseUser) {
        throw new Error('User not authenticated');
      }

      const result = await api.get('/api/customer/dashboard');
      setData(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="space-y-8 animate-pulse">
        {/* Skeleton header */}
        <div>
          <div className="h-8 bg-gray-700 rounded w-64 mb-2"></div>
          <div className="h-4 bg-gray-800 rounded w-96"></div>
        </div>
        
        {/* Skeleton stats grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-charcoal rounded-lg border border-gold/20 p-6">
              <div className="h-4 bg-gray-700 rounded w-20 mb-2"></div>
              <div className="h-8 bg-gray-600 rounded w-16 mb-2"></div>
              <div className="h-3 bg-gray-800 rounded w-24"></div>
            </div>
          ))}
        </div>
        
        {/* Skeleton content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-charcoal rounded-lg border border-gold/20 p-6">
            <div className="h-6 bg-gray-700 rounded w-32 mb-4"></div>
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-12 bg-gray-800 rounded"></div>
              ))}
            </div>
          </div>
          <div className="bg-charcoal rounded-lg border border-gold/20 p-6">
            <div className="h-6 bg-gray-700 rounded w-24 mb-4"></div>
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-10 bg-gray-800 rounded"></div>
              ))}
            </div>
          </div>
        </div>
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

  if (!data) return null;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gold mb-2">
            Welcome back, {user?.email?.split('@')[0] || 'Customer'}!
          </h1>
          <p className="text-gray-400">Here's what's happening with your account.</p>
        </div>

        {/* Quick Website Navigation */}
        <div className="flex items-center space-x-3">
          <Link
            href="/"
            className="flex items-center px-3 py-2 text-sm bg-gold/10 hover:bg-gold/20 border border-gold/30 rounded-lg transition-colors text-gold"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Back to Website</span>
            <span className="sm:hidden">Website</span>
          </Link>
          <Link
            href="/shop"
            className="flex items-center px-3 py-2 text-sm bg-gold hover:bg-gold/90 rounded-lg transition-colors text-black font-medium"
          >
            <Store className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Continue Shopping</span>
            <span className="sm:hidden">Shop</span>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatsCard
          title="Total Orders"
          value={data.stats.totalOrders.toString()}
          icon={ShoppingBag}
          trend={data.stats.totalOrders > 0 ? "Active customer" : "Start shopping"}
          trendUp={data.stats.totalOrders > 0}
        />
        <StatsCard
          title="Cart Items"
          value={data.stats.cartItems.toString()}
          icon={Package}
          trend={data.stats.cartItems > 0 ? "Ready to checkout" : "Cart is empty"}
          trendUp={data.stats.cartItems > 0}
        />
        <StatsCard
          title="Saved Addresses"
          value={data.stats.savedAddresses.toString()}
          icon={MapPin}
          trend={data.stats.savedAddresses > 0 ? "Addresses saved" : "Add address"}
          trendUp={data.stats.savedAddresses > 0}
        />
        <StatsCard
          title="Notifications"
          value={data.stats.unreadNotifications.toString()}
          icon={Bell}
          trend={data.stats.unreadNotifications > 0 ? "Unread messages" : "All caught up"}
          trendUp={false}
        />
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">
        {/* Recent Orders */}
        <div className="xl:col-span-2">
          <RecentOrdersCustomer orders={data.recentOrders} />
        </div>

        {/* Quick Actions */}
        <div>
          <QuickActions
            cartItemCount={data.stats.cartItems}
            hasAddresses={data.stats.savedAddresses > 0}
            hasPaymentMethods={data.paymentMethods.length > 0}
          />
        </div>
      </div>
    </div>
  );
}