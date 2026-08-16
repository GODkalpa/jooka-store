import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Lock, Eye, FileText, ArrowLeft } from 'lucide-react';

export const metadata = {
  title: 'Privacy Policy | JOOKA Store Nepal',
  description: 'Learn how JOOKA protects your personal information, privacy, and data security.',
};

export default function PrivacyPolicyPage() {
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
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Official Policy</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900">
            Privacy Policy
          </h1>
          <p className="text-sm text-gray-500">
            Last Updated: August 2026 • JOOKA Store Nepal
          </p>
        </div>

        {/* Content Sections */}
        <div className="space-y-8 text-sm text-gray-700 leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Eye className="w-5 h-5 text-gray-900" />
              1. Information We Collect
            </h2>
            <p>
              When you visit JOOKA (jookawear.com) or place an order, we collect essential information necessary to deliver our services, including:
            </p>
            <ul className="list-disc list-inside space-y-1.5 pl-2 text-gray-600">
              <li><strong>Contact Information:</strong> Full name, delivery address, phone number, and email address.</li>
              <li><strong>Order Details:</strong> Items purchased, order numbers, sizes, selected colors, and delivery preferences.</li>
              <li><strong>Device & Usage Data:</strong> IP address, browser type, and interaction logs for performance monitoring and fraud prevention.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Lock className="w-5 h-5 text-gray-900" />
              2. How We Use Your Information
            </h2>
            <p>Your data is strictly used for legitimate business operations:</p>
            <ul className="list-disc list-inside space-y-1.5 pl-2 text-gray-600">
              <li>Processing, packing, and dispatching your orders across Nepal.</li>
              <li>Sending order status notifications, tracking numbers, and delivery confirmations via email/SMS.</li>
              <li>Account management and customer service inquiry resolution.</li>
              <li>Platform optimization, security audits, and fraudulent activity detection.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-gray-900" />
              3. Data Security & Storage
            </h2>
            <p>
              We implement industry-standard encryption protocols (SSL/TLS) for data in transit and secure database storage for registered account details. We do <strong>not</strong> sell, rent, or trade your personal information to third-party advertisers.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-gray-900">
              4. Cookies and Tracking
            </h2>
            <p>
              We use essential cookies to maintain your shopping bag items, keep you securely signed in to your account, and optimize web performance. You can choose to disable cookies through your browser settings, though certain store features may become unavailable.
            </p>
          </section>

          <section className="space-y-3 border-t border-gray-200 pt-6">
            <h2 className="text-lg font-bold text-gray-900">
              5. Contact Us Regarding Your Privacy
            </h2>
            <p>
              If you have any questions, requests for data correction, or deletion inquiries, please reach out to our team at:
            </p>
            <div className="bg-gray-50 border border-gray-200 p-4 rounded-xl space-y-1 text-xs text-gray-800">
              <p><strong>Email:</strong> support@jookawear.com / jooka648@gmail.com</p>
              <p><strong>Location:</strong> Kathmandu Valley, Nepal</p>
              <p><strong>Support Desk:</strong> Available Sunday – Friday (9:00 AM – 6:00 PM NPT)</p>
            </div>
          </section>
        </div>

      </div>
    </div>
  );
}
