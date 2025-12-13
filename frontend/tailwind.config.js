/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#1E3A8A", // deep blue
        accent: "#F97316", // warm orange
        soft: "#F3F4F6", // gray
      },
    },
  },
  plugins: [],
};
