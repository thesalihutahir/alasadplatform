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
        router.push('/'); 
      }
    }
  }, [loading, user, isAdmin, router]);

  // Show a loading spinner or component while checking auth status
  if (loading || !user || !isAdmin) {
    // Placeholder for a proper loading state (e.g., a simple spinner)
    return <div className="flex justify-center items-center h-screen">Loading Admin Panel...</div>;
  }

  // If authenticated AND is Admin, render the children (the Admin page content)
  return <>{children}</>;
}
