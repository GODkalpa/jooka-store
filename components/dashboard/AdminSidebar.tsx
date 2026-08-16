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
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { name: 'Users', href: '/admin/users', icon: Users },
  { name: 'Products', href: '/admin/products', icon: Package },
  { name: 'Orders', href: '/admin/orders', icon: ShoppingCart },
  { name: 'Inventory', href: '/admin/inventory', icon: BarChart3 },
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
      <div className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-50 lg:w-64 lg:flex lg:flex-col bg-white border-r border-border-muted font-sans shadow-xs">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-6 border-b border-border-muted">
            <Link href="/admin/dashboard" className="text-lg font-extrabold tracking-tight text-black flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-red-600 rounded-full"></span>
              JOOKA Admin
            </Link>
            <span className="text-[9px] font-bold uppercase bg-red-50 text-red-700 border border-red-200 px-2 py-0.5 rounded">
              Control Portal
            </span>
          </div>

          {/* View Website & Backend Links */}
          <div className="px-4 py-3 border-b border-border-muted space-y-1">
            <Link
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center px-3.5 py-2 text-xs font-semibold text-neutral-600 rounded-md hover:bg-neutral-100 hover:text-black transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5 mr-2.5 flex-shrink-0" />
              <span className="truncate">View Storefront</span>
            </Link>
            <a
              href="http://localhost:9000/app"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center px-3.5 py-2 text-xs font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-md transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5 mr-2.5 flex-shrink-0" />
              <span className="truncate">Medusa Raw Backend</span>
            </a>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center px-3.5 py-2.5 text-xs font-semibold rounded-md transition-all ${
                    isActive
                      ? 'bg-black text-white shadow-xs'
                      : 'text-neutral-600 hover:bg-neutral-100 hover:text-black'
                  }`}
                >
                  <item.icon className={`w-4 h-4 mr-3 flex-shrink-0 ${isActive ? 'text-white' : 'text-neutral-500'}`} />
                  <span className="truncate">{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Sign Out */}
          <div className="p-3 border-t border-border-muted">
            <button
              onClick={async () => {
                await logout();
                window.location.href = '/';
              }}
              className="flex items-center w-full px-3.5 py-2.5 text-xs font-semibold text-red-600 rounded-md hover:bg-red-50 transition-colors"
            >
              <LogOut className="w-4 h-4 mr-3 flex-shrink-0" />
              <span className="truncate">Sign Out</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar */}
      <div className={`lg:hidden fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-border-muted font-sans shadow-lg transform transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex flex-col h-full">
          {/* Mobile Header */}
          <div className="flex items-center justify-between h-16 px-4 border-b border-border-muted">
            <Link href="/admin/dashboard" className="text-base font-bold tracking-tight text-black">
              JOOKA Admin
            </Link>
            <button
              onClick={onClose}
              className="text-neutral-500 hover:text-black transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* View Website Link */}
          <div className="px-3 py-2 border-b border-border-muted">
            <Link
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleLinkClick}
              className="flex items-center px-3 py-2 text-xs font-semibold text-neutral-600 rounded-md hover:bg-neutral-100 hover:text-black transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5 mr-2.5 flex-shrink-0" />
              <span className="truncate">View Storefront</span>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={handleLinkClick}
                  className={`flex items-center px-3.5 py-2.5 text-xs font-semibold rounded-md transition-all ${
                    isActive
                      ? 'bg-black text-white'
                      : 'text-neutral-600 hover:bg-neutral-100 hover:text-black'
                  }`}
                >
                  <item.icon className="w-4 h-4 mr-3 flex-shrink-0" />
                  <span className="truncate">{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Sign Out */}
          <div className="p-3 border-t border-border-muted">
            <button
              onClick={async () => {
                await logout();
                window.location.href = '/';
              }}
              className="flex items-center w-full px-3.5 py-2.5 text-xs font-semibold text-red-600 rounded-md hover:bg-red-50 transition-colors"
            >
              <LogOut className="w-4 h-4 mr-3 flex-shrink-0" />
              <span className="truncate">Sign Out</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}