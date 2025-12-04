"use client";

import Link from 'next/link';
import { Menu, Search, X } from 'lucide-react'; 
import { useState } from 'react';
import Image from 'next/image'; 

const ICON_BG_COLOR = 'bg-[#432e16]'; 
const BRAND_GOLD = '#d17600'; 

const navItems = [
  { name: 'Home', href: '/' },
  { name: 'Programs', href: '/programs' },
  { name: 'Multimedia', 'href': '/multimedia' },
  { name: 'Blogs', href: '/blogs' },
  { name: 'Scholarships', href: '/scholarships' },
  { name: 'Learn a skill', href: '/skills' },
  { name: 'Donate', href: '/donate' },
  { name: 'Volunteer', href: '/volunteer' },
  { name: 'About Us', href: '/about' },
];

export default function Header() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-white font-lato">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          
          {/* LEFT SIDE: Menu Icon Only */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className={`p-3 rounded-full ${ICON_BG_COLOR} text-white focus:outline-none`}
              aria-expanded={isSidebarOpen}
            >
              <Menu className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>

          {/* RIGHT SIDE: Logo (Flexible Size) */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center">
              <Image 
                src="/headerlogo.svg" 
                alt="Al-Asad Education Foundation Logo" 
                className="h-auto w-90 object-contain" 
                sizes="100vw"
              />
            </Link>
          </div>
          
        </div>
      </div>

      {/* Overlay Backdrop */}
      <div 
        className={`fixed inset-0 bg-black z-40 transition-opacity duration-300 ${isSidebarOpen ? 'opacity-50' : 'opacity-0 pointer-events-none'}`}
        onClick={closeSidebar}
      />

      {/* Sidebar Panel - BRAND GOLD WITH OPACITY */}
      <div 
        style={{ backgroundColor: BRAND_GOLD, '--tw-bg-opacity': isSidebarOpen ? '0.9' : '0' }}
        className={`fixed top-0 left-0 w-80 max-w-full h-full opacity-95 text-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="flex flex-col h-full">
          
          {/* Header Bar with Close Button */}
          <div className="p-4 flex justify-end items-center border-b border-gray-100 border-opacity-30">
            <button 
              onClick={closeSidebar} 
              className={`p-2 rounded-full text-white hover:text-[#432e16] hover:bg-white focus:outline-none`}
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Sidebar Content - COMBINED SEARCH AND NAVIGATION */}
          <div className="p-4 flex-grow overflow-y-auto space-y-4">
            
            {/* Search Input (Always visible at the top) */}
            <div className="relative mb-4">
              <input
                type="text"
                placeholder="Search the site..."
                className="w-full px-4 py-3 border-none rounded-xl focus:ring-2 focus:ring-white outline-none text-base text-black"
              />
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[#9a9a9a]" />
            </div>

            {/* Main Navigation Links */}
            <nav className="space-y-1 border-t border-gray-100 border-opacity-30 pt-4">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={closeSidebar}
                  className={`block px-3 py-2 rounded-md text-base font-lato font-medium text-white hover:text-white hover:bg-[#432e16] transition`}
                >
                  {item.name}
                </Link>
              ))}
            </nav>
            
          </div>
          
          {/* Footer of Sidebar */}
          <Link href="/adminlogin">
<div className="p-4 border-t border-gray-100 border-opacity-30 text-xs text-white opacity-80 font-lato">
            Al-Asad Education Foundation
          </div>
</Link>
        </div>
      </div>
    </header>
  );
}
