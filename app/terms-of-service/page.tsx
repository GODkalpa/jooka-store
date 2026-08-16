import React from 'react';
import Link from 'next/link';
import { FileText, CheckCircle, AlertCircle, ShoppingBag, ArrowLeft } from 'lucide-react';

export const metadata = {
  title: 'Terms of Service | JOOKA Store Nepal',
  description: 'Terms and Conditions governing the use of JOOKA E-Commerce platform.',
};

export default function TermsOfServicePage() {
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
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-full text-xs font-semibold text-gray-800">
            <FileText className="w-4 h-4 text-gray-900" />
            <span>Legal Agreement</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900">
            Terms of Service
          </h1>
          <p className="text-sm text-gray-500">
            Effective Date: August 2026 • JOOKA Store Nepal
          </p>
        </div>

        {/* Content */}
        <div className="space-y-8 text-sm text-gray-700 leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-gray-900">
              1. Acceptance of Terms
            </h2>
            <p>
              By accessing, browsing, or making purchases on JOOKA (jookawear.com), you agree to comply with and be bound by these Terms of Service, along with our Privacy Policy and Shipping & Returns Policy.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-gray-900" />
              2. Orders, Pricing & Currency
            </h2>
            <p>
              All prices listed on JOOKA are denominated in <strong>Nepalese Rupees (NPR / ₨)</strong> and include applicable local value-added taxes where stated.
            </p>
            <ul className="list-disc list-inside space-y-1.5 pl-2 text-gray-600">
              <li>We reserve the right to correct any typographical or pricing errors prior to order dispatch.</li>
              <li>Order placement constitutes an offer to purchase; order confirmation emails acknowledge receipt, while fulfillment confirms acceptance.</li>
              <li>In the rare event of inventory discrepancy, you will be promptly contacted for a substitute, delay consent, or full cancellation.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-emerald-600" />
              3. Cash on Delivery (COD) & Payments
            </h2>
            <p>
              JOOKA provides Cash on Delivery (COD) across designated delivery zones in Nepal. When choosing COD:
            </p>
            <ul className="list-disc list-inside space-y-1.5 pl-2 text-gray-600">
              <li>You agree to have the exact cash amount ready upon delivery hand-off by our courier partner.</li>
              <li>Repeated fraudulent orders or refusal of delivery without valid cause may result in account termination and restriction of future COD privileges.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-gray-900">
              4. User Accounts & Responsibilities
            </h2>
            <p>
              When creating an account on JOOKA, you are responsible for maintaining the confidentiality of your login credentials and for all activities that occur under your account. You must provide accurate and updated delivery details.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-gray-900">
              5. Intellectual Property
            </h2>
            <p>
              All branding, logos, apparel photography, designs, website layouts, and product descriptions are the exclusive intellectual property of JOOKA. Unauthorized reproduction or commercial use is strictly prohibited.
            </p>
          </section>

          <section className="space-y-3 border-t border-gray-200 pt-6">
            <h2 className="text-lg font-bold text-gray-900">
              6. Questions & Assistance
            </h2>
            <p>
              For legal inquiries or terms clarification, please contact:
            </p>
            <div className="bg-gray-50 border border-gray-200 p-4 rounded-xl space-y-1 text-xs text-gray-800">
              <p><strong>Email:</strong> legal@jookawear.com / jooka648@gmail.com</p>
              <p><strong>Store Address:</strong> Kathmandu, Nepal</p>
            </div>
          </section>
        </div>

      </div>
    </div>
  );
}
