/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          gold: '#d17600',       // Primary
          brown: {
            DEFAULT: '#655037',  // Tertiary/Medium
            dark: '#432e16',     // Secondary/Dark
          },
          white: '#ffffff',
        }
      },
      fontFamily: {
        sans: ['Lato', 'sans-serif'],
        heading: ['Agency', 'sans-serif'],
        arabic: ['Tajawal', 'serif'],
      },
    },
  },
  plugins: [],
}