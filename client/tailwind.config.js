/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Palette lifted directly from the Malika's Cake Boutique logo:
        // rose pink + charcoal + white. No gold/brown.
        pink: '#DB2777',
        'pink-light': '#FDF2F8',
        charcoal: '#3F3F46',
        cream: '#FFF8FA',
      },
      fontFamily: {
        script: ['Pacifico', 'cursive'],
        sans: ['Poppins', 'Inter', 'sans-serif'],
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
}
