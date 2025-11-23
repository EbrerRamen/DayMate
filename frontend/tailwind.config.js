/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
            colors: {
                primary: "#1A3D64",
                secondary: "#0C2B4E",
                accent: "#FFC300",
                bg: "#F4F4F4",
                },
                fontFamily: {
                sans: ["Inter", "system-ui"],
                },
    },
  },
  plugins: [],
};
