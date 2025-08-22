'use client';

import { useEffect, useState } from 'react';
import { Save, Globe, DollarSign, Truck, Bell, Shield, Store, Mail, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/lib/auth/firebase-auth';

interface AdminSettings {
  // Store Configuration
  store_name: string;
  store_description: string;
  store_email: string;
  store_phone: string;
  store_address: {
    street: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
  };
  
  // Tax & Currency Settings
  default_currency: string;
  tax_rate: number;
  tax_included_in_prices: boolean;
  
  // Shipping Configuration
  free_shipping_threshold: number;
  default_shipping_rate: number;
  shipping_zones: string[];
  
  // Notification Settings
  admin_email_notifications: boolean;
  customer_email_notifications: boolean;
  low_stock_threshold: number;
  notify_low_stock: boolean;
  order_notification_emails: string[];
  
  // Security & Privacy
  require_email_verification: boolean;
  allow_guest_checkout: boolean;
  session_timeout: number;
  
  // Display Settings
  products_per_page: number;
  featured_products_count: number;
  show_out_of_stock: boolean;
  inventory_tracking: boolean;
}

export default function AdminSettings() {
  const { user, firebaseUser } = useAuth();
  const [settings, setSettings] = useState<AdminSettings>({
    store_name: 'JOOKA E-commerce',
    store_description: 'Modern e-commerce platform for Nepal',
    store_email: '',
    store_phone: '',
    store_address: {
      street: '',
      city: 'Kathmandu',
      state: 'Bagmati',
      postal_code: '44600',
      country: 'Nepal',
    },
    default_currency: 'NPR',
    tax_rate: 0.13,
    tax_included_in_prices: false,
    free_shipping_threshold: 5000,
    default_shipping_rate: 150,
    shipping_zones: ['Nepal'],
    admin_email_notifications: true,
    customer_email_notifications: true,
    low_stock_threshold: 10,
    notify_low_stock: true,
    order_notification_emails: [],
    require_email_verification: true,
    allow_guest_checkout: false,
    session_timeout: 3600,
    products_per_page: 12,
    featured_products_count: 8,
    show_out_of_stock: true,
    inventory_tracking: true,
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [newNotificationEmail, setNewNotificationEmail] = useState('');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      if (!user || !firebaseUser) return;

      const token = await firebaseUser.getIdToken();
      const response = await fetch('/api/admin/settings', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const result = await response.json();
        if (result.data) {
          setSettings(prevSettings => ({
            ...prevSettings,
            ...result.data
          }));
        }
      }
    } catch (err) {
      console.error('Failed to fetch settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      if (!user || !firebaseUser) return;

      const token = await firebaseUser.getIdToken();
      const response = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || 'Failed to update settings');
      }

      setSuccess('Settings updated successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setSaving(false);
    }
  };

  const addNotificationEmail = () => {
    if (newNotificationEmail && !settings.order_notification_emails.includes(newNotificationEmail)) {
      setSettings(prev => ({
        ...prev,
        order_notification_emails: [...prev.order_notification_emails, newNotificationEmail]
      }));
      setNewNotificationEmail('');
    }
  };

  const removeNotificationEmail = (email: string) => {
    setSettings(prev => ({
      ...prev,
      order_notification_emails: prev.order_notification_emails.filter(e => e !== email)
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gold mb-2">Admin Settings</h1>
        <p className="text-gray-400">Configure your store settings and preferences.</p>
      </div>

      {/* Status Messages */}
      {error && (
        <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4 flex items-start">
          <AlertTriangle className="w-5 h-5 text-red-400 mr-2 mt-0.5 flex-shrink-0" />
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {success && (
        <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4 flex items-start">
          <div className="w-5 h-5 text-green-400 mr-2 mt-0.5 flex-shrink-0">✓</div>
          <p className="text-green-400 text-sm">{success}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Store Configuration */}
        <div className="bg-charcoal/50 border border-gold/20 rounded-lg p-6">
          <div className="flex items-center mb-6">
            <Store className="w-5 h-5 text-gold mr-2" />
            <h3 className="text-lg font-semibold text-gold">Store Configuration</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm text-gray-300 mb-2">Store Name</label>
              <input
                type="text"
                value={settings.store_name}
                onChange={(e) => setSettings(prev => ({ ...prev, store_name: e.target.value }))}
                className="w-full px-3 py-2 bg-black border border-gold/20 rounded-md text-white focus:outline-none focus:border-gold"
                required
              />
            </div>

            <div>
              <label className="block text-sm text-gray-300 mb-2">Store Email</label>
              <input
                type="email"
                value={settings.store_email}
                onChange={(e) => setSettings(prev => ({ ...prev, store_email: e.target.value }))}
                className="w-full px-3 py-2 bg-black border border-gold/20 rounded-md text-white focus:outline-none focus:border-gold"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm text-gray-300 mb-2">Store Description</label>
              <textarea
                value={settings.store_description}
                onChange={(e) => setSettings(prev => ({ ...prev, store_description: e.target.value }))}
                className="w-full px-3 py-2 bg-black border border-gold/20 rounded-md text-white focus:outline-none focus:border-gold"
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm text-gray-300 mb-2">Store Phone</label>
              <input
                type="tel"
                value={settings.store_phone}
                onChange={(e) => setSettings(prev => ({ ...prev, store_phone: e.target.value }))}
                className="w-full px-3 py-2 bg-black border border-gold/20 rounded-md text-white focus:outline-none focus:border-gold"
                placeholder="+977 98xxxxxxxx"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-300 mb-2">Street Address</label>
              <input
                type="text"
                value={settings.store_address.street}
                onChange={(e) => setSettings(prev => ({ 
                  ...prev, 
                  store_address: { ...prev.store_address, street: e.target.value }
                }))}
                className="w-full px-3 py-2 bg-black border border-gold/20 rounded-md text-white focus:outline-none focus:border-gold"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-300 mb-2">City</label>
              <input
                type="text"
                value={settings.store_address.city}
                onChange={(e) => setSettings(prev => ({ 
                  ...prev, 
                  store_address: { ...prev.store_address, city: e.target.value }
                }))}
                className="w-full px-3 py-2 bg-black border border-gold/20 rounded-md text-white focus:outline-none focus:border-gold"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-300 mb-2">State/Province</label>
              <input
                type="text"
                value={settings.store_address.state}
                onChange={(e) => setSettings(prev => ({ 
                  ...prev, 
                  store_address: { ...prev.store_address, state: e.target.value }
                }))}
                className="w-full px-3 py-2 bg-black border border-gold/20 rounded-md text-white focus:outline-none focus:border-gold"
              />
            </div>
          </div>
        </div>

        {/* Tax & Currency Settings */}
        <div className="bg-charcoal/50 border border-gold/20 rounded-lg p-6">
          <div className="flex items-center mb-6">
            <DollarSign className="w-5 h-5 text-gold mr-2" />
            <h3 className="text-lg font-semibold text-gold">Tax & Currency Settings</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm text-gray-300 mb-2">Default Currency</label>
              <select
                value={settings.default_currency}
                onChange={(e) => setSettings(prev => ({ ...prev, default_currency: e.target.value }))}
                className="w-full px-3 py-2 bg-black border border-gold/20 rounded-md text-white focus:outline-none focus:border-gold"
              >
                <option value="NPR">NPR (Nepalese Rupee)</option>
                <option value="USD">USD (US Dollar)</option>
                <option value="EUR">EUR (Euro)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-gray-300 mb-2">Tax Rate (%)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="100"
                value={settings.tax_rate * 100}
                onChange={(e) => setSettings(prev => ({ ...prev, tax_rate: parseFloat(e.target.value) / 100 }))}
                className="w-full px-3 py-2 bg-black border border-gold/20 rounded-md text-white focus:outline-none focus:border-gold"
              />
            </div>

            <div className="md:col-span-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={settings.tax_included_in_prices}
                  onChange={(e) => setSettings(prev => ({ ...prev, tax_included_in_prices: e.target.checked }))}
                  className="w-4 h-4 text-gold bg-black border-gold/20 rounded focus:ring-gold focus:ring-2 mr-3"
                />
                <span className="text-sm text-gray-300">Tax included in product prices</span>
              </label>
            </div>
          </div>
        </div>

        {/* Shipping Configuration */}
        <div className="bg-charcoal/50 border border-gold/20 rounded-lg p-6">
          <div className="flex items-center mb-6">
            <Truck className="w-5 h-5 text-gold mr-2" />
            <h3 className="text-lg font-semibold text-gold">Shipping Configuration</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm text-gray-300 mb-2">Free Shipping Threshold (₨)</label>
              <input
                type="number"
                min="0"
                value={settings.free_shipping_threshold}
                onChange={(e) => setSettings(prev => ({ ...prev, free_shipping_threshold: parseInt(e.target.value) || 0 }))}
                className="w-full px-3 py-2 bg-black border border-gold/20 rounded-md text-white focus:outline-none focus:border-gold"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-300 mb-2">Default Shipping Rate (₨)</label>
              <input
                type="number"
                min="0"
                value={settings.default_shipping_rate}
                onChange={(e) => setSettings(prev => ({ ...prev, default_shipping_rate: parseInt(e.target.value) || 0 }))}
                className="w-full px-3 py-2 bg-black border border-gold/20 rounded-md text-white focus:outline-none focus:border-gold"
              />
            </div>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="bg-charcoal/50 border border-gold/20 rounded-lg p-6">
          <div className="flex items-center mb-6">
            <Bell className="w-5 h-5 text-gold mr-2" />
            <h3 className="text-lg font-semibold text-gold">Notification Settings</h3>
          </div>
          
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={settings.admin_email_notifications}
                  onChange={(e) => setSettings(prev => ({ ...prev, admin_email_notifications: e.target.checked }))}
                  className="w-4 h-4 text-gold bg-black border-gold/20 rounded focus:ring-gold focus:ring-2 mr-3"
                />
                <span className="text-sm text-gray-300">Admin email notifications</span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={settings.customer_email_notifications}
                  onChange={(e) => setSettings(prev => ({ ...prev, customer_email_notifications: e.target.checked }))}
                  className="w-4 h-4 text-gold bg-black border-gold/20 rounded focus:ring-gold focus:ring-2 mr-3"
                />
                <span className="text-sm text-gray-300">Customer email notifications</span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={settings.notify_low_stock}
                  onChange={(e) => setSettings(prev => ({ ...prev, notify_low_stock: e.target.checked }))}
                  className="w-4 h-4 text-gold bg-black border-gold/20 rounded focus:ring-gold focus:ring-2 mr-3"
                />
                <span className="text-sm text-gray-300">Notify on low stock</span>
              </label>

              <div>
                <label className="block text-sm text-gray-300 mb-2">Low Stock Threshold</label>
                <input
                  type="number"
                  min="0"
                  value={settings.low_stock_threshold}
                  onChange={(e) => setSettings(prev => ({ ...prev, low_stock_threshold: parseInt(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 bg-black border border-gold/20 rounded-md text-white focus:outline-none focus:border-gold"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-300 mb-2">Order Notification Emails</label>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <input
                    type="email"
                    value={newNotificationEmail}
                    onChange={(e) => setNewNotificationEmail(e.target.value)}
                    placeholder="Enter email address"
                    className="flex-1 px-3 py-2 bg-black border border-gold/20 rounded-md text-white focus:outline-none focus:border-gold"
                  />
                  <button
                    type="button"
                    onClick={addNotificationEmail}
                    className="px-4 py-2 bg-gold text-black rounded-md hover:bg-gold/90 transition-colors"
                  >
                    Add
                  </button>
                </div>
                <div className="space-y-1">
                  {settings.order_notification_emails.map((email, index) => (
                    <div key={index} className="flex items-center justify-between bg-black/30 px-3 py-2 rounded-md">
                      <span className="text-sm text-gray-300">{email}</span>
                      <button
                        type="button"
                        onClick={() => removeNotificationEmail(email)}
                        className="text-red-400 hover:text-red-300 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Security & Privacy */}
        <div className="bg-charcoal/50 border border-gold/20 rounded-lg p-6">
          <div className="flex items-center mb-6">
            <Shield className="w-5 h-5 text-gold mr-2" />
            <h3 className="text-lg font-semibold text-gold">Security & Privacy</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={settings.require_email_verification}
                onChange={(e) => setSettings(prev => ({ ...prev, require_email_verification: e.target.checked }))}
                className="w-4 h-4 text-gold bg-black border-gold/20 rounded focus:ring-gold focus:ring-2 mr-3"
              />
              <span className="text-sm text-gray-300">Require email verification</span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={settings.allow_guest_checkout}
                onChange={(e) => setSettings(prev => ({ ...prev, allow_guest_checkout: e.target.checked }))}
                className="w-4 h-4 text-gold bg-black border-gold/20 rounded focus:ring-gold focus:ring-2 mr-3"
              />
              <span className="text-sm text-gray-300">Allow guest checkout</span>
            </label>

            <div>
              <label className="block text-sm text-gray-300 mb-2">Session Timeout (seconds)</label>
              <input
                type="number"
                min="300"
                value={settings.session_timeout}
                onChange={(e) => setSettings(prev => ({ ...prev, session_timeout: parseInt(e.target.value) || 3600 }))}
                className="w-full px-3 py-2 bg-black border border-gold/20 rounded-md text-white focus:outline-none focus:border-gold"
              />
            </div>
          </div>
        </div>

        {/* Display Settings */}
        <div className="bg-charcoal/50 border border-gold/20 rounded-lg p-6">
          <div className="flex items-center mb-6">
            <Globe className="w-5 h-5 text-gold mr-2" />
            <h3 className="text-lg font-semibold text-gold">Display Settings</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm text-gray-300 mb-2">Products per Page</label>
              <input
                type="number"
                min="6"
                max="50"
                value={settings.products_per_page}
                onChange={(e) => setSettings(prev => ({ ...prev, products_per_page: parseInt(e.target.value) || 12 }))}
                className="w-full px-3 py-2 bg-black border border-gold/20 rounded-md text-white focus:outline-none focus:border-gold"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-300 mb-2">Featured Products Count</label>
              <input
                type="number"
                min="4"
                max="20"
                value={settings.featured_products_count}
                onChange={(e) => setSettings(prev => ({ ...prev, featured_products_count: parseInt(e.target.value) || 8 }))}
                className="w-full px-3 py-2 bg-black border border-gold/20 rounded-md text-white focus:outline-none focus:border-gold"
              />
            </div>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={settings.show_out_of_stock}
                onChange={(e) => setSettings(prev => ({ ...prev, show_out_of_stock: e.target.checked }))}
                className="w-4 h-4 text-gold bg-black border-gold/20 rounded focus:ring-gold focus:ring-2 mr-3"
              />
              <span className="text-sm text-gray-300">Show out of stock products</span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={settings.inventory_tracking}
                onChange={(e) => setSettings(prev => ({ ...prev, inventory_tracking: e.target.checked }))}
                className="w-4 h-4 text-gold bg-black border-gold/20 rounded focus:ring-gold focus:ring-2 mr-3"
              />
              <span className="text-sm text-gray-300">Enable inventory tracking</span>
            </label>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center px-6 py-3 bg-gold text-black rounded-lg font-medium hover:bg-gold/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Save className="w-5 h-5 mr-2" />
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </form>
    </div>
  );
}