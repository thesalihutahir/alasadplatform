"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Loader2 } from 'lucide-react';

export default function AdminRootPage() {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading) {
            if (user) {
                // If user is logged in, go to the Dashboard
                router.push('/admin/dashboard');
            } else {
                // If not logged in, go to Login page
                router.push('/admin/login');
            }
        }
    }, [user, loading, router]);

    // While we decide where to send them, show a loading spinner
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="flex flex-col items-center gap-4">
                <Loader2 className="w-10 h-10 text-[#d17600] animate-spin" />
                <p className="text-gray-500 font-lato">Redirecting to admin panel...</p>
            </div>
        </div>
    );
}
