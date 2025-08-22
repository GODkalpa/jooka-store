'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth/firebase-auth';
import {
  LayoutDashboard,
  Users,
  Package,
  ShoppingCart,
  BarChart3,
  Settings,
  LogOut,
  ExternalLink,
  X,
  MessageCircle,
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { name: 'Users', href: '/admin/users', icon: Users },
  { name: 'Products', href: '/admin/products', icon: Package },
  { name: 'Orders', href: '/admin/orders', icon: ShoppingCart },
  { name: 'Inventory', href: '/admin/inventory', icon: BarChart3 },
  { name: 'Support', href: '/admin/support', icon: MessageCircle },
  { name: 'Settings', href: '/admin/settings', icon: Settings },
];

interface AdminSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function AdminSidebar({ isOpen = true, onClose }: AdminSidebarProps) {
  const pathname = usePathname();
  const { logout } = useAuth();

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
            <Link href="/" className="text-lg font-bold text-gold hover:text-gold/80 transition-colors">
              JOOKA Admin
            </Link>
          </div>

          {/* View Website Link */}
          <div className="px-4 py-3 border-b border-gold/20">
            <Link
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center px-4 py-2 text-sm font-medium text-gray-300 rounded-md hover:bg-gold/10 hover:text-gold transition-colors"
            >
              <ExternalLink className="w-4 h-4 mr-3 flex-shrink-0" />
              <span className="truncate">View Website</span>
            </Link>
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
            <Link href="/" className="text-lg font-bold text-gold hover:text-gold/80 transition-colors">
              JOOKA Admin
            </Link>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* View Website Link */}
          <div className="px-4 py-3 border-b border-gold/20">
            <Link
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleLinkClick}
              className="flex items-center px-4 py-2 text-sm font-medium text-gray-300 rounded-md hover:bg-gold/10 hover:text-gold transition-colors"
            >
              <ExternalLink className="w-4 h-4 mr-3 flex-shrink-0" />
              <span className="truncate">View Website</span>
            </Link>
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