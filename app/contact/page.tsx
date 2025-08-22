'use client';

import React, { useState } from 'react';
import { MessageCircle, Send, Mail, Phone, MapPin } from 'lucide-react';
import { useAuth } from '@/lib/auth/firebase-auth';
import { CreateConversationData } from '@/types/firebase';

export default function ContactPage() {
  const { user, firebaseUser } = useAuth();
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
      const token = user ? await firebaseUser?.getIdToken() : null;
      const requestData = {
        ...formData,
        guest_email: !user ? guestEmail : undefined
      };

      const response = await fetch('/api/conversations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
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
      <div className="min-h-screen bg-black text-white">
        <div className="max-w-4xl mx-auto px-4 py-16">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <MessageCircle className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gold mb-4">Message Sent!</h1>
            <p className="text-gray-400 mb-8">
              Thank you for contacting us. We've received your message and will respond within 24 hours.
            </p>
            {user ? (
              <a
                href="/dashboard/messages"
                className="bg-gold text-black px-6 py-3 rounded-lg hover:bg-gold/90 transition-colors inline-flex items-center"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                View Your Messages
              </a>
            ) : (
              <a
                href="/"
                className="bg-gold text-black px-6 py-3 rounded-lg hover:bg-gold/90 transition-colors"
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
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gold mb-4">Contact Us</h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Have a question or need support? We're here to help. Send us a message and we'll get back to you as soon as possible.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div className="bg-charcoal rounded-lg border border-gold/20 p-8">
            <h2 className="text-2xl font-semibold text-gold mb-6">Send us a message</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {!user && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Your Email *
                  </label>
                  <input
                    type="email"
                    value={guestEmail}
                    onChange={(e) => setGuestEmail(e.target.value)}
                    className="w-full px-4 py-3 bg-black border border-gold/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-gold"
                    placeholder="your.email@example.com"
                    required
                    disabled={isLoading}
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Subject *
                </label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                  className="w-full px-4 py-3 bg-black border border-gold/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-gold"
                  placeholder="What can we help you with?"
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as any }))}
                    className="w-full px-4 py-3 bg-black border border-gold/20 rounded-lg text-white focus:outline-none focus:border-gold"
                    disabled={isLoading}
                  >
                    <option value="general">General Question</option>
                    <option value="order">Order Issue</option>
                    <option value="technical">Technical Support</option>
                    <option value="billing">Billing Question</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Priority
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as any }))}
                    className="w-full px-4 py-3 bg-black border border-gold/20 rounded-lg text-white focus:outline-none focus:border-gold"
                    disabled={isLoading}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Message *
                </label>
                <textarea
                  value={formData.initial_message}
                  onChange={(e) => setFormData(prev => ({ ...prev, initial_message: e.target.value }))}
                  className="w-full px-4 py-3 bg-black border border-gold/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-gold"
                  placeholder="Please describe your question or issue in detail..."
                  rows={6}
                  required
                  disabled={isLoading}
                />
              </div>

              <button
                type="submit"
                disabled={!formData.subject.trim() || !formData.initial_message.trim() || (!user && !guestEmail.trim()) || isLoading}
                className="w-full bg-gold text-black px-6 py-3 rounded-lg hover:bg-gold/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isLoading ? (
                  'Sending...'
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Send Message
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Contact Information */}
          <div className="space-y-8">
            <div className="bg-charcoal rounded-lg border border-gold/20 p-8">
              <h2 className="text-2xl font-semibold text-gold mb-6">Get in touch</h2>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-gold/10 rounded-lg flex items-center justify-center">
                    <Mail className="w-6 h-6 text-gold" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white mb-1">Email</h3>
                    <p className="text-gray-400">support@jooka.com</p>
                    <p className="text-sm text-gray-500">We respond within 24 hours</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-gold/10 rounded-lg flex items-center justify-center">
                    <Phone className="w-6 h-6 text-gold" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white mb-1">Phone</h3>
                    <p className="text-gray-400">+1 (555) 123-4567</p>
                    <p className="text-sm text-gray-500">Mon-Fri 9AM-6PM EST</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-gold/10 rounded-lg flex items-center justify-center">
                    <MapPin className="w-6 h-6 text-gold" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white mb-1">Address</h3>
                    <p className="text-gray-400">123 Business Ave<br />Suite 100<br />New York, NY 10001</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-charcoal rounded-lg border border-gold/20 p-8">
              <h3 className="text-xl font-semibold text-gold mb-4">Frequently Asked Questions</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-white mb-1">How do I track my order?</h4>
                  <p className="text-sm text-gray-400">You can track your order in your dashboard under "Orders".</p>
                </div>
                <div>
                  <h4 className="font-medium text-white mb-1">What's your return policy?</h4>
                  <p className="text-sm text-gray-400">We offer 30-day returns on all unused items.</p>
                </div>
                <div>
                  <h4 className="font-medium text-white mb-1">How can I change my order?</h4>
                  <p className="text-sm text-gray-400">Contact us immediately if you need to modify your order.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}