'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { LoginRequest, ApiResponse, LoginResponse } from '../../types';
import config from '../../config';

interface LoginFormData {
   email: string;
   password: string;
}

export default function AdminLoginPage() {
   const router = useRouter();
   const [isSubmitting, setIsSubmitting] = useState(false);
   const [error, setError] = useState<string | null>(null);

   const {
      register,
      handleSubmit,
      formState: { errors }
   } = useForm<LoginFormData>();

   const onSubmit = async (formData: LoginFormData) => {
      setIsSubmitting(true);
      setError(null);

      try {
         const loginData: LoginRequest = formData;

         const response = await fetch(`${config.apiUrl}/api/auth/login`, {
            method: 'POST',
            headers: {
               'Content-Type': 'application/json',
            },
            body: JSON.stringify(loginData),
         });

         const result: ApiResponse<LoginResponse> = await response.json();

         if (result.success && result.data) {
            // Store token in localStorage
            localStorage.setItem('admin_token', result.data.token);
            localStorage.setItem('organization', JSON.stringify(result.data.organization));

            // Redirect to dashboard
            router.push('/admin/dashboard');
         } else {
            setError(result.message || 'Login failed');
         }
      } catch (err) {
         setError('Login failed. Please try again.');
         console.error('Error during login:', err);
      } finally {
         setIsSubmitting(false);
      }
   };

   return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
         <div className="max-w-md w-full">
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
               {/* Header */}
               <div className="bg-blue-600 text-white p-6 text-center">
                  <h1 className="text-2xl font-bold">Admin Portal</h1>
                  <p className="text-blue-100 mt-1">Guest Management System</p>
               </div>

               {/* Login Form */}
               <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
                  {error && (
                     <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                        {error}
                     </div>
                  )}

                  {/* Email */}
                  <div>
                     <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                        Organization Email
                     </label>
                     <input
                        {...register('email', {
                           required: 'Email is required',
                           pattern: {
                              value: /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
                              message: 'Please enter a valid email address'
                           }
                        })}
                        type="email"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter your organization email"
                     />
                     {errors.email && (
                        <p className="text-red-600 text-sm mt-1">{errors.email.message}</p>
                     )}
                  </div>

                  {/* Password */}
                  <div>
                     <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                        Password
                     </label>
                     <input
                        {...register('password', {
                           required: 'Password is required',
                           minLength: { value: 6, message: 'Password must be at least 6 characters' }
                        })}
                        type="password"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter your password"
                     />
                     {errors.password && (
                        <p className="text-red-600 text-sm mt-1">{errors.password.message}</p>
                     )}
                  </div>

                  {/* Submit Button */}
                  <button
                     type="submit"
                     disabled={isSubmitting}
                     className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                     {isSubmitting ? (
                        <span className="flex items-center justify-center">
                           <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                           Signing In...
                        </span>
                     ) : (
                        'Sign In'
                     )}
                  </button>

                  {/* Register Link */}
                  <div className="text-center pt-4 border-t">
                     <p className="text-sm text-gray-600">
                        Don&apos;t have an organization account?{' '}
                        <a href="/admin/register" className="text-blue-600 hover:text-blue-700 font-medium">
                           Register here
                        </a>
                     </p>
                  </div>
               </form>
            </div>

            {/* Demo Info */}
            <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
               <h3 className="text-sm font-medium text-yellow-800 mb-2">Demo Credentials</h3>
               <div className="text-sm text-yellow-700 space-y-1">
                  <p><strong>Email:</strong> demo@organization.com</p>
                  <p><strong>Password:</strong> demo123</p>
                  <p className="text-xs mt-2 italic">
                     These are demo credentials for testing the system
                  </p>
               </div>
            </div>
         </div>
      </div>
   );
}