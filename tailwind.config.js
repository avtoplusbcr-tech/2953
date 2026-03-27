/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: '#F44611',      // RAL 2004 — Чистый оранжевый
        'brand-dark': '#D03A0A', // Темнее для hover/active
        'brand-light': '#F5F2F0',// Светло-серо-бежевый для подложек неактивных кнопок
        bg: '#FFFFFF',         // Белый фон страницы (или очень светлый)
        card: '#FFFFFF',       // Белые карточки
        text: '#1F2937',       // Темно-серый/черный текст
        'text-muted': '#A3A3A3', // Светло-серый текст (МАРТ, ВРЕМЯ)
        border: '#E5E7EB',     // Серые границы (где нужно)
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 8px 30px rgba(0, 0, 0, 0.04)',
      }
    },
  },
  plugins: [],
};
