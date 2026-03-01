'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import config from '@/config';

interface AnalyticsData {
  summary: {
    totalOrganizations: number;
    activeOrganizations: number;
    totalGuests: number;
    activeGuests: number;
    todayGuests: number;
    averageVisitDuration: number;
  };
  guestsByOrganization: Array<{
    organizationName: string;
    guestCount: number;
  }>;
  dailyTrends: Array<{
    _id: string;
    count: number;
  }>;
  peakHours: Array<{
    _id: number;
    count: number;
  }>;
}

export default function AdvancedAnalytics() {
  const router = useRouter();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState({ startDate: '', endDate: '' });

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    const isSystem = localStorage.getItem('is_system_login');

    if (!token || isSystem !== 'true') {
      router.push('/admin?type=system');
      return;
    }

    fetchAnalytics(token);
  }, [router]);

  const fetchAnalytics = async (token: string, start?: string, end?: string) => {
    try {
      let url = `${config.apiUrl}/api/system/analytics`;
      const params = new URLSearchParams();
      if (start) params.append('startDate', start);
      if (end) params.append('endDate', end);
      if (params.toString()) url += `?${params.toString()}`;

      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const result = await response.json();
      if (result.success && result.data) {
        setAnalytics(result.data);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDateFilter = () => {
    const token = localStorage.getItem('admin_token');
    if (token) {
      setIsLoading(true);
      fetchAnalytics(token, dateRange.startDate, dateRange.endDate);
    }
  };

  const clearFilter = () => {
    setDateRange({ startDate: '', endDate: '' });
    const token = localStorage.getItem('admin_token');
    if (token) {
      setIsLoading(true);
      fetchAnalytics(token);
    }
  };

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
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/system/dashboard" className="text-white hover:text-purple-100">
                <span className="text-2xl">←</span>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-white">Advanced Analytics</h1>
                <p className="text-purple-100 text-sm">System-wide reports and insights</p>
              </div>
            </div>
            <Link
              href="/"
              className="bg-white bg-opacity-20 text-white px-4 py-2 rounded-lg hover:bg-opacity-30 transition-colors flex items-center gap-2"
            >
              <span>🏠</span>
              <span className="font-medium">Home</span>
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Date Range Filter */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Date Range Filter</h2>
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
              <input
                type="date"
                value={dateRange.startDate}
                onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
              <input
                type="date"
                value={dateRange.endDate}
                onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <button
              onClick={handleDateFilter}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Apply Filter
            </button>
            <button
              onClick={clearFilter}
              className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Clear
            </button>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="text-2xl mb-2">🏢</div>
            <p className="text-sm text-gray-500">Total Orgs</p>
            <p className="text-2xl font-bold text-gray-900">{analytics?.summary.totalOrganizations}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="text-2xl mb-2">✅</div>
            <p className="text-sm text-gray-500">Active Orgs</p>
            <p className="text-2xl font-bold text-green-600">{analytics?.summary.activeOrganizations}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="text-2xl mb-2">👥</div>
            <p className="text-sm text-gray-500">Total Guests</p>
            <p className="text-2xl font-bold text-gray-900">{analytics?.summary.totalGuests}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="text-2xl mb-2">🟢</div>
            <p className="text-sm text-gray-500">Active Now</p>
            <p className="text-2xl font-bold text-blue-600">{analytics?.summary.activeGuests}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="text-2xl mb-2">📅</div>
            <p className="text-sm text-gray-500">Today</p>
            <p className="text-2xl font-bold text-indigo-600">{analytics?.summary.todayGuests}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="text-2xl mb-2">⏱️</div>
            <p className="text-sm text-gray-500">Avg Duration</p>
            <p className="text-2xl font-bold text-purple-600">{analytics?.summary.averageVisitDuration}m</p>
          </div>
        </div>

        {/* Top Organizations */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Top Organizations by Guest Count</h2>
          <div className="space-y-3">
            {analytics?.guestsByOrganization.map((org, index) => (
              <div key={index} className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center font-bold">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-medium text-gray-900">{org.organizationName}</span>
                    <span className="text-sm text-gray-600">{org.guestCount} guests</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-purple-600 h-2 rounded-full transition-all"
                      style={{
                        width: `${(org.guestCount / (analytics?.guestsByOrganization[0]?.guestCount || 1)) * 100}%`
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Daily Trends */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Daily Trends (Last 30 Days)</h2>
            <div className="space-y-2">
              {analytics?.dailyTrends.slice(-10).map((trend, index) => (
                <div key={index} className="flex items-center gap-3">
                  <span className="text-sm text-gray-600 w-24">{new Date(trend._id).toLocaleDateString()}</span>
                  <div className="flex-1 bg-gray-200 rounded-full h-6">
                    <div
                      className="bg-indigo-600 h-6 rounded-full flex items-center justify-end pr-2 transition-all"
                      style={{
                        width: `${(trend.count / Math.max(...(analytics?.dailyTrends.map(t => t.count) || [1]))) * 100}%`,
                        minWidth: '30px'
                      }}
                    >
                      <span className="text-xs text-white font-medium">{trend.count}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Peak Hours */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Peak Hours</h2>
            <div className="space-y-2">
              {analytics?.peakHours.map((hour, index) => (
                <div key={index} className="flex items-center gap-3">
                  <span className="text-sm text-gray-600 w-16">
                    {hour._id}:00
                  </span>
                  <div className="flex-1 bg-gray-200 rounded-full h-6">
                    <div
                      className="bg-purple-600 h-6 rounded-full flex items-center justify-end pr-2 transition-all"
                      style={{
                        width: `${(hour.count / Math.max(...(analytics?.peakHours.map(h => h.count) || [1]))) * 100}%`,
                        minWidth: '30px'
                      }}
                    >
                      <span className="text-xs text-white font-medium">{hour.count}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
