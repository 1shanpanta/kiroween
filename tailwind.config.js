/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,ts,tsx}', './components/**/*.{js,ts,tsx}'],

  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        'void-black': '#000000',
        'shadow-green': '#008000', // Darker green / Accent
        'standard-green': '#00FF00', // High-contrast bright green / Primary
        'phosphor-bright': '#CCFFCC',
        'fatal-red': '#FF0000',
      },
    },
  },
  plugins: [],
};
