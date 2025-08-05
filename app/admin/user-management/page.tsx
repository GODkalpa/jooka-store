'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

export default function UserManagementPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handlePromoteUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');
    setError('');

    try {
      const response = await fetch('/api/admin/promote-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to promote user');
      }

      setMessage(data.message);
      setEmail('');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to promote user');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          <div>
            <h1 className="text-3xl font-bold text-[#D4AF37] mb-2">User Management</h1>
            <p className="text-gray-400">Manage user roles and permissions</p>
          </div>

          {/* Promote User Section */}
          <div className="bg-gray-900 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Promote User to Admin</h2>
            <p className="text-gray-400 mb-6">
              Enter the email address of a user to promote them to admin role.
            </p>

            <form onSubmit={handlePromoteUser} className="space-y-4">
              {error && (
                <div className="bg-red-900/20 border border-red-500 text-red-400 px-4 py-3 rounded">
                  {error}
                </div>
              )}

              {message && (
                <div className="bg-green-900/20 border border-green-500 text-green-400 px-4 py-3 rounded">
                  {message}
                </div>
              )}

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                  User Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent"
                  placeholder="Enter user email to promote"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="bg-[#D4AF37] text-black px-6 py-2 rounded-md font-medium hover:bg-[#B8941F] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Promoting...' : 'Promote to Admin'}
              </button>
            </form>
          </div>

          {/* Development Notice */}
          {process.env.NODE_ENV === 'development' && (
            <div className="bg-yellow-900/20 border border-yellow-500 text-yellow-400 px-4 py-3 rounded">
              <h3 className="font-semibold mb-2">Development Mode</h3>
              <p className="text-sm">
                This user promotion feature is only available in development mode. 
                In production, use the command line script: <code className="bg-black px-2 py-1 rounded">npm run admin:create</code>
              </p>
            </div>
          )}

          {/* Instructions */}
          <div className="bg-gray-900 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Admin Creation Methods</h2>
            <div className="space-y-4 text-gray-300">
              <div>
                <h3 className="font-medium text-white mb-2">1. Command Line Script (Recommended)</h3>
                <p className="text-sm mb-2">Use the secure command line script to create admin accounts:</p>
                <code className="bg-black px-3 py-2 rounded block">npm run admin:create</code>
              </div>
              
              <div>
                <h3 className="font-medium text-white mb-2">2. Promote Existing Users (Development Only)</h3>
                <p className="text-sm">
                  Use the form above to promote existing customer accounts to admin role. 
                  This method is only available in development mode.
                </p>
              </div>
              
              <div>
                <h3 className="font-medium text-white mb-2">3. Database Direct Access</h3>
                <p className="text-sm">
                  Directly update the user role in your Supabase database by changing the 
                  <code className="bg-black px-1 rounded mx-1">role</code> field from 
                  <code className="bg-black px-1 rounded mx-1">'customer'</code> to 
                  <code className="bg-black px-1 rounded mx-1">'admin'</code> in the users table.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}