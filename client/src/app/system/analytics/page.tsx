'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import config from '@/config';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

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
  const [filterActive, setFilterActive] = useState(false);

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
    if (dateRange.startDate && dateRange.endDate) {
      // Validate that start date is before end date
      const start = new Date(dateRange.startDate);
      const end = new Date(dateRange.endDate);
      
      if (start > end) {
        alert('Start date must be before end date');
        return;
      }
    }

    const token = localStorage.getItem('admin_token');
    if (token) {
      setIsLoading(true);
      setFilterActive(!!dateRange.startDate || !!dateRange.endDate);
      fetchAnalytics(token, dateRange.startDate, dateRange.endDate);
    }
  };

  const clearFilter = () => {
    setDateRange({ startDate: '', endDate: '' });
    setFilterActive(false);
    const token = localStorage.getItem('admin_token');
    if (token) {
      setIsLoading(true);
      fetchAnalytics(token);
    }
  };

  const setQuickFilter = (days: number) => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - days);
    
    const startStr = start.toISOString().split('T')[0];
    const endStr = end.toISOString().split('T')[0];
    
    setDateRange({ startDate: startStr, endDate: endStr });
    
    const token = localStorage.getItem('admin_token');
    if (token) {
      setIsLoading(true);
      setFilterActive(true);
      fetchAnalytics(token, startStr, endStr);
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
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Date Range Filter</h2>
            {filterActive && (
              <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                Filter Active
              </span>
            )}
          </div>
          
          {/* Quick Filters */}
          <div className="flex gap-2 mb-4 flex-wrap">
            <button
              onClick={() => setQuickFilter(7)}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
            >
              Last 7 Days
            </button>
            <button
              onClick={() => setQuickFilter(30)}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
            >
              Last 30 Days
            </button>
            <button
              onClick={() => setQuickFilter(90)}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
            >
              Last 90 Days
            </button>
          </div>

          {/* Custom Date Range */}
          <div className="flex gap-4 items-end flex-wrap">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
              <input
                type="date"
                value={dateRange.startDate}
                onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <div className="flex-1 min-w-[200px]">
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
              disabled={isLoading}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Loading...' : 'Apply Filter'}
            </button>
            <button
              onClick={clearFilter}
              disabled={isLoading}
              className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
            {analytics && analytics.dailyTrends && analytics.dailyTrends.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart
                  data={analytics.dailyTrends.map(trend => ({
                    date: new Date(trend._id).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                    fullDate: trend._id,
                    guests: trend.count
                  }))}
                  margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorGuests" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="date" 
                    stroke="#6b7280" 
                    style={{ fontSize: '12px' }}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis 
                    stroke="#6b7280" 
                    style={{ fontSize: '12px' }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#fff', 
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                    labelStyle={{ color: '#111827', fontWeight: 'bold' }}
                  />
                  <Legend 
                    wrapperStyle={{ paddingTop: '20px' }}
                    iconType="circle"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="guests" 
                    stroke="#6366f1" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorGuests)" 
                    name="Guest Visits"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-gray-500">
                <p>No data available for the selected date range</p>
              </div>
            )}
          </div>

          {/* Peak Hours */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Peak Hours</h2>
            {analytics && analytics.peakHours && analytics.peakHours.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart
                  data={analytics.peakHours.map(hour => ({
                    hour: `${hour._id}:00`,
                    guests: hour.count
                  }))}
                  margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="hour" 
                    stroke="#6b7280" 
                    style={{ fontSize: '12px' }}
                  />
                  <YAxis 
                    stroke="#6b7280" 
                    style={{ fontSize: '12px' }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#fff', 
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                    labelStyle={{ color: '#111827', fontWeight: 'bold' }}
                  />
                  <Legend 
                    wrapperStyle={{ paddingTop: '20px' }}
                    iconType="circle"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="guests" 
                    stroke="#9333ea" 
                    strokeWidth={3}
                    dot={{ fill: '#9333ea', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6 }}
                    name="Guest Arrivals"
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-gray-500">
                <p>No data available for the selected date range</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
