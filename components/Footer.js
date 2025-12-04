"use client";

import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  return (
    
    <footer className="w-full bg-[#432e16] text-white font-body pt-12 pb-6">
      <div className="max-w-7xl mx-auto flex flex-col items-center px-4">

        {/* Logo */}
        
        <div className="mb-4 mt-30">
          <Image 
                src="/footerlogo.svg" 
                alt="Al-Asad Education Foundation Logo" 
                className="h-12 w-65 object-contain" 
                sizes="100vw"
              />
        </div>

        {/* Separator line */}
        <div className="w-70 border-t opacity-40" style={{ borderColor: "#9a9a9a" }}></div>

        {/* Social icons + email bar */}
        <div className="flex flex-col sm:flex-row items-center justify-center w-full mt-6 mb-6 gap-2">

          {/* Social icons */}
          <div className="flex items-center gap-1">
            <Link href="https://www.facebook.com/share/1D438MVXpQ/">
              <Image src="/fbicon.svg" alt="Facebook" w-2 h-2 />
            </Link>

            <Link href="https://youtube.com/@alasadeducation">
              <Image src="/yticon.svg" alt="YouTube" w-2 h-2 />
            </Link>

            <Link href="https://www.instagram.com/alasad_education_foundation">
              <Image src="/igicon.svg" alt="Instagram" w-2 h-2 />
            </Link>

            <Link href="https://www.tiktok.com/@alasad_tv">
              <Image src="/tticon.svg" alt="TikTok" w-2 h-2 />
            </Link>

            <Link href="https://t.me/alasadeducation">
              <Image src="/tgicon.svg" alt="Telegram" w-2 h-2 />
            </Link>

            <Link href="https://x.com/AsadEducation">
              <Image src="/xicon.svg" alt="X" w-2 h-2 />
            </Link>

            <Link href="https://whatsapp.com/channel/0029VawdL4n6xCSHyUsMzc2V">
              <Image src="/waicon.svg" alt="WhatsApp" w-2 h-2 />
            </Link>
          </div>

          {/* Email bar - Adjusted styling for input field placeholder and button color/roundness */}
          <form
            action={`mailto:alasadeducationfoundation@yahoo.com`}
            method="POST"
            encType="text/plain"
            // Removed fixed width for better responsiveness and mockup match
            className="flex"
          >
            <input
              type="email"
              required
              // Changed placeholder text to match mockup exactly
              placeholder="Send us a mail..."
              // Adjusted styling for light background, text color, and padding to match mockup
              className="bg-white text-black text-sm px-4 py-2 w-48 outline-none border-y border-l"
            />
            <button
              type="submit"
              // Matched the button's background color (brand-gold/dark orange)
              className="bg-brand-gold px-6 py-2 text-sm font-semibold hover:bg-opacity-90"
            >
              Send
            </button>
          </form>
        </div>

        {/* Copyright */}
        <p className="mt-50 text-[#9a9a9a] text-sm text-center">
          © All rights reserved
<br />
Al-Asad Education Foundation
        </p>
      </div>
    </footer>
  );
}
