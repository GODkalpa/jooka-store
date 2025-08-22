'use client';

import AdminMessaging from '@/components/dashboard/AdminMessaging';

export default function AdminSupportPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gold mb-2">Customer Support</h1>
          <p className="text-gray-400">Manage customer conversations and support requests</p>
        </div>
      </div>
      
      <AdminMessaging className="min-h-[700px]" />
    </div>
  );
}