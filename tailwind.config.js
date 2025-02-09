/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          dark: "#0f172a",
          light: "#1e293b",
        },
      },
      animation: {
        fadeIn: "fadeIn 0.5s ease-out",
        successPop: "successPop 0.5s ease-out forwards",
        successIcon: "successIcon 0.5s ease-out forwards",
        float: "float 3s ease-in-out infinite",
        pulse: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        successPop: {
          "0%": { transform: "scale(0.9)", opacity: "0" },
          "70%": { transform: "scale(1.1)" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        successIcon: {
          "0%": { transform: "scale(0) rotate(-180deg)" },
          "70%": { transform: "scale(1.2) rotate(10deg)" },
          "100%": { transform: "scale(1) rotate(0)" },
        },
        float: {
          "0%": { transform: "translateY(0px) rotate(0deg)" },
          "50%": { transform: "translateY(-20px) rotate(180deg)" },
          "100%": { transform: "translateY(0px) rotate(360deg)" },
        },
      },
    },
  },
  plugins: [],
};
