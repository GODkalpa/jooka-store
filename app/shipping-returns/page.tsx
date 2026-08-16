import React from 'react';
import Link from 'next/link';
import { Truck, RotateCcw, Clock, ShieldCheck, MapPin, ArrowLeft, PackageCheck } from 'lucide-react';

export const metadata = {
  title: 'Shipping & Returns Policy | JOOKA Store Nepal',
  description: 'Fast nationwide delivery across Kathmandu Valley and Nepal districts. 7-day hassle-free exchange policy.',
};

export default function ShippingReturnsPage() {
  return (
    <div className="min-h-screen bg-canvas py-12 md:py-20 px-4 sm:px-6 lg:px-8 font-sans text-gray-900">
      <div className="max-w-4xl mx-auto space-y-10">
        
        {/* Breadcrumb */}
        <div>
          <Link href="/" className="inline-flex items-center text-xs font-semibold text-gray-600 hover:text-black transition-colors">
            <ArrowLeft className="w-3.5 h-3.5 mr-1" />
            Back to Home
          </Link>
        </div>

        {/* Header */}
        <div className="space-y-4 border-b border-gray-200 pb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#C8102E]/10 text-[#C8102E] rounded-full text-xs font-semibold">
            <Truck className="w-4 h-4" />
            <span>Nationwide Delivery & Exchanges</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900">
            Shipping & Returns Policy
          </h1>
          <p className="text-sm text-gray-500">
            Fast Kathmandu Valley dispatch & reliable courier delivery across all 7 provinces of Nepal.
          </p>
        </div>

        {/* Highlight Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-3 shadow-xs">
            <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center text-amber-700">
              <Clock className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-gray-900 text-sm">Kathmandu Express</h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              24–48 hours delivery within Kathmandu, Lalitpur, and Bhaktapur ring road & surrounding valleys.
            </p>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-3 shadow-xs">
            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center text-blue-700">
              <MapPin className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-gray-900 text-sm">Outside Valley Courier</h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              2–4 business days delivery to Pokhara, Biratnagar, Butwal, Chitwan, Dharan, and major cities.
            </p>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-3 shadow-xs">
            <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center text-emerald-700">
              <RotateCcw className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-gray-900 text-sm">7-Day Easy Exchange</h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              Hassle-free size and color exchanges if the fit isn't perfect.
            </p>
          </div>
        </div>

        {/* Detailed Sections */}
        <div className="space-y-8 text-sm text-gray-700 leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Truck className="w-5 h-5 text-gray-900" />
              1. Delivery Rates & Timelines
            </h2>
            <div className="overflow-x-auto border border-gray-200 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 border-b border-gray-200 font-bold text-gray-900">
                  <tr>
                    <th className="p-3.5">Shipping Zone</th>
                    <th className="p-3.5">Estimated Time</th>
                    <th className="p-3.5">Shipping Fee</th>
                    <th className="p-3.5">Free Shipping Threshold</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-gray-700">
                  <tr>
                    <td className="p-3.5 font-semibold">Inside Kathmandu Valley</td>
                    <td className="p-3.5">24 – 48 Hours</td>
                    <td className="p-3.5">₨ 100</td>
                    <td className="p-3.5 text-emerald-700 font-bold">Orders over ₨ 3,000</td>
                  </tr>
                  <tr>
                    <td className="p-3.5 font-semibold">Outside Valley (Major Cities)</td>
                    <td className="p-3.5">2 – 4 Days</td>
                    <td className="p-3.5">₨ 150</td>
                    <td className="p-3.5 text-emerald-700 font-bold">Orders over ₨ 4,000</td>
                  </tr>
                  <tr>
                    <td className="p-3.5 font-semibold">Remote & Mountain Districts</td>
                    <td className="p-3.5">4 – 7 Days</td>
                    <td className="p-3.5">₨ 200</td>
                    <td className="p-3.5 text-emerald-700 font-bold">Orders over ₨ 5,000</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <PackageCheck className="w-5 h-5 text-gray-900" />
              2. 7-Day Exchange Policy
            </h2>
            <p>
              We want you to feel confident in every piece you wear. If the size or style doesn't fit, we offer exchanges within <strong>7 days</strong> of delivery under the following conditions:
            </p>
            <ul className="list-disc list-inside space-y-1.5 pl-2 text-gray-600">
              <li>Item must be unused, unwashed, and in original condition.</li>
              <li>Original tags and JOOKA packaging must be intact.</li>
              <li>Clearance or Final Sale items are not eligible for exchange unless defective.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <RotateCcw className="w-5 h-5 text-gray-900" />
              3. How to Request an Exchange
            </h2>
            <ol className="list-decimal list-inside space-y-2 pl-2 text-gray-600">
              <li>Contact our customer support team via phone or email within 7 days of receiving your package.</li>
              <li>Provide your Order Number (e.g. <code>JK-2026-XXXX</code>) and the desired replacement size/item.</li>
              <li>For Kathmandu Valley orders, our courier will swap the item at your doorstep. For outside valley orders, we will guide you on the local courier return drop.</li>
            </ol>
          </section>

          <section className="space-y-3 border-t border-gray-200 pt-6">
            <h2 className="text-lg font-bold text-gray-900">
              4. Need Help With an Order?
            </h2>
            <p>
              Our support desk is ready to help with tracking and exchanges:
            </p>
            <div className="bg-gray-50 border border-gray-200 p-4 rounded-xl space-y-1 text-xs text-gray-800">
              <p><strong>Hotline:</strong> +977-1-4XXXXXX / Viber & WhatsApp Support</p>
              <p><strong>Email:</strong> support@jookawear.com</p>
              <p><strong>Hours:</strong> Sunday – Friday (9:00 AM – 6:00 PM NPT)</p>
            </div>
          </section>
        </div>

      </div>
    </div>
  );
}
