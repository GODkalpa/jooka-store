import { Shield, ShieldOff, Trash2, Mail, MailCheck } from 'lucide-react';
import TableRowActions from '@/components/ui/TableRowActions';
import { formatSafeDate } from '@/lib/utils/date';
import { api, ApiError } from '@/lib/api/client';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  email_verified: boolean;
  created_at: string;
  last_sign_in_at: string;
}

interface UsersTableProps {
  users: User[];
  onUserUpdate: () => void;
}

export default function UsersTable({ users, onUserUpdate }: UsersTableProps) {

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role: newRole }),
      });

      if (response.ok) {
        onUserUpdate();
        alert('User role updated successfully!');
      } else {
        const result = await response.json();
        alert(`Failed to update user role: ${result.error}`);
      }
    } catch (error) {
      console.error('Failed to update user role:', error);
      alert('Failed to update user role. Please try again.');
    }
  };

  const handleDelete = async (userId: string, userEmail: string) => {
    if (!confirm(`Are you sure you want to delete user "${userEmail}"? This action cannot be undone.`)) return;

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        onUserUpdate();
        alert('User deleted successfully!');
      } else {
        const result = await response.json();
        alert(`Failed to delete user: ${result.error}`);
      }
    } catch (error) {
      console.error('Failed to delete user:', error);
      alert('Failed to delete user. Please try again.');
    }
  };

  return (
    <div className="bg-charcoal rounded-lg border border-gold/20 overflow-hidden">
      <div className="overflow-x-auto overflow-y-visible">
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
                Joined
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Last Active
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gold/20">
            {users.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-400">
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
                      {user.role === 'admin' ? (
                        <Shield className="w-3 h-3 mr-1" />
                      ) : (
                        <ShieldOff className="w-3 h-3 mr-1" />
                      )}
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      user.email_verified
                        ? 'bg-green-900/20 text-green-400 border border-green-500/20'
                        : 'bg-yellow-900/20 text-yellow-400 border border-yellow-500/20'
                    }`}>
                      {user.email_verified ? (
                        <MailCheck className="w-3 h-3 mr-1" />
                      ) : (
                        <Mail className="w-3 h-3 mr-1" />
                      )}
                      {user.email_verified ? 'Verified' : 'Unverified'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-300">
                    {formatSafeDate(user.created_at)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-300">
                    {user.last_sign_in_at 
                      ? formatSafeDate(user.last_sign_in_at)
                      : 'Never'
                    }
                  </td>
                  <td className="px-6 py-4">
                    <TableRowActions
                      onDelete={() => handleDelete(user.id, user.email)}
                      customActions={[
                        {
                          label: user.role === 'admin' ? 'Remove Admin' : 'Make Admin',
                          icon: user.role === 'admin' ? ShieldOff : Shield,
                          onClick: () => handleRoleChange(user.id, user.role === 'admin' ? 'customer' : 'admin'),
                          variant: 'secondary'
                        }
                      ]}
                      size="sm"
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}