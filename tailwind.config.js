/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        display: ['"TAN Astoria"', 'Georgia', 'serif'],
      },
      colors: {
        ink: '#0A0A0A',
        paper: '#FAFAF9',
        line: '#E7E5E4',
      },
    },
  },
  plugins: [],
};
