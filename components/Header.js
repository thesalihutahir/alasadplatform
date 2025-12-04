"use client";

import Link from 'next/link';
import { Menu, Search, X } from 'lucide-react'; 
import { useState } from 'react';
import Image from 'next/image'; 

// --- Brand Constants ---
const ICON_BG_COLOR = 'bg-[#432e16]'; // brand-brown-dark
const BRAND_GOLD = '#d17600'; // brand-gold (Used via inline style for opacity)
// ---

const navItems = [
  { name: 'Home', href: '/' },
  { name: 'Programs', href: '/programs' },
  { name: 'Multimedia', 'href': '/multimedia' },
  { name: 'News', href: '/news' },
  { name: 'About Us', href: '/about' },
];

export default function Header() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [sidebarContentType, setSidebarContentType] = useState('menu'); 

  const openSidebar = (type) => {
    setSidebarContentType(type);
    setIsSidebarOpen(true);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-white shadow-md font-lato"> {/* Using font-lato for body */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          
          {/* LEFT SIDE: Menu and Search Icons */}
          <div className="flex items-center space-x-2">
            
            {/* Menu Button */}
            <button
              onClick={() => openSidebar('menu')}
              className={`p-3 rounded-full ${ICON_BG_COLOR} text-white focus:outline-none`}
              aria-expanded={isSidebarOpen && sidebarContentType === 'menu'}
            >
              <Menu className="h-5 w-5" aria-hidden="true" />
            </button>

            {/* Search Button */}
            <button
              onClick={() => openSidebar('search')}
              className={`p-3 rounded-full ${ICON_BG_COLOR} text-white focus:outline-none`}
              aria-expanded={isSidebarOpen && sidebarContentType === 'search'}
            >
              <Search className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>

          {/* RIGHT SIDE: Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center">
              <Image 
                src="/headerlogo.png" 
                alt="Al-Asad Education Foundation Logo" 
                width={300} 
                height={50}
                className="h-12 w-auto" 
              />
            </Link>
          </div>
          
        </div>
      </div>

      {/* ---------------------------------------------------- */}
      {/* Sidebar/Drawer Navigation */}
      {/* ---------------------------------------------------- */}
      
      {/* Overlay Backdrop */}
      <div 
        className={`fixed inset-0 bg-black z-40 transition-opacity duration-300 ${isSidebarOpen ? 'opacity-50' : 'opacity-0 pointer-events-none'}`}
        onClick={closeSidebar}
      />

      {/* Sidebar Panel - BRAND GOLD WITH OPACITY */}
      <div 
        // Use inline style for background color to apply opacity effectively
        style={{ backgroundColor: BRAND_GOLD, '--tw-bg-opacity': isSidebarOpen ? '0.9' : '0' }}
        className={`fixed top-0 left-0 w-60 max-w-full h-full text-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="flex flex-col h-full">
          
          {/* Header Bar with Close Button */}
          <div className="p-4 flex justify-between items-center border-b border-gray-100 border-opacity-30">
            {/* Font Agency for Heading */}
            <h3 className="text-xl font-agency tracking-wider uppercase font-bold">
                {sidebarContentType === 'menu' ? 'Navigation' : 'Search'}
            </h3>
            <button 
              onClick={closeSidebar} 
              // Icon is white on brand-gold background, using brand-brown-dark on hover
              className={`p-2 rounded-full text-white hover:text-[#432e16] hover:bg-white focus:outline-none`}
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Sidebar Content */}
          <div className="p-4 flex-grow overflow-y-auto">
            {sidebarContentType === 'menu' ? (
              // Main Navigation Links
              <nav className="space-y-1">
                {navItems.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={closeSidebar}
                    // Font Lato for links, white text, hover state uses brand-brown-dark text on a slightly opaque gold background
                    className={`block px-3 py-2 rounded-md text-base font-lato font-medium text-white hover:text-white hover:bg-[#432e16] transition`}
                  >
                    {item.name}
                  </Link>
                ))}
              </nav>
            ) : (
              // Search Input/Bar Content
              <div>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search the site..."
                    // White input on gold background
                    className="w-full px-4 py-3 border-none rounded-md focus:ring-2 focus:ring-white outline-none text-base text-black"
                  />
                  <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[#9a9a9a]" />
                </div>
                <p className="mt-4 text-sm text-white opacity-80 font-lato">
                    Type a query above to find programs, news, or media.
                </p>
              </div>
            )}
          </div>
          
          {/* Footer of Sidebar */}
          <div className="p-4 border-t border-gray-100 border-opacity-30 text-xs text-white opacity-80 font-lato">
            Al-Asad Education Foundation
          </div>
        </div>
      </div>
    </header>
  );
}
