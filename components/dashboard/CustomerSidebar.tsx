'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth/firebase-auth';
import JookaLogo from '@/components/JookaLogo';
import {
  LayoutDashboard,
  ShoppingBag,
  User,
  MapPin,
  CreditCard,
  Settings,
  LogOut,
  ArrowLeft,
  X,
} from 'lucide-react';

const navigation = [
  { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Orders', href: '/dashboard/orders', icon: ShoppingBag },
  { name: 'Profile', href: '/dashboard/profile', icon: User },
  { name: 'Addresses', href: '/dashboard/addresses', icon: MapPin },
  { name: 'Payments', href: '/dashboard/payments', icon: CreditCard },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
];

interface CustomerSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function CustomerSidebar({ isOpen = true, onClose }: CustomerSidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const handleLinkClick = () => {
    if (onClose) onClose();
  };

  const userInitial = user?.profile?.first_name
    ? user.profile.first_name.charAt(0)
    : (user?.email?.charAt(0) || 'U');

  const userName = user?.profile?.full_name
    || user?.profile?.first_name
    || user?.email?.split('@')[0]
    || 'Customer';

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-gray-100">
        <JookaLogo size="sm" />
      </div>

      {/* Back link */}
      <div className="px-5 pt-5 pb-1">
        <Link
          href="/"
          onClick={handleLinkClick}
          className="inline-flex items-center gap-2 text-xs font-medium text-gray-400 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to store
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {navigation.map((item) => {
          const isActive =
            item.href === '/dashboard'
              ? pathname === '/dashboard'
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={handleLinkClick}
              className={`relative flex items-center gap-3 px-3 py-2.5 text-sm rounded-md transition-colors duration-150 ${
                isActive
                  ? 'text-gray-900 font-semibold bg-gray-100'
                  : 'text-gray-500 font-medium hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              {isActive && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-4 bg-[#C8102E] rounded-r-full" />
              )}
              <item.icon
                className={`w-[18px] h-[18px] flex-shrink-0 ${isActive ? 'text-gray-700' : 'text-gray-400'}`}
                strokeWidth={1.75}
              />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* User + logout */}
      <div className="px-4 py-4 border-t border-gray-100 space-y-3">
        <div className="flex items-center gap-3 px-2">
          <div className="w-8 h-8 bg-[#111827] text-white rounded-full flex items-center justify-center text-xs font-bold uppercase flex-shrink-0">
            {userInitial}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-gray-900 truncate">{userName}</p>
            <p className="text-xs text-gray-400 truncate">{user?.email}</p>
          </div>
        </div>

        <button
          onClick={async () => {
            await logout();
            window.location.href = '/';
          }}
          className="flex items-center gap-2 w-full px-3 py-2 text-xs font-medium text-gray-400 hover:text-red-600 hover:bg-red-50/60 rounded-md transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Sign out
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-50 lg:w-[260px] lg:flex lg:flex-col bg-white border-r border-gray-200">
        {sidebarContent}
      </aside>

      {/* Mobile drawer */}
      <div
        className={`lg:hidden fixed inset-y-0 left-0 z-50 w-[280px] bg-white border-r border-gray-200 shadow-xl transform transition-transform duration-200 ease-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="px-5 py-4 flex items-center justify-between border-b border-gray-100">
            <JookaLogo size="sm" />
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-900 p-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <nav className="flex-1 px-3 py-4 space-y-0.5">
            {navigation.map((item) => {
              const isActive =
                item.href === '/dashboard'
                  ? pathname === '/dashboard'
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={handleLinkClick}
                  className={`relative flex items-center gap-3 px-3 py-2.5 text-sm rounded-md transition-colors ${
                    isActive
                      ? 'text-gray-900 font-semibold bg-gray-100'
                      : 'text-gray-500 font-medium hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  {isActive && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-4 bg-[#C8102E] rounded-r-full" />
                  )}
                  <item.icon
                    className={`w-[18px] h-[18px] flex-shrink-0 ${isActive ? 'text-gray-700' : 'text-gray-400'}`}
                    strokeWidth={1.75}
                  />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          <div className="px-4 py-4 border-t border-gray-100 space-y-3">
            <div className="flex items-center gap-3 px-1">
              <div className="w-8 h-8 bg-[#111827] text-white rounded-full flex items-center justify-center text-xs font-bold uppercase flex-shrink-0">
                {userInitial}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-gray-900 truncate">{userName}</p>
                <p className="text-xs text-gray-400 truncate">{user?.email}</p>
              </div>
            </div>

            <button
              onClick={async () => {
                await logout();
                window.location.href = '/';
              }}
              className="flex items-center gap-2 w-full px-3 py-2 text-xs font-medium text-gray-400 hover:text-red-600 hover:bg-red-50/60 rounded-md transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sign out
            </button>
          </div>
        </div>
      </div>
    </>
  );
}