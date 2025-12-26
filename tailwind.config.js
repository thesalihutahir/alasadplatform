const { withUt } = require("uploadthing/tw");

/** @type {import('tailwindcss').Config} */
module.exports = withUt({
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // OFFICIAL BRAND COLORS
        'brand-gold': '#d17600',       // Gold
        'brand-brown-dark': '#432e16', // Dark Brown
        'brand-brown': '#655037',      // Medium Brown
        'brand-sand': '#F8F6F2',       // Light Sand/Cream background
      },
      fontFamily: {
        // Define custom font families
        'agency': ['AgencyRegular', 'sans-serif'], // For headings
        'lato': ['LatoRegular', 'sans-serif'],     // For body text
        // I added this one back so the Arabic Quote we just built doesn't break
        'tajawal': ['Tajawal', 'sans-serif'],      
      },
      backgroundImage: {
        // Define background image patterns
        'vision-overlay': "url('/visionandmissionbg.svg')",
      }
    },
  },
  plugins: [],
});
