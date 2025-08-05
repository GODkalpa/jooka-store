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
        // JOOKA Brand Colors
        gold: '#D4AF37',
        charcoal: '#2C2C2C',
        black: '#111111',
        ivory: '#F5F5F5',
        // Shadcn compatible colors
        background: '#111111',
        foreground: '#D4AF37',
        primary: {
          DEFAULT: '#D4AF37',
          foreground: '#111111',
        },
        secondary: {
          DEFAULT: '#2C2C2C',
          foreground: '#F5F5F5',
        },
        muted: {
          DEFAULT: '#2C2C2C',
          foreground: '#F5F5F5',
        },
      },
      fontFamily: {
        serif: ['Playfair Display', 'serif'],
        sans: ['Inter', 'sans-serif'],
        garamond: ['Cormorant Garamond', 'serif'],
      },
      borderWidth: {
        '3': '3px',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.5s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
