"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
// Import the real Auth hook
import { useAuth } from '@/context/AuthContext'; 
import { Eye, EyeOff, Lock, Mail, Loader2, ArrowLeft } from 'lucide-react';

export default function AdminLoginPage() {
    const router = useRouter();
    const { login } = useAuth(); 

    // Form State
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false); // Toggle State
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await login(email, password);
            router.push('/admin/dashboard');
        } catch (err) {
            console.error(err);
            if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
                setError('Incorrect email or password.');
            } else if (err.code === 'auth/too-many-requests') {
                setError('Too many failed attempts. Try again later.');
            } else {
                setError('Failed to login. Please check your connection.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#f8f5f0] relative overflow-hidden px-4">

            {/* Background Pattern */}
            <div className="absolute inset-0 z-0 opacity-25">
                <Image src="/images/chairman/sheikh1.webp" alt="Pattern" fill className="object-cover" />
            </div>

            {/* Login Card */}
            <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 md:p-10 relative z-10 border border-[#d17600]/20">

                {/* Logo Area */}
                <div className="flex justify-center mb-10">
                    <div className="relative w-48 h-18">
                        <Image src="/headerlogo.svg" alt="Al-Asad Logo" fill className="object-contain" />
                    </div>
                </div>

                <div className="text-center mb-8">
                    <h1 className="font-agency text-3xl text-[#432e16] mb-1">
                        Admin Portal
                    </h1>
                    <p className="font-lato text-sm text-gray-500">
                        Secure access for foundation staff only.
                    </p>
                </div>

                {/* Error Message Display */}
                {error && (
                    <div className="mb-6 bg-red-50 border border-red-200 text-red-600 text-xs font-bold px-4 py-3 rounded-lg text-center animate-pulse">
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-5">

                    {/* Email Input */}
                    <div>
                        <label className="block text-xs font-bold text-[#432e16] uppercase tracking-wider mb-2">
                            Email Address
                        </label>
                        <div className="relative">
                            <input 
                                type="email" 
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#d17600]/50 focus:bg-white transition-all text-[#432e16]"
                                placeholder="name@alasadfoundation.org"
                            />
                            <Mail className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        </div>
                    </div>

                    {/* Password Input with Toggle */}
                    <div>
                        <label className="block text-xs font-bold text-[#432e16] uppercase tracking-wider mb-2">
                            Password
                        </label>
                        <div className="relative">
                            <input 
                                type={showPassword ? "text" : "password"} 
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full pl-10 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#d17600]/50 focus:bg-white transition-all text-[#432e16]"
                                placeholder="••••••••"
                            />
                            <Lock className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            
                            {/* Toggle Button */}
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#d17600] transition-colors p-1"
                                tabIndex="-1" // Skip tab focus for better UX flow
                            >
                                {showPassword ? (
                                    <EyeOff className="w-5 h-5" />
                                ) : (
                                    <Eye className="w-5 h-5" />
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Action Button */}
                    <button 
                        type="submit" 
                        disabled={loading}
                        className={`w-full py-3 rounded-xl font-agency text-xl tracking-wide text-white transition-all shadow-lg flex justify-center items-center ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#432e16] hover:bg-[#d17600]'}`}
                    >
                        {loading ? (
                            <Loader2 className="animate-spin h-6 w-6 text-white" />
                        ) : (
                            "Sign In"
                        )}
                    </button>

                </form>

                <div className="mt-8 text-center border-t border-gray-100 pt-6">
                    <Link href="/" className="text-xs text-gray-400 hover:text-[#d17600] transition-colors flex items-center justify-center gap-1">
                        <ArrowLeft className="w-3 h-3" /> Back to Website
                    </Link>
                </div>

            </div>

            <p className="mt-6 text-[10px] text-gray-400 font-mono z-10">
                Al-Asad Education Foundation • Admin System v1.0
            </p>

        </div>
    );
}