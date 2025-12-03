"use client";

import Link from 'next/link';
// Import the components needed for the icons
import { Menu, Search, X } from 'lucide-react'; 
import { useState } from 'react';
import Image from 'next/image'; // Import Image component for the logo

const navItems = [
  { name: 'Home', href: '/' },
  { name: 'Programs', href: '/programs' },
  { name: 'Multimedia', href: '/multimedia' },
  { name: 'News', href: '/news' },
  { name: 'About Us', href: '/about' },
];

// Define the dark brown color used in the icons/search background in the mockup
const ICON_BG_COLOR = 'bg-[#432e16]';

export default function Header() {
  // State for controlling the sidebar/drawer visibility
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  // State to track if the sidebar is opened for the search view or the main menu view
  const [sidebarContentType, setSidebarContentType] = useState('menu'); // 'menu' or 'search'

  const openSidebar = (type) => {
    setSidebarContentType(type);
    setIsSidebarOpen(true);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    // The header in the mockup is white/light
    <header className="sticky top-0 z-50 bg-white shadow-md font-body">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          
          {/* Left Side: Menu and Search Icons (Styled to match mockup) */}
          <div className="flex items-center space-x-2">
            
            {/* Menu Button (Styled as a rounded button with dark background) */}
            <button
              onClick={() => openSidebar('menu')}
              className={`p-3 rounded-full ${ICON_BG_COLOR} text-white focus:outline-none`}
              aria-expanded={isSidebarOpen && sidebarContentType === 'menu'}
            >
              <Menu className="h-4 w-4" aria-hidden="true" />
            </button>

            {/* Search Button (Styled as a rounded button with dark background) */}
            <button
              onClick={() => openSidebar('search')}
              className={`p-3 rounded-full ${ICON_BG_COLOR} text-white focus:outline-none`}
              aria-expanded={isSidebarOpen && sidebarContentType === 'search'}
            >
              <Search className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>

          {/* Center: Logo (Styled and Sized to match mockup) */}
          <div className="flex-shrink-0 absolute transform -translate-x-1/2 md:static md:translate-x-0">
            <Link href="/" className="flex items-right">
              {/* Using next/image for better performance and sizing */}
              <Image 
                src="/headerlogo.png" // Assume this path now points to the full Arabic/English logo
                alt="Al-Asad Education Foundation Logo" 
                width=auto // Increased size significantly to match the mockup
                height=auto
                className="h-12 w-auto" // Set height for visual control
              />
            </Link>
          </div>
          
       

        </div>
      </div>

      {/* ---------------------------------------------------- */}
      {/* Sidebar/Drawer Navigation (Matches chat screenshot style) */}
      {/* ---------------------------------------------------- */}
      
      {/* Overlay Backdrop */}
      <div 
        className={`fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300 ${isSidebarOpen ? 'opacity-80' : 'opacity-0 pointer-events-none'}`}
        onClick={closeSidebar}
      />

      {/* Sidebar Panel */}
      <div 
        className={`fixed top-0 left-0 w-60 max-w-full h-full bg-brand-brown opacity-80 text-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="flex flex-col h-full">
          
          {/* Header Bar with Close Button */}
          <div className="p-4 flex justify-between items-center border-b border-gray-200">
            {/* Content Title based on what was clicked */}
            <h3 className="text-xl font-bold font-agency">
                {sidebarContentType === 'menu' ? 'Navigation' : 'Search'}
            </h3>
            <button 
              onClick={closeSidebar} 
              className="p-2 text-brand-brown-dark hover:text-brand-gold rounded-full hover:bg-gray-100"
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
                    className="block px-3 py-2 rounded-md text-base font-medium text-brand-brown-dark hover:text-brand-gold hover:bg-gray-100 transition font-heading"
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-brand-gold focus:border-brand-gold outline-none text-base"
                  />
                  <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                </div>
                <p className="mt-4 text-sm text-gray-500">
                    Type a query above to find programs, news, or media.
                </p>
              </div>
            )}
          </div>
          
          {/* Footer of Sidebar (Optional, but good for context) */}
          <div className="p-4 border-t border-gray-200 text-xs text-gray-500">
            Al-Asad Education Foundation
          </div>
        </div>
      </div>
    </header>
  );
}
