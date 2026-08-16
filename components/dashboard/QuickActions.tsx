import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

interface QuickActionsProps {
  cartItemCount: number;
  hasAddresses?: boolean;
  hasPaymentMethods?: boolean;
}

export default function QuickActions({ cartItemCount }: QuickActionsProps) {
  const links = [
    {
      label: 'Shopping bag',
      count: cartItemCount > 0 ? cartItemCount : null,
      href: '/cart',
    },
    { label: 'Edit profile', href: '/dashboard/profile' },
    { label: 'Account settings', href: '/dashboard/settings' },
  ];

  return (
    <section>
      <h3 className="text-sm font-semibold text-gray-900 mb-3">Quick links</h3>
      <div className="bg-white rounded-lg border border-gray-100 divide-y divide-gray-100 overflow-hidden">
        {links.map((link) => (
          <Link
            key={link.label}
            href={link.href}
            className="flex items-center justify-between px-4 py-3 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50/60 transition-colors"
          >
            <span>{link.label}</span>
            <div className="flex items-center gap-2">
              {link.count && (
                <span className="bg-[#C8102E] text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                  {link.count}
                </span>
              )}
              <ChevronRight className="w-4 h-4 text-gray-300" />
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}