module.exports = {
  content: ['./app/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  theme: {
    screens: {
      'xs': '475px',
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px',
    },
    extend: {
      colors: {
        // Professional Designer Palette (Restrained, Premium & High Contrast)
        jooka: {
          gold: '#C5A059',
          'gold-light': '#F7F3EB',
          'gold-[#D4AF37]': '#D4AF37',
          red: '#C8102E',
          'red-light': '#FEF2F2',
          black: '#111827',
          gray: '#F9FAFB',
          'border-gray': '#E5E7EB',
        },
        gold: '#C5A059',
        canvas: '#FFFFFF',
        surface: '#FFFFFF',
        'surface-muted': '#F9FAFB',
        'border-muted': '#E5E7EB',
        black: '#111827',
        charcoal: '#1F2937',
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', '"Plus Jakarta Sans"', 'sans-serif'],
        display: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      boxShadow: {
        'xs': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      },
      borderWidth: {
        '3': '3px',
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-in-out',
        'slide-up': 'slideUp 0.4s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(16px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
