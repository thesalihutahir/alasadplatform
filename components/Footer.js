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
          
          {/* Column 2: Support */}
          <div className="space-y-4">
            <ul className="space-y-2 text-sm">
              <li><Link href="/donate" className="hover:text-brand-gold transition-colors">Donate</Link> | 
              <Link href="#" className="hover:text-brand-gold transition-colors">Volunteer</Link> | 
              <Link href="/admin" className="hover:text-brand-gold transition-colors">Staff Login</Link></li>
            </ul>
          </div>
        
        </div> {/* <-- ADDED: Correctly closes the grid div */}
        
        {/* Copyright */}
        <div className="mt-12 border-t border-gray-700 pt-8 text-center">
          <p className="text-sm text-gray-500">&copy; {new Date().getFullYear()} Al-Asad Education Foundation. All rights reserved.</p>
        </div>
      </div>
    </footer>
  ); {/* <-- ADDED: Closes the return statement */}
}; {/* <-- ADDED: Closes the function definition */}

export default Footer;