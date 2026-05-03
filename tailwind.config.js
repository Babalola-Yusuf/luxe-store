/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand:   'var(--color-brand)',
        accent:  'var(--color-accent)',
        accent2: 'var(--color-accent2)',
        surface: 'var(--color-surface)',
        bg:      'var(--color-bg)',
        border:  'var(--color-border)',
        muted:   'var(--color-muted)',
      },
      fontFamily: {
        sans:    ['"DM Sans"', 'sans-serif'],
        display: ['"Playfair Display"', 'serif'],
      },
    },
  },
  plugins: [],
}
