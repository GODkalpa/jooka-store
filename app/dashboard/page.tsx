'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/firebase-auth';
import { ArrowRight, CreditCard, ChevronRight } from 'lucide-react';
import RecentOrdersCustomer from '@/components/dashboard/RecentOrdersCustomer';
import QuickActions from '@/components/dashboard/QuickActions';
import { api } from '@/lib/api/client';

interface DashboardData {
  user: any;
  recentOrders: any[];
  cart: { items: any[]; itemCount: number };
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
  const { user, isLoading: authLoading } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && user) {
      fetchDashboardData();
    } else if (!authLoading && !user) {
      setLoading(false);
    }
  }, [authLoading, user]);

  const fetchDashboardData = async () => {
    try {
      const result = await api.get('/api/customer/dashboard');
      setData(result.data);
    } catch (err) {
      setData({
        user: user,
        recentOrders: [],
        cart: { items: [], itemCount: 0 },
        addresses: [],
        paymentMethods: [],
        notifications: [],
        stats: { totalOrders: 0, cartItems: 0, savedAddresses: 0, unreadNotifications: 0 },
      });
    } finally {
      setLoading(false);
    }
  };

  /* ── Skeleton loading ── */
  if (authLoading || loading) {
    return (
      <div className="animate-pulse">
        <div className="flex items-center justify-between pb-6 border-b border-gray-200">
          <div className="h-7 bg-gray-200/60 rounded w-40" />
          <div className="h-4 bg-gray-100 rounded w-28 hidden sm:block" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-8">
          <div className="lg:col-span-2 space-y-px">
            <div className="h-9 bg-gray-100 rounded-t-lg" />
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-[56px] bg-white border-b border-gray-100" />
            ))}
          </div>
          <div className="space-y-5">
            <div className="h-28 bg-white rounded-lg border border-gray-100" />
            <div className="h-20 bg-white rounded-lg border border-gray-100" />
            <div className="h-36 bg-white rounded-lg border border-gray-100" />
          </div>
        </div>
      </div>
    );
  }

  const d = data || {
    user,
    recentOrders: [],
    cart: { items: [], itemCount: 0 },
    addresses: [],
    paymentMethods: [],
    notifications: [],
    stats: { totalOrders: 0, cartItems: 0, savedAddresses: 0, unreadNotifications: 0 },
  };

  const defaultAddress =
    d.addresses.find((a: any) => a.is_default) || d.addresses[0];

  return (
    <div className="pb-12">
      {/* ── Header ── */}
      <div className="flex items-center justify-between pb-6 border-b border-gray-200">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">
          My Account
        </h1>
        <Link
          href="/shop"
          className="hidden sm:inline-flex items-center gap-1.5 text-sm font-semibold text-gray-900 hover:text-[#C8102E] transition-colors"
        >
          Continue shopping
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* ── Content ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-8">
        {/* Main: recent orders */}
        <div className="lg:col-span-2">
          <RecentOrdersCustomer orders={d.recentOrders} />
        </div>

        {/* Side: account context */}
        <div className="space-y-6">
          {/* Default address */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-900">
                Default address
              </h3>
              <Link
                href="/dashboard/addresses"
                className="text-xs font-medium text-gray-400 hover:text-gray-900 transition-colors"
              >
                Edit
              </Link>
            </div>

            {defaultAddress ? (
              <div className="bg-white rounded-lg border border-gray-100 p-4 text-sm text-gray-600 space-y-0.5">
                <p className="font-semibold text-gray-900">
                  {defaultAddress.first_name} {defaultAddress.last_name}
                </p>
                <p>{defaultAddress.address_line_1}</p>
                <p>
                  {defaultAddress.city}, {defaultAddress.state}{' '}
                  {defaultAddress.postal_code}
                </p>
                {defaultAddress.phone && (
                  <p className="text-xs text-gray-400 pt-1">
                    {defaultAddress.phone}
                  </p>
                )}
              </div>
            ) : (
              <Link
                href="/dashboard/addresses"
                className="flex items-center justify-between bg-white rounded-lg border border-dashed border-gray-300 p-4 text-sm text-gray-400 hover:text-gray-600 hover:border-gray-400 transition-colors"
              >
                <span>Add a delivery address</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            )}
          </section>

          {/* Payment */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-900">Payment</h3>
              <Link
                href="/dashboard/payments"
                className="text-xs font-medium text-gray-400 hover:text-gray-900 transition-colors"
              >
                Details
              </Link>
            </div>
            <div className="bg-white rounded-lg border border-gray-100 p-4 flex items-center gap-3">
              <div className="w-8 h-8 bg-gray-100 rounded-md flex items-center justify-center flex-shrink-0">
                <CreditCard className="w-4 h-4 text-gray-500" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">
                  Cash on Delivery
                </p>
                <p className="text-xs text-gray-400">
                  Pay when your order arrives
                </p>
              </div>
            </div>
          </section>

          {/* Quick links */}
          <QuickActions cartItemCount={d.stats.cartItems} />

          {/* Mobile CTA */}
          <Link href="/shop" className="btn-primary w-full sm:hidden">
            Continue shopping
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}