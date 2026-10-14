/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Study-inspired futuristic library palette (Reference Matching)
        sanctuary: {
          bg: '#FAF7F0',          // Warm Ivory main background
          cream: '#FFFDF7',       // Soft Cream secondary background
          surface: '#FFFFFF',     // Clean translucent white
          surfaceAlt: '#F5EFEB',  // Subtle warm paper
        },
        forest: {
          900: '#0E2922',
          800: '#153B32',         // Main text: deep forest
          700: '#1B4D41',
          600: '#236152',
        },
        slateText: {
          muted: '#61736D',       // Secondary text: muted slate
          light: '#82948E',
        },
        emeraldPrimary: {
          50: '#F0FDF8',
          100: '#D5FBEB',
          200: '#B8F2D0',         // Accent mint
          500: '#10B981',
          600: '#07866B',         // Primary emerald
          700: '#056B55',
          800: '#045242',
        },
        tealSec: {
          400: '#2DD4BF',
          500: '#18A999',         // Secondary teal
          600: '#138B7D',
        },
        mintAccent: {
          100: '#E6FAF0',
          200: '#C9F5DE',
          300: '#B8F2D0',         // Mint accent
          400: '#8AE6B5',
        },
        goldHighlight: {
          100: '#FEF8EB',
          200: '#FDECCB',
          300: '#FCD897',
          400: '#F8C868',
          500: '#F4B942',         // Warm Gold highlight
          600: '#DB9E27',
        },
        coralWarning: {
          100: '#FDEEEB',
          200: '#FCD5D1',
          400: '#F6A7A0',
          500: '#F28B82',         // Soft coral weak-topic warning
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Outfit', 'Inter', 'sans-serif'],
        mono: ['Fira Code', 'monospace'],
      },
      boxShadow: {
        'glass-clean': '0 10px 30px -5px rgba(21, 59, 50, 0.08), 0 4px 12px -2px rgba(21, 59, 50, 0.04)',
        'glass-hover': '0 18px 40px -5px rgba(7, 134, 107, 0.14), 0 8px 18px -4px rgba(21, 59, 50, 0.06)',
        'gold-glow': '0 0 25px -4px rgba(244, 185, 66, 0.35)',
        'emerald-glow': '0 0 25px -4px rgba(7, 134, 107, 0.30)',
      },
      animation: {
        'float-gentle': 'floatGentle 5s ease-in-out infinite',
        'float-slow': 'floatGentle 8s ease-in-out infinite',
        'pulse-subtle': 'pulseSubtle 3s ease-in-out infinite',
        'drift-particles': 'driftParticles 14s linear infinite',
      },
      keyframes: {
        floatGentle: {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '50%': { transform: 'translateY(-8px) rotate(1deg)' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '0.9', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.02)' },
        },
        driftParticles: {
          '0%': { transform: 'translateY(0px) translateX(0px)', opacity: '0' },
          '10%': { opacity: '0.8' },
          '90%': { opacity: '0.8' },
          '100%': { transform: 'translateY(-120px) translateX(40px)', opacity: '0' },
        }
      }
    },
  },
  plugins: [],
}
