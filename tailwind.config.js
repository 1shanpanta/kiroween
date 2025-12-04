module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        'void-black': '#000000',
        'shadow-green': '#008000',
        'standard-green': '#00FF00',
        'phosphor-bright': '#CCFFCC',
        'fatal-red': '#FF0000',
      },
      fontFamily: {
        'press-start': ['PressStart2P'],
      },
    },
  },
  plugins: [],
};
