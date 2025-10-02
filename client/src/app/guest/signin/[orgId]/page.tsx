'use client';

import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { GuestRegistrationRequest, ApiResponse } from '../../../../types';

interface GuestFormData {
   guestName: string;
   guestPhone: string;
   guestEmail?: string;
   location: string;
   personToSee: string;
   purpose?: string;
   expectedDuration: number;
}

interface Organization {
   _id: string;
   name: string;
   locations: string[];
   staffMembers: string[];
   minGuestVisitMinutes: number;
}

export default function GuestSignInPage() {
   const params = useParams();
   const searchParams = useSearchParams();
   const orgId = params.orgId as string;
   const orgName = searchParams.get('org');

   const [organization, setOrganization] = useState<Organization | null>(null);
   const [isLoading, setIsLoading] = useState(true);
   const [isSubmitting, setIsSubmitting] = useState(false);
   const [guestCode, setGuestCode] = useState<string | null>(null);
   const [error, setError] = useState<string | null>(null);

   const {
      register,
      handleSubmit,
      watch,
      formState: { errors },
      reset
   } = useForm<GuestFormData>();

   const expectedDuration = watch('expectedDuration');

   useEffect(() => {
      const fetchOrganization = async () => {
         try {
            const response = await fetch(`/api/organizations/${orgId}`);
            const data: ApiResponse<Organization> = await response.json();

            if (data.success && data.data) {
               setOrganization(data.data);
            } else {
               setError('Organization not found');
            }
         } catch (err) {
            setError('Failed to load organization details');
            console.error('Error fetching organization:', err);
         } finally {
            setIsLoading(false);
         }
      };

      if (orgId) {
         fetchOrganization();
      }
   }, [orgId]);

   const onSubmit = async (formData: GuestFormData) => {
      if (!organization) return;

      setIsSubmitting(true);
      setError(null);

      try {
         const guestData: GuestRegistrationRequest = {
            ...formData,
            organizationId: orgId,
         };

         const response = await fetch('/api/guests/register', {
            method: 'POST',
            headers: {
               'Content-Type': 'application/json',
            },
            body: JSON.stringify(guestData),
         });

         const result: ApiResponse<{ guestCode: string }> = await response.json();

         if (result.success && result.data) {
            setGuestCode(result.data.guestCode);
            reset();
         } else {
            setError(result.message || 'Failed to register guest');
         }
      } catch (err) {
         setError('Failed to register guest. Please try again.');
         console.error('Error registering guest:', err);
      } finally {
         setIsSubmitting(false);
      }
   };

   const handleNewGuest = () => {
      setGuestCode(null);
      setError(null);
   };

   if (isLoading) {
      return (
         <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
            <div className="bg-white p-8 rounded-lg shadow-lg">
               <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
               <p className="text-center mt-4 text-gray-600">Loading...</p>
            </div>
         </div>
      );
   }

   if (error && !organization) {
      return (
         <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center">
            <div className="bg-white p-8 rounded-lg shadow-lg max-w-md text-center">
               <div className="text-red-500 text-6xl mb-4">⚠️</div>
               <h1 className="text-2xl font-bold text-gray-800 mb-2">Error</h1>
               <p className="text-gray-600">{error}</p>
            </div>
         </div>
      );
   }

   if (guestCode) {
      return (
         <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center px-4">
            <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full text-center">
               <div className="text-green-500 text-6xl mb-4">✅</div>
               <h1 className="text-2xl font-bold text-gray-800 mb-4">Welcome!</h1>
               <p className="text-gray-600 mb-6">You have been successfully registered as a guest.</p>

               <div className="bg-blue-50 p-6 rounded-lg mb-6">
                  <h2 className="text-lg font-semibold text-blue-800 mb-2">Your Guest Code</h2>
                  <div className="text-4xl font-bold text-blue-600 tracking-widest">{guestCode}</div>
                  <p className="text-sm text-blue-600 mt-2">Please present this code to security</p>
               </div>

               <div className="text-sm text-gray-500 mb-6">
                  <p>• Security has been notified of your arrival</p>
                  <p>• Please collect your ID card from the front desk</p>
                  <p>• Keep your guest code handy for sign-out</p>
               </div>

               <button
                  onClick={handleNewGuest}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors"
               >
                  Register Another Guest
               </button>
            </div>
         </div>
      );
   }

   return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
         <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
               {/* Header */}
               <div className="bg-blue-600 text-white p-6">
                  <h1 className="text-2xl font-bold">Guest Sign-In</h1>
                  <p className="text-blue-100 mt-1">
                     {orgName || organization?.name || 'Organization'}
                  </p>
               </div>

               {/* Form */}
               <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
                  {error && (
                     <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                        {error}
                     </div>
                  )}

                  {/* Guest Name */}
                  <div>
                     <label htmlFor="guestName" className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name *
                     </label>
                     <input
                        {...register('guestName', {
                           required: 'Full name is required',
                           minLength: { value: 2, message: 'Name must be at least 2 characters' }
                        })}
                        type="text"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter your full name"
                     />
                     {errors.guestName && (
                        <p className="text-red-600 text-sm mt-1">{errors.guestName.message}</p>
                     )}
                  </div>

                  {/* Phone Number */}
                  <div>
                     <label htmlFor="guestPhone" className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number *
                     </label>
                     <input
                        {...register('guestPhone', {
                           required: 'Phone number is required',
                           pattern: {
                              value: /^[\+]?[1-9][\d]{0,15}$/,
                              message: 'Please enter a valid phone number'
                           }
                        })}
                        type="tel"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter your phone number"
                     />
                     {errors.guestPhone && (
                        <p className="text-red-600 text-sm mt-1">{errors.guestPhone.message}</p>
                     )}
                  </div>

                  {/* Email (Optional) */}
                  <div>
                     <label htmlFor="guestEmail" className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address (Optional)
                     </label>
                     <input
                        {...register('guestEmail', {
                           pattern: {
                              value: /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
                              message: 'Please enter a valid email address'
                           }
                        })}
                        type="email"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter your email address"
                     />
                     {errors.guestEmail && (
                        <p className="text-red-600 text-sm mt-1">{errors.guestEmail.message}</p>
                     )}
                  </div>

                  {/* Location */}
                  <div>
                     <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                        Location/Department *
                     </label>
                     <select
                        {...register('location', { required: 'Please select a location' })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                     >
                        <option value="">Select a location</option>
                        {organization?.locations.map((location) => (
                           <option key={location} value={location}>
                              {location}
                           </option>
                        ))}
                     </select>
                     {errors.location && (
                        <p className="text-red-600 text-sm mt-1">{errors.location.message}</p>
                     )}
                  </div>

                  {/* Person to See */}
                  <div>
                     <label htmlFor="personToSee" className="block text-sm font-medium text-gray-700 mb-2">
                        Person to See *
                     </label>
                     <select
                        {...register('personToSee', { required: 'Please select a person to see' })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                     >
                        <option value="">Select a person</option>
                        {organization?.staffMembers.map((staff) => (
                           <option key={staff} value={staff}>
                              {staff}
                           </option>
                        ))}
                     </select>
                     {errors.personToSee && (
                        <p className="text-red-600 text-sm mt-1">{errors.personToSee.message}</p>
                     )}
                  </div>

                  {/* Purpose */}
                  <div>
                     <label htmlFor="purpose" className="block text-sm font-medium text-gray-700 mb-2">
                        Purpose of Visit (Optional)
                     </label>
                     <textarea
                        {...register('purpose', {
                           maxLength: { value: 200, message: 'Purpose cannot exceed 200 characters' }
                        })}
                        rows={3}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Brief description of your visit"
                     />
                     {errors.purpose && (
                        <p className="text-red-600 text-sm mt-1">{errors.purpose.message}</p>
                     )}
                  </div>

                  {/* Expected Duration */}
                  <div>
                     <label htmlFor="expectedDuration" className="block text-sm font-medium text-gray-700 mb-2">
                        Expected Duration (minutes) *
                     </label>
                     <input
                        {...register('expectedDuration', {
                           required: 'Expected duration is required',
                           min: {
                              value: organization?.minGuestVisitMinutes || 15,
                              message: `Minimum visit time is ${organization?.minGuestVisitMinutes || 15} minutes`
                           },
                           max: { value: 480, message: 'Maximum visit time is 8 hours (480 minutes)' }
                        })}
                        type="number"
                        min={organization?.minGuestVisitMinutes || 15}
                        max={480}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Expected duration in minutes"
                     />
                     {errors.expectedDuration && (
                        <p className="text-red-600 text-sm mt-1">{errors.expectedDuration.message}</p>
                     )}
                     {expectedDuration && (
                        <p className="text-sm text-gray-600 mt-1">
                           That&apos;s approximately {Math.round(expectedDuration / 60 * 10) / 10} hour{expectedDuration >= 60 ? 's' : ''}
                        </p>
                     )}
                  </div>

                  {/* Submit Button */}
                  <button
                     type="submit"
                     disabled={isSubmitting}
                     className="w-full bg-blue-600 text-white py-4 px-6 rounded-lg font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                     {isSubmitting ? (
                        <span className="flex items-center justify-center">
                           <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                           Registering...
                        </span>
                     ) : (
                        'Sign In as Guest'
                     )}
                  </button>

                  {/* Footer Info */}
                  <div className="text-center text-sm text-gray-500 pt-4 border-t">
                     <p>• Security will be notified of your arrival</p>
                     <p>• Please collect your ID card from the front desk</p>
                     <p>• Minimum visit time: {organization?.minGuestVisitMinutes || 15} minutes</p>
                  </div>
               </form>
            </div>
         </div>
      </div>
   );
}