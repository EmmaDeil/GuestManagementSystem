'use client';

import { useState, useEffect } from 'react';
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
   }, [router]);

   const fetchDashboardData = async (token: string) => {
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
   };

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
         setError('Failed to sign out guest');
         console.error('Error signing out guest:', err);
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

   const isGuestExpired = (guest: Guest): boolean => {
      const signInTime = new Date(guest.signInTime);
      const expectedEndTime = new Date(signInTime.getTime() + guest.expectedDuration * 60 * 1000);
      return new Date() > expectedEndTime && guest.status === 'signed-in';
   };

   const getTimeRemaining = (guest: Guest): string => {
      const signInTime = new Date(guest.signInTime);
      const expectedEndTime = new Date(signInTime.getTime() + guest.expectedDuration * 60 * 1000);
      const now = new Date();
      const diffMinutes = Math.floor((expectedEndTime.getTime() - now.getTime()) / (1000 * 60));

      if (diffMinutes <= 0) {
         const overdue = Math.abs(diffMinutes);
         return `Overdue by ${overdue} min`;
      }

      return `${diffMinutes} min remaining`;
   };

   if (isLoading) {
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
                  <button
                     onClick={generateQRCode}
                     className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                     Generate QR Code
                  </button>
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
               <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">Recent Guests</h2>
               </div>
               <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                     <thead className="bg-gray-50">
                        <tr>
                           <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Guest
                           </th>
                           <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Code
                           </th>
                           <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Person to See
                           </th>
                           <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Status
                           </th>
                           <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Sign-In Time
                           </th>
                           <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              ID Card
                           </th>
                           <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Timer Status
                           </th>
                           <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Actions
                           </th>
                        </tr>
                     </thead>
                     <tbody className="bg-white divide-y divide-gray-200">
                        {Array.isArray(guests) && guests.map((guest) => (
                           <tr key={guest._id}>
                              <td className="px-6 py-4 whitespace-nowrap">
                                 <div>
                                    <div className="text-sm font-medium text-gray-900">{guest.guestName}</div>
                                    <div className="text-sm text-gray-500">{guest.guestPhone}</div>
                                 </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                                 {guest.guestCode}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                 {guest.personToSee}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                 <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${guest.status === 'signed-in'
                                    ? 'bg-green-100 text-green-800'
                                    : guest.status === 'signed-out'
                                       ? 'bg-gray-100 text-gray-800'
                                       : 'bg-red-100 text-red-800'
                                    }`}>
                                    {guest.status}
                                 </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                 {new Date(guest.signInTime).toLocaleString()}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                 {guest.idCardAssigned ? (
                                    <span className="text-green-600">Assigned: {guest.idCardNumber}</span>
                                 ) : (
                                    <span className="text-orange-600">Pending</span>
                                 )}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm">
                                 {guest.status === 'signed-in' && (
                                    <div className={`${isGuestExpired(guest) ? 'text-red-600 font-semibold' : 'text-gray-600'}`}>
                                       {getTimeRemaining(guest)}
                                       {isGuestExpired(guest) && (
                                          <div className="text-xs text-red-500 mt-1">
                                             ⚠️ Expired - Action Required
                                          </div>
                                       )}
                                    </div>
                                 )}
                                 {guest.status !== 'signed-in' && (
                                    <span className="text-gray-400">-</span>
                                 )}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm">
                                 <div className="flex space-x-2">
                                    {/* Assign ID Card Button */}
                                    {!guest.idCardAssigned && guest.status === 'signed-in' && (
                                       <button
                                          onClick={() => {
                                             const idCardNumber = prompt('Enter ID Card Number:');
                                             if (idCardNumber && guest._id) {
                                                assignIdCard(guest._id, idCardNumber);
                                             }
                                          }}
                                          className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-xs font-medium"
                                          title="Assign ID Card"
                                       >
                                          Assign ID
                                       </button>
                                    )}

                                    {/* Sign Out Button */}
                                    {guest.status === 'signed-in' && (
                                       <button
                                          onClick={() => guest._id && signOutGuest(guest._id)}
                                          className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-xs font-medium"
                                          title="Sign Out Guest"
                                       >
                                          Sign Out
                                       </button>
                                    )}

                                    {/* Extend Visit Button - Show prominently for expired guests */}
                                    {guest.status === 'signed-in' && (
                                       <button
                                          onClick={() => {
                                             const additional = prompt('Extend visit by how many minutes?', '30');
                                             if (additional && guest._id) {
                                                const minutes = parseInt(additional);
                                                if (!isNaN(minutes) && minutes > 0) {
                                                   extendVisit(guest._id, minutes);
                                                }
                                             }
                                          }}
                                          className={`px-3 py-1 rounded text-xs font-medium ${isGuestExpired(guest)
                                                ? 'bg-orange-500 hover:bg-orange-600 text-white animate-pulse'
                                                : 'bg-gray-500 hover:bg-gray-600 text-white'
                                             }`}
                                          title={isGuestExpired(guest) ? 'Guest is overdue - Extend visit time' : 'Extend Visit Time'}
                                       >
                                          {isGuestExpired(guest) ? '⏰ Extend' : 'Extend'}
                                       </button>
                                    )}

                                    {/* View Details Button */}
                                    <button
                                       onClick={() => {
                                          setSelectedGuest(guest);
                                          setShowDetailsModal(true);
                                       }}
                                       className="bg-indigo-500 hover:bg-indigo-600 text-white px-3 py-1 rounded text-xs font-medium"
                                       title="View Guest Details"
                                    >
                                       Details
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

         {/* Guest Details Modal */}
         {showDetailsModal && selectedGuest && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
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
      </div>
   );
}