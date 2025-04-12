/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./App.{js,ts,tsx}', './components/**/*.{js,ts,tsx}'],

  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        funkyPink: '#FF6F91',
        deepPurple: '#2D1B69',
      },
    },
  },
  plugins: [],
};
