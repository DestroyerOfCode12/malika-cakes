import konstaConfig from 'konsta/config';

// Konsta UI (v3, the Tailwind v3 line) only adds to the theme: a `primary` colour,
// `ios:` / `material:` variants and a few spacing steps. Everything below is the
// existing brand config, unchanged, so the order form and admin keep their styling.
/** @type {import('tailwindcss').Config} */
export default konstaConfig({
  konsta: {
    // Native mobile chrome uses the logo's rose pink instead of Konsta's default iOS blue
    colors: {
      primary: '#DB2777',
    },
  },
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Palette lifted directly from the Malika's Cake Boutique logo:
        // rose pink + pastel blush + charcoal + white. No gold/brown.
        pink: '#DB2777',
        'pink-light': '#FDF2F8',
        blush: '#F7C8D3',
        charcoal: '#3F3F46',
        cream: '#FFF8FA',
      },
      fontFamily: {
        script: ['"Kaushan Script"', 'cursive'],
        sans: ['Poppins', 'Inter', 'sans-serif'],
        display: ['"Playfair Display"', 'Georgia', 'serif'],
      },
      keyframes: {
        wiggle: {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        },
        pop: {
          '0%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.06)' },
          '100%': { transform: 'scale(1)' },
        },
      },
      animation: {
        wiggle: 'wiggle 0.4s ease-in-out',
        pop: 'pop 0.25s ease-in-out',
      },
    },
  },
  plugins: [],
});
