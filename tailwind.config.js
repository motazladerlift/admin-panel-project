/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'admin-primary': '#ff6b35',
        'admin-primary-hover': '#f7931e',
        'admin-secondary': '#ff8c42',
        'admin-bg': '#f8f9fa',
        'admin-text': '#2c3e50',
        'admin-text-secondary': '#6c757d',
        'admin-card-bg': '#ffffff',
        'admin-border': '#e9ecef',
        'admin-sidebar-start': '#2c3e50',
        'admin-sidebar-end': '#34495e',
      },
      backgroundImage: {
        'admin-gradient': 'linear-gradient(135deg, #ff6b35 0%, #f7931e 50%, #ff8c42 100%)',
        'admin-sidebar-gradient': 'linear-gradient(180deg, #2c3e50 0%, #34495e 50%, #2c3e50 100%)',
      },
      fontFamily: {
        'arabic': ['Noto Sans Arabic', 'Tajawal', 'sans-serif'],
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        'admin': '0 2px 10px rgba(0, 0, 0, 0.08)',
        'admin-hover': '0 6px 20px rgba(0, 0, 0, 0.12)',
        'admin-card': '0 4px 15px rgba(255, 107, 53, 0.2)',
        'admin-sidebar': '4px 0 20px rgba(0, 0, 0, 0.1)',
      },
      animation: {
        'shimmer': 'shimmer 3s infinite',
        'pulse-custom': 'pulse-custom 2s infinite',
      },
      keyframes: {
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        'pulse-custom': {
          '0%': { boxShadow: '0 0 0 0 rgba(39, 174, 96, 0.7)' },
          '70%': { boxShadow: '0 0 0 10px rgba(39, 174, 96, 0)' },
          '100%': { boxShadow: '0 0 0 0 rgba(39, 174, 96, 0)' },
        }
      }
    },
  },
  plugins: [],
  important: true,
}
