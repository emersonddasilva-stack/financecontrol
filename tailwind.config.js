/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  darkMode: 'class',
  theme: {
    container: {
      center: true,
      padding: '1rem',
    },
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        primary: {
          DEFAULT: 'var(--primary)',
          foreground: 'var(--primary-foreground)',
        },
        secondary: {
          DEFAULT: 'var(--secondary)',
          foreground: 'var(--secondary-foreground)',
        },
        accent: {
          DEFAULT: 'var(--accent)',
          foreground: 'var(--accent-foreground)',
        },
        muted: {
          DEFAULT: 'var(--muted)',
          foreground: 'var(--muted-foreground)',
        },
        card: {
          DEFAULT: 'var(--card)',
          foreground: 'var(--card-foreground)',
        },
        border: 'var(--border)',
        input: 'var(--input)',
        ring: 'var(--ring)',
        positive: 'var(--positive)',
        'positive-bg': 'var(--positive-bg)',
        negative: 'var(--negative)',
        'negative-bg': 'var(--negative-bg)',
        warning: 'var(--warning)',
        'warning-bg': 'var(--warning-bg)',
        info: 'var(--info)',
        'info-bg': 'var(--info-bg)',
      },
      borderRadius: {
        DEFAULT: 'var(--radius)',
        sm: 'calc(var(--radius) - 0.25rem)',
        lg: 'var(--radius)',
        xl: 'calc(var(--radius) + 0.25rem)',
        '2xl': 'calc(var(--radius) + 0.5rem)',
      },
      fontFamily: {
        sans: ['var(--font-plus-jakarta-sans)', 'sans-serif'],
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
};