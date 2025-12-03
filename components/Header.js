"use client";

import Link from 'next/link';
// Import the components needed for the icons
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

// Define the dark brown color used in the icons/search background in the mockup
const ICON_COLOR = 'text-brand-brown-dark'; // Assume brand-brown-dark matches the icon color

export default function Header() {
  // State for controlling the sidebar/drawer visibility
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  // We'll simplify the state to just handle the menu open/close for clarity
  const [isSearchOpen, setIsSearchOpen] = useState(false); 

  const closeSidebar = () => {
    setIsSidebarOpen(false);
    setIsSearchOpen(false);
  };

  return (
    // The header in the mockup is white/light
    <header className="sticky top-0 z-50 bg-white shadow-md font-body">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Adjusted h-16 or h-20 based on typical mobile header height */}
        <div className="flex justify-between items-center h-20">
          
          {/* LEFT SIDE: Menu and Search Icons (LARGE, rounded, dark icons) */}
          <div className="flex items-center space-x-2">
            
            {/* Menu Button (Large, rounded, dark background icon) */}
            <button
              onClick={() => setIsSidebarOpen(true)}
              // Increased size to p-4 (or p-5) for large circle and w-6 h-6 for the icon itself
              className={`p-3 md:p-4 rounded-full ${ICON_COLOR} hover:bg-gray-100 transition focus:outline-none`}
              aria-expanded={isSidebarOpen}
            >
              <Menu className="h-6 w-6" aria-hidden="true" />
            </button>

            {/* Search Button (Large, rounded, dark background icon) */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className={`p-3 md:p-4 rounded-full ${ICON_COLOR} hover:bg-gray-100 transition focus:outline-none`}
              aria-expanded={isSearchOpen}
            >
              <Search className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>

          {/* CENTER/RIGHT: Logo (Structured to match the split text/icon mockup) */}
          {/* Note: In a real app, this would be a single image asset for the full logo */}
          <Link href="/" className="flex items-center space-x-2">
            
            {/* Arabic/English Text Logo */}
            <div className="flex flex-col text-right pr-2 border-r border-gray-300">
              
            {/* Lion Icon Logo (Assuming separate file for the lion graphic) */}
            <Image 
                src="/headerlogo.svg" // Changed to a smaller, specific icon file
                alt="Al-Asad Lion Icon" 
                width={36} 
                height={36}
                className="h-9 w-9 object-contain"
            />
          </Link>
        </div>
      </div>

      {/* ---------------------------------------------------- */}
      {/* Sidebar/Drawer Navigation (Simplified Menu) */}
      {/* ---------------------------------------------------- */}
      
      {/* Menu Overlay Backdrop */}
      <div 
        className={`fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300 ${isSidebarOpen || isSearchOpen ? 'opacity-80' : 'opacity-0 pointer-events-none'}`}
        onClick={closeSidebar}
      />

      {/* Sidebar Panel */}
      <div 
        // Side panel width is now 100% on small screens and slides from the left
        className={`fixed top-0 left-0 w-60 max-w-full h-full bg-white text-brand-brown-dark shadow-xl z-50 transform transition-transform duration-300 ease-in-out ${isSidebarOpen || isSearchOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="flex flex-col h-full">
          
          {/* Header Bar with Close Button */}
          <div className="p-4 flex justify-between items-center border-b border-gray-100">
            <h3 className="text-xl font-bold font-agency">
                {isSidebarOpen ? 'Menu' : 'Search'}
            </h3>
            <button 
              onClick={closeSidebar} 
              className={`p-1 text-gray-700 hover:text-brand-gold rounded-full hover:bg-gray-100`}
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Sidebar Content */}
          <div className="p-4 flex-grow overflow-y-auto">
            {isSidebarOpen ? (
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
            ) : isSearchOpen ? (
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
            ) : null}
          </div>
          
          {/* Footer of Sidebar */}
          <div className="p-4 border-t border-gray-100 text-xs text-gray-500">
            Al-Asad Education Foundation
          </div>
        </div>
      </div>
    </header>
  );
}
