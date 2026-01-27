"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext'; 
import LogoReveal from '@/components/logo-reveal';

import { 
    LayoutDashboard, FileText, Video, Mic, Users, Handshake, 
    Settings, LogOut, Menu, X, BookOpen, Radio, Image as ImageIcon, 
    Book, Heart, FileBarChart   
} from 'lucide-react';

export default function AdminLayout({ children }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const pathname = usePathname();
    const router = useRouter();
    const { user, logout, loading } = useAuth(); 

    // Guard: Protect Admin Routes
    useEffect(() => {
        if (!loading && pathname !== '/admin/login') {
            if (!user) {
                router.push('/admin/login');
                return;
            }
            if (!user.role) {
                logout(); 
                router.push('/admin/login?error=unauthorized');
            }
        }
    }, [user, loading, pathname, router, logout]);

    if (pathname === '/admin/login') return <>{children}</>;

    if (loading) {
        return (
            <div className="h-screen w-full flex items-center justify-center bg-white">
                <div className="w-full max-w-sm px-10"><LogoReveal /></div>
            </div>
        );
    }

    if (!user || !user.role) return null;

    // v1.1 Change: All items visible to all admins
    const menuItems = [
        { name: 'Dashboard', icon: LayoutDashboard, href: '/admin/dashboard' },
        { name: 'Donations', icon: Heart, href: '/admin/donations' },
        { name: 'Audit Log', icon: FileBarChart, href: '/admin/audit' }, // New
        { name: 'Manage Blogs', icon: FileText, href: '/admin/blogs' },
        { name: 'Manage Programs', icon: BookOpen, href: '/admin/programs' },
        { name: 'Video Library', icon: Video, href: '/admin/videos' },
        { name: 'Audio Library', icon: Mic, href: '/admin/audios' },
        { name: 'Podcasts', icon: Radio, href: '/admin/podcasts' },
        { name: 'Photo Gallery', icon: ImageIcon, href: '/admin/gallery' },
        { name: 'eBooks', icon: Book, href: '/admin/ebooks' },
        { name: 'Volunteers', icon: Users, href: '/admin/volunteers' },
        { name: 'Partnerships', icon: Handshake, href: '/admin/partners' },
        { name: 'Settings', icon: Settings, href: '/admin/settings' },
    ];

    const getInitials = (name) => name ? name.charAt(0).toUpperCase() : 'A';

    return (
        <div className="min-h-screen bg-gray-50 flex font-lato">
            <div 
                className={`fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity ${isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={() => setIsSidebarOpen(false)}
            />

            <aside 
                className={`fixed lg:sticky top-0 left-0 h-screen w-72 bg-[#432e16] text-white z-50 transform transition-transform duration-300 ease-in-out lg:translate-x-0 flex flex-col shadow-2xl ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
            >
                <div className="p-6 border-b border-white/10 flex items-center justify-between bg-[#3a2813]">
                    <div className="flex items-center gap-3">
                        <div className="relative w-8 h-8">
                            <Image src="/headerlogo.svg" alt="Logo" fill className="object-contain brightness-0 invert" />
                        </div>
                        <span className="font-agency text-2xl tracking-wide pt-1">Admin Panel</span>
                    </div>
                    <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-white/70 hover:text-white"><X className="w-6 h-6" /></button>
                </div>

                <nav className="flex-grow p-4 space-y-1 overflow-y-auto scrollbar-thin scrollbar-thumb-white/20">
                    <p className="px-4 py-2 text-xs font-bold text-white/40 uppercase tracking-widest mb-1">Main Menu</p>
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname.startsWith(item.href);
                        return (
                            <Link 
                                key={item.name} 
                                href={item.href}
                                onClick={() => setIsSidebarOpen(false)}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                                    isActive 
                                    ? 'bg-[#d17600] text-white font-bold shadow-lg translate-x-1' 
                                    : 'text-white/70 hover:bg-white/10 hover:text-white'
                                }`}
                            >
                                <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-white/60 group-hover:text-white'}`} />
                                <span className="text-sm">{item.name}</span>
                                {isActive && <div className="ml-auto w-1.5 h-1.5 bg-white rounded-full"></div>}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-white/10 bg-[#3a2813]">
                    <Link href="/admin/profile" className="flex items-center gap-3 p-2 rounded-lg mb-3 hover:bg-white/5 transition-colors group">
                         <div className="relative w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white font-bold border-2 border-white/20 overflow-hidden group-hover:border-[#d17600]">
                            {user?.photoURL ? <Image src={user.photoURL} alt="Profile" fill className="object-cover" /> : <span>{getInitials(user?.displayName)}</span>}
                        </div>
                        <div className="flex-grow min-w-0">
                            <p className="text-sm font-bold text-white truncate">{user?.displayName || 'Admin'}</p>
                            <p className="text-[10px] text-white/50 truncate capitalize">{user?.role?.replace('_', ' ') || 'Staff'}</p>
                        </div>
                    </Link>
                    <button 
                        onClick={() => logout()}
                        className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg bg-red-500/10 text-red-300 hover:bg-red-500 hover:text-white transition-all text-xs font-bold uppercase tracking-wider border border-red-500/20"
                    >
                        <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                </div>
            </aside>

            <div className="flex-grow flex flex-col min-w-0 h-screen overflow-y-auto bg-gray-50">
                <header className="lg:hidden bg-white border-b border-gray-200 p-4 flex items-center justify-between sticky top-0 z-30 shadow-sm">
                    <div className="flex items-center gap-3">
                        <button onClick={() => setIsSidebarOpen(true)} className="p-2 bg-gray-100 rounded-lg text-gray-600 hover:bg-gray-200"><Menu className="w-6 h-6" /></button>
                        <span className="font-agency text-xl text-[#432e16] pt-1">Dashboard</span>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-[#432e16] text-white flex items-center justify-center text-sm font-bold">{getInitials(user?.displayName)}</div>
                </header>
                <main className="flex-grow p-6 md:p-10 max-w-7xl mx-auto w-full">{children}</main>
            </div>
        </div>
    );
}
