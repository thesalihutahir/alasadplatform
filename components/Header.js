"use client";

import Link from 'next/link';
import { Menu, Search, X } from 'lucide-react'; 
import { useState } from 'react';
import Image from 'next/image';

const navItems = [
  { name: 'Home', href: '/' },
  { name: 'Programs', href: '/programs' },
  { name: 'Multimedia', href: '/multimedia' },
  { name: 'News', href: '/news' },
  { name: 'About Us', href: '/about' },
];

const ICON_BG_COLOR = 'bg-[#432e16]';

export default function Header() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [sidebarContentType, setSidebarContentType] = useState('menu');

  const openSidebar = (type) => {
    setSidebarContentType(type);
    setIsSidebarOpen(true);
  };

  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <header className="sticky top-0 z-50 bg-white shadow-md font-body">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="relative flex justify-between items-center h-20">

          {/* LEFT ICONS */}
          <div className="flex items-center space-x-2 z-20">
            <button
              onClick={() => openSidebar('menu')}
              className={`p-3 rounded-full ${ICON_BG_COLOR} text-white`}
            >
              <Menu className="h-5 w-5" />
            </button>

            <button
              onClick={() => openSidebar('search')}
              className={`p-3 rounded-full ${ICON_BG_COLOR} text-white`}
            >
              <Search className="h-5 w-5" />
            </button>
          </div>

          {/* CENTERED LOGO */}
          <div className="absolute left-1/2 top-1/2 z-10 transform -translate-x-1/2 -translate-y-1/2 flex-shrink-0">
            <Link href="/" className="block">
              <Image
                src="/headerlogo.svg"
                alt="Al-Asad Education Foundation Logo"
                width={240}
                height={80}
                className="w-[180px] sm:w-[210px] md:w-[240px] lg:w-[260px] h-auto"
                priority
              />
            </Link>
          </div>

          {/* RIGHT SIDE EMPTY FOR BALANCE */}
          <div className="w-10 z-20" />
        </div>
      </div>

      {/* OVERLAY */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300 ${isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={closeSidebar}
      />

      {/* SIDEBAR */}
      <div
        className={`fixed top-0 left-0 w-80 max-w-full h-full bg-[#f9f9f9] shadow-xl z-50 transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="flex flex-col h-full">
          
          <div className="p-4 flex justify-between items-center border-b border-gray-200">
            <h3 className="text-xl font-bold font-heading">
                {sidebarContentType === 'menu' ? 'Navigation' : 'Search'}
            </h3>
            <button 
              onClick={closeSidebar}
              className="p-2 rounded-full hover:bg-gray-100 text-brand-brown-dark"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="p-4 flex-grow overflow-y-auto">
            {sidebarContentType === 'menu' ? (
              <nav className="space-y-1">
                {navItems.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={closeSidebar}
                    className="block px-3 py-2 rounded-md text-base font-medium text-brand-brown-dark hover:text-brand-gold hover:bg-gray-100 transition font-heading"
                  >
                    {item.name}
                  </Link>
                ))}
              </nav>
            ) : (
              <div>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search the site..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-brand-gold focus:border-brand-gold outline-none text-base"
                  />
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                </div>
                <p className="mt-4 text-sm text-gray-500">
                  Type a query above to find programs, news, or media.
                </p>
              </div>
            )}
          </div>

          <div className="p-4 border-t border-gray-200 text-xs text-gray-500">
            Al-Asad Education Foundation
          </div>
        </div>
      </div>
    </header>
  );
}