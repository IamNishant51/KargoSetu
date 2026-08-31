/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#072749',
          dark: '#031121',
          light: '#0c417a',
        },
        gov: {
          bg: '#f8fafc',
          surface: '#ffffff',
          border: '#e2e8f0',
          text: '#0f172a',
          label: '#64748b',
        }
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
    },
  },
  plugins: [],
};
