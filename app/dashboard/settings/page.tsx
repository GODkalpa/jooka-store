'use client';

import { useEffect, useState } from 'react';
import { Save, Shield, Bell, Eye, EyeOff, Trash2 } from 'lucide-react';
import { useAuth } from '@/lib/auth/firebase-auth';

interface UserSettings {
  email_notifications: boolean;
  sms_notifications: boolean;
  marketing_emails: boolean;
  order_updates: boolean;
  newsletter: boolean;
  two_factor_enabled: boolean;
  privacy_profile: 'public' | 'private';
  data_sharing: boolean;
}

export default function CustomerSettings() {
  const { user, firebaseUser, logout } = useAuth();
  const [settings, setSettings] = useState<UserSettings>({
    email_notifications: true,
    sms_notifications: false,
    marketing_emails: true,
    order_updates: true,
    newsletter: false,
    two_factor_enabled: false,
    privacy_profile: 'private',
    data_sharing: false,
  });
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });
  const [loading, setLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      if (!user || !firebaseUser) return;

      const token = await firebaseUser.getIdToken();
      const response = await fetch('/api/user/settings', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const result = await response.json();
        setSettings(result.data || settings);
      }
    } catch (err) {
      console.error('Failed to fetch settings:', err);
    }
  };

  const handleSettingsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (!user || !firebaseUser) return;

      const token = await firebaseUser.getIdToken();
      const response = await fetch('/api/user/settings', {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || 'Failed to update settings');
      }

      setSuccess('Settings updated successfully!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordData.new_password !== passwordData.confirm_password) {
      setError('New passwords do not match');
      return;
    }

    if (passwordData.new_password.length < 8) {
      setError('New password must be at least 8 characters long');
      return;
    }

    setPasswordLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (!user || !firebaseUser) return;

      const token = await firebaseUser.getIdToken();
      const response = await fetch('/api/user/change-password', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          current_password: passwordData.current_password,
          new_password: passwordData.new_password,
        }),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || 'Failed to change password');
      }

      setSuccess('Password changed successfully!');
      setPasswordData({
        current_password: '',
        new_password: '',
        confirm_password: '',
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    const confirmation = prompt(
      'This action cannot be undone. Type "DELETE" to confirm account deletion:'
    );
    
    if (confirmation !== 'DELETE') {
      return;
    }

    try {
      if (!user || !firebaseUser) return;

      const token = await firebaseUser.getIdToken();
      const response = await fetch('/api/user/delete-account', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        alert('Your account has been deleted successfully.');
        await logout();
        window.location.href = '/';
      } else {
        const result = await response.json();
        setError(result.error || 'Failed to delete account');
      }
    } catch (err) {
      setError('An error occurred while deleting your account');
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gold">Account Settings</h1>
        <p className="text-gray-400 mt-1">Manage your account preferences and security</p>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="bg-green-900/20 border border-green-500 rounded-lg p-4">
          <p className="text-green-400">{success}</p>
        </div>
      )}
      {error && (
        <div className="bg-red-900/20 border border-red-500 rounded-lg p-4">
          <p className="text-red-400">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Notification Settings */}
        <div className="bg-charcoal rounded-lg border border-gold/20 p-6">
          <div className="flex items-center mb-6">
            <Bell className="w-5 h-5 text-gold mr-2" />
            <h3 className="text-lg font-semibold text-gold">Notifications</h3>
          </div>
          
          <form onSubmit={handleSettingsSubmit} className="space-y-4">
            <div className="space-y-4">
              <label className="flex items-center justify-between">
                <span className="text-sm text-gray-300">Email notifications</span>
                <input
                  type="checkbox"
                  checked={settings.email_notifications}
                  onChange={(e) => setSettings(prev => ({ ...prev, email_notifications: e.target.checked }))}
                  className="w-4 h-4 text-gold bg-black border-gold/20 rounded focus:ring-gold focus:ring-2"
                />
              </label>

              <label className="flex items-center justify-between">
                <span className="text-sm text-gray-300">SMS notifications</span>
                <input
                  type="checkbox"
                  checked={settings.sms_notifications}
                  onChange={(e) => setSettings(prev => ({ ...prev, sms_notifications: e.target.checked }))}
                  className="w-4 h-4 text-gold bg-black border-gold/20 rounded focus:ring-gold focus:ring-2"
                />
              </label>

              <label className="flex items-center justify-between">
                <span className="text-sm text-gray-300">Order updates</span>
                <input
                  type="checkbox"
                  checked={settings.order_updates}
                  onChange={(e) => setSettings(prev => ({ ...prev, order_updates: e.target.checked }))}
                  className="w-4 h-4 text-gold bg-black border-gold/20 rounded focus:ring-gold focus:ring-2"
                />
              </label>

              <label className="flex items-center justify-between">
                <span className="text-sm text-gray-300">Marketing emails</span>
                <input
                  type="checkbox"
                  checked={settings.marketing_emails}
                  onChange={(e) => setSettings(prev => ({ ...prev, marketing_emails: e.target.checked }))}
                  className="w-4 h-4 text-gold bg-black border-gold/20 rounded focus:ring-gold focus:ring-2"
                />
              </label>

              <label className="flex items-center justify-between">
                <span className="text-sm text-gray-300">Newsletter</span>
                <input
                  type="checkbox"
                  checked={settings.newsletter}
                  onChange={(e) => setSettings(prev => ({ ...prev, newsletter: e.target.checked }))}
                  className="w-4 h-4 text-gold bg-black border-gold/20 rounded focus:ring-gold focus:ring-2"
                />
              </label>
            </div>

            <div className="pt-4 border-t border-gold/20">
              <button
                type="submit"
                disabled={loading}
                className="btn-primary flex items-center"
              >
                <Save className="w-4 h-4 mr-2" />
                {loading ? 'Saving...' : 'Save Notification Settings'}
              </button>
            </div>
          </form>
        </div>

        {/* Security Settings */}
        <div className="bg-charcoal rounded-lg border border-gold/20 p-6">
          <div className="flex items-center mb-6">
            <Shield className="w-5 h-5 text-gold mr-2" />
            <h3 className="text-lg font-semibold text-gold">Security & Privacy</h3>
          </div>
          
          <div className="space-y-4">
            <label className="flex items-center justify-between">
              <span className="text-sm text-gray-300">Two-factor authentication</span>
              <input
                type="checkbox"
                checked={settings.two_factor_enabled}
                onChange={(e) => setSettings(prev => ({ ...prev, two_factor_enabled: e.target.checked }))}
                className="w-4 h-4 text-gold bg-black border-gold/20 rounded focus:ring-gold focus:ring-2"
              />
            </label>

            <div>
              <label className="block text-sm text-gray-300 mb-2">Profile visibility</label>
              <select
                value={settings.privacy_profile}
                onChange={(e) => setSettings(prev => ({ ...prev, privacy_profile: e.target.value as any }))}
                className="w-full px-3 py-2 bg-black border border-gold/20 rounded-md text-white focus:outline-none focus:border-gold"
              >
                <option value="private">Private</option>
                <option value="public">Public</option>
              </select>
            </div>

            <label className="flex items-center justify-between">
              <span className="text-sm text-gray-300">Allow data sharing for analytics</span>
              <input
                type="checkbox"
                checked={settings.data_sharing}
                onChange={(e) => setSettings(prev => ({ ...prev, data_sharing: e.target.checked }))}
                className="w-4 h-4 text-gold bg-black border-gold/20 rounded focus:ring-gold focus:ring-2"
              />
            </label>
          </div>
        </div>
      </div>

      {/* Change Password */}
      <div className="bg-charcoal rounded-lg border border-gold/20 p-6">
        <h3 className="text-lg font-semibold text-gold mb-6">Change Password</h3>
        
        <form onSubmit={handlePasswordSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Current Password
              </label>
              <div className="relative">
                <input
                  type={showPasswords.current ? 'text' : 'password'}
                  required
                  value={passwordData.current_password}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, current_password: e.target.value }))}
                  className="w-full px-4 py-2 pr-10 bg-black border border-gold/20 rounded-md text-white placeholder-gray-400 focus:outline-none focus:border-gold"
                  placeholder="Enter current password"
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gold"
                >
                  {showPasswords.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showPasswords.new ? 'text' : 'password'}
                  required
                  value={passwordData.new_password}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, new_password: e.target.value }))}
                  className="w-full px-4 py-2 pr-10 bg-black border border-gold/20 rounded-md text-white placeholder-gray-400 focus:outline-none focus:border-gold"
                  placeholder="Enter new password"
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gold"
                >
                  {showPasswords.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  type={showPasswords.confirm ? 'text' : 'password'}
                  required
                  value={passwordData.confirm_password}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, confirm_password: e.target.value }))}
                  className="w-full px-4 py-2 pr-10 bg-black border border-gold/20 rounded-md text-white placeholder-gray-400 focus:outline-none focus:border-gold"
                  placeholder="Confirm new password"
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gold"
                >
                  {showPasswords.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-gold/20">
            <button
              type="submit"
              disabled={passwordLoading}
              className="btn-primary flex items-center"
            >
              <Save className="w-4 h-4 mr-2" />
              {passwordLoading ? 'Changing...' : 'Change Password'}
            </button>
          </div>
        </form>
      </div>

      {/* Danger Zone */}
      <div className="bg-red-900/20 border border-red-500/20 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-red-400 mb-4">Danger Zone</h3>
        <p className="text-gray-400 text-sm mb-6">
          Once you delete your account, there is no going back. Please be certain.
        </p>
        
        <button
          onClick={handleDeleteAccount}
          className="flex items-center px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Delete Account
        </button>
      </div>
    </div>
  );
}