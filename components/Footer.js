"use client";

import Link from 'next/link';
import { Mail, Phone, MapPin, Smartphone } from 'lucide-react';

const Footer = () => {
  // Extracted contact details from the banner image
  const CONTACT_INFO = {
    address: 'Mani Road, Opp. Gidan Dawo Primary School, Katsina, Katsina State.',
    email: 'alasadeducationfoundation@yahoo.com',
    phone: '+234 806 716 8669', // Format corrected
    phoneLink: 'tel:+2348067168669'
  };

  return (
    <footer className="bg-brand-brown-dark text-white font-body">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-10">
          
          {/* Column 1: Logo and Mission */}
          <div className="space-y-4 col-span-2 md:col-span-2">
            <Link href="/">
                <img 
                    src="/footerlogo.png" 
                    alt="Al-Asad Education Foundation Logo" 
                    className="h-16 w-auto mb-2" 
                    onError={(e) => { e.target.onerror = null; e.target.src="/placeholder.png" }}
                />
            </Link>
          </div>
          
          {/* Column 2: Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-brand-gold uppercase tracking-wider font-heading">Links</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/programs" className="hover:text-brand-gold transition-colors">Programs</Link></li>
              <li><Link href="/multimedia" className="hover:text-brand-gold transition-colors">Multimedia</Link></li>
              <li><Link href="/news" className="hover:text-brand-gold transition-colors">News & Updates</Link></li>
              <li><Link href="/about" className="hover:text-brand-gold transition-colors">About Us</Link></li>
            </ul>
          </div>

          {/* Column 3: Support */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-brand-gold uppercase tracking-wider font-heading">Support</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/donate" className="hover:text-brand-gold transition-colors">Donate Now</Link></li>
              <li><Link href="#" className="hover:text-brand-gold transition-colors">Volunteer</Link></li>
              <li><Link href="/admin" className="hover:text-brand-gold transition-colors">Staff Login</Link></li>
            </ul>
          </div>

          {/* Column 4: Contact */}
          <div className="space-y-4 col-span-2 md:col-span-1">
            <h3 className="text-lg font-bold text-brand-gold uppercase tracking-wider font-heading">Contact Us</h3>
            <address className="space-y-3 text-sm not-italic">
              <div className="flex items-start">
                <MapPin className="w-5 h-5 flex-shrink-0 mr-2 text-brand-gold mt-0.5" />
                <span>{CONTACT_INFO.address}</span>
              </div>
              <div className="flex items-center">
                <Mail className="w-5 h-5 mr-2 text-brand-gold" />
                <a href={`mailto:${CONTACT_INFO.email}`} className="hover:text-brand-gold transition-colors break-all">
                  {CONTACT_INFO.email}
                </a>
              </div>
              <div className="flex items-center">
                <Smartphone className="w-5 h-5 mr-2 text-brand-gold" />
                <a href={CONTACT_INFO.phoneLink} className="hover:text-brand-gold transition-colors">
                  {CONTACT_INFO.phone}
                </a>
              </div>
            </address>
          </div>
        </div>
        
        {/* Copyright */}
        <div className="mt-12 border-t border-gray-700 pt-8 text-center">
          <p className="text-sm text-gray-500">&copy; {new Date().getFullYear()} Al-Asad Education Foundation. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;