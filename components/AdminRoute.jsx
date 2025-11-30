// components/AdminRoute.jsx
"use client";

import { useRouter } from 'next/navigation';
import { useAuth } from './AuthContext';
import { useEffect } from 'react';

// Use this wrapper on your protected page components
export function AdminRoute({ children }) {
  const { user, isAdmin, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Only run the check after loading is complete
    if (!loading) {
      if (!user) {
        // 1. Not logged in: Redirect to a login page
        router.push('/admin/login');
      } else if (!isAdmin) {
        // 2. Logged in, but not an Admin: Redirect to home or an unauthorized page
        // If they are logged in but not an admin, we don't send them to the login page.
        router.push('/'); 
      }
    }
  }, [loading, user, isAdmin, router]);

  // Show a loading spinner or component while checking auth status
  if (loading || !user || !isAdmin) {
    // A slightly nicer looking loading state
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
            <p className="text-lg font-medium text-indigo-700">
                {loading ? 'Verifying authentication...' : 'Redirecting...'}
            </p>
        </div>
    );
  }

  // If authenticated AND is Admin, render the children (the Admin page content)
  return <>{children}</>;
}