"use client";

import Link from 'next/link';
import { Mail, Phone, MapPin, Smartphone } from 'lucide-react';

const Footer = () => {
  // Extracted contact details
  const CONTACT_INFO = {
    address: 'Mani Road, Opp. Gidan Dawo Primary School, Katsina, Katsina State.',
    email: 'alasadeducationfoundation@yahoo.com',
    phone: '+234 806 716 8669',
    phoneLink: 'tel:+2348067168669'
  };
  
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-brand-brown-dark text-white font-body">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        
        {/* Main Grid: Logo, Support, and Contact Info */}
        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-10">
          
          {/* Column 1: Logo and Mission/Description */}
          <div className="space-y-4 col-span-1 md:col-span-2">
            <Link href="/">
                <img 
                    src="/footerlogo.png" 
                    alt="Al-Asad Education Foundation Logo" 
                    className="h-16 w-auto mb-2" 
                    onError={(e) => { e.target.onerror = null; e.target.src="/placeholder.png" }}
                />
            </Link>
            <p className="text-sm text-gray-300 max-w-xs">
                Guiding through Qur'an, Empowering Communities. Excellence in learning and social development.
            </p>
          </div>
          
          {/* Column 2: Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-brand-gold mb-3 font-heading uppercase">Quick Links</h3>
            <ul className="space-y-2 text-sm">
                <li><Link href="/programs" className="hover:text-brand-gold transition-colors">Our Programs</Link></li>
                <li><Link href="/multimedia" className="hover:text-brand-gold transition-colors">Multimedia</Link></li>
                <li><Link href="/news" className="hover:text-brand-gold transition-colors">Latest News</Link></li>
                <li><Link href="/about" className="hover:text-brand-gold transition-colors">About Us</Link></li>
            </ul>
          </div>
          
          {/* Column 3: Support */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-brand-gold mb-3 font-heading uppercase">Support</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/donate" className="hover:text-brand-gold transition-colors">Donate Now</Link></li>
              <li><Link href="#" className="hover:text-brand-gold transition-colors">Volunteer</Link></li>
              <li><Link href="/admin" className="hover:text-brand-gold transition-colors">Staff Login</Link></li>
            </ul>
          </div>

          {/* Column 4: Contact Us */}
          <div className="space-y-4 col-span-1">
            <h3 className="text-lg font-bold text-brand-gold mb-3 font-heading uppercase">Contact Us</h3>
            <ul className="space-y-3 text-sm">
                <li className="flex items-start">
                    <MapPin className="w-5 h-5 text-brand-gold flex-shrink-0 mt-1 mr-2" />
                    <span className='text-gray-300'>{CONTACT_INFO.address}</span>
                </li>
                <li className="flex items-center">
                    <Mail className="w-5 h-5 text-brand-gold flex-shrink-0 mr-2" />
                    <a href={`mailto:${CONTACT_INFO.email}`} className="hover:text-brand-gold transition-colors">{CONTACT_INFO.email}</a>
                </li>
                <li className="flex items-center">
                    <Smartphone className="w-5 h-5 text-brand-gold flex-shrink-0 mr-2" />
                    <a href={CONTACT_INFO.phoneLink} className="hover:text-brand-gold transition-colors">{CONTACT_INFO.phone}</a>
                </li>
            </ul>
          </div>

        </div> {/* End of main grid */}
        
        {/* Copyright */}
        <div className="mt-12 border-t border-gray-700 pt-8 text-center">
          <p className="text-sm text-gray-500">&copy; {currentYear} Al-Asad Education Foundation. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;