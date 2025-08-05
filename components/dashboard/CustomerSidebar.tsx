'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth/firebase-auth';
import {
  LayoutDashboard,
  ShoppingBag,
  User,
  MapPin,
  CreditCard,
  Settings,
  LogOut,
  Bell,
  ArrowLeft,
  Store,
  X,
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Orders', href: '/dashboard/orders', icon: ShoppingBag },
  { name: 'Profile', href: '/dashboard/profile', icon: User },
  { name: 'Addresses', href: '/dashboard/addresses', icon: MapPin },
  { name: 'Payment Methods', href: '/dashboard/payments', icon: CreditCard },
  { name: 'Notifications', href: '/dashboard/notifications', icon: Bell },
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

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-50 lg:w-64 lg:flex lg:flex-col bg-charcoal border-r border-gold/20">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-center h-16 px-4 border-b border-gold/20">
            <Link href="/" className="text-xl font-bold text-gold hover:text-gold/80 transition-colors">
              JOOKA
            </Link>
          </div>

          {/* Back to Website Link */}
          <div className="px-4 py-3 border-b border-gold/20">
            <Link
              href="/"
              className="flex items-center px-4 py-2 text-sm font-medium text-gray-300 rounded-md hover:bg-gold/10 hover:text-gold transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-3" />
              Back to Website
            </Link>
            <Link
              href="/shop"
              className="flex items-center px-4 py-2 text-sm font-medium text-gray-300 rounded-md hover:bg-gold/10 hover:text-gold transition-colors mt-1"
            >
              <Store className="w-4 h-4 mr-3" />
              Continue Shopping
            </Link>
          </div>

          {/* User Info */}
          <div className="px-4 py-6 border-b border-gold/20">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gold/20 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-gold" />
              </div>
              <div className="ml-3 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {user?.profile?.full_name || 'User'}
                </p>
                <p className="text-xs text-gray-400 truncate">
                  {user?.email}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors ${
                    isActive
                      ? 'bg-gold text-black'
                      : 'text-gray-300 hover:bg-gold/10 hover:text-gold'
                  }`}
                >
                  <item.icon className="w-5 h-5 mr-3 flex-shrink-0" />
                  <span className="truncate">{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Logout */}
          <div className="p-4 border-t border-gold/20">
            <button
              onClick={async () => {
                await logout();
                window.location.href = '/';
              }}
              className="flex items-center w-full px-4 py-3 text-sm font-medium text-gray-300 rounded-md hover:bg-red-600/10 hover:text-red-400 transition-colors"
            >
              <LogOut className="w-5 h-5 mr-3 flex-shrink-0" />
              <span className="truncate">Sign Out</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar */}
      <div className={`lg:hidden fixed inset-y-0 left-0 z-50 w-64 bg-charcoal border-r border-gold/20 transform transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex flex-col h-full">
          {/* Mobile Header */}
          <div className="flex items-center justify-between h-16 px-4 border-b border-gold/20">
            <Link href="/" className="text-xl font-bold text-gold hover:text-gold/80 transition-colors">
              JOOKA
            </Link>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Back to Website Link */}
          <div className="px-4 py-3 border-b border-gold/20">
            <Link
              href="/"
              onClick={handleLinkClick}
              className="flex items-center px-4 py-2 text-sm font-medium text-gray-300 rounded-md hover:bg-gold/10 hover:text-gold transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-3" />
              Back to Website
            </Link>
            <Link
              href="/shop"
              onClick={handleLinkClick}
              className="flex items-center px-4 py-2 text-sm font-medium text-gray-300 rounded-md hover:bg-gold/10 hover:text-gold transition-colors mt-1"
            >
              <Store className="w-4 h-4 mr-3" />
              Continue Shopping
            </Link>
          </div>

          {/* User Info */}
          <div className="px-4 py-6 border-b border-gold/20">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gold/20 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-gold" />
              </div>
              <div className="ml-3 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {user?.profile?.full_name || 'User'}
                </p>
                <p className="text-xs text-gray-400 truncate">
                  {user?.email}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={handleLinkClick}
                  className={`flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors ${
                    isActive
                      ? 'bg-gold text-black'
                      : 'text-gray-300 hover:bg-gold/10 hover:text-gold'
                  }`}
                >
                  <item.icon className="w-5 h-5 mr-3 flex-shrink-0" />
                  <span className="truncate">{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Logout */}
          <div className="p-4 border-t border-gold/20">
            <button
              onClick={async () => {
                await logout();
                window.location.href = '/';
              }}
              className="flex items-center w-full px-4 py-3 text-sm font-medium text-gray-300 rounded-md hover:bg-red-600/10 hover:text-red-400 transition-colors"
            >
              <LogOut className="w-5 h-5 mr-3 flex-shrink-0" />
              <span className="truncate">Sign Out</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}