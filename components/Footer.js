"use client";

import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="w-full bg-[#432e16] text-white font-body pt-12 pb-6">
      <div className="max-w-7xl mx-auto flex flex-col items-center px-4">

        {/* Logo */}
        <div className="mb-2">
          <Image
            src="/footerlogo.svg"
            alt="Al-Asad Education Foundation"
            width={100}
            height={100}
            className="w-60 h-auto"
          />
        </div>

        {/* Separator line */}
        <div className="w-90 border-t" style={{ borderColor: "#9a9a9a" }}></div>

        {/* Social icons + email bar */}
        <div className="flex flex-col sm:flex-row items-center justify-center w-full mt-6 gap-4">

          {/* Social icons */}
          <div className="flex items-center gap-2">
            <Link href="https://www.facebook.com/share/1D438MVXpQ/" target="_blank">
              <Image src="/fbicon.svg" alt="Facebook" width={30} height={30} />
            </Link>

            <Link href="https://youtube.com/@alasadeducation" target="_blank">
              <Image src="/yticon.svg" alt="YouTube" width={30} height={30} />
            </Link>

            <Link href="https://www.instagram.com/alasad_education_foundation" target="_blank">
              <Image src="/igicon.svg" alt="Instagram" width={30} height={30} />
            </Link>

            <Link href="https://www.tiktok.com/@alasad_tv" target="_blank">
              <Image src="/tticon.svg" alt="TikTok" width={30} height={30} />
            </Link>

            <Link href="https://t.me/alasadeducation" target="_blank">
              <Image src="/tgicon.svg" alt="Telegram" width={30} height={30} />
            </Link>

            <Link href="https://x.com/AsadEducation" target="_blank">
              <Image src="/xicon.svg" alt="X" width={30} height={30} />
            </Link>

            <Link href="https://whatsapp.com/channel/0029VawdL4n6xCSHyUsMzc2V" target="_blank">
              <Image src="/waicon.svg" alt="WhatsApp" width={30} height={30} />
            </Link>
          </div>

          {/* Email bar */}
          <form
            action={`mailto:alasadeducationfoundation@yahoo.com`}
            method="POST"
            encType="text/plain"
            className="flex w-60 sm:w-auto"
          >
            <input
              type="email"
              required
              placeholder="Send us a mail..."
              className="bg-white text-black px-4 py-2 rounded-l-md w-full sm:w-64 outline-none"
            />
            <button
              type="submit"
              className="bg-[#d97706] px-6 py-2 rounded-r-md font-semibold"
            >
              Send
            </button>
          </form>
        </div>

        {/* Copyright */}
        <p className="mt-6 text-[#9a9a9a] text-sm text-center">
          © Al-Asad Education Foundation. All rights reserved.
        </p>
      </div>
    </footer>
  );
}