export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#6C47FF',
        dark: '#0f0f0f',
      }
    }
  },
  plugins: [require('@tailwindcss/typography')]
}
