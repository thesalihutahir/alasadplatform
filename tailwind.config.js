/** @type {import('tailwindcss').Config} */
module.exports = {
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
      },
      backgroundImage: {
        // Define background image patterns
        'vision-overlay': "url('/visionandmissionbg.svg')",
      }
    },
  },
  plugins: [],
}