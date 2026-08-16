'use client';

import { useEffect, useState } from 'react';
import { Save, Shield, Bell, Eye, EyeOff, Trash2, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/lib/auth/firebase-auth';

export default function SettingsPage() {
  const { user } = useAuth();
  
  const [preferences, setPreferences] = useState({
    email_notifications: true,
    sms_notifications: false,
    marketing_emails: false,
    two_factor_auth: false,
    profile_visibility: 'private',
  });
  
  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: '',
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    async function fetchSettings() {
      try {
        const res = await fetch('/api/user/settings');
        if (res.ok) {
          const data = await res.json();
          setPreferences({
            email_notifications: data.email_notifications ?? true,
            sms_notifications: data.sms_notifications ?? false,
            marketing_emails: data.marketing_emails ?? false,
            two_factor_auth: data.two_factor_auth ?? false,
            profile_visibility: data.profile_visibility ?? 'private',
          });
        }
      } catch (e) {
        console.error('Failed to fetch settings:', e);
      }
    }
    fetchSettings();
  }, []);

  const handlePreferencesChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    setPreferences(prev => ({ ...prev, [name]: val }));
  };

  const savePreferences = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/user/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(preferences),
      });
      if (res.ok) {
        setMessage('Settings saved successfully.');
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (e) {
      console.error('Failed to save settings:', e);
    } finally {
      setLoading(false);
    }
  };

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwords.new !== passwords.confirm) {
      alert("New passwords don't match");
      return;
    }
    try {
      const res = await fetch('/api/user/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: passwords.current,
          newPassword: passwords.new,
        }),
      });
      if (res.ok) {
        setPasswords({ current: '', new: '', confirm: '' });
        alert('Password changed successfully');
      } else {
        alert('Failed to change password');
      }
    } catch (e) {
      console.error('Failed to change password:', e);
    }
  };

  const deleteAccount = async () => {
    if (confirm('Are you absolutely sure you want to delete your account? This action cannot be undone.')) {
      try {
        await fetch('/api/user/delete-account', { method: 'DELETE' });
        window.location.href = '/';
      } catch (e) {
        console.error('Failed to delete account:', e);
      }
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Settings</h1>
      </div>

      {message && (
        <div className="flex items-center gap-2 p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-md text-sm">
          <CheckCircle2 className="h-4 w-4" />
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-gray-100 p-6 hover:shadow-md transition-all duration-200">
          <div className="flex items-center gap-2 mb-4">
            <Bell className="h-5 w-5 text-gray-900" />
            <h2 className="text-lg font-bold text-gray-900">Notifications</h2>
          </div>
          <div className="space-y-4">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="email_notifications"
                checked={preferences.email_notifications}
                onChange={handlePreferencesChange}
                className="mt-1 w-4 h-4 accent-gray-900 rounded border-gray-300"
              />
              <div>
                <span className="block text-sm font-medium text-gray-900">Email Notifications</span>
                <span className="block text-xs text-gray-500">Receive order updates via email.</span>
              </div>
            </label>
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="sms_notifications"
                checked={preferences.sms_notifications}
                onChange={handlePreferencesChange}
                className="mt-1 w-4 h-4 accent-gray-900 rounded border-gray-300"
              />
              <div>
                <span className="block text-sm font-medium text-gray-900">SMS Notifications</span>
                <span className="block text-xs text-gray-500">Get text messages for delivery updates.</span>
              </div>
            </label>
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="marketing_emails"
                checked={preferences.marketing_emails}
                onChange={handlePreferencesChange}
                className="mt-1 w-4 h-4 accent-gray-900 rounded border-gray-300"
              />
              <div>
                <span className="block text-sm font-medium text-gray-900">Marketing Emails</span>
                <span className="block text-xs text-gray-500">Receive offers, discounts, and news.</span>
              </div>
            </label>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-100 p-6 hover:shadow-md transition-all duration-200">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="h-5 w-5 text-gray-900" />
            <h2 className="text-lg font-bold text-gray-900">Security & Privacy</h2>
          </div>
          <div className="space-y-5">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="two_factor_auth"
                checked={preferences.two_factor_auth}
                onChange={handlePreferencesChange}
                className="mt-1 w-4 h-4 accent-gray-900 rounded border-gray-300"
              />
              <div>
                <span className="block text-sm font-medium text-gray-900">Two-Factor Authentication</span>
                <span className="block text-xs text-gray-500">Add an extra layer of security to your account.</span>
              </div>
            </label>
            <div className="pt-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Profile Visibility</label>
              <select
                name="profile_visibility"
                value={preferences.profile_visibility}
                onChange={handlePreferencesChange}
                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-md text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900 transition-colors"
              >
                <option value="private">Private</option>
                <option value="public">Public (Reviews only)</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button onClick={savePreferences} disabled={loading} className="btn-primary flex items-center gap-2">
          <Save className="h-4 w-4" />
          {loading ? 'Saving...' : 'Save Preferences'}
        </button>
      </div>

      <div className="border-t border-gray-200 my-8"></div>

      <div className="bg-white rounded-lg border border-gray-100 p-6 hover:shadow-md transition-all duration-200">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Change Password</h2>
        <form onSubmit={changePassword} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={passwords.current}
                  onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                  className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-md text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900 transition-colors"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={passwords.new}
                  onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                  className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-md text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900 transition-colors"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={passwords.confirm}
                  onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                  className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-md text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </div>
          <div className="flex justify-end pt-2">
            <button type="submit" className="btn-secondary">
              Update Password
            </button>
          </div>
        </form>
      </div>

      <div className="bg-red-50 border border-red-200 rounded-lg p-5">
        <h2 className="text-lg font-bold text-red-900 mb-2">Danger Zone</h2>
        <p className="text-sm text-red-700 mb-4">
          Once you delete your account, there is no going back. Please be certain.
        </p>
        <button
          onClick={deleteAccount}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-xs font-semibold flex items-center gap-2 transition-colors"
        >
          <Trash2 className="h-4 w-4" />
          Delete Account
        </button>
      </div>
    </div>
  );
}