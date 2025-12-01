"use client";

import Link from 'next/link';
import { Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-brand-brown-dark text-white font-body">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          
          {/* Column 1: Logo and Mission */}
          <div className="space-y-4 col-span-2 md:col-span-1">
            <Link href="/">
                <img 
                    src="/headerlogo.png" 
                    alt="Al-Asad Platform Logo" 
                    className="h-16 w-auto mb-2" 
                    onError={(e) => { e.target.onerror = null; e.target.src="/placeholder.png" }}
                />
            </Link>
            <p className="text-sm text-gray-300">
              Fostering excellence in Islamic education and community outreach for a brighter future.
            </p>
          </div>
          
          {/* Column 2: Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-brand-gold uppercase tracking-wider font-heading">Navigation</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/about" className="hover:text-brand-gold transition-colors">About Us</Link></li>
              <li><Link href="/programs" className="hover:text-brand-gold transition-colors">Programs</Link></li>
              <li><Link href="/news" className="hover:text-brand-gold transition-colors">News</Link></li>
              <li><Link href="/multimedia" className="hover:text-brand-gold transition-colors">Multimedia</Link></li>
            </ul>
          </div>

          {/* Column 3: Support */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-brand-gold uppercase tracking-wider font-heading">Support</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/donate" className="hover:text-brand-gold transition-colors">Donate Now</Link></li>
              <li><Link href="/admin" className="hover:text-brand-gold transition-colors">Admin Login</Link></li>
              <li><a href="#" className="hover:text-brand-gold transition-colors">Volunteering</a></li>
              <li><a href="#" className="hover:text-brand-gold transition-colors">Terms of Use</a></li>
            </ul>
          </div>

          {/* Column 4: Contact */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-brand-gold uppercase tracking-wider font-heading">Contact</h3>
            <address className="space-y-2 text-sm not-italic">
              <div className="flex items-center">
                <MapPin className="w-4 h-4 mr-2 text-brand-gold" />
                <span>P.O. Box 1234, Abuja, Nigeria</span>
              </div>
              <div className="flex items-center">
                <Phone className="w-4 h-4 mr-2 text-brand-gold" />
                <a href="tel:+2348000000000" className="hover:text-brand-gold transition-colors">+234 800 000 0000</a>
              </div>
              <div className="flex items-center">
                <Mail className="w-4 h-4 mr-2 text-brand-gold" />
                <a href="mailto:info@al-asad.org" className="hover:text-brand-gold transition-colors">info@al-asad.org</a>
              </div>
            </address>
          </div>

        </div>
        
        {/* Copyright */}
        <div className="mt-12 border-t border-gray-700 pt-8 text-center">
          <p className="text-sm text-gray-500">&copy; {new Date().getFullYear()} Al Asad Platform. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;