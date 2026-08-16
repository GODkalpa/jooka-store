'use client';

import { useEffect, useState } from 'react';
import { Camera, Save } from 'lucide-react';
import Image from 'next/image';
import { useAuth } from '@/lib/auth/firebase-auth';
import { validateUserProfileUpdate } from '@/lib/validation/schemas';
import { api } from '@/lib/api/client';

export default function ProfilePage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    dob: ''
  });
  const [avatar, setAvatar] = useState<string | null>(null);
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    async function loadProfile() {
      if (!user) return;
      try {
        const res = await api.get('/api/user/profile');
        if (res.data) {
          setFormData({
            fullName: res.data.fullName || '',
            phone: res.data.phone || '',
            dob: res.data.dob || ''
          });
          setAvatar(res.data.photoURL || user.profile?.avatar_url || (user as any).photoURL || null);
        }
      } catch (err) {
        console.error('Failed to load profile', err);
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    const file = e.target.files[0];
    const data = new FormData();
    data.append('file', file);
    try {
      const res = await api.post('/api/upload', data);
      setAvatar(res.data.url);
    } catch (err) {
      console.error('Avatar upload failed', err);
      setAlert({ type: 'error', message: 'Failed to upload avatar' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setAlert(null);
    try {
      await api.put('/api/user/profile', { ...formData, photoURL: avatar });
      setAlert({ type: 'success', message: 'Profile updated successfully' });
    } catch (err: any) {
      setAlert({ type: 'error', message: err.message || 'Failed to update profile' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-48 mb-8"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-64 bg-gray-200 rounded-lg"></div>
          <div className="md:col-span-2 h-64 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-bold tracking-tight text-gray-900 mb-8">Profile</h1>

      {alert && (
        <div className={`mb-6 p-4 rounded-lg border ${
          alert.type === 'success' 
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
            : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          <p className="text-sm font-medium">{alert.message}</p>
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-6">
        {/* Avatar Card */}
        <div className="w-full md:w-1/3">
          <div className="bg-white rounded-lg border border-gray-100 p-6 flex flex-col items-center justify-center hover:shadow-md transition-all duration-200">
            <div className="relative group cursor-pointer">
              <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-100 border border-gray-200 relative">
                {avatar ? (
                  <Image src={avatar} alt="Avatar" fill className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    No Avatar
                  </div>
                )}
              </div>
              <label className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                <Camera className="w-8 h-8 text-white" />
                <input type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} />
              </label>
            </div>
            <p className="mt-4 text-xs text-gray-400 text-center">
              Allowed: JPG, PNG. Max size: 2MB.
            </p>
          </div>
        </div>

        {/* Profile Form */}
        <div className="w-full md:w-2/3">
          <div className="bg-white rounded-lg border border-gray-100 p-6 hover:shadow-md transition-all duration-200">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-md text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900 transition-colors"
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-md text-sm text-gray-400 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone
                </label>
                <div className="flex">
                  <span className="inline-flex items-center px-4 py-2.5 rounded-l-md border border-r-0 border-gray-200 bg-gray-50 text-gray-500 sm:text-sm">
                    +977
                  </span>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="flex-1 min-w-0 block w-full px-4 py-2.5 bg-white border border-gray-200 rounded-none rounded-r-md text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900 transition-colors"
                    placeholder="98XXXXXXXX"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date of Birth
                </label>
                <input
                  type="date"
                  name="dob"
                  value={formData.dob}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-md text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900 transition-colors"
                />
              </div>

              <div className="pt-4 border-t border-gray-100 flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="btn-primary flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}