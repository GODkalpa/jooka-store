'use client';

import CustomerMessaging from '@/components/dashboard/CustomerMessaging';

export default function MessagesPage() {
  return (
    <div className="space-y-4 md:space-y-6 p-4 md:p-0">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gold mb-2">Messages</h1>
          <p className="text-sm md:text-base text-gray-400">Chat with our support team</p>
        </div>
      </div>
      
      <CustomerMessaging className="min-h-[500px] md:min-h-[600px]" />
    </div>
  );
}