/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand:   '#1a1a2e',
        accent:  '#e94560',
        accent2: '#f5a623',
        surface: '#ffffff',
        bg:      '#f8f7f4',
        border:  '#e8e4dc',
        muted:   '#7a7a8a',
      },
      fontFamily: {
        sans:    ['"DM Sans"', 'sans-serif'],
        display: ['"Playfair Display"', 'serif'],
      },
    },
  },
  plugins: [],
}
