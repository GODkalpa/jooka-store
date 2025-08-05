'use client';

import { useState } from 'react';
import { X, Save, CreditCard, Lock } from 'lucide-react';

interface PaymentMethodModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function PaymentMethodModal({ onClose, onSuccess }: PaymentMethodModalProps) {
  const [formData, setFormData] = useState({
    cardholder_name: '',
    card_number: '',
    exp_month: '',
    exp_year: '',
    cvv: '',
    is_default: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // In a real implementation, you would use a payment processor like Stripe
      // This is a simplified example
      const response = await fetch('/api/user/payment-methods', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'card',
          cardholder_name: formData.cardholder_name,
          card_number: formData.card_number,
          exp_month: parseInt(formData.exp_month),
          exp_year: parseInt(formData.exp_year),
          cvv: formData.cvv,
          is_default: formData.is_default,
        }),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || 'Failed to add payment method');
      }

      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const formatCardNumber = (value: string) => {
    // Remove all non-digits
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    // Add spaces every 4 digits
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCardNumber(e.target.value);
    if (formatted.replace(/\s/g, '').length <= 16) {
      setFormData(prev => ({ ...prev, card_number: formatted }));
    }
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 20 }, (_, i) => currentYear + i);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-charcoal rounded-lg border border-gold/20 w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gold/20">
          <h2 className="text-xl font-semibold text-gold">Add Payment Method</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gold transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Security Notice */}
        <div className="p-6 border-b border-gold/20">
          <div className="flex items-center text-sm text-gray-400">
            <Lock className="w-4 h-4 mr-2" />
            <span>Your payment information is encrypted and secure</span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-900/20 border border-red-500 rounded-lg p-4">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Cardholder Name */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Cardholder Name *
            </label>
            <input
              type="text"
              required
              value={formData.cardholder_name}
              onChange={(e) => setFormData(prev => ({ ...prev, cardholder_name: e.target.value }))}
              className="w-full px-4 py-2 bg-black border border-gold/20 rounded-md text-white placeholder-gray-400 focus:outline-none focus:border-gold"
              placeholder="Enter name as it appears on card"
            />
          </div>

          {/* Card Number */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Card Number *
            </label>
            <div className="relative">
              <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                required
                value={formData.card_number}
                onChange={handleCardNumberChange}
                className="w-full pl-10 pr-4 py-2 bg-black border border-gold/20 rounded-md text-white placeholder-gray-400 focus:outline-none focus:border-gold font-mono"
                placeholder="1234 5678 9012 3456"
                maxLength={19}
              />
            </div>
          </div>

          {/* Expiry and CVV */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Month *
              </label>
              <select
                required
                value={formData.exp_month}
                onChange={(e) => setFormData(prev => ({ ...prev, exp_month: e.target.value }))}
                className="w-full px-3 py-2 bg-black border border-gold/20 rounded-md text-white focus:outline-none focus:border-gold"
              >
                <option value="">MM</option>
                {months.map(month => (
                  <option key={month} value={month}>
                    {String(month).padStart(2, '0')}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Year *
              </label>
              <select
                required
                value={formData.exp_year}
                onChange={(e) => setFormData(prev => ({ ...prev, exp_year: e.target.value }))}
                className="w-full px-3 py-2 bg-black border border-gold/20 rounded-md text-white focus:outline-none focus:border-gold"
              >
                <option value="">YYYY</option>
                {years.map(year => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                CVV *
              </label>
              <input
                type="text"
                required
                value={formData.cvv}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '');
                  if (value.length <= 4) {
                    setFormData(prev => ({ ...prev, cvv: value }));
                  }
                }}
                className="w-full px-3 py-2 bg-black border border-gold/20 rounded-md text-white placeholder-gray-400 focus:outline-none focus:border-gold font-mono"
                placeholder="123"
                maxLength={4}
              />
            </div>
          </div>

          {/* Default Payment Method */}
          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.is_default}
                onChange={(e) => setFormData(prev => ({ ...prev, is_default: e.target.checked }))}
                className="w-4 h-4 text-gold bg-black border-gold/20 rounded focus:ring-gold focus:ring-2"
              />
              <span className="ml-2 text-sm text-gray-300">Set as default payment method</span>
            </label>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gold/20">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 text-gray-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary flex items-center"
            >
              <Save className="w-4 h-4 mr-2" />
              {loading ? 'Adding...' : 'Add Payment Method'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}