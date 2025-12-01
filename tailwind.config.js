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
        'brand-gold': '#d17600',       // Official Gold: #d17600
        'brand-brown-dark': '#432e16', // Official Dark Brown: #432e16
        'brand-brown-light': '#655037', // Official Brown: #655037
        'brand-sand': '#F8F6F2',       // Off-White Background Color
      },
      fontFamily: {
        // Map custom fonts (assuming WOFF2 files are in public/fonts/)
        heading: ['AgencyRegular', 'sans-serif'],
        body: ['LatoRegular', 'sans-serif'],
      },
      backgroundImage: {
        'hero': "url('/hero.jpg')",
      }
    },
  },
  plugins: [],
}