import { Edit, Trash2, Star, Home, Building, MapPin } from 'lucide-react';
import type { Address } from '@/types/firebase';

interface AddressCardProps {
  address: Address;
  onEdit: () => void;
  onDelete: () => void;
  onSetDefault: () => void;
}

const typeIcons = {
  shipping: Home,
  billing: Building,
};

const typeColors = {
  shipping: 'text-blue-400',
  billing: 'text-purple-400',
};

export default function AddressCard({ 
  address, 
  onEdit, 
  onDelete, 
  onSetDefault 
}: AddressCardProps) {
  const TypeIcon = typeIcons[address.type];

  return (
    <div className={`bg-charcoal rounded-lg border p-6 transition-colors ${
      address.is_default 
        ? 'border-gold bg-gold/5' 
        : 'border-gold/20 hover:border-gold/40'
    }`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <TypeIcon className={`w-5 h-5 mr-2 ${typeColors[address.type]}`} />
          <span className="text-sm font-medium text-white capitalize">
            {address.type}
          </span>
          {address.is_default && (
            <Star className="w-4 h-4 ml-2 text-gold" fill="currentColor" />
          )}
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={onEdit}
            className="text-gray-400 hover:text-gold transition-colors"
            title="Edit address"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={onDelete}
            className="text-gray-400 hover:text-red-400 transition-colors"
            title="Delete address"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Address Details */}
      <div className="space-y-2 mb-4">
        <div className="text-white font-medium">
          {address.first_name} {address.last_name}
        </div>
        
        {address.company && (
          <div className="text-gray-300 text-sm">
            {address.company}
          </div>
        )}
        
        <div className="text-gray-300 text-sm">
          {address.address_line_1}
          {address.address_line_2 && (
            <div>{address.address_line_2}</div>
          )}
        </div>
        
        <div className="text-gray-300 text-sm">
          {address.city}, {address.state} {address.postal_code}
        </div>
        
        <div className="text-gray-300 text-sm">
          {address.country}
        </div>
        
        {address.phone && (
          <div className="text-gray-300 text-sm">
            {address.phone}
          </div>
        )}
      </div>

      {/* Actions */}
      {!address.is_default && (
        <div className="pt-4 border-t border-gold/20">
          <button
            onClick={onSetDefault}
            className="text-sm text-gold hover:text-gold/80 transition-colors"
          >
            Set as Default
          </button>
        </div>
      )}
      
      {address.is_default && (
        <div className="pt-4 border-t border-gold/20">
          <span className="text-sm text-gold">Default Address</span>
        </div>
      )}
    </div>
  );
}