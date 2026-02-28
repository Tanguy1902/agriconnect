/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}"
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: '#059669', // Emerald 600
        'primary-foreground': '#ffffff',
        secondary: '#78350f', // Amber 900
        'secondary-foreground': '#ffffff',
        accent: '#f59e0b', // Amber 500
        'accent-foreground': '#ffffff',
      },
    },
  },
  plugins: [],
}
