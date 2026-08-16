'use client';

import { useState } from 'react';
import { Plus, MapPin } from 'lucide-react';
import AddressCard from '@/components/dashboard/AddressCard';
import AddressModal from '@/components/dashboard/AddressModal';
import { useAddresses } from '@/lib/context/UserDataContext';
import { useAuth } from '@/lib/auth/firebase-auth';
import type { Address } from '@/types/firebase';
import { api } from '@/lib/api/client';

export default function AddressesPage() {
  const { user } = useAuth();
  const { addresses, loading, refreshAddresses } = useAddresses();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);

  const handleEdit = (address: Address) => {
    setEditingAddress(address);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setEditingAddress(null);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this address?')) return;
    try {
      await api.delete(`/api/user/addresses/${id}`);
      refreshAddresses();
    } catch (err) {
      console.error('Failed to delete address', err);
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      await api.put(`/api/user/addresses/${id}`, { isDefault: true });
      refreshAddresses();
    } catch (err) {
      console.error('Failed to set default address', err);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="flex justify-between items-center mb-8">
          <div className="h-8 bg-gray-200 rounded w-32"></div>
          <div className="h-10 bg-gray-200 rounded w-32"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
             <div key={i} className="h-40 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Addresses</h1>
        <button onClick={handleAdd} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add address
        </button>
      </div>

      {!addresses || addresses.length === 0 ? (
        <div className="border border-dashed border-gray-300 rounded-lg p-12 flex flex-col items-center justify-center text-center">
          <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-4">
            <MapPin className="w-6 h-6 text-gray-400" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-1">No addresses saved</h3>
          <p className="text-sm text-gray-500 mb-6">Add an address so we can deliver your orders quickly.</p>
          <button onClick={handleAdd} className="btn-primary">
            Add your first address
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {addresses.map((address) => (
            <AddressCard
              key={address.id}
              address={address as unknown as Address}
              onEdit={() => handleEdit(address as unknown as Address)}
              onDelete={() => handleDelete(address.id)}
              onSetDefault={() => handleSetDefault(address.id)}
            />
          ))}
        </div>
      )}

      {isModalOpen && (
        <AddressModal
          address={editingAddress}
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => {
            setIsModalOpen(false);
            refreshAddresses();
          }}
        />
      )}
    </div>
  );
}