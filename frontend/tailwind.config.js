/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#FBFBFB",
        surface: "#FFFFFF",
        border: "#E4E4E7",
      },
    },
  },
  plugins: [],
}