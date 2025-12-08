// app/admin/page.jsx
"use client";

import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AdminUpload from '@/components/AdminUpload';
import { useAuth } from '@/components/AuthContext';
import { LogIn, Loader2 } from 'lucide-react';

export default function AdminPage() {
    const { isAuthenticated, loading, userId, signOutUser } = useAuth();

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <Loader2 className="w-10 h-10 text-brand-gold animate-spin" />
                <p className="ml-3 text-lg text-gray-600">Loading authentication...</p>
            </div>
        );
    }

    // Protection: If the user is not authenticated (and this page is not configured 
    // to check for specific admin roles yet, we treat any authenticated user as staff for now)
    if (!isAuthenticated) {
        return (
            <div className="min-h-screen flex flex-col justify-between bg-gray-50">
                <Header />
                <div className="flex-grow flex flex-col items-center justify-center p-6 text-center">
                    <LogIn className="w-16 h-16 text-red-500 mb-4" />
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">Access Denied</h1>
                    <p className="text-gray-600 mb-6">
                        You must be signed in as a staff member to access the administration dashboard.
                    </p>
                    <button 
                        onClick={() => alert("Simulate Login: In Phase 2, this button will trigger Firebase email/password login.")}
                        className="px-6 py-3 bg-brand-gold text-white font-semibold rounded-full hover:bg-brand-brown transition-colors"
                    >
                        Staff Login
                    </button>
                    <p className="mt-4 text-xs text-gray-400">Your current User ID: {userId || 'N/A'}</p>
                </div>
                <Footer />
            </div>
        );
    }

    // Authenticated View
    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Header />
            <main className="flex-grow pt-10 pb-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center mb-10 border-b pb-4">
                        <h1 className="text-3xl font-extrabold text-brand-brown-dark">
                            Admin Dashboard
                        </h1>
                        <button 
                            onClick={signOutUser}
                            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-full hover:bg-red-700 transition"
                        >
                            Sign Out
                        </button>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Main Content Management Area */}
                        <div className="lg:col-span-2">
                            <AdminUpload />
                        </div>

                        {/* Status Sidebar */}
                        <div className="lg:col-span-1 space-y-6">
                            <div className="p-6 bg-white rounded-xl shadow-lg border-l-4 border-brand-gold">
                                <h4 className="text-lg font-semibold text-gray-800 mb-3">System Status</h4>
                                <p className="text-sm text-gray-600">
                                    <span className="font-bold">App ID:</span> {appId}
                                </p>
                                <p className="text-sm text-gray-600">
                                    <span className="font-bold">User ID:</span> {userId}
                                </p>
                                <p className="text-sm text-green-600 font-bold">
                                    Status: Connected to Firestore
                                </p>
                            </div>
                            
                            <div className="p-6 bg-white rounded-xl shadow-lg border-l-4 border-indigo-500">
                                <h4 className="text-lg font-semibold text-gray-800 mb-3">Pending Tasks</h4>
                                <ul className="text-sm space-y-2 text-gray-600">
                                    <li>- 2 New Scholarship Applications</li>
                                    <li>- 5 Unreviewed Multimedia Posts</li>
                                    <li>- Database Backup required</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
