/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // ─── Nord Official Palette ───
        nord0: '#2e3440',       // Polar Night – deepest bg
        nord1: '#3b4252',       // Polar Night – card/surface
        nord2: '#434c5e',       // Polar Night – elevated surface
        nord3: '#4c566a',       // Polar Night – muted UI
        nord4: '#d8dee9',       // Snow Storm – body text
        nord5: '#e5e9f0',       // Snow Storm – subtle highlight
        nord6: '#eceff4',       // Snow Storm – bright text
        nord7: '#8fbcbb',       // Frost – teal
        nord8: '#88c0d0',       // Frost – cyan accent
        nord9: '#81a1c1',       // Frost – blue
        nord10: '#5e81ac',      // Frost – deep blue
        nord11: '#bf616a',      // Aurora – red
        nord12: '#d08770',      // Aurora – orange
        nord13: '#ebcb8b',      // Aurora – yellow/gold
        nord14: '#a3be8c',      // Aurora – green
        nord15: '#b48ead',      // Aurora – purple

        // ─── Semantic Tokens (Nord-mapped) ───
        accent: '#88c0d0',      // nord8 – primary accent
        primary: '#eceff4',     // nord6 – bright text
        secondary: '#d8dee9',   // nord4 – body text
        muted: '#4c566a',       // nord3 – dimmed text / UI
        separator: '#4c566a',   // nord3 – separators, slashes

        // Match results
        win: '#a3be8c',         // nord14 – green
        loss: '#bf616a',        // nord11 – red
        kda: '#88c0d0',         // nord8 – KDA highlight
        'game-gold': '#ebcb8b', // nord13 – gold values

        // Surfaces
        page: '#2e3440',        // nord0 – page background
        card: {
          DEFAULT: '#3b4252',   // nord1 – card background
          hover: '#434c5e',     // nord2 – card hover
          selected: '#434c5e',  // nord2 – selected card
        },
        section: '#3b4252',     // nord1 – section background
        overlay: '#434c5e',     // nord2 – overlay panels
        bar: '#434c5e',         // nord2 – progress bar tracks
        item: {
          DEFAULT: '#2e3440',   // nord0 – item slot background
          empty: '#3b4252',     // nord1 – empty item slot
        },

        // Borders
        'icon-border': '#4c566a',  // nord3 – icon borders
        'icon-bg': '#2e3440',      // nord0 – icon backgrounds
        border: {
          default: 'rgba(76, 86, 106, 0.3)',  // nord3/30
          strong: 'rgba(136, 192, 208, 0.3)',  // nord8/30
        },
        divider: 'rgba(76, 86, 106, 0.2)',     // nord3/20
      },
      screens: {
        'xs': '480px',
      },
      animation: {
        'pulse-dot': 'pulse-dot 2s ease-in-out infinite',
        'slide-down': 'slide-down 0.3s ease-out',
        'slide-in-left': 'slide-in-left 0.4s ease-out',
        'slide-in-right': 'slide-in-right 0.4s ease-out',
        'vs-reveal': 'vs-reveal 0.5s ease-out 0.2s both',
        'fade-in': 'fadeIn 0.4s ease-out forwards',
        'fade-slide-up': 'fade-slide-up 0.4s ease-out forwards',
      },
      keyframes: {
        'pulse-dot': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.3' },
        },
        'slide-down': {
          from: { opacity: '0', transform: 'translateY(-8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in-left': {
          from: { opacity: '0', transform: 'translateX(-12px)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
        'slide-in-right': {
          from: { opacity: '0', transform: 'translateX(12px)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
        'vs-reveal': {
          from: { opacity: '0', transform: 'scale(0.8)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
        fadeIn: {
          from: { opacity: '0', transform: 'translateY(4px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-slide-up': {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
