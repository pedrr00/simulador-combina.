/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'cyan-accent': '#22d3ee',
        'dark-bg': '#0B1120',
        'card-bg': '#1a2236',
      },
      boxShadow: {
        glow: '0 0 20px rgba(34, 211, 238, 0.2)',
      },
    },
  },
  plugins: [],
};
