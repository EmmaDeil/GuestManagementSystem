'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AdminRegister() {
   const router = useRouter();
   const [formData, setFormData] = useState({
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      contactPerson: '',
      phone: '',
      address: '',
      locations: ['Reception', 'Main Office'],
      staffMembers: ['Reception Staff'],
      minGuestVisitMinutes: 15
   });
   const [loading, setLoading] = useState(false);
   const [error, setError] = useState('');
   const [successMessage, setSuccessMessage] = useState('');

   const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const { name, value } = e.target;
      setFormData(prev => ({
         ...prev,
         [name]: value
      }));
   };

   const handleArrayChange = (index: number, value: string, field: 'locations' | 'staffMembers') => {
      setFormData(prev => ({
         ...prev,
         [field]: prev[field].map((item, i) => i === index ? value : item)
      }));
   };

   const addArrayItem = (field: 'locations' | 'staffMembers') => {
      setFormData(prev => ({
         ...prev,
         [field]: [...prev[field], '']
      }));
   };

   const removeArrayItem = (index: number, field: 'locations' | 'staffMembers') => {
      setFormData(prev => ({
         ...prev,
         [field]: prev[field].filter((_, i) => i !== index)
      }));
   };

   const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setLoading(true);
      setError('');
      setSuccessMessage('');

      // Validation
      if (formData.password !== formData.confirmPassword) {
         setError('Passwords do not match');
         setLoading(false);
         return;
      }

      if (formData.password.length < 6) {
         setError('Password must be at least 6 characters long');
         setLoading(false);
         return;
      }

      try {
         const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: {
               'Content-Type': 'application/json',
            },
            body: JSON.stringify({
               name: formData.name,
               email: formData.email,
               password: formData.password,
               contactPerson: formData.contactPerson,
               phone: formData.phone,
               address: formData.address,
               locations: formData.locations.filter(loc => loc.trim() !== ''),
               staffMembers: formData.staffMembers.filter(staff => staff.trim() !== ''),
               minGuestVisitMinutes: Number(formData.minGuestVisitMinutes)
            }),
         });

         const data = await response.json();

         if (response.ok) {
            // Registration successful
            setSuccessMessage('Organization registered successfully! Please login.');
            setTimeout(() => {
               router.push('/admin');
            }, 2000);
         } else {
            setError(data.message || 'Registration failed');
         }
      } catch (err) {
         setError('Network error. Please try again.');
         console.error('Registration error:', err);
      } finally {
         setLoading(false);
      }
   };

   return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
         <div className="max-w-2xl w-full space-y-8">
            <div>
               <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                  Register Your Organization
               </h2>
               <p className="mt-2 text-center text-sm text-gray-600">
                  Create an account to manage your guest registration system
               </p>
            </div>

            <form className="mt-8 space-y-6 bg-white p-8 rounded-lg shadow-md" onSubmit={handleSubmit}>
               {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
                     <span className="block sm:inline">{error}</span>
                  </div>
               )}

               {successMessage && (
                  <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded relative" role="alert">
                     <span className="block sm:inline">{successMessage}</span>
                  </div>
               )}

               {/* Organization Information */}
               <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900">Organization Information</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                           Organization Name *
                        </label>
                        <input
                           id="name"
                           name="name"
                           type="text"
                           required
                           value={formData.name}
                           onChange={handleChange}
                           className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                           placeholder="Your organization name"
                        />
                     </div>

                     <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                           Email Address *
                        </label>
                        <input
                           id="email"
                           name="email"
                           type="email"
                           autoComplete="email"
                           required
                           value={formData.email}
                           onChange={handleChange}
                           className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                           placeholder="organization@example.com"
                        />
                     </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                           Password *
                        </label>
                        <input
                           id="password"
                           name="password"
                           type="password"
                           autoComplete="new-password"
                           required
                           value={formData.password}
                           onChange={handleChange}
                           className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                           placeholder="Password (min 6 characters)"
                        />
                     </div>

                     <div>
                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                           Confirm Password *
                        </label>
                        <input
                           id="confirmPassword"
                           name="confirmPassword"
                           type="password"
                           autoComplete="new-password"
                           required
                           value={formData.confirmPassword}
                           onChange={handleChange}
                           className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                           placeholder="Confirm your password"
                        />
                     </div>
                  </div>
               </div>

               {/* Contact Information */}
               <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900">Contact Information</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div>
                        <label htmlFor="contactPerson" className="block text-sm font-medium text-gray-700">
                           Contact Person *
                        </label>
                        <input
                           id="contactPerson"
                           name="contactPerson"
                           type="text"
                           required
                           value={formData.contactPerson}
                           onChange={handleChange}
                           className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                           placeholder="Primary contact name"
                        />
                     </div>

                     <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                           Phone Number *
                        </label>
                        <input
                           id="phone"
                           name="phone"
                           type="tel"
                           required
                           value={formData.phone}
                           onChange={handleChange}
                           className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                           placeholder="+1234567890"
                        />
                     </div>
                  </div>

                  <div>
                     <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                        Address *
                     </label>
                     <textarea
                        id="address"
                        name="address"
                        rows={3}
                        required
                        value={formData.address}
                        onChange={handleChange}
                        className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                        placeholder="Complete organization address"
                     />
                  </div>
               </div>

               {/* Organization Settings */}
               <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900">Organization Settings</h3>

                  {/* Locations */}
                  <div>
                     <label className="block text-sm font-medium text-gray-700 mb-2">
                        Locations/Departments
                     </label>
                     {formData.locations.map((location, index) => (
                        <div key={index} className="flex items-center space-x-2 mb-2">
                           <input
                              type="text"
                              value={location}
                              onChange={(e) => handleArrayChange(index, e.target.value, 'locations')}
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                              placeholder="Location name"
                           />
                           {formData.locations.length > 1 && (
                              <button
                                 type="button"
                                 onClick={() => removeArrayItem(index, 'locations')}
                                 className="px-3 py-2 text-red-600 hover:text-red-800"
                              >
                                 Remove
                              </button>
                           )}
                        </div>
                     ))}
                     <button
                        type="button"
                        onClick={() => addArrayItem('locations')}
                        className="text-indigo-600 hover:text-indigo-800 text-sm"
                     >
                        + Add Location
                     </button>
                  </div>

                  {/* Staff Members */}
                  <div>
                     <label className="block text-sm font-medium text-gray-700 mb-2">
                        Staff Members
                     </label>
                     {formData.staffMembers.map((staff, index) => (
                        <div key={index} className="flex items-center space-x-2 mb-2">
                           <input
                              type="text"
                              value={staff}
                              onChange={(e) => handleArrayChange(index, e.target.value, 'staffMembers')}
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                              placeholder="Staff member name"
                           />
                           {formData.staffMembers.length > 1 && (
                              <button
                                 type="button"
                                 onClick={() => removeArrayItem(index, 'staffMembers')}
                                 className="px-3 py-2 text-red-600 hover:text-red-800"
                              >
                                 Remove
                              </button>
                           )}
                        </div>
                     ))}
                     <button
                        type="button"
                        onClick={() => addArrayItem('staffMembers')}
                        className="text-indigo-600 hover:text-indigo-800 text-sm"
                     >
                        + Add Staff Member
                     </button>
                  </div>

                  {/* Minimum Visit Duration */}
                  <div>
                     <label htmlFor="minGuestVisitMinutes" className="block text-sm font-medium text-gray-700">
                        Minimum Guest Visit Duration (minutes)
                     </label>
                     <select
                        id="minGuestVisitMinutes"
                        name="minGuestVisitMinutes"
                        value={formData.minGuestVisitMinutes}
                        onChange={handleChange}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                     >
                        <option value={5}>5 minutes</option>
                        <option value={10}>10 minutes</option>
                        <option value={15}>15 minutes</option>
                        <option value={30}>30 minutes</option>
                        <option value={60}>1 hour</option>
                     </select>
                  </div>
               </div>

               <div>
                  <button
                     type="submit"
                     disabled={loading}
                     className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                     {loading ? 'Registering...' : 'Register Organization'}
                  </button>
               </div>

               <div className="text-center">
                  <Link
                     href="/admin"
                     className="text-indigo-600 hover:text-indigo-500 text-sm"
                  >
                     Already have an account? Sign in
                  </Link>
               </div>
            </form>
         </div>
      </div>
   );
}