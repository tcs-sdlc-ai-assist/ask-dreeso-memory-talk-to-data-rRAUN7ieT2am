/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        'accent-blue': '#4E84C4',
        'success': '#54B948',
        'warning': '#FBB034',
        'critical': '#F15A29',
        'bg-dark': '#0A1A2F',
        'bg-dark-secondary': '#1E2A44',
      },
      fontFamily: {
        urbanist: ['Urbanist', 'sans-serif'],
      },
      borderRadius: {
        'card': '16px',
        'bubble': '20px',
      },
    },
  },
  plugins: [],
};