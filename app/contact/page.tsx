'use client';

import React, { useState } from 'react';
import { MessageCircle, Send, Mail, Phone, MapPin, CheckCircle2, Clock } from 'lucide-react';
import { useAuth } from '@/lib/auth/firebase-auth';
import { CreateConversationData } from '@/types/firebase';

export default function ContactPage() {
  const { user } = useAuth();
  const [formData, setFormData] = useState<CreateConversationData>({
    subject: '',
    category: 'general',
    priority: 'medium',
    initial_message: ''
  });
  const [guestEmail, setGuestEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.subject.trim() || !formData.initial_message.trim()) return;

    setIsLoading(true);
    try {
      const requestData = {
        ...formData,
        guest_email: !user ? guestEmail : undefined
      };

      const response = await fetch('/api/conversations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
      });

      if (response.ok) {
        setSubmitted(true);
        setFormData({
          subject: '',
          category: 'general',
          priority: 'medium',
          initial_message: ''
        });
        setGuestEmail('');
      } else {
        throw new Error('Failed to submit support request');
      }
    } catch (error) {
      console.error('Error submitting support request:', error);
      alert('Failed to submit support request. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-canvas pt-12 pb-24 font-sans text-black">
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          <div className="bg-white border border-border-muted rounded-xl p-8 sm:p-10 text-center shadow-sm">
            <div className="w-16 h-16 bg-emerald-50 border border-emerald-200 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-8 h-8 stroke-[1.5]" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-black mb-3">Message Sent!</h1>
            <p className="text-sm text-neutral-600 max-w-md mx-auto mb-8 leading-relaxed">
              Thank you for contacting JOOKA Customer Service. We have received your message and will respond within 24 hours.
            </p>
            {user ? (
              <a
                href="/dashboard"
                className="inline-flex items-center justify-center px-6 py-3.5 bg-[#C8102E] text-white text-xs font-semibold uppercase tracking-widest hover:bg-[#A60C24] transition-colors shadow-sm rounded-lg"
              >
                Go to Account Dashboard
              </a>
            ) : (
              <a
                href="/"
                className="inline-flex items-center justify-center px-6 py-3.5 bg-black text-white text-xs font-semibold uppercase tracking-widest hover:bg-neutral-800 transition-colors shadow-sm"
              >
                Return to Home
              </a>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-canvas pt-8 pb-24 font-sans text-black">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 space-y-2">
          <span className="inline-block bg-black text-white text-[10px] font-bold uppercase px-3 py-1 rounded-full tracking-widest">
            Client Relations & Support
          </span>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-black">
            Contact Us
          </h1>
          <p className="text-sm text-neutral-600 max-w-2xl mx-auto leading-relaxed">
            Have a question about orders, sizing, or custom collections? Send us a message and our support team will assist you promptly.
          </p>
        </div>

        <div className="grid lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Contact Form */}
          <div className="lg:col-span-7 bg-white rounded-xl border border-border-muted p-6 sm:p-8 shadow-sm space-y-6">
            <div className="border-b border-border-muted pb-4">
              <h2 className="text-lg font-bold text-black uppercase tracking-wider">
                Send Us a Message
              </h2>
              <p className="text-xs text-neutral-500 mt-0.5">
                Fill out the details below and we will get back to you shortly.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {!user && (
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Your Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={guestEmail}
                    onChange={(e) => setGuestEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-neutral-300 rounded-md text-xs text-black placeholder-neutral-400 focus:border-black focus:ring-1 focus:ring-black outline-none transition-all"
                    placeholder="name@example.com"
                    required
                    disabled={isLoading}
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Subject <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                  className="w-full px-3.5 py-2.5 bg-white border border-neutral-300 rounded-md text-xs text-black placeholder-neutral-400 focus:border-black focus:ring-1 focus:ring-black outline-none transition-all"
                  placeholder="How can we help you?"
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as any }))}
                    className="w-full px-3.5 py-2.5 bg-white border border-neutral-300 rounded-md text-xs text-black focus:border-black focus:ring-1 focus:ring-black outline-none transition-all"
                    disabled={isLoading}
                  >
                    <option value="general">General Inquiry</option>
                    <option value="order">Order & Delivery Issue</option>
                    <option value="technical">Technical Support</option>
                    <option value="billing">Billing & Exchange</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Priority
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as any }))}
                    className="w-full px-3.5 py-2.5 bg-white border border-neutral-300 rounded-md text-xs text-black focus:border-black focus:ring-1 focus:ring-black outline-none transition-all"
                    disabled={isLoading}
                  >
                    <option value="low">Low Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="high">High Priority</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Message <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.initial_message}
                  onChange={(e) => setFormData(prev => ({ ...prev, initial_message: e.target.value }))}
                  className="w-full px-3.5 py-2.5 bg-white border border-neutral-300 rounded-md text-xs text-black placeholder-neutral-400 focus:border-black focus:ring-1 focus:ring-black outline-none transition-all"
                  placeholder="Please provide as much detail as possible..."
                  rows={5}
                  required
                  disabled={isLoading}
                />
              </div>

              <button
                type="submit"
                disabled={!formData.subject.trim() || !formData.initial_message.trim() || (!user && !guestEmail.trim()) || isLoading}
                className="w-full py-3.5 bg-black text-white text-xs font-semibold uppercase tracking-widest hover:bg-neutral-800 transition-colors shadow-sm rounded-md flex items-center justify-center space-x-2 border border-black disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Sending Message...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Send Message</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Contact Details & FAQ Sidebar */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-surface-muted rounded-xl border border-border-muted p-6 shadow-sm space-y-6">
              <h2 className="text-base font-bold text-black uppercase tracking-wider border-b border-border-muted pb-3">
                Get in Touch
              </h2>
              <div className="space-y-5">
                <div className="flex items-start space-x-3.5">
                  <div className="w-9 h-9 bg-white border border-border-muted rounded-lg flex items-center justify-center text-black flex-shrink-0">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-black uppercase">Email Support</h3>
                    <p className="text-xs text-neutral-700 font-mono mt-0.5">support@jooka.com</p>
                    <p className="text-[11px] text-neutral-500">We respond within 24 hours</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3.5">
                  <div className="w-9 h-9 bg-white border border-border-muted rounded-lg flex items-center justify-center text-black flex-shrink-0">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-black uppercase">Customer Hotline</h3>
                    <p className="text-xs text-neutral-700 font-mono mt-0.5">+977 (01) 400-JOOKA</p>
                    <p className="text-[11px] text-neutral-500">Mon - Fri: 9:00 AM - 6:00 PM</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3.5">
                  <div className="w-9 h-9 bg-white border border-border-muted rounded-lg flex items-center justify-center text-black flex-shrink-0">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-black uppercase">Headquarters</h3>
                    <p className="text-xs text-neutral-700 mt-0.5">Durbar Marg, Kathmandu<br />Nepal</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-border-muted p-6 shadow-sm space-y-4">
              <h3 className="text-xs font-bold text-black uppercase tracking-wider border-b border-border-muted pb-3">
                Frequently Asked Questions
              </h3>
              <div className="space-y-3.5 text-xs">
                <div>
                  <h4 className="font-bold text-black mb-0.5">How do I track my delivery?</h4>
                  <p className="text-neutral-600 text-[11px]">Track your active Nepal orders directly in your customer dashboard under "Orders".</p>
                </div>
                <div className="border-t border-border-muted pt-3">
                  <h4 className="font-bold text-black mb-0.5">What is your exchange policy?</h4>
                  <p className="text-neutral-600 text-[11px]">We offer a 7-day hassle-free size exchange policy across Nepal.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}