// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/lib/**/*.{js,ts,jsx,tsx,mdx}',
    './src/posts/**/*.{md,mdx}',
  ],
  theme: {
    fontFamily: {
      sans: ['var(--font-poppins)'],
    },
    colors: {
      background: '#F9FAFB',
      primary: '#4CAF50',
      accent: '#2196F3',
      textDark: '#374151',
      textSecondary: '#6B7280',
    },
    extend: {
      typography: ({ theme }) => ({
        DEFAULT: {
          css: {
            '--tw-prose-body': theme('colors.textDark'),
            '--tw-prose-headings': theme('colors.textDark'),
            '--tw-prose-links': theme('colors.accent'),
            '--tw-prose-bold': theme('colors.textDark'),
            '--tw-prose-quotes': theme('colors.textDark'),
            '--tw-prose-code': theme('colors.textDark'),
            '--tw-prose-th-borders': theme('colors.textSecondary'),
            '--tw-prose-td-borders': theme('colors.textSecondary'),
            a: {
              textDecoration: 'none',
              fontWeight: '600',
              '&:hover': { color: theme('colors.primary') },
            },
            code: { backgroundColor: theme('colors.background') },
            blockquote: {
              borderLeftColor: theme('colors.primary'),
              color: theme('colors.textSecondary'),
            },
            hr: { borderColor: theme('colors.textSecondary') },
          },
        },
        invert: {
          css: {
            '--tw-prose-body': theme('colors.background'),
          },
        },
      }),
      boxShadow: {
        card: '0 4px 20px rgba(0,0,0,0.05)',
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
};