'use client';

import AdminMessaging from '@/components/dashboard/AdminMessaging';

export default function AdminSupportPage() {
  return (
    <div className="space-y-4 md:space-y-6 p-4 md:p-0">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gold mb-2">Customer Support</h1>
          <p className="text-sm md:text-base text-gray-400">Manage customer conversations and support requests</p>
        </div>
      </div>
      
      <AdminMessaging className="min-h-[600px] md:min-h-[700px]" />
    </div>
  );
}