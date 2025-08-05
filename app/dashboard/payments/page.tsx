'use client';

import { Banknote, Info, CheckCircle } from 'lucide-react';

export default function CustomerPayments() {

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gold">Payment Method</h1>
        <p className="text-gray-400 mt-1">Cash on Delivery (COD) - Simple and secure</p>
      </div>

      {/* COD Information Card */}
      <div className="bg-charcoal rounded-lg border border-gold/20 p-8">
        <div className="flex items-center space-x-4 mb-6">
          <div className="w-16 h-16 bg-gold/20 rounded-full flex items-center justify-center">
            <Banknote className="w-8 h-8 text-gold" />
          </div>
          <div>
            <h2 className="text-2xl font-semibold text-white">Cash on Delivery</h2>
            <p className="text-gray-400">Pay when your order arrives at your doorstep</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* How it works */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gold flex items-center">
              <Info className="w-5 h-5 mr-2" />
              How it works
            </h3>
            <ul className="space-y-3 text-gray-300">
              <li className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                <span>Place your order and select Cash on Delivery</span>
              </li>
              <li className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                <span>We prepare and ship your order to your address</span>
              </li>
              <li className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                <span>Pay the exact amount in cash when delivered</span>
              </li>
              <li className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                <span>Receive your order and payment receipt</span>
              </li>
            </ul>
          </div>

          {/* Benefits */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gold">Benefits</h3>
            <ul className="space-y-3 text-gray-300">
              <li className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                <span>No need to share card details online</span>
              </li>
              <li className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                <span>Inspect your order before payment</span>
              </li>
              <li className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                <span>Available across Nepal</span>
              </li>
              <li className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                <span>No additional processing fees</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Important Notes */}
      <div className="bg-blue-900/20 border border-blue-500/20 rounded-lg p-6">
        <h3 className="text-lg font-medium text-blue-400 mb-3">Important Notes</h3>
        <ul className="space-y-2 text-blue-200 text-sm">
          <li>• Please have the exact amount ready for smooth delivery</li>
          <li>• COD is available for orders within Nepal only</li>
          <li>• Our delivery partner will provide you with a payment receipt</li>
          <li>• If you're not available, please arrange for someone to receive the order</li>
        </ul>
      </div>
    </div>
  );
}