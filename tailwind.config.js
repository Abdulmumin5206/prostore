/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          '"SF Pro Display"',
          '"SF Pro Text"',
          '"SF Pro Icons"',
          '"Helvetica Neue"',
          'Helvetica',
          'Arial',
          'sans-serif'
        ],
      },
      fontSize: {
        xs: ['0.75rem', { lineHeight: '1rem' }],
        sm: ['0.875rem', { lineHeight: '1.25rem' }],
        base: ['1rem', { lineHeight: '1.5rem' }],
        lg: ['1.125rem', { lineHeight: '1.75rem' }],
        xl: ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
        '5xl': ['3rem', { lineHeight: '1' }],
        '6xl': ['3.75rem', { lineHeight: '1' }],
        '7xl': ['4.5rem', { lineHeight: '1' }],
      },
      letterSpacing: {
        tighter: '-0.05em',
        tight: '-0.025em',
        normal: '0em',
        wide: '0.025em',
        wider: '0.05em',
        widest: '0.1em',
      },
      spacing: {
        // Standardized spacing system (reduced values)
        'section-y': '2.5rem',    // 40px - Standard vertical padding for sections (reduced from 4rem)
        'section-y-sm': '2rem',   // 32px - Smaller vertical padding for sections (reduced from 3rem)
        'section-y-lg': '3rem',   // 48px - Larger vertical padding for sections (reduced from 5rem)
        'section-x': '1rem',      // 16px - Standard horizontal padding for sections (unchanged)
        'content-y': '1.5rem',    // 24px - Vertical spacing between content blocks (reduced from 2.5rem)
        'content-y-sm': '1rem',   // 16px - Smaller vertical spacing between content blocks (reduced from 1.5rem)
        'content-y-lg': '2rem',   // 32px - Larger vertical spacing between content blocks (reduced from 3.5rem)
        'element-y': '0.75rem',   // 12px - Vertical spacing between elements (reduced from 1rem)
        'element-y-sm': '0.375rem', // 6px - Smaller vertical spacing between elements (reduced from 0.5rem)
        'element-y-lg': '1rem',   // 16px - Larger vertical spacing between elements (reduced from 1.5rem)
      },
    },
  },
  plugins: [],
};
