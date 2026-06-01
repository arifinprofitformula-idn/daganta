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
          50: '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7c3aed',
          700: '#6d28d9',
          800: '#5b21b6',
          900: '#4c1d95',
          950: '#2e1065',
        },
        'brand-navy': '#0B1F33',
        'brand-blue': '#2563EB',
        'brand-sky': '#38BDF8',
        'brand-teal': '#14B8A6',
        'brand-slate-bg': '#F8FAFC',
        'brand-border': '#E2E8F0',
        'brand-gold': '#D99A24',
        'brand-cream': '#FFF7E6',
        'brand-cloud': '#F7F9FC',
        'brand-green': '#1F7A5C',
      }
    },
  },
  plugins: [],
}
