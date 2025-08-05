'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { api } from '@/lib/api/client';
import { formatSafeDate } from '@/lib/utils/date';
import {
  ArrowLeft,
  Package,
  Truck,
  CheckCircle,
  X,
  MapPin,
  CreditCard,
  Banknote,
  Calendar,
  User,
  Mail,
  Phone
} from 'lucide-react';

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
  user_id: string;
  user_email: string;
  customer_name?: string;
  customer_phone?: string;
  customer_profile?: any;
  total_amount: number;
  status: string;
  payment_status: string;
  created_at: string;
  updated_at: string;
  shipping_address: any;
  billing_address: any;
  payment_method: any;
  items: OrderItem[];
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

export default function AdminOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;
  
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (orderId) {
      fetchOrder();
    }
  }, [orderId]);

  const fetchOrder = async () => {
    try {
      const result = await api.get(`/api/orders/${orderId}`);
      setOrder(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (newStatus: string) => {
    setUpdating(true);
    try {
      console.log(`Updating order ${orderId} status from ${order?.status} to ${newStatus}`);
      await api.put(`/api/orders/${orderId}`, { status: newStatus });

      await fetchOrder(); // Refresh order data

      // Show different messages based on status change
      if (newStatus === 'delivered') {
        alert('Order marked as delivered! Payment status automatically set to "paid".');
      } else if (newStatus === 'cancelled') {
        alert('Order cancelled! Payment status automatically set to "cancelled".');
      } else {
        alert('Order status updated successfully!');
      }
    } catch (error) {
      console.error('Failed to update order status:', error);
      alert('Failed to update order status. Please try again.');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold"></div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="flex items-center text-gold hover:text-gold/80 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Orders
          </button>
        </div>
        <div className="bg-red-900/20 border border-red-500 rounded-lg p-4">
          <p className="text-red-400">Error: {error || 'Order not found'}</p>
        </div>
      </div>
    );
  }

  const StatusIcon = statusIcons[order.status as keyof typeof statusIcons] || Package;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="flex items-center text-gold hover:text-gold/80 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Orders
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gold">
              Order #{order.id.slice(-8)}
            </h1>
            <p className="text-gray-400 mt-1">
              Placed on {formatSafeDate(order.created_at)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${
            statusColors[order.status as keyof typeof statusColors] || 
            'bg-gray-900/20 text-gray-400 border-gray-500/20'
          }`}>
            <StatusIcon className="w-4 h-4 mr-2" />
            {order.status}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Items */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-charcoal rounded-lg border border-gold/20 p-6">
            <h2 className="text-xl font-semibold text-gold mb-4">Order Items</h2>
            <div className="space-y-4">
              {order.items.map((item) => (
                <motion.div
                  key={item.id}
                  className="flex gap-4 p-4 bg-black/20 rounded-lg border border-gold/10"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Product Image */}
                  <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                    <Image
                      src={item.product_image || item.product_image_url || '/placeholder-product.svg'}
                      alt={`${item.product_name}${item.selected_color ? ` - ${item.selected_color}` : ''}`}
                      fill
                      className="object-cover"
                    />
                    {item.selected_color && (
                      <div className="absolute top-1 left-1 bg-black/70 text-white text-xs px-1 py-0.5 rounded">
                        {item.selected_color}
                      </div>
                    )}
                  </div>

                  {/* Product Details */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-medium truncate">
                      {item.product_name}
                    </h3>
                    <div className="flex flex-wrap gap-2 text-xs text-gray-400 mt-1">
                      {item.selected_size && (
                        <span className="bg-charcoal/50 px-2 py-1 rounded">
                          Size: {item.selected_size}
                        </span>
                      )}
                      {item.selected_color && (
                        <span className="bg-charcoal/50 px-2 py-1 rounded">
                          Color: {item.selected_color}
                        </span>
                      )}
                      <span className="bg-charcoal/50 px-2 py-1 rounded">
                        Qty: {item.quantity}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-gold font-medium">
                        {formatNPR(item.unit_price)} each
                      </p>
                      <p className="text-white font-semibold">
                        {formatNPR(item.total_price)}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Order Total */}
            <div className="border-t border-gold/20 mt-6 pt-4">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-gray-300">Total</span>
                <span className="text-2xl font-bold text-gold">
                  {formatNPR(order.total_amount)}
                </span>
              </div>
            </div>
          </div>

          {/* Status Update */}
          <div className="bg-charcoal rounded-lg border border-gold/20 p-6">
            <h2 className="text-xl font-semibold text-gold mb-4">Update Status</h2>
            <div className="mb-4 p-3 bg-blue-900/20 border border-blue-500/20 rounded-lg">
              <p className="text-sm text-blue-400">
                💡 <strong>Auto Payment Update:</strong> Payment status will automatically update to "paid" when order is delivered, or "cancelled" when order is cancelled.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {['pending', 'processing', 'sent for delivery', 'delivered', 'cancelled'].map((status) => (
                <button
                  key={status}
                  onClick={() => updateOrderStatus(status)}
                  disabled={updating || order.status === status}
                  className={`px-4 py-2 rounded-lg border-2 transition-all duration-300 ${
                    order.status === status
                      ? 'border-gold bg-gold text-black'
                      : 'border-gray-600 text-gray-300 hover:border-gold hover:text-gold'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Order Summary & Customer Info */}
        <div className="space-y-6">
          {/* Customer Information */}
          <div className="bg-charcoal rounded-lg border border-gold/20 p-6">
            <h2 className="text-xl font-semibold text-gold mb-4 flex items-center gap-2">
              <User className="w-5 h-5" />
              Customer Information
            </h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <User className="w-4 h-4 text-gray-400" />
                <span className="text-gray-300">
                  {order.customer_name || 'Unknown Customer'}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-gray-400" />
                <span className="text-gray-300">{order.user_email}</span>
              </div>
              {order.customer_phone && (
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-300">{order.customer_phone}</span>
                </div>
              )}
            </div>
          </div>

          {/* Shipping Address */}
          {order.shipping_address && (
            <div className="bg-charcoal rounded-lg border border-gold/20 p-6">
              <h2 className="text-xl font-semibold text-gold mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Shipping Address
              </h2>
              <div className="text-gray-300 space-y-1">
                <p>{order.shipping_address.firstName} {order.shipping_address.lastName}</p>
                <p>{order.shipping_address.streetAddress1}</p>
                {order.shipping_address.streetAddress2 && (
                  <p>{order.shipping_address.streetAddress2}</p>
                )}
                <p>
                  {order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.postalCode}
                </p>
                <p>{order.shipping_address.country}</p>
              </div>
            </div>
          )}

          {/* Payment Information */}
          <div className="bg-charcoal rounded-lg border border-gold/20 p-6">
            <h2 className="text-xl font-semibold text-gold mb-4 flex items-center gap-2">
              <Banknote className="w-5 h-5" />
              Payment
            </h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-400">Status:</span>
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
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
              <div className="flex justify-between">
                <span className="text-gray-400">Method:</span>
                <span className="text-gray-300">
                  Cash on Delivery (COD)
                </span>
              </div>
            </div>
          </div>

          {/* Order Timeline */}
          <div className="bg-charcoal rounded-lg border border-gold/20 p-6">
            <h2 className="text-xl font-semibold text-gold mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Timeline
            </h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Created:</span>
                <span className="text-gray-300">
                  {formatSafeDate(order.created_at, {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Updated:</span>
                <span className="text-gray-300">
                  {formatSafeDate(order.updated_at, {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
