/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#e6f2f4',
          100: '#cce5e9',
          200: '#99ccd3',
          300: '#66b2bd',
          400: '#3295a2', // Main primary color
          500: '#3295a2',
          600: '#2b7a85',
          700: '#235c68',
          800: '#1c4a54',
          900: '#16373e',
        },
        secondary: {
          50: '#e6f1f7',
          100: '#cce3ef',
          200: '#99c7df',
          300: '#66abcf',
          400: '#338fbf',
          500: '#1888b0', // Main secondary color
          600: '#146d8d',
          700: '#10526a',
          800: '#0d4256',
          900: '#0a3142',
        },
        accent: {
          50: '#e6f2f4',
          100: '#cce5e9',
          200: '#99ccd3',
          300: '#66b2bd',
          400: '#3295a2',
          500: '#1888b0',
          600: '#146d8d',
          700: '#10526a',
          800: '#0d4256',
          900: '#0a3142',
        },
        success: {
          50: '#f0fdf4',
          500: '#22c55e',
          600: '#16a34a',
        },
        warning: {
          50: '#fffbeb',
          500: '#f59e0b',
          600: '#d97706',
        },
        error: {
          50: '#fef2f2',
          500: '#ef4444',
          600: '#dc2626',
        },
        // Updated color scheme
        teal: {
          50: '#e6f2f4',
          100: '#cce5e9',
          200: '#99ccd3',
          300: '#66b2bd',
          400: '#3295a2',
          500: '#3295a2', // From coolors.co
          600: '#2b7a85',
          700: '#235c68',
          800: '#1c4a54',
          900: '#16373e',
        },
        blue: {
          50: '#e6f1f7',
          100: '#cce3ef',
          200: '#99c7df',
          300: '#66abcf',
          400: '#338fbf',
          500: '#1888b0', // From coolors.co
          600: '#146d8d',
          700: '#10526a',
          800: '#0d4256',
          900: '#0a3142',
        },
        gray: {
          50: '#f0f4f8', // Light background
          100: '#e1e5e9',
          200: '#c2c9d0',
          300: '#a3adb7',
          400: '#84919e',
          500: '#667585',
          600: '#525e6a',
          700: '#3d4650',
          800: '#292f35',
          900: '#14171a',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-in': 'slideIn 0.3s ease-out',
        'pulse-subtle': 'pulseSubtle 2s infinite',
        'bounce-subtle': 'bounceSubtle 1s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideIn: {
          '0%': { transform: 'translateX(-10px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' },
        },
        bounceSubtle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
        'elegant': '0 4px 20px 0 rgba(0, 0, 0, 0.1)',
        'soft': '0 2px 15px 0 rgba(0, 0, 0, 0.08)',
        'card': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
      },
      backdropBlur: {
        'xs': '2px',
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      borderRadius: {
        '4xl': '2rem',
      },
      maxWidth: {
        '8xl': '88rem',
        '9xl': '96rem',
      },
    },
  },
  plugins: [],
};