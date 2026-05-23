/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Dark theme with green accent (matching landing page)
        green: {
          50:  '#e6fff5',
          100: '#b3ffe0',
          200: '#80ffc9',
          300: '#4dffb3',
          400: '#1aff9c',
          500: '#00ea64', // Main green
          600: '#00c754',
          700: '#00a444',
          800: '#008135',
          900: '#005e25',
        },
        dark: {
          50:  '#2a2a2a',
          100: '#1f1f1f',
          200: '#171717',
          300: '#111111', // Surface
          400: '#0d0d0d',
          500: '#0a0a0a', // Main background
          600: '#080808',
          700: '#050505',
          800: '#030303',
          900: '#000000',
        },
        // Keep teal as alias for compatibility
        teal: {
          50:  '#e6fff5',
          100: '#b3ffe0',
          200: '#80ffc9',
          300: '#4dffb3',
          400: '#1aff9c',
          500: '#00ea64',
          600: '#00c754',
          700: '#00a444',
          800: '#008135',
          900: '#005e25',
        },
        // Update gold to match green theme
        gold: {
          50:  '#e6fff5',
          100: '#b3ffe0',
          200: '#80ffc9',
          300: '#4dffb3',
          400: '#1aff9c',
          500: '#00ea64',
          600: '#00c754',
          700: '#00a444',
          800: '#008135',
          900: '#005e25',
        },
        // Primary as green
        primary: {
          50:  '#e6fff5',
          100: '#b3ffe0',
          200: '#80ffc9',
          300: '#4dffb3',
          400: '#1aff9c',
          500: '#00ea64',
          600: '#00c754',
          700: '#00a444',
          800: '#008135',
          900: '#005e25',
        },
      },
    },
  },
  plugins: [],
}
