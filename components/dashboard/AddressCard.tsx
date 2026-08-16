import { Edit, Trash2, Home, Building } from 'lucide-react';
import type { Address } from '@/types/firebase';

interface AddressCardProps {
  address: Address;
  onEdit: () => void;
  onDelete: () => void;
  onSetDefault: () => void;
}

export default function AddressCard({ address, onEdit, onDelete, onSetDefault }: AddressCardProps) {
  const isDefault = address.is_default;
  const isOffice = address.type === 'billing';

  return (
    <div 
      className={`bg-white rounded-lg p-5 flex flex-col h-full transition-all duration-200 hover:shadow-md ${
        isDefault ? 'border border-gray-900 ring-1 ring-gray-900' : 'border border-gray-100'
      }`}
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2">
          {isOffice ? (
            <Building className="w-4 h-4 text-gray-500" />
          ) : (
            <Home className="w-4 h-4 text-gray-500" />
          )}
          <span className="text-sm font-semibold text-gray-900 capitalize">
            {address.type || 'Home'}
          </span>
          {isDefault && (
            <span className="bg-gray-900 text-white text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-sm ml-2">
              Default
            </span>
          )}
        </div>
        <div className="flex gap-2">
          <button 
            onClick={onEdit}
            className="text-gray-400 hover:text-gray-900 transition-colors p-1"
            title="Edit address"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button 
            onClick={onDelete}
            className="text-gray-400 hover:text-red-600 transition-colors p-1"
            title="Delete address"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex-1">
        <p className="text-sm font-semibold text-gray-900 mb-1">{address.first_name} {address.last_name}</p>
        {address.phone && <p className="text-sm text-gray-600 mb-1">{address.phone}</p>}
        <p className="text-sm text-gray-600 line-clamp-3">
          {address.address_line_1 || (address as any).street_address_1}, {address.city}, {address.state} {address.postal_code}
        </p>
      </div>

      {!isDefault && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <button 
            onClick={onSetDefault}
            className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
          >
            Set as default
          </button>
        </div>
      )}
    </div>
  );
}