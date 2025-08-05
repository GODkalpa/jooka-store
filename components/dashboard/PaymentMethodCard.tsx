import { Trash2, Star, CreditCard } from 'lucide-react';

interface PaymentMethod {
  id: string;
  type: 'card' | 'paypal' | 'bank_account';
  provider: string;
  last_four: string;
  brand: string;
  exp_month: number;
  exp_year: number;
  cardholder_name: string;
  is_default: boolean;
  created_at: string;
}

interface PaymentMethodCardProps {
  paymentMethod: PaymentMethod;
  onDelete: () => void;
  onSetDefault: () => void;
}

const brandColors = {
  visa: 'from-blue-600 to-blue-800',
  mastercard: 'from-red-600 to-orange-600',
  amex: 'from-green-600 to-teal-600',
  discover: 'from-orange-600 to-yellow-600',
  default: 'from-gray-600 to-gray-800',
};

const brandLogos = {
  visa: 'VISA',
  mastercard: 'MC',
  amex: 'AMEX',
  discover: 'DISC',
  default: 'CARD',
};

export default function PaymentMethodCard({ 
  paymentMethod, 
  onDelete, 
  onSetDefault 
}: PaymentMethodCardProps) {
  const brandKey = paymentMethod.brand.toLowerCase() as keyof typeof brandColors;
  const gradientClass = brandColors[brandKey] || brandColors.default;
  const brandLogo = brandLogos[brandKey] || brandLogos.default;

  return (
    <div className={`relative rounded-lg p-6 transition-all duration-300 ${
      paymentMethod.is_default 
        ? 'ring-2 ring-gold bg-gold/5' 
        : 'hover:scale-105'
    }`}>
      {/* Card Background */}
      <div className={`absolute inset-0 bg-gradient-to-br ${gradientClass} rounded-lg opacity-90`} />
      
      {/* Card Content */}
      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <CreditCard className="w-6 h-6 text-white mr-2" />
            <span className="text-white font-bold text-sm">{brandLogo}</span>
          </div>
          <div className="flex items-center space-x-2">
            {paymentMethod.is_default && (
              <Star className="w-4 h-4 text-yellow-400" fill="currentColor" />
            )}
            <button
              onClick={onDelete}
              className="text-white/70 hover:text-red-400 transition-colors"
              title="Remove payment method"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Card Number */}
        <div className="mb-4">
          <div className="text-white text-lg font-mono tracking-wider">
            •••• •••• •••• {paymentMethod.last_four}
          </div>
        </div>

        {/* Card Details */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-white/70 text-xs uppercase tracking-wide">
              Cardholder
            </div>
            <div className="text-white text-sm font-medium">
              {paymentMethod.cardholder_name}
            </div>
          </div>
          <div>
            <div className="text-white/70 text-xs uppercase tracking-wide">
              Expires
            </div>
            <div className="text-white text-sm font-medium">
              {String(paymentMethod.exp_month).padStart(2, '0')}/{paymentMethod.exp_year.toString().slice(-2)}
            </div>
          </div>
        </div>

        {/* Actions */}
        {!paymentMethod.is_default && (
          <div className="pt-4 border-t border-white/20">
            <button
              onClick={onSetDefault}
              className="text-sm text-white hover:text-yellow-400 transition-colors"
            >
              Set as Default
            </button>
          </div>
        )}
        
        {paymentMethod.is_default && (
          <div className="pt-4 border-t border-white/20">
            <span className="text-sm text-yellow-400 font-medium">Default Payment Method</span>
          </div>
        )}
      </div>
    </div>
  );
}