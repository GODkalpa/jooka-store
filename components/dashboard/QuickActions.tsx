import Link from 'next/link';
import { 
  ShoppingCart, 
  MapPin, 
  CreditCard, 
  User, 
  Package,
  Settings
} from 'lucide-react';

interface QuickActionsProps {
  cartItemCount: number;
  hasAddresses: boolean;
  hasPaymentMethods: boolean;
}

export default function QuickActions({ 
  cartItemCount, 
  hasAddresses, 
  hasPaymentMethods 
}: QuickActionsProps) {
  const actions = [
    {
      title: 'View Cart',
      description: `${cartItemCount} items in cart`,
      href: '/cart',
      icon: ShoppingCart,
      color: 'text-blue-400',
      bgColor: 'bg-blue-900/20',
      borderColor: 'border-blue-500/20',
    },
    {
      title: 'Manage Addresses',
      description: hasAddresses ? 'Update addresses' : 'Add first address',
      href: '/dashboard/addresses',
      icon: MapPin,
      color: 'text-green-400',
      bgColor: 'bg-green-900/20',
      borderColor: 'border-green-500/20',
    },
    {
      title: 'Payment Methods',
      description: hasPaymentMethods ? 'Manage cards' : 'Add payment method',
      href: '/dashboard/payments',
      icon: CreditCard,
      color: 'text-purple-400',
      bgColor: 'bg-purple-900/20',
      borderColor: 'border-purple-500/20',
    },
    {
      title: 'Update Profile',
      description: 'Edit personal info',
      href: '/dashboard/profile',
      icon: User,
      color: 'text-gold',
      bgColor: 'bg-gold/20',
      borderColor: 'border-gold/20',
    },
    {
      title: 'Browse Products',
      description: 'Discover new items',
      href: '/shop',
      icon: Package,
      color: 'text-orange-400',
      bgColor: 'bg-orange-900/20',
      borderColor: 'border-orange-500/20',
    },
    {
      title: 'Account Settings',
      description: 'Privacy & security',
      href: '/dashboard/settings',
      icon: Settings,
      color: 'text-gray-400',
      bgColor: 'bg-gray-900/20',
      borderColor: 'border-gray-500/20',
    },
  ];

  return (
    <div className="bg-charcoal rounded-lg border border-gold/20">
      <div className="px-6 py-4 border-b border-gold/20">
        <h3 className="text-lg font-semibold text-gold">Quick Actions</h3>
      </div>
      
      <div className="p-6">
        <div className="grid grid-cols-1 gap-3">
          {actions.map((action) => (
            <Link
              key={action.title}
              href={action.href}
              className={`flex items-center p-3 rounded-lg border ${action.bgColor} ${action.borderColor} hover:bg-opacity-80 transition-colors group`}
            >
              <div className={`p-2 rounded-md ${action.bgColor} mr-3`}>
                <action.icon className={`w-4 h-4 ${action.color}`} />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-medium text-white group-hover:text-gold transition-colors">
                  {action.title}
                </h4>
                <p className="text-xs text-gray-400">
                  {action.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}