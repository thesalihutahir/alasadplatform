"use client";

import Link from 'next/link';
import { 
  Menu, 
  Search, 
  X, 
  ChevronDown, 
  ChevronUp,
  Home,
  Info,
  BookOpen,
  PlayCircle,
  FileText,
  Heart,
  Mail
} from 'lucide-react'; 
import { useState } from 'react';
import Image from 'next/image'; 
import { usePathname } from 'next/navigation';

const ICON_BG_COLOR = 'bg-[#432e16]'; 

// Updated Sitemap with Icons
const navItems = [
  { name: 'Home', href: '/', icon: Home },
  { name: 'About Us', href: '/about', icon: Info },
  { 
    name: 'Programs', 
    href: '/programs',
    icon: BookOpen,
    children: [
      { name: 'Educational Support', href: '/programs/educational-support' },
      { name: 'Community Development', href: '/programs/community-development' },
      { name: 'Training & Innovation', href: '/programs/training-and-innovation' },
    ]
  },
  { 
    name: 'Multimedia', 
    href: '/media',
    icon: PlayCircle,
    children: [
      { name: 'Videos', href: '/media/videos' },
      { name: 'Audios', href: '/media/audios' },
      { name: 'Podcasts', href: '/media/podcasts' },
      { name: 'eBooks', href: '/media/ebooks' },
      { name: 'Photo Gallery', href: '/media/gallery' },
    ]
  },
  { 
    name: 'Blogs', 
    href: '/blogs',
    icon: FileText,
    children: [
      { name: 'Articles', href: '/blogs/articles' },
      { name: 'News & Updates', href: '/blogs/updates' },
      { name: 'Research', href: '/blogs/research-and-publications' },
    ]
  },
  { 
    name: 'Get Involved', 
    href: '/get-involved',
    icon: Heart,
    children: [
      { name: 'Donate', href: '/get-involved/donate' },
      { name: 'Volunteer', href: '/get-involved/volunteer' },
      { name: 'Partner With Us', href: '/get-involved/partner-with-us' },
    ]
  },
  { name: 'Contact', href: '/contact', icon: Mail },
];

export default function Header() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [expandedItem, setExpandedItem] = useState(null);
  const pathname = usePathname();

  const closeSidebar = () => {
    setIsSidebarOpen(false);
    setExpandedItem(null); 
  };

  const toggleExpand = (name) => {
    if (expandedItem === name) {
      setExpandedItem(null);
    } else {
      setExpandedItem(name);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white font-lato shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">

          {/* LEFT SIDE: Menu Icon and Logo Container */}
          <div className="flex items-center space-x-3 sm:space-x-4"> 

            {/* Menu Icon */}
            <button
              onClick={() => setIsSidebarOpen(true)}
              className={`p-3 rounded-full ${ICON_BG_COLOR} text-white focus:outline-none hover:bg-[#d17600] transition-colors`}
              aria-expanded={isSidebarOpen}
            >
              <Menu className="h-5 w-5" aria-hidden="true" />
            </button>

            {/* Logo */}
            <Link href="/" className="flex items-center">
              <Image 
                src="/headerlogo.svg" 
                alt="Al-Asad Education Foundation Logo" 
                className="h-16 w-auto object-contain max-h-full" 
                sizes="(max-width: 640px) 70vw, 30vw"
                priority 
              />
            </Link>
          </div>

          <div className="flex-shrink-0">
             {/* Empty Placeholder */}
          </div>

        </div>
      </div>

      {/* Overlay Backdrop */}
      <div 
        className={`fixed inset-0 bg-black z-40 transition-opacity duration-300 ${isSidebarOpen ? 'opacity-50' : 'opacity-0 pointer-events-none'}`}
        onClick={closeSidebar}
      />

      {/* Sidebar Panel - BRAND BROWN DARK (Like Admin) */}
      <div 
        className={`fixed top-0 left-0 w-72 max-w-full h-full bg-[#432e16] text-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="flex flex-col h-full">

          {/* Header Bar with Close Button */}
          <div className="p-6 flex justify-between items-center border-b border-white/10">
            <div className="flex items-center gap-3">
               {/* Optional White Logo in Sidebar */}
               <div className="relative w-8 h-8 opacity-90">
                  <Image src="/headerlogo.svg" alt="Logo" fill className="object-contain brightness-0 invert" />
               </div>
               <span className="font-agency text-xl tracking-wide">Menu</span>
            </div>
            <button 
              onClick={closeSidebar} 
              className="p-2 rounded-full text-white/70 hover:text-white hover:bg-white/10 focus:outline-none transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Sidebar Content */}
          <div className="p-4 flex-grow overflow-y-auto">

            {/* Search Input */}
            <div className="relative mb-6">
              <input
                type="text"
                placeholder="Search..."
                className="w-full pl-10 pr-4 py-3 border-none rounded-xl bg-white/10 text-white placeholder-white/50 focus:ring-2 focus:ring-[#d17600] outline-none text-sm"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/50" />
            </div>

            {/* Integrated Navigation Links */}
            <nav className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                
                return (
                  <div key={item.name} className="flex flex-col">
                    <div className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all cursor-pointer group ${isActive ? 'bg-[#d17600] text-white shadow-md' : 'text-white/80 hover:bg-white/10 hover:text-white'}`}>
                      
                      {/* Main Link Area */}
                      <Link
                        href={item.href}
                        onClick={closeSidebar}
                        className="flex-grow flex items-center gap-3"
                      >
                        <Icon className="w-5 h-5 opacity-90" />
                        <span className="text-sm font-lato font-medium tracking-wide">{item.name}</span>
                      </Link>

                      {/* Expand Toggle (Separate Click Target) */}
                      {item.children && (
                        <button 
                          onClick={(e) => {
                            e.preventDefault();
                            toggleExpand(item.name);
                          }}
                          className="p-1 rounded hover:bg-black/20 focus:outline-none"
                        >
                          {expandedItem === item.name ? (
                            <ChevronUp className="w-4 h-4 text-white opacity-80" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-white opacity-60 group-hover:opacity-100" />
                          )}
                        </button>
                      )}
                    </div>

                    {/* Sub-menu (Accordion Animation) */}
                    <div className={`overflow-hidden transition-all duration-300 ease-in-out ${expandedItem === item.name ? 'max-h-96 opacity-100 mt-1 mb-2' : 'max-h-0 opacity-0'}`}>
                      {item.children?.map((child) => (
                        <Link
                          key={child.name}
                          href={child.href}
                          onClick={closeSidebar}
                          className="flex items-center gap-2 pl-12 pr-4 py-2.5 text-sm text-white/60 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                        >
                          <div className="w-1.5 h-1.5 rounded-full bg-[#d17600] opacity-70"></div>
                          {child.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                );
              })}
            </nav>

          </div>

          {/* Footer of Sidebar */}
          <Link href="/admin/login" onClick={closeSidebar}>
            <div className="p-4 border-t border-white/10 text-[10px] text-white/40 hover:text-[#d17600] font-mono text-center transition-colors">
              Al-Asad Education Foundation
            </div>
          </Link>
        </div>
      </div>
    </header>
  );
}
