/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          light: "#FFD6A5", // pale orange
          DEFAULT: "#FF914D", // main brand orange
          dark: "#E85C0D", // darker shade
        },
      },
    },
  },
  plugins: [],
}
