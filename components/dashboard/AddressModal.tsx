'use client';

import { useState } from 'react';
import { X, Save, MapPin, User, Building, Phone, FileText } from 'lucide-react';
import { validateAddress } from '@/lib/validation/schemas';
import { api } from '@/lib/api/client';
import { useUserData } from '@/lib/context/UserDataContext';
import type { Address } from '@/types/firebase';

interface AddressModalProps {
  address?: Address | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddressModal({ address, onClose, onSuccess }: AddressModalProps) {
  const { addAddress, updateAddress, setDefaultAddress } = useUserData();
  const [formData, setFormData] = useState({
    type: address?.type || 'shipping',
    firstName: address?.first_name || '',
    lastName: address?.last_name || '',
    company: address?.company || '',
    streetAddress1: address?.address_line_1 || '',
    streetAddress2: address?.address_line_2 || '',
    city: address?.city || '',
    state: address?.state || 'Bagmati Province',
    postalCode: address?.postal_code || '',
    country: address?.country || 'Nepal',
    phone: address?.phone || '',
    deliveryInstructions: address?.delivery_instructions || '',
    isDefault: address?.is_default || false,
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear field error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const validation = validateAddress(formData);

    if (!validation.success) {
      const fieldErrors: Record<string, string> = {};
      validation.error.errors.forEach(err => {
        const field = err.path[0] as string;
        fieldErrors[field] = err.message;
      });
      setErrors(fieldErrors);
      return false;
    }

    setErrors({});
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      let result;
      if (address) {
        // Update existing address
        result = await api.put(`/api/user/addresses/${address.id}`, formData);

        // Update context immediately for real-time UI updates
        const updatedAddressData = {
          type: formData.type as 'shipping' | 'billing',
          first_name: formData.firstName,
          last_name: formData.lastName,
          company: formData.company || undefined,
          address_line_1: formData.streetAddress1,
          address_line_2: formData.streetAddress2 || undefined,
          city: formData.city,
          state: formData.state,
          postal_code: formData.postalCode || undefined,
          country: formData.country,
          phone: formData.phone || undefined,
          delivery_instructions: formData.deliveryInstructions || undefined,
          is_default: formData.isDefault,
        };
        updateAddress(address.id, updatedAddressData);

        // Handle default address change for updates
        if (formData.isDefault && !address.is_default) {
          setDefaultAddress(address.id);
        }
      } else {
        // Create new address
        result = await api.post('/api/user/addresses', formData);

        // Add to context immediately for real-time UI updates
        if (result.data) {
          addAddress(result.data);

          // Handle default address for new addresses
          if (formData.isDefault) {
            setDefaultAddress(result.data.id);
          }
        }
      }

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Address save error:', error);
      setErrors({ general: error instanceof Error ? error.message : 'Failed to save address' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-charcoal rounded-lg border border-gold/20 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gold/20">
          <h2 className="text-xl font-semibold text-gold">
            {address ? 'Edit Address' : 'Add New Address'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gold transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {errors.general && (
            <div className="bg-red-900/20 border border-red-500 rounded-lg p-4">
              <p className="text-red-400">{errors.general}</p>
            </div>
          )}

          {/* Address Type */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <MapPin className="w-4 h-4 inline mr-2" />
              Address Type
            </label>
            <select
              value={formData.type}
              onChange={(e) => handleInputChange('type', e.target.value)}
              className={`w-full px-4 py-2 bg-black border rounded-md text-white focus:outline-none focus:border-gold ${
                errors.type ? 'border-red-500' : 'border-gold/20'
              }`}
            >
              <option value="shipping">Shipping</option>
              <option value="billing">Billing</option>
            </select>
            {errors.type && <p className="text-red-400 text-sm mt-1">{errors.type}</p>}
          </div>

          {/* Name Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <User className="w-4 h-4 inline mr-2" />
                First Name *
              </label>
              <input
                type="text"
                required
                value={formData.firstName}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
                className={`w-full px-4 py-2 bg-black border rounded-md text-white placeholder-gray-400 focus:outline-none focus:border-gold ${
                  errors.firstName ? 'border-red-500' : 'border-gold/20'
                }`}
                placeholder="Enter first name"
              />
              {errors.firstName && <p className="text-red-400 text-sm mt-1">{errors.firstName}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Last Name *
              </label>
              <input
                type="text"
                required
                value={formData.lastName}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
                className={`w-full px-4 py-2 bg-black border rounded-md text-white placeholder-gray-400 focus:outline-none focus:border-gold ${
                  errors.lastName ? 'border-red-500' : 'border-gold/20'
                }`}
                placeholder="Enter last name"
              />
              {errors.lastName && <p className="text-red-400 text-sm mt-1">{errors.lastName}</p>}
            </div>
          </div>

          {/* Company */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <Building className="w-4 h-4 inline mr-2" />
              Company (Optional)
            </label>
            <input
              type="text"
              value={formData.company}
              onChange={(e) => handleInputChange('company', e.target.value)}
              className={`w-full px-4 py-2 bg-black border rounded-md text-white placeholder-gray-400 focus:outline-none focus:border-gold ${
                errors.company ? 'border-red-500' : 'border-gold/20'
              }`}
              placeholder="Enter company name"
            />
            {errors.company && <p className="text-red-400 text-sm mt-1">{errors.company}</p>}
          </div>

          {/* Street Address */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Street Address *
            </label>
            <input
              type="text"
              required
              value={formData.streetAddress1}
              onChange={(e) => handleInputChange('streetAddress1', e.target.value)}
              className={`w-full px-4 py-2 bg-black border rounded-md text-white placeholder-gray-400 focus:outline-none focus:border-gold ${
                errors.streetAddress1 ? 'border-red-500' : 'border-gold/20'
              }`}
              placeholder="Enter street address"
            />
            {errors.streetAddress1 && <p className="text-red-400 text-sm mt-1">{errors.streetAddress1}</p>}
          </div>

          {/* Apartment/Suite */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Apartment, Suite, etc. (Optional)
            </label>
            <input
              type="text"
              value={formData.streetAddress2}
              onChange={(e) => handleInputChange('streetAddress2', e.target.value)}
              className={`w-full px-4 py-2 bg-black border rounded-md text-white placeholder-gray-400 focus:outline-none focus:border-gold ${
                errors.streetAddress2 ? 'border-red-500' : 'border-gold/20'
              }`}
              placeholder="Apartment, suite, unit, building, floor, etc."
            />
            {errors.streetAddress2 && <p className="text-red-400 text-sm mt-1">{errors.streetAddress2}</p>}
          </div>

          {/* City and State */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                City *
              </label>
              <input
                type="text"
                required
                value={formData.city}
                onChange={(e) => handleInputChange('city', e.target.value)}
                className={`w-full px-4 py-2 bg-black border rounded-md text-white placeholder-gray-400 focus:outline-none focus:border-gold ${
                  errors.city ? 'border-red-500' : 'border-gold/20'
                }`}
                placeholder="Enter city"
              />
              {errors.city && <p className="text-red-400 text-sm mt-1">{errors.city}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                State/Province *
              </label>
              <input
                type="text"
                required
                value={formData.state}
                onChange={(e) => handleInputChange('state', e.target.value)}
                className={`w-full px-4 py-2 bg-black border rounded-md text-white placeholder-gray-400 focus:outline-none focus:border-gold ${
                  errors.state ? 'border-red-500' : 'border-gold/20'
                }`}
                placeholder="Enter state or province"
              />
              {errors.state && <p className="text-red-400 text-sm mt-1">{errors.state}</p>}
            </div>
          </div>

          {/* Postal Code and Phone */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Postal Code
              </label>
              <input
                type="text"
                value={formData.postalCode}
                onChange={(e) => handleInputChange('postalCode', e.target.value)}
                className={`w-full px-4 py-2 bg-black border rounded-md text-white placeholder-gray-400 focus:outline-none focus:border-gold ${
                  errors.postalCode ? 'border-red-500' : 'border-gold/20'
                }`}
                placeholder="Enter postal code"
              />
              {errors.postalCode && <p className="text-red-400 text-sm mt-1">{errors.postalCode}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <Phone className="w-4 h-4 inline mr-2" />
                Phone Number
              </label>
              <div className="flex">
                <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gold/20 bg-charcoal text-gray-300 text-sm">
                  +977
                </span>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className={`flex-1 px-4 py-2 bg-black border rounded-r-md text-white placeholder-gray-400 focus:outline-none focus:border-gold ${
                    errors.phone ? 'border-red-500' : 'border-gold/20'
                  }`}
                  placeholder="98XXXXXXXX"
                  maxLength={10}
                />
              </div>
              {errors.phone && <p className="text-red-400 text-sm mt-1">{errors.phone}</p>}
            </div>
          </div>

          {/* Delivery Instructions */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <FileText className="w-4 h-4 inline mr-2" />
              Delivery Instructions (Optional)
            </label>
            <textarea
              value={formData.deliveryInstructions}
              onChange={(e) => handleInputChange('deliveryInstructions', e.target.value)}
              rows={3}
              className={`w-full px-4 py-2 bg-black border rounded-md text-white placeholder-gray-400 focus:outline-none focus:border-gold resize-none ${
                errors.deliveryInstructions ? 'border-red-500' : 'border-gold/20'
              }`}
              placeholder="Special delivery instructions for COD orders..."
            />
            {errors.deliveryInstructions && <p className="text-red-400 text-sm mt-1">{errors.deliveryInstructions}</p>}
          </div>

          {/* Country */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Country *
            </label>
            <select
              value={formData.country}
              onChange={(e) => handleInputChange('country', e.target.value)}
              className={`w-full px-4 py-2 bg-black border rounded-md text-white focus:outline-none focus:border-gold ${
                errors.country ? 'border-red-500' : 'border-gold/20'
              }`}
            >
              <option value="Nepal">Nepal</option>
              <option value="India">India</option>
              <option value="China">China</option>
              <option value="Bangladesh">Bangladesh</option>
            </select>
            {errors.country && <p className="text-red-400 text-sm mt-1">{errors.country}</p>}
          </div>

          {/* Default Address */}
          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.isDefault}
                onChange={(e) => handleInputChange('isDefault', e.target.checked)}
                className="w-4 h-4 text-gold bg-black border-gold/20 rounded focus:ring-gold focus:ring-2"
              />
              <span className="ml-2 text-sm text-gray-300">Set as default address for COD deliveries</span>
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
              {loading ? 'Saving...' : address ? 'Update Address' : 'Add Address'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}