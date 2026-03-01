'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Organization } from '../../../types';

interface SystemUser {
   email: string;
   role: string;
   loginTime: string;
}

export default function SystemDashboard() {
   const router = useRouter();
   const [organization, setOrganization] = useState<Organization | null>(null);
   const [systemUser, setSystemUser] = useState<SystemUser | null>(null);
   const [isLoading, setIsLoading] = useState(true);

   useEffect(() => {
      // Check if user is authenticated
      const token = localStorage.getItem('admin_token');
      const orgData = localStorage.getItem('organization');
      const isSystem = localStorage.getItem('is_system_login');

      if (!token || isSystem !== 'true') {
         router.push('/admin?type=system');
         return;
      }

      if (orgData) {
         try {
            const org = JSON.parse(orgData);
            setOrganization(org);
            
            // Extract email from organization data or create system user
            setSystemUser({
               email: org.email || 'system@admin.com',
               role: 'System Administrator',
               loginTime: new Date().toLocaleString()
            });
         } catch (err) {
            console.error('Error parsing organization data:', err);
         }
      }

      setIsLoading(false);
   }, [router]);

   const handleLogout = () => {
      localStorage.removeItem('admin_token');
      localStorage.removeItem('organization');
      localStorage.removeItem('is_system_login');
      router.push('/');
   };

   if (isLoading) {
      return (
         <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="bg-white p-8 rounded-lg shadow-lg">
               <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
               <p className="text-center mt-4 text-gray-600">Loading...</p>
            </div>
         </div>
      );
   }

   return (
      <div className="min-h-screen bg-gray-50">
         {/* Header */}
         <header className="bg-gradient-to-r from-purple-600 to-indigo-700 shadow-lg">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
               <div className="flex justify-between items-center py-4">
                  <div className="flex items-center gap-3">
                     <div className="text-4xl">🔑</div>
                     <div>
                        <h1 className="text-2xl font-bold text-white">System Portal</h1>
                        <p className="text-purple-100 text-sm">Administrator Dashboard</p>
                     </div>
                  </div>
                  <div className="flex items-center gap-3">
                     <Link
                        href="/"
                        className="bg-white bg-opacity-20 text-white px-4 py-2 rounded-lg hover:bg-opacity-30 transition-colors flex items-center gap-2"
                     >
                        <span className="text-lg">🏠</span>
                        <span className="font-medium">Home</span>
                     </Link>
                     <button
                        onClick={handleLogout}
                        className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                     >
                        Logout
                     </button>
                  </div>
               </div>
            </div>
         </header>

         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Welcome Section */}
            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg p-6 mb-8 border border-purple-200">
               <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Welcome to System Administration
               </h2>
               <p className="text-gray-600">
                  Manage system-wide configurations, users, and access controls
               </p>
            </div>

            {/* System User Details Card */}
            <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
               <div className="flex items-center gap-3 mb-6">
                  <div className="text-4xl">👤</div>
                  <h2 className="text-xl font-bold text-gray-900">System User Details</h2>
               </div>
               
               <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                     <div className="border-l-4 border-purple-600 pl-4">
                        <p className="text-sm font-medium text-gray-500">Email Address</p>
                        <p className="text-lg font-semibold text-gray-900">{systemUser?.email}</p>
                     </div>
                     
                     <div className="border-l-4 border-indigo-600 pl-4">
                        <p className="text-sm font-medium text-gray-500">Role</p>
                        <p className="text-lg font-semibold text-gray-900">{systemUser?.role}</p>
                     </div>
                  </div>

                  <div className="space-y-4">
                     <div className="border-l-4 border-purple-600 pl-4">
                        <p className="text-sm font-medium text-gray-500">Organization</p>
                        <p className="text-lg font-semibold text-gray-900">{organization?.name || 'System Admin'}</p>
                     </div>

                     <div className="border-l-4 border-indigo-600 pl-4">
                        <p className="text-sm font-medium text-gray-500">Login Time</p>
                        <p className="text-lg font-semibold text-gray-900">{systemUser?.loginTime}</p>
                     </div>
                  </div>
               </div>

               {/* User Info Badge */}
               <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="flex items-center gap-2">
                     <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                        ✓ Authenticated
                     </span>
                     <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                        ✓ Active Session
                     </span>
                     <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                        🔒 Secure Connection
                     </span>
                  </div>
               </div>
            </div>

            {/* System Management Cards */}
            <div className="grid md:grid-cols-3 gap-6 mb-8">
               <Link href="/system/configuration" className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                  <div className="text-purple-600 text-4xl mb-3">⚙️</div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">System Configuration</h3>
                  <p className="text-sm text-gray-600 mb-4">
                     Configure system-wide settings and preferences
                  </p>
                  <div className="text-purple-600 hover:text-purple-700 font-medium text-sm">
                     Manage Settings →
                  </div>
               </Link>

               <Link href="/system/users" className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                  <div className="text-indigo-600 text-4xl mb-3">👥</div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">User Management</h3>
                  <p className="text-sm text-gray-600 mb-4">
                     Manage system users and access permissions
                  </p>
                  <div className="text-indigo-600 hover:text-indigo-700 font-medium text-sm">
                     Manage Users →
                  </div>
               </Link>

               <Link href="/system/analytics" className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                  <div className="text-purple-600 text-4xl mb-3">📊</div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Advanced Analytics</h3>
                  <p className="text-sm text-gray-600 mb-4">
                     View system-wide reports and analytics
                  </p>
                  <div className="text-purple-600 hover:text-purple-700 font-medium text-sm">
                     View Reports →
                  </div>
               </Link>
            </div>

            {/* Additional Features */}
            <div className="grid md:grid-cols-2 gap-6">
               <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                     <span>🔐</span> Security & Access Control
                  </h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                     <li className="flex items-start gap-2">
                        <span className="text-green-600">✓</span>
                        <span>Manage role-based access controls</span>
                     </li>
                     <li className="flex items-start gap-2">
                        <span className="text-green-600">✓</span>
                        <span>Configure authentication settings</span>
                     </li>
                     <li className="flex items-start gap-2">
                        <span className="text-green-600">✓</span>
                        <span>Monitor security logs and events</span>
                     </li>
                     <li className="flex items-start gap-2">
                        <span className="text-green-600">✓</span>
                        <span>Set up two-factor authentication</span>
                     </li>
                  </ul>
               </div>

               <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                     <span>📝</span> System Logs & Monitoring
                  </h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                     <li className="flex items-start gap-2">
                        <span className="text-green-600">✓</span>
                        <span>View real-time system activity</span>
                     </li>
                     <li className="flex items-start gap-2">
                        <span className="text-green-600">✓</span>
                        <span>Export audit logs and reports</span>
                     </li>
                     <li className="flex items-start gap-2">
                        <span className="text-green-600">✓</span>
                        <span>Monitor system performance metrics</span>
                     </li>
                     <li className="flex items-start gap-2">
                        <span className="text-green-600">✓</span>
                        <span>Configure alerts and notifications</span>
                     </li>
                  </ul>
               </div>
            </div>
         </div>

         {/* Footer */}
         <footer className="bg-gray-800 text-white py-6 mt-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
               <p className="text-sm">&copy; 2025 Guest Management System - System Portal</p>
               <p className="text-xs text-gray-400 mt-1">Administrator Access Only</p>
            </div>
         </footer>
      </div>
   );
}
