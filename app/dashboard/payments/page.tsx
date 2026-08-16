'use client';

import { Banknote, ShieldCheck, CheckCircle2 } from 'lucide-react';

export default function PaymentsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Payments</h1>
      </div>

      <div className="bg-white rounded-lg border border-gray-100 p-6 sm:p-8 hover:shadow-md transition-all duration-200">
        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
            <Banknote className="h-8 w-8 text-gray-900" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">Cash on Delivery (COD)</h2>
            <p className="text-sm text-gray-600 mt-1">Pay comfortably when your order arrives.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-[#C8102E]" />
              How it works
            </h3>
            <ul className="space-y-3">
              {[
                'Place your order online without any upfront payment.',
                'Our delivery partner will bring your package to your address.',
                'Inspect your package to ensure it is sealed and correct.',
                'Hand over the cash only when you receive your order.'
              ].map((text, i) => (
                <li key={i} className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-600">{text}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-[#C8102E]" />
              Customer protection
            </h3>
            <ul className="space-y-3">
              {[
                '100% risk-free shopping experience.',
                'No hidden charges or unexpected fees.',
                'Verify quality before parting with your money.',
                'Easy returns if the product is damaged or defective.'
              ].map((text, i) => (
                <li key={i} className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-600">{text}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}