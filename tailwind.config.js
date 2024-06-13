module.exports = {
  mode: 'jit',
  content: ['./src/**/*.{js,ts,jsx,tsx}', './pages/**/*.{js,ts,jsx,tsx}'],
  darkMode: false,
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#323a45',
          light: '#4f5261',
          lighter: '#696c7d',
          dark: '#22252e',
          darker: '#202126',
          bg: '#1e1e1e',
          border: '#373a40',
        },
        white: '#efefef',
        gray: '#cccccc',
        error: '#990100',
        desc: '#ffd864',
        yellow: '#f1c232',
        red: '#df6665',
        purple: '#b19fe6',
        blue: '#6fa8dd',
        heal: '#84cf7c',
        hsr: {
          physical: '#b0b0b0',
          wind: '#59cf97',
          lightning: '#d376f0',
          imaginary: '#ffd438',
          fire: '#ff5347',
          ice: '#4dc9ff',
          quantum: '#6563ff',
        },
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
}
