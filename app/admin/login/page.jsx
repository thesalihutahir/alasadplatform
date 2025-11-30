// app/admin/login/page.jsx
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase'; // Import auth from your initialized firebase
import Link from 'next/link';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!email || !password) {
      setError('Please enter both email and password.');
      setLoading(false);
      return;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // On successful login, the AuthContext listener will update the user state.
      // We wait briefly for the context to update the isAdmin status, 
      // then redirect to the protected dashboard.

      // IMPORTANT: In a real app, you might want to wait for the custom role (isAdmin)
      // to be fetched before redirecting, but a simple timeout usually works well 
      // since the context is already listening.

      setTimeout(() => {
          // Redirect to the Admin Dashboard root
          router.push('/admin'); 
      }, 500);

    } catch (firebaseError) {
      console.error("Login Error:", firebaseError.code, firebaseError.message);
      
      let friendlyError;
      switch (firebaseError.code) {
        case 'auth/invalid-credential':
          friendlyError = 'Invalid email or password. Please try again.';
          break;
        case 'auth/user-disabled':
          friendlyError = 'This user account has been disabled.';
          break;
        default:
          friendlyError = 'An unexpected error occurred during login. Check console.';
          break;
      }
      
      setError(friendlyError);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to the Admin Panel
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Al Asad Foundation Content Management System
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>
            <div>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          {error && (
            <div className="text-sm font-medium text-red-600 text-center">
              {error}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white ${
                loading ? 'bg-indigo-400' : 'bg-indigo-600 hover:bg-indigo-700'
              } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </div>
        </form>
        <div className="text-center">
            <Link href="/" className="text-sm text-indigo-600 hover:text-indigo-500">
                Go back to the main site
            </Link>
        </div>
      </div>
    </div>
  );
}
