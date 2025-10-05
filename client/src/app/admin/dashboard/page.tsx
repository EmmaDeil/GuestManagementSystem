'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Guest, Organization, DashboardStats, GuestsListResponse, ApiResponse } from '../../../types';
import config from '../../../config';

export default function AdminDashboard() {
   const router = useRouter();
   const [organization, setOrganization] = useState<Organization | null>(null);
   const [stats, setStats] = useState<DashboardStats | null>(null);
   const [guests, setGuests] = useState<Guest[]>([]);
   const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
   const [isLoading, setIsLoading] = useState(true);
   const [error, setError] = useState<string | null>(null);
   const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null);
   const [showDetailsModal, setShowDetailsModal] = useState(false);
   const [currentTime, setCurrentTime] = useState(new Date());
   const [showExportModal, setShowExportModal] = useState(false);
   const [exportStartDate, setExportStartDate] = useState('');
   const [exportEndDate, setExportEndDate] = useState('');
   const [isExporting, setIsExporting] = useState(false);
   const [showExtendModal, setShowExtendModal] = useState(false);
   const [extendGuestId, setExtendGuestId] = useState<string | null>(null);
   const [extendMinutes, setExtendMinutes] = useState('30');
   const [showAssignIdModal, setShowAssignIdModal] = useState(false);
   const [assignIdGuestId, setAssignIdGuestId] = useState<string | null>(null);
   const [idCardNumber, setIdCardNumber] = useState('');
   const autoSigningOutRef = useRef<Set<string>>(new Set());

   const fetchDashboardData = useCallback(async (token: string) => {
      try {
         const [statsRes, guestsRes] = await Promise.all([
            fetch(`${config.apiUrl}/api/dashboard/stats`, {
               headers: { Authorization: `Bearer ${token}` }
            }),
            fetch(`${config.apiUrl}/api/guests`, {
               headers: { Authorization: `Bearer ${token}` }
            })
         ]);

         const statsData: ApiResponse<DashboardStats> = await statsRes.json();
         const guestsData: ApiResponse<GuestsListResponse> = await guestsRes.json();

         if (statsData.success && statsData.data) {
            setStats(statsData.data);
         }

         if (guestsData.success && guestsData.data && guestsData.data.guests) {
            setGuests(Array.isArray(guestsData.data.guests) ? guestsData.data.guests : []);
         } else {
            setGuests([]); // Ensure guests is always an array
         }
      } catch (err) {
         setError('Failed to load dashboard data');
         console.error('Error fetching dashboard data:', err);
      } finally {
         setIsLoading(false);
      }
   }, []);

   useEffect(() => {
      const token = localStorage.getItem('admin_token');
      const orgData = localStorage.getItem('organization');

      if (!token || !orgData) {
         router.push('/admin');
         return;
      }

      try {
         const org = JSON.parse(orgData);
         setOrganization(org);
         fetchDashboardData(token);
      } catch (err) {
         console.error('Error parsing organization data:', err);
         router.push('/admin');
      }
   }, [router, fetchDashboardData]);

   // Real-time timer updates with auto-expiry
   useEffect(() => {
      const autoSignOutExpiredGuest = async (guestId: string) => {
         // Check if we're already trying to sign out this guest
         if (autoSigningOutRef.current.has(guestId)) {
            return;
         }

         const token = localStorage.getItem('admin_token');
         if (!token) return;

         // Mark guest as being processed
         autoSigningOutRef.current.add(guestId);

         try {
            const response = await fetch(`${config.apiUrl}/api/guests/${guestId}/signout`, {
               method: 'PATCH',
               headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json'
               }
            });

            if (response.ok) {
               const result: ApiResponse = await response.json();
               if (result.success) {
                  // Silently refresh data without showing error
                  const token = localStorage.getItem('admin_token');
                  if (token) {
                     fetchDashboardData(token);
                  }
               }
            } else if (response.status === 404) {
               // Guest not found - probably already signed out, just refresh data
               const token = localStorage.getItem('admin_token');
               if (token) {
                  fetchDashboardData(token);
               }
            }
         } catch {
            // Silently handle auto-expiry errors
            console.log('Auto-expiry handled for guest:', guestId);
         } finally {
            // Remove guest from processing set
            autoSigningOutRef.current.delete(guestId);
         }
      };

      const interval = setInterval(() => {
         const now = new Date();
         setCurrentTime(now);

         // Auto-expire guests whose time has run out
         guests.forEach(guest => {
            if (guest.status === 'signed-in') {
               const signInTime = new Date(guest.signInTime);
               const expectedEndTime = new Date(signInTime.getTime() + guest.expectedDuration * 60 * 1000);

               if (now > expectedEndTime) {
                  // Auto sign out expired guest (only if not already being processed)
                  autoSignOutExpiredGuest(guest._id!);
               }
            }
         });
      }, 1000); // Update every second

      return () => clearInterval(interval);
   }, [guests, fetchDashboardData]);

   // Auto-refresh guest list every 10 seconds to show new sign-ins
   useEffect(() => {
      const token = localStorage.getItem('admin_token');
      if (!token) return;

      const refreshInterval = setInterval(() => {
         // Silently refresh dashboard data in the background
         fetchDashboardData(token);
      }, 10000); // Refresh every 10 seconds

      return () => clearInterval(refreshInterval);
   }, [fetchDashboardData]);

   const generateQRCode = async () => {
      const token = localStorage.getItem('admin_token');
      if (!token || !organization) return;

      try {
         const response = await fetch(`${config.apiUrl}/api/qr/generate`, {
            method: 'POST',
            headers: {
               'Authorization': `Bearer ${token}`,
               'Content-Type': 'application/json'
            }
         });

         const result: ApiResponse<{ qrCodeUrl: string }> = await response.json();

         if (result.success && result.data) {
            setQrCodeUrl(result.data.qrCodeUrl);
         } else {
            setError(result.message || 'Failed to generate QR code');
         }
      } catch (err) {
         setError('Failed to generate QR code');
         console.error('Error generating QR code:', err);
      }
   };

   const printQRCode = () => {
      if (!qrCodeUrl) return;

      const printWindow = window.open('', '_blank');
      if (!printWindow) {
         alert('Please allow pop-ups to print the QR code');
         return;
      }

      const orgName = organization?.name || 'Guest Management System';
      const printDate = new Date().toLocaleDateString('en-US', {
         year: 'numeric',
         month: 'long',
         day: 'numeric'
      });

      printWindow.document.write(`
         <!DOCTYPE html>
         <html>
            <head>
               <title>Print QR Code - ${orgName}</title>
               <style>
                  @media print {
                     @page {
                        margin: 1cm;
                     }
                     body {
                        -webkit-print-color-adjust: exact;
                        print-color-adjust: exact;
                     }
                  }
                  body {
                     font-family: Arial, sans-serif;
                     display: flex;
                     justify-content: center;
                     align-items: center;
                     min-height: 100vh;
                     margin: 0;
                     padding: 20px;
                     background: white;
                  }
                  .container {
                     text-align: center;
                     max-width: 600px;
                     border: 2px solid #e5e7eb;
                     border-radius: 12px;
                     padding: 40px;
                     background: white;
                  }
                  .header {
                     margin-bottom: 30px;
                  }
                  h1 {
                     color: #1f2937;
                     font-size: 32px;
                     margin: 0 0 10px 0;
                     font-weight: bold;
                  }
                  .subtitle {
                     color: #6b7280;
                     font-size: 18px;
                     margin: 0 0 20px 0;
                  }
                  .qr-wrapper {
                     background: white;
                     padding: 20px;
                     border-radius: 8px;
                     display: inline-block;
                     margin: 20px 0;
                     box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                  }
                  img {
                     display: block;
                     width: 300px;
                     height: 300px;
                  }
                  .instructions {
                     margin-top: 30px;
                     padding: 20px;
                     background: #f9fafb;
                     border-radius: 8px;
                     text-align: left;
                  }
                  .instructions h2 {
                     color: #1f2937;
                     font-size: 20px;
                     margin: 0 0 15px 0;
                  }
                  .instructions ol {
                     color: #4b5563;
                     font-size: 16px;
                     line-height: 1.8;
                     margin: 0;
                     padding-left: 25px;
                  }
                  .footer {
                     margin-top: 30px;
                     padding-top: 20px;
                     border-top: 1px solid #e5e7eb;
                     color: #9ca3af;
                     font-size: 14px;
                  }
                  @media print {
                     .no-print {
                        display: none;
                     }
                  }
               </style>
            </head>
            <body>
               <div class="container">
                  <div class="header">
                     <h1>${orgName}</h1>
                     <p class="subtitle">Guest Sign-In QR Code</p>
                  </div>
                  
                  <div class="qr-wrapper">
                     <img src="${qrCodeUrl}" alt="QR Code for Guest Sign-In" />
                  </div>
                  
                  <div class="instructions">
                     <h2>📱 How to Use:</h2>
                     <ol>
                        <li>Open your smartphone camera</li>
                        <li>Point it at the QR code above</li>
                        <li>Tap the notification to open the sign-in form</li>
                        <li>Fill out your details and submit</li>
                        <li>Show your guest code to reception</li>
                     </ol>
                  </div>
                  
                  <div class="footer">
                     <p>Generated on ${printDate}</p>
                     <p>Guest Management System</p>
                  </div>
               </div>
               <script>
                  window.onload = function() {
                     setTimeout(function() {
                        window.print();
                     }, 250);
                  }
               </script>
            </body>
         </html>
      `);
      printWindow.document.close();
   };

   const handleLogout = () => {
      localStorage.removeItem('admin_token');
      localStorage.removeItem('organization');
      router.push('/admin');
   };

   const assignIdCard = async (guestId: string, idCardNumber: string) => {
      const token = localStorage.getItem('admin_token');
      if (!token) return;

      try {
         const response = await fetch(`${config.apiUrl}/api/guests/${guestId}/assign-id`, {
            method: 'PATCH',
            headers: {
               'Authorization': `Bearer ${token}`,
               'Content-Type': 'application/json'
            },
            body: JSON.stringify({ idCardNumber })
         });

         const result: ApiResponse = await response.json();

         if (result.success) {
            // Refresh guests data
            const token = localStorage.getItem('admin_token');
            if (token) {
               fetchDashboardData(token);
            }
         } else {
            setError(result.message || 'Failed to assign ID card');
         }
      } catch (err) {
         setError('Failed to assign ID card');
         console.error('Error assigning ID card:', err);
      }
   };

   const signOutGuest = async (guestId: string) => {
      const token = localStorage.getItem('admin_token');
      if (!token) return;

      if (!confirm('Are you sure you want to sign out this guest?')) return;

      try {
         const response = await fetch(`${config.apiUrl}/api/guests/${guestId}/signout`, {
            method: 'PATCH',
            headers: {
               'Authorization': `Bearer ${token}`,
               'Content-Type': 'application/json'
            }
         });

         if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
         }

         const result: ApiResponse = await response.json();

         if (result.success) {
            const token = localStorage.getItem('admin_token');
            if (token) {
               fetchDashboardData(token);
            }
         } else {
            setError(result.message || 'Failed to sign out guest');
         }
      } catch (err) {
         console.error('Sign out error:', err);
         setError('Failed to sign out guest. Please check if the guest exists.');
      }
   };

   const extendVisit = async (guestId: string, additionalMinutes: number) => {
      const token = localStorage.getItem('admin_token');
      if (!token) return;

      try {
         const response = await fetch(`${config.apiUrl}/api/guests/${guestId}/extend`, {
            method: 'PATCH',
            headers: {
               'Authorization': `Bearer ${token}`,
               'Content-Type': 'application/json'
            },
            body: JSON.stringify({ additionalMinutes })
         });

         const result: ApiResponse = await response.json();

         if (result.success) {
            const token = localStorage.getItem('admin_token');
            if (token) {
               fetchDashboardData(token);
            }
         } else {
            setError(result.message || 'Failed to extend visit');
         }
      } catch (err) {
         setError('Failed to extend visit');
         console.error('Error extending visit:', err);
      }
   };

   const handleExtendVisit = () => {
      if (!extendGuestId) return;

      const minutes = parseInt(extendMinutes);
      if (isNaN(minutes) || minutes <= 0) {
         setError('Please enter a valid number of minutes');
         return;
      }

      extendVisit(extendGuestId, minutes);
      setShowExtendModal(false);
      setExtendGuestId(null);
      setExtendMinutes('30'); // Reset to default
   };

   const handleAssignIdCard = () => {
      if (!assignIdGuestId || !idCardNumber.trim()) {
         setError('Please enter an ID card number');
         return;
      }

      assignIdCard(assignIdGuestId, idCardNumber.trim());
      setShowAssignIdModal(false);
      setAssignIdGuestId(null);
      setIdCardNumber(''); // Reset
   }; const isGuestExpired = (guest: Guest): boolean => {
      const signInTime = new Date(guest.signInTime);
      const expectedEndTime = new Date(signInTime.getTime() + guest.expectedDuration * 60 * 1000);
      return currentTime > expectedEndTime && guest.status === 'signed-in';
   };

   const getTimeRemaining = (guest: Guest): string => {
      const signInTime = new Date(guest.signInTime);
      const expectedEndTime = new Date(signInTime.getTime() + guest.expectedDuration * 60 * 1000);
      const diffMinutes = Math.floor((expectedEndTime.getTime() - currentTime.getTime()) / (1000 * 60));

      if (diffMinutes <= 0) {
         const overdue = Math.abs(diffMinutes);
         return `Overdue by ${overdue} min`;
      }

      return `${diffMinutes} min remaining`;
   };

   const exportGuestsData = async () => {
      const token = localStorage.getItem('admin_token');
      if (!token) return;

      // Validate required fields
      if (!exportStartDate || !exportEndDate) {
         setError('Both start date and end date are required for export');
         return;
      }

      // Validate date range
      if (new Date(exportStartDate) > new Date(exportEndDate)) {
         setError('Start date cannot be after end date');
         return;
      }

      setIsExporting(true);
      setError(null);
      try {
         // Build query parameters
         const params = new URLSearchParams();
         params.append('startDate', exportStartDate);
         params.append('endDate', exportEndDate);

         const queryString = params.toString();
         const url = queryString
            ? `${config.apiUrl}/api/guests/export?${queryString}`
            : `${config.apiUrl}/api/guests/export`;

         const response = await fetch(url, {
            headers: {
               'Authorization': `Bearer ${token}`
            }
         });

         if (!response.ok) {
            throw new Error('Failed to export data');
         }

         const data = await response.json();

         if (data.success && data.data) {
            // Convert to CSV
            const csvContent = convertToCSV(data.data);

            // Download file
            const blob = new Blob([csvContent], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;

            // Generate filename with date range
            const startStr = exportStartDate || 'all';
            const endStr = exportEndDate || 'current';
            link.download = `guests_${startStr}_to_${endStr}.csv`;

            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            setShowExportModal(false);
            setExportStartDate('');
            setExportEndDate('');
         } else {
            setError('No data found for the selected criteria');
         }
      } catch (err) {
         setError('Failed to export guests data');
         console.error('Export error:', err);
      } finally {
         setIsExporting(false);
      }
   };

   const convertToCSV = (data: Guest[]): string => {
      const headers = [
         'Guest Name',
         'Phone',
         'Email',
         'Guest Code',
         'Location',
         'Person to See',
         'Purpose',
         'Sign-In Time',
         'Sign-Out Time',
         'Expected Duration (min)',
         'Status',
         'ID Card Assigned',
         'ID Card Number'
      ];

      const rows = data.map(guest => [
         guest.guestName || 'N/A',
         guest.guestPhone || 'N/A',
         guest.guestEmail || 'Not provided',
         guest.guestCode || 'N/A',
         guest.location || 'N/A',
         guest.personToSee || 'N/A',
         guest.purpose || 'Not specified',
         guest.signInTime ? new Date(guest.signInTime).toLocaleString() : 'N/A',
         guest.signOutTime ? new Date(guest.signOutTime).toLocaleString() : 'Still signed in',
         guest.expectedDuration || 'N/A',
         guest.status || 'Unknown',
         guest.idCardAssigned ? 'Yes' : 'No',
         guest.idCardNumber || 'Not assigned'
      ]);

      const csvContent = [
         headers.join(','),
         ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      ].join('\n');

      return csvContent;
   }; if (isLoading) {
      return (
         <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
         </div>
      );
   }

   return (
      <div className="min-h-screen bg-gray-50">
         {/* Header */}
         <header className="bg-white shadow-sm border-b">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
               <div className="flex justify-between items-center py-4">
                  <div>
                     <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
                     <p className="text-gray-600">{organization?.name}</p>
                  </div>
                  <button
                     onClick={handleLogout}
                     className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                  >
                     Logout
                  </button>
               </div>
            </div>
         </header>

         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {error && (
               <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                  {error}
               </div>
            )}

            {/* Stats Cards */}
            {stats && (
               <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                  <div className="bg-white p-6 rounded-lg shadow">
                     <h3 className="text-sm font-medium text-gray-500">Total Guests</h3>
                     <p className="text-2xl font-bold text-gray-900">{stats.totalGuests}</p>
                  </div>
                  <div className="bg-white p-6 rounded-lg shadow">
                     <h3 className="text-sm font-medium text-gray-500">Active Guests</h3>
                     <p className="text-2xl font-bold text-green-600">{stats.activeGuests}</p>
                  </div>
                  <div className="bg-white p-6 rounded-lg shadow">
                     <h3 className="text-sm font-medium text-gray-500">Today&apos;s Guests</h3>
                     <p className="text-2xl font-bold text-blue-600">{stats.todayGuests}</p>
                  </div>
                  <div className="bg-white p-6 rounded-lg shadow">
                     <h3 className="text-sm font-medium text-gray-500">Pending ID Assignments</h3>
                     <p className="text-2xl font-bold text-orange-600">{stats.pendingIdAssignments}</p>
                  </div>
               </div>
            )}

            {/* QR Code Section */}
            <div className="bg-white rounded-lg shadow mb-8 p-6">
               <h2 className="text-lg font-semibold text-gray-900 mb-4">QR Code for Guest Sign-In</h2>
               <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                  <div className="flex flex-col gap-2">
                     <button
                        onClick={generateQRCode}
                        className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                     >
                        Generate QR Code
                     </button>
                     {qrCodeUrl && (
                        <button
                           onClick={printQRCode}
                           className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center gap-2"
                        >
                           <span>🖨️</span>
                           <span>Print QR Code</span>
                        </button>
                     )}
                  </div>
                  {qrCodeUrl && (
                     <div className="border-2 border-gray-200 rounded-lg p-4">
                        <Image src={qrCodeUrl} alt="QR Code" width={128} height={128} className="w-36 h-32" />
                        <p className="text-sm text-gray-600 mt-2 text-center">Guest Sign-In QR Code</p>
                     </div>
                  )}
               </div>
            </div>

            {/* Guests Table */}
            <div className="bg-white rounded-lg shadow">
               <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                  <h2 className="text-lg font-semibold text-gray-900">Recent Guests</h2>
                  <button
                     onClick={() => setShowExportModal(true)}
                     className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm"
                  >
                     📊 Export Data
                  </button>
               </div>
               <div className="overflow-hidden">
                  <div className="overflow-x-auto">
                     <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                           <tr>
                              <th className="px-2 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                 Guest
                              </th>
                              <th className="px-2 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                                 Code
                              </th>
                              <th className="px-2 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                                 Person to See
                              </th>
                              <th className="px-2 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                 Status
                              </th>
                              <th className="px-2 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                                 Sign-In Time
                              </th>
                              <th className="px-2 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                                 ID Card
                              </th>
                              <th className="px-2 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                 Timer Status
                              </th>
                              <th className="px-2 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                 Actions
                              </th>
                           </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                           {Array.isArray(guests) && guests.map((guest) => (
                              <tr key={guest._id}>
                                 <td className="px-2 sm:px-4 py-3">
                                    <div>
                                       <div className="text-sm font-medium text-gray-900 truncate max-w-[120px]">{guest.guestName}</div>
                                       <div className="text-xs text-gray-500 sm:hidden">{guest.guestCode}</div>
                                       <div className="text-xs text-gray-500 truncate max-w-[120px]">{guest.guestPhone}</div>
                                    </div>
                                 </td>
                                 <td className="px-2 sm:px-4 py-3 text-sm font-mono text-gray-900 hidden sm:table-cell">
                                    {guest.guestCode}
                                 </td>
                                 <td className="px-2 sm:px-4 py-3 text-sm text-gray-900 hidden md:table-cell">
                                    <div className="truncate max-w-[100px]">{guest.personToSee}</div>
                                 </td>
                                 <td className="px-2 sm:px-4 py-3">
                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${guest.status === 'signed-in'
                                       ? 'bg-green-100 text-green-800'
                                       : guest.status === 'signed-out'
                                          ? 'bg-gray-100 text-gray-800'
                                          : 'bg-red-100 text-red-800'
                                       }`}>
                                       {guest.status === 'signed-in' ? 'In' : guest.status === 'signed-out' ? 'Out' : 'Exp'}
                                    </span>
                                 </td>
                                 <td className="px-2 sm:px-4 py-3 text-xs text-gray-900 hidden lg:table-cell">
                                    {new Date(guest.signInTime).toLocaleString('en-US', {
                                       month: 'short',
                                       day: 'numeric',
                                       hour: '2-digit',
                                       minute: '2-digit'
                                    })}
                                 </td>
                                 <td className="px-2 sm:px-4 py-3 text-xs text-gray-900 hidden md:table-cell">
                                    {guest.idCardAssigned ? (
                                       <span className="text-green-600">✓ {guest.idCardNumber}</span>
                                    ) : (
                                       <span className="text-orange-600">Pending</span>
                                    )}
                                 </td>
                                 <td className="px-2 sm:px-4 py-3 text-xs">
                                    {guest.status === 'signed-in' && (
                                       <div className={`${isGuestExpired(guest) ? 'text-red-600 font-semibold' : 'text-gray-600'}`}>
                                          <div className="whitespace-nowrap">{getTimeRemaining(guest)}</div>
                                          {isGuestExpired(guest) && (
                                             <div className="text-xs text-red-500 mt-1">
                                                ⚠️ Expired
                                             </div>
                                          )}
                                       </div>
                                    )}
                                    {guest.status !== 'signed-in' && (
                                       <span className="text-gray-400">-</span>
                                    )}
                                 </td>
                                 <td className="px-2 sm:px-4 py-3">
                                    <div className="flex flex-col sm:flex-row gap-1">
                                       {/* Assign ID Card Button */}
                                       {!guest.idCardAssigned && guest.status === 'signed-in' && (
                                          <button
                                             onClick={() => {
                                                if (guest._id) {
                                                   setAssignIdGuestId(guest._id);
                                                   setShowAssignIdModal(true);
                                                }
                                             }}
                                             className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded text-xs font-medium whitespace-nowrap"
                                             title="Assign ID Card"
                                          >
                                             ID
                                          </button>
                                       )}

                                       {/* Sign Out Button */}
                                       {guest.status === 'signed-in' && (
                                          <button
                                             onClick={() => guest._id && signOutGuest(guest._id)}
                                             className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-xs font-medium whitespace-nowrap"
                                             title="Sign Out Guest"
                                          >
                                             Out
                                          </button>
                                       )}

                                       {/* Extend Visit Button */}
                                       {guest.status === 'signed-in' && (
                                          <button
                                             onClick={() => {
                                                if (guest._id) {
                                                   setExtendGuestId(guest._id);
                                                   setShowExtendModal(true);
                                                }
                                             }}
                                             className={`px-2 py-1 rounded text-xs font-medium whitespace-nowrap ${isGuestExpired(guest)
                                                ? 'bg-orange-500 hover:bg-orange-600 text-white animate-pulse'
                                                : 'bg-gray-500 hover:bg-gray-600 text-white'
                                                }`}
                                             title={isGuestExpired(guest) ? 'Guest is overdue - Extend visit time' : 'Extend Visit Time'}
                                          >
                                             {isGuestExpired(guest) ? '⏰' : 'Ext'}
                                          </button>
                                       )}

                                       {/* View Details Button */}
                                       <button
                                          onClick={() => {
                                             setSelectedGuest(guest);
                                             setShowDetailsModal(true);
                                          }}
                                          className="bg-indigo-500 hover:bg-indigo-600 text-white px-2 py-1 rounded text-xs font-medium whitespace-nowrap"
                                          title="View Guest Details"
                                       >
                                          📋
                                       </button>
                                    </div>
                                 </td>
                              </tr>
                           ))}
                        </tbody>
                     </table>
                     {Array.isArray(guests) && guests.length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                           No guests found
                        </div>
                     )}
                  </div>
               </div>
            </div>
         </div>

         {/* Guest Details Modal */}
         {showDetailsModal && selectedGuest && (
            <div className="fixed inset-0 bg-gray-500 bg-opacity-20 backdrop-blur-sm flex items-center justify-center z-50">
               <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                  <div className="flex justify-between items-center mb-4">
                     <h3 className="text-lg font-semibold text-gray-900">Guest Details</h3>
                     <button
                        onClick={() => setShowDetailsModal(false)}
                        className="text-gray-400 hover:text-gray-600"
                     >
                        ✕
                     </button>
                  </div>

                  <div className="space-y-3">
                     <div>
                        <label className="block text-sm font-medium text-gray-700">Name</label>
                        <p className="text-sm text-gray-900">{selectedGuest.guestName}</p>
                     </div>

                     <div>
                        <label className="block text-sm font-medium text-gray-700">Phone</label>
                        <p className="text-sm text-gray-900">{selectedGuest.guestPhone}</p>
                     </div>

                     {selectedGuest.guestEmail && (
                        <div>
                           <label className="block text-sm font-medium text-gray-700">Email</label>
                           <p className="text-sm text-gray-900">{selectedGuest.guestEmail}</p>
                        </div>
                     )}

                     <div>
                        <label className="block text-sm font-medium text-gray-700">Guest Code</label>
                        <p className="text-sm font-mono text-gray-900 bg-gray-100 px-2 py-1 rounded">{selectedGuest.guestCode}</p>
                     </div>

                     <div>
                        <label className="block text-sm font-medium text-gray-700">Location</label>
                        <p className="text-sm text-gray-900">{selectedGuest.location}</p>
                     </div>

                     <div>
                        <label className="block text-sm font-medium text-gray-700">Person to See</label>
                        <p className="text-sm text-gray-900">{selectedGuest.personToSee}</p>
                     </div>

                     {selectedGuest.purpose && (
                        <div>
                           <label className="block text-sm font-medium text-gray-700">Purpose</label>
                           <p className="text-sm text-gray-900">{selectedGuest.purpose}</p>
                        </div>
                     )}

                     <div>
                        <label className="block text-sm font-medium text-gray-700">Sign-In Time</label>
                        <p className="text-sm text-gray-900">{new Date(selectedGuest.signInTime).toLocaleString()}</p>
                     </div>

                     {selectedGuest.signOutTime && (
                        <div>
                           <label className="block text-sm font-medium text-gray-700">Sign-Out Time</label>
                           <p className="text-sm text-gray-900">{new Date(selectedGuest.signOutTime).toLocaleString()}</p>
                        </div>
                     )}

                     <div>
                        <label className="block text-sm font-medium text-gray-700">Expected Duration</label>
                        <p className="text-sm text-gray-900">{selectedGuest.expectedDuration} minutes</p>
                     </div>

                     <div>
                        <label className="block text-sm font-medium text-gray-700">Status</label>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${selectedGuest.status === 'signed-in'
                           ? 'bg-green-100 text-green-800'
                           : selectedGuest.status === 'signed-out'
                              ? 'bg-gray-100 text-gray-800'
                              : 'bg-red-100 text-red-800'
                           }`}>
                           {selectedGuest.status}
                        </span>
                     </div>

                     {selectedGuest.status === 'signed-in' && (
                        <div>
                           <label className="block text-sm font-medium text-gray-700">Time Status</label>
                           <p className={`text-sm ${isGuestExpired(selectedGuest) ? 'text-red-600 font-semibold' : 'text-gray-900'}`}>
                              {getTimeRemaining(selectedGuest)}
                           </p>
                        </div>
                     )}

                     <div>
                        <label className="block text-sm font-medium text-gray-700">ID Card Status</label>
                        <p className="text-sm text-gray-900">
                           {selectedGuest.idCardAssigned ? (
                              <span className="text-green-600">Assigned: {selectedGuest.idCardNumber}</span>
                           ) : (
                              <span className="text-orange-600">Not Assigned</span>
                           )}
                        </p>
                     </div>
                  </div>

                  <div className="mt-6 flex justify-end">
                     <button
                        onClick={() => setShowDetailsModal(false)}
                        className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded text-sm"
                     >
                        Close
                     </button>
                  </div>
               </div>
            </div>
         )}

         {/* Extend Time Modal */}
         {showExtendModal && (
            <div className="fixed inset-0 bg-gray-500 bg-opacity-20 backdrop-blur-sm flex items-center justify-center z-50">
               <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                  <div className="flex justify-between items-center mb-4">
                     <h3 className="text-lg font-semibold text-gray-900">⏰ Extend Visit Time</h3>
                     <button
                        onClick={() => {
                           setShowExtendModal(false);
                           setExtendGuestId(null);
                           setExtendMinutes('30');
                        }}
                        className="text-gray-400 hover:text-gray-600"
                     >
                        ✕
                     </button>
                  </div>

                  <div className="space-y-4">
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                           Extend visit by how many minutes?
                        </label>
                        <input
                           type="number"
                           value={extendMinutes}
                           onChange={(e) => setExtendMinutes(e.target.value)}
                           min="1"
                           max="480"
                           required
                           className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                           placeholder="Enter minutes (e.g., 30)"
                           autoFocus
                        />
                     </div>

                     <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded">
                        💡 <strong>Tip:</strong> Common values are 15, 30, 60, or 120 minutes.
                     </div>
                  </div>

                  <div className="mt-6 flex justify-end space-x-3">
                     <button
                        onClick={() => {
                           setShowExtendModal(false);
                           setExtendGuestId(null);
                           setExtendMinutes('30');
                        }}
                        className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded text-sm"
                     >
                        Cancel
                     </button>
                     <button
                        onClick={handleExtendVisit}
                        disabled={!extendMinutes || parseInt(extendMinutes) <= 0}
                        className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded text-sm flex items-center"
                     >
                        ⏰ Extend Time
                     </button>
                  </div>
               </div>
            </div>
         )}

         {/* Assign ID Card Modal */}
         {showAssignIdModal && (
            <div className="fixed inset-0 bg-gray-500 bg-opacity-20 backdrop-blur-sm flex items-center justify-center z-50">
               <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                  <div className="flex justify-between items-center mb-4">
                     <h3 className="text-lg font-semibold text-gray-900">🆔 Assign ID Card</h3>
                     <button
                        onClick={() => {
                           setShowAssignIdModal(false);
                           setAssignIdGuestId(null);
                           setIdCardNumber('');
                        }}
                        className="text-gray-400 hover:text-gray-600"
                     >
                        ✕
                     </button>
                  </div>

                  <div className="space-y-4">
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                           ID Card Number *
                        </label>
                        <input
                           type="text"
                           value={idCardNumber}
                           onChange={(e) => setIdCardNumber(e.target.value)}
                           required
                           className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                           placeholder="Enter ID card number (e.g., ID-001)"
                           autoFocus
                        />
                     </div>

                     <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded">
                        💡 <strong>Tip:</strong> Use a consistent format like ID-001, CARD-123, or any tracking number.
                     </div>
                  </div>

                  <div className="mt-6 flex justify-end space-x-3">
                     <button
                        onClick={() => {
                           setShowAssignIdModal(false);
                           setAssignIdGuestId(null);
                           setIdCardNumber('');
                        }}
                        className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded text-sm"
                     >
                        Cancel
                     </button>
                     <button
                        onClick={handleAssignIdCard}
                        disabled={!idCardNumber.trim()}
                        className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded text-sm flex items-center"
                     >
                        🆔 Assign Card
                     </button>
                  </div>
               </div>
            </div>
         )}

         {/* Export Data Modal */}
         {showExportModal && (
            <div className="fixed inset-0 bg-gray-500 bg-opacity-20 backdrop-blur-sm flex items-center justify-center z-50">
               <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                  <div className="flex justify-between items-center mb-4">
                     <h3 className="text-lg font-semibold text-gray-900">Export Guests Data</h3>
                     <button
                        onClick={() => setShowExportModal(false)}
                        className="text-gray-400 hover:text-gray-600"
                     >
                        ✕
                     </button>
                  </div>

                  <div className="space-y-4">
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Start Date *</label>
                        <input
                           type="date"
                           value={exportStartDate}
                           onChange={(e) => setExportStartDate(e.target.value)}
                           required
                           className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                     </div>

                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">End Date *</label>
                        <input
                           type="date"
                           value={exportEndDate}
                           onChange={(e) => setExportEndDate(e.target.value)}
                           required
                           className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                     </div>

                     <div className="text-sm text-gray-600">
                        Export will include all guest data for the selected date range. Both start and end dates are required.
                     </div>
                  </div>

                  <div className="mt-6 flex justify-end space-x-3">
                     <button
                        onClick={() => setShowExportModal(false)}
                        className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded text-sm"
                     >
                        Cancel
                     </button>
                     <button
                        onClick={exportGuestsData}
                        disabled={isExporting || !exportStartDate || !exportEndDate}
                        className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-2 rounded text-sm flex items-center"
                     >
                        {isExporting ? (
                           <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Exporting...
                           </>
                        ) : (
                           '📊 Export CSV'
                        )}
                     </button>
                  </div>
               </div>
            </div>
         )}
      </div>
   );
}