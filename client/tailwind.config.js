module.exports = {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
    './node_modules/@vkontakte/**/*.js',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Open Sans"', '"Helvetica"', 'sans-serif'],
        fancy: ['Raleway', '"Helvetica"', 'sans-serif'],
        display: ['"Fredoka One"', 'sans-serif'],
      },
      screens: {
        'media-hover': {
          raw: '(hover: hover)',
        },
      },
      boxShadow: {
        up: '0px -4px 16px -2px rgba(31, 41, 55, 0.2)',
        vignette: 'inset 0px 0px 40px rgba(0, 0, 0, 0.2)',
      },
    },
  },
  plugins: [
    require('tailwindcss-textshadow'),
    require('tailwindcss-safe-area'),
  ],
}
