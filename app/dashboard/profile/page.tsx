'use client';

import { useEffect, useState } from 'react';
import { Camera, Save, User, Phone, Mail, Calendar } from 'lucide-react';
import Image from 'next/image';
import { useAuth } from '@/lib/auth/firebase-auth';
import { validateUserProfileUpdate } from '@/lib/validation/schemas';
import { api } from '@/lib/api/client';
import { formatSafeDate } from '@/lib/utils/date';

interface ProfileFormData {
  fullName: string;
  firstName: string;
  lastName: string;
  phone: string;
  dateOfBirth: string;
}

export default function CustomerProfile() {
  const { user, firebaseUser, refreshUser } = useAuth();
  const [profile, setProfile] = useState<ProfileFormData>({
    fullName: '',
    firstName: '',
    lastName: '',
    phone: '',
    dateOfBirth: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [imageUploading, setImageUploading] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user || !firebaseUser) {
        setLoading(false);
        return;
      }

      try {
        const result = await api.get('/api/user/profile');
        const profileData = result.data;

        // Set profile data
        setProfile({
          fullName: profileData.profile?.full_name ||
                   `${profileData.profile?.first_name || ''} ${profileData.profile?.last_name || ''}`.trim(),
          firstName: profileData.profile?.first_name || '',
          lastName: profileData.profile?.last_name || '',
          phone: profileData.profile?.phone || '',
          dateOfBirth: profileData.profile?.date_of_birth || ''
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;

    // Validate form data using centralized schema
    const validationResult = validateUserProfileUpdate({
      fullName: profile.fullName,
      firstName: profile.firstName,
      lastName: profile.lastName,
      phone: profile.phone,
      dateOfBirth: profile.dateOfBirth,
    });

    if (!validationResult.success) {
      const errorMessages = validationResult.error.errors.map(err => err.message).join(', ');
      setError(`Validation failed: ${errorMessages}`);
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      await api.put('/api/user/profile', {
        fullName: profile.fullName,
        firstName: profile.firstName,
        lastName: profile.lastName,
        phone: profile.phone,
        dateOfBirth: profile.dateOfBirth,
      });

      // Refresh user data
      await refreshUser();

      setSuccess('Profile updated successfully!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'avatar');

      const token = await firebaseUser.getIdToken();
      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload image');
      }

      const result = await response.json();
      
      // Update profile with new avatar URL
      const token2 = await firebaseUser.getIdToken();
      const updateResponse = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token2}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          avatar_url: result.url,
        }),
      });

      if (updateResponse.ok) {
        setProfile(prev => prev ? { ...prev, avatar_url: result.url } : null);
        setSuccess('Profile picture updated successfully!');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload image');
    } finally {
      setImageUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="bg-red-900/20 border border-red-500 rounded-lg p-4">
        <p className="text-red-400">Please sign in to view your profile</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gold">Profile Settings</h1>
        <p className="text-gray-400 mt-1">Manage your personal information</p>
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Picture */}
        <div className="bg-charcoal rounded-lg border border-gold/20 p-6">
          <h3 className="text-lg font-semibold text-gold mb-4">Profile Picture</h3>
          
          <div className="flex flex-col items-center">
            <div className="relative w-32 h-32 mb-4">
              {user.profile?.avatar_url ? (
                <Image
                  src={user.profile.avatar_url}
                  alt="Profile"
                  fill
                  className="rounded-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gold/20 rounded-full flex items-center justify-center">
                  <User className="w-16 h-16 text-gold" />
                </div>
              )}
              
              <label className="absolute bottom-0 right-0 bg-gold text-black p-2 rounded-full cursor-pointer hover:bg-gold/80 transition-colors">
                <Camera className="w-4 h-4" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  disabled={imageUploading}
                />
              </label>
            </div>
            
            {imageUploading && (
              <p className="text-sm text-gray-400">Uploading...</p>
            )}
          </div>
        </div>

        {/* Profile Form */}
        <div className="lg:col-span-2 bg-charcoal rounded-lg border border-gold/20 p-6">
          <h3 className="text-lg font-semibold text-gold mb-6">Personal Information</h3>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <User className="w-4 h-4 inline mr-2" />
                  Full Name
                </label>
                <input
                  type="text"
                  value={profile.fullName}
                  onChange={(e) => setProfile(prev => ({ ...prev, fullName: e.target.value }))}
                  className="w-full px-4 py-2 bg-black border border-gold/20 rounded-md text-white placeholder-gray-400 focus:outline-none focus:border-gold"
                  placeholder="Enter your full name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <Mail className="w-4 h-4 inline mr-2" />
                  Email Address
                </label>
                <input
                  type="email"
                  value={user.email}
                  disabled
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-md text-gray-400 cursor-not-allowed"
                />
                <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <Phone className="w-4 h-4 inline mr-2" />
                  Phone Number
                </label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gold/20 bg-charcoal text-gray-300 text-sm">
                    +977
                  </span>
                  <input
                    type="tel"
                    value={profile.phone}
                    onChange={(e) => setProfile(prev => ({ ...prev, phone: e.target.value }))}
                    className="flex-1 px-4 py-2 bg-black border border-gold/20 rounded-r-md text-white placeholder-gray-400 focus:outline-none focus:border-gold"
                    placeholder="98XXXXXXXX"
                    maxLength={10}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">Enter 10-digit Nepal mobile number</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <Calendar className="w-4 h-4 inline mr-2" />
                  Date of Birth
                </label>
                <input
                  type="date"
                  value={profile.dateOfBirth}
                  onChange={(e) => setProfile(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                  className="w-full px-4 py-2 bg-black border border-gold/20 rounded-md text-white focus:outline-none focus:border-gold"
                />
              </div>
            </div>

            <div className="pt-6 border-t border-gold/20">
              <button
                type="submit"
                disabled={saving}
                className="btn-primary flex items-center"
              >
                <Save className="w-4 h-4 mr-2" />
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Account Info */}
      <div className="bg-charcoal rounded-lg border border-gold/20 p-6">
        <h3 className="text-lg font-semibold text-gold mb-4">Account Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
          <div>
            <span className="text-gray-400">Member since:</span>
            <span className="text-white ml-2">
              {user.created_at ? formatSafeDate(user.created_at) : 'N/A'}
            </span>
          </div>
          <div>
            <span className="text-gray-400">Account ID:</span>
            <span className="text-white ml-2 font-mono">
              {user.id.slice(-8)}
            </span>
          </div>
          <div>
            <span className="text-gray-400">Account Type:</span>
            <span className="text-white ml-2 capitalize">
              {user.role}
            </span>
          </div>
          <div>
            <span className="text-gray-400">Email Verified:</span>
            <span className={`ml-2 ${user.email_verified ? 'text-green-400' : 'text-red-400'}`}>
              {user.email_verified ? 'Yes' : 'No'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}