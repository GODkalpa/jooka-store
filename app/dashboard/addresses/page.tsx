'use client';

import { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, MapPin, Home, Building } from 'lucide-react';
import AddressCard from '@/components/dashboard/AddressCard';
import AddressModal from '@/components/dashboard/AddressModal';
import { useAddresses } from '@/lib/context/UserDataContext';
import { useAuth } from '@/lib/auth/firebase-auth';
import type { Address } from '@/types/firebase';

export default function CustomerAddresses() {
  const { user, firebaseUser } = useAuth();
  const { addresses, loading, error, removeAddress, setDefaultAddress, refreshAddresses } = useAddresses();
  const [showModal, setShowModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);

  // No need for useEffect or fetchAddresses - context handles this

  const handleEdit = (address: Address) => {
    setEditingAddress(address);
    setShowModal(true);
  };

  const handleDelete = async (addressId: string) => {
    if (!confirm('Are you sure you want to delete this address?')) return;

    try {
      if (!firebaseUser) return;

      const token = await firebaseUser.getIdToken();
      const response = await fetch(`/api/user/addresses/${addressId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        removeAddress(addressId);
        alert('Address deleted successfully!');
      } else {
        const result = await response.json();
        alert(`Failed to delete address: ${result.error}`);
      }
    } catch (error) {
      console.error('Failed to delete address:', error);
      alert('Failed to delete address. Please try again.');
    }
  };

  const handleSetDefault = async (addressId: string) => {
    try {
      if (!firebaseUser) return;

      const token = await firebaseUser.getIdToken();
      const response = await fetch(`/api/user/addresses/${addressId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ is_default: true }),
      });

      if (response.ok) {
        setDefaultAddress(addressId);
        alert('Default address updated successfully!');
      } else {
        const result = await response.json();
        alert(`Failed to set default address: ${result.error}`);
      }
    } catch (error) {
      console.error('Failed to set default address:', error);
      alert('Failed to set default address. Please try again.');
    }
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
      <div className="bg-red-900/20 border border-red-500 rounded-lg p-4">
        <p className="text-red-400">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gold">Shipping Addresses</h1>
          <p className="text-gray-400 mt-1">Manage your delivery addresses</p>
        </div>
        <button 
          onClick={() => {
            setEditingAddress(null);
            setShowModal(true);
          }}
          className="btn-primary flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Address
        </button>
      </div>

      {/* Addresses Grid */}
      {addresses.length === 0 ? (
        <div className="bg-charcoal rounded-lg border border-gold/20 p-12 text-center">
          <MapPin className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">No addresses saved</h3>
          <p className="text-gray-400 mb-6">
            Add your first shipping address to make checkout faster
          </p>
          <button 
            onClick={() => {
              setEditingAddress(null);
              setShowModal(true);
            }}
            className="btn-primary"
          >
            Add Your First Address
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {addresses.map((address) => (
            <AddressCard
              key={address.id}
              address={address}
              onEdit={() => handleEdit(address)}
              onDelete={() => handleDelete(address.id)}
              onSetDefault={() => handleSetDefault(address.id)}
            />
          ))}
        </div>
      )}

      {/* Address Modal */}
      {showModal && (
        <AddressModal
          address={editingAddress}
          onClose={() => {
            setShowModal(false);
            setEditingAddress(null);
          }}
          onSuccess={() => {
            setShowModal(false);
            setEditingAddress(null);
            refreshAddresses();
          }}
        />
      )}
    </div>
  );
}