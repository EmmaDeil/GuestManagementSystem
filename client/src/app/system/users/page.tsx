'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import config from '@/config';

interface User {
  _id: string;
  name: string;
  email: string;
  contactPerson: string;
  phone: string;
  isActive: boolean;
  createdAt: string;
  stats: {
    totalGuests: number;
    activeGuests: number;
  };
}

export default function UserManagement() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    const isSystem = localStorage.getItem('is_system_login');

    if (!token || isSystem !== 'true') {
      router.push('/admin?type=system');
      return;
    }

    fetchUsers(token);
  }, [router]);

  const fetchUsers = async (token: string) => {
    try {
      const response = await fetch(`${config.apiUrl}/api/system/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const result = await response.json();
      if (result.success && result.data) {
        setUsers(result.data.users);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleUserStatus = async (userId: string, currentStatus: boolean) => {
    const token = localStorage.getItem('admin_token');
    try {
      const response = await fetch(`${config.apiUrl}/api/system/users/${userId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ isActive: !currentStatus })
      });

      const result = await response.json();
      if (result.success) {
        setUsers(users.map(u => u._id === userId ? { ...u, isActive: !currentStatus } : u));
      }
    } catch (error) {
      console.error('Error toggling user status:', error);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' ||
                         (filterStatus === 'active' && user.isActive) ||
                         (filterStatus === 'inactive' && !user.isActive);
    return matchesSearch && matchesFilter;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-gradient-to-r from-purple-600 to-indigo-700 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2 sm:gap-3">
              <Link href="/system/dashboard" className="text-white hover:text-purple-100">
                <span className="text-xl sm:text-2xl">←</span>
              </Link>
              <div>
                <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-white">User Management</h1>
                <p className="text-purple-100 text-xs sm:text-sm">Manage system users and organizations</p>
              </div>
            </div>
            <Link
              href="/"
              className="bg-white bg-opacity-20 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-opacity-30 transition-colors flex items-center gap-2 text-sm sm:text-base"
            >
              <span>🏠</span>
              <span className="font-medium hidden sm:inline">Home</span>
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
            <div className="flex items-center gap-3">
              <div className="text-2xl sm:text-3xl">👥</div>
              <div>
                <p className="text-xs sm:text-sm text-gray-500">Total Users</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">{users.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
            <div className="flex items-center gap-3">
              <div className="text-2xl sm:text-3xl">✅</div>
              <div>
                <p className="text-xs sm:text-sm text-gray-500">Active Users</p>
                <p className="text-xl sm:text-2xl font-bold text-green-600">{users.filter(u => u.isActive).length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
            <div className="flex items-center gap-3">
              <div className="text-2xl sm:text-3xl">⏸️</div>
              <div>
                <p className="text-xs sm:text-sm text-gray-500">Inactive Users</p>
                <p className="text-xl sm:text-2xl font-bold text-orange-600">{users.filter(u => !u.isActive).length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <input
                type="text"
                placeholder="Search users by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm sm:text-base"
              />
            </div>
            <div className="flex gap-2">
              {(['all', 'active', 'inactive'] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`flex-1 px-2 sm:px-4 py-2 rounded-lg font-medium transition-colors text-xs sm:text-sm ${
                    filterStatus === status
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-2 sm:px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Organization
                  </th>
                  <th className="hidden md:table-cell px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact Person
                  </th>
                  <th className="hidden sm:table-cell px-2 sm:px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="hidden lg:table-cell px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Guests
                  </th>
                  <th className="px-2 sm:px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-2 sm:px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50">
                    <td className="px-2 sm:px-4 md:px-6 py-4">
                      <div className="font-medium text-gray-900 text-sm sm:text-base">{user.name}</div>
                      <div className="text-xs sm:text-sm text-gray-500">{user.phone}</div>
                      {/* Show contact person on mobile as secondary info */}
                      <div className="md:hidden text-xs text-gray-500 mt-1">
                        Contact: {user.contactPerson}
                      </div>
                      {/* Show email on mobile */}
                      <div className="sm:hidden text-xs text-gray-500 mt-1 break-all">
                        {user.email}
                      </div>
                    </td>
                    <td className="hidden md:table-cell px-4 md:px-6 py-4">
                      <div className="text-sm text-gray-900">{user.contactPerson}</div>
                    </td>
                    <td className="hidden sm:table-cell px-2 sm:px-4 md:px-6 py-4">
                      <div className="text-sm text-gray-900 break-all max-w-xs">{user.email}</div>
                    </td>
                    <td className="hidden lg:table-cell px-4 md:px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {user.stats.totalGuests} total
                        {user.stats.activeGuests > 0 && (
                          <span className="ml-2 text-green-600">({user.stats.activeGuests} active)</span>
                        )}
                      </div>
                    </td>
                    <td className="px-2 sm:px-4 md:px-6 py-4">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full whitespace-nowrap ${
                        user.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                      {/* Show guest stats on mobile */}
                      <div className="lg:hidden text-xs text-gray-500 mt-1">
                        Guests: {user.stats.totalGuests}
                        {user.stats.activeGuests > 0 && ` (${user.stats.activeGuests} active)`}
                      </div>
                    </td>
                    <td className="px-2 sm:px-4 md:px-6 py-4 text-sm font-medium">
                      <button
                        onClick={() => toggleUserStatus(user._id, user.isActive)}
                        className={`px-2 sm:px-3 py-1 rounded text-xs sm:text-sm font-medium whitespace-nowrap ${
                          user.isActive
                            ? 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                            : 'bg-green-100 text-green-700 hover:bg-green-200'
                        }`}
                      >
                        {user.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredUsers.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No users found matching your criteria.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
