/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.html',
    './src/index.css',
    './src/**/*.{js,jsx,ts,tsx,css}'
  ],
  theme: {
    extend: {
      fontFamily: {
        pixelify: ['"Pixelify Sans"', 'sans-serif'],
        tagesschrift: ['Tagesschrift', 'Regular'],
      }
    }
  },
  plugins: [],
}