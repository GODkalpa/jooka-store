'use client';

import { useState, useEffect } from 'react';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  email_verified: boolean;
  created_at: string;
  last_sign_in_at: string;
}

export default function UserDeletionTest() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteStatus, setDeleteStatus] = useState<string>('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/test/firebase-users');
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      setUsers(data.data?.users || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string, userEmail: string) => {
    if (!confirm(`Are you sure you want to delete user "${userEmail}"? This action cannot be undone.`)) {
      return;
    }

    try {
      setDeleteStatus(`Deleting user ${userEmail}...`);
      
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (response.ok) {
        setDeleteStatus(`✅ User ${userEmail} deleted successfully!`);
        // Refresh the users list
        await fetchUsers();
      } else {
        setDeleteStatus(`❌ Failed to delete user: ${result.error}`);
      }
    } catch (error) {
      console.error('Failed to delete user:', error);
      setDeleteStatus(`❌ Failed to delete user: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleRoleChange = async (userId: string, newRole: string, userEmail: string) => {
    try {
      setDeleteStatus(`Updating role for ${userEmail}...`);
      
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role: newRole }),
      });

      const result = await response.json();

      if (response.ok) {
        setDeleteStatus(`✅ Role updated for ${userEmail}!`);
        // Refresh the users list
        await fetchUsers();
      } else {
        setDeleteStatus(`❌ Failed to update role: ${result.error}`);
      }
    } catch (error) {
      console.error('Failed to update role:', error);
      setDeleteStatus(`❌ Failed to update role: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white p-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-gold mb-8">User Deletion Test</h1>
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black text-white p-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-gold mb-8">User Deletion Test</h1>
          <div className="bg-red-900/20 border border-red-500 rounded-lg p-4">
            <p className="text-red-400">Error: {error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gold mb-8">User Deletion Test</h1>
        
        {deleteStatus && (
          <div className="mb-6 p-4 bg-charcoal border border-gold/20 rounded-lg">
            <p className="text-white">{deleteStatus}</p>
          </div>
        )}

        <div className="bg-charcoal rounded-lg border border-gold/20 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gold/20 bg-gold/5">
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gold/20">
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-gray-400">
                      No users found
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user.id} className="hover:bg-gold/5">
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-white">
                            {user.name || 'No name'}
                          </div>
                          <div className="text-sm text-gray-400">{user.email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          user.role === 'admin' 
                            ? 'bg-purple-900/20 text-purple-400 border border-purple-500/20'
                            : 'bg-blue-900/20 text-blue-400 border border-blue-500/20'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          user.email_verified
                            ? 'bg-green-900/20 text-green-400 border border-green-500/20'
                            : 'bg-yellow-900/20 text-yellow-400 border border-yellow-500/20'
                        }`}>
                          {user.email_verified ? 'Verified' : 'Unverified'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleRoleChange(
                              user.id, 
                              user.role === 'admin' ? 'customer' : 'admin',
                              user.email
                            )}
                            className="px-3 py-1 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded"
                          >
                            {user.role === 'admin' ? 'Remove Admin' : 'Make Admin'}
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user.id, user.email)}
                            className="px-3 py-1 text-xs bg-red-600 hover:bg-red-700 text-white rounded"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}