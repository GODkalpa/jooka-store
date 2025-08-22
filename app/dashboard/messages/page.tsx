'use client';

import CustomerMessaging from '@/components/dashboard/CustomerMessaging';

export default function MessagesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gold mb-2">Messages</h1>
          <p className="text-gray-400">Chat with our support team</p>
        </div>
      </div>
      
      <CustomerMessaging className="min-h-[600px]" />
    </div>
  );
}