'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/firebase-auth';
import AdminSidebar from '@/components/dashboard/AdminSidebar';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading, isAuthenticated, isAdmin } = useAuth();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push('/auth/signin?error=AdminRequired');
        return;
      }

      if (!isAdmin) {
        router.push('/auth/signin?error=AdminRequired');
        return;
      }
    }
  }, [isLoading, isAuthenticated, isAdmin, router]);

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-gold">Loading...</div>
      </div>
    );
  }

  // Show nothing while redirecting
  if (!isAuthenticated || !isAdmin) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-gold">Redirecting...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <AdminSidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
      />
      
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      <div className="lg:ml-64">
        {/* Mobile header */}
        <div className="lg:hidden bg-charcoal border-b border-gold/20 px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-gold hover:text-gold/80"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <h1 className="text-lg font-bold text-gold">Admin Panel</h1>
          <div className="w-6" /> {/* Spacer for centering */}
        </div>
        
        <main className="p-4 sm:p-6 lg:p-8 overflow-auto">
          <div className="max-w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}