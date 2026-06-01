import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#050505",
        paper: "#f4f0e8",
        blood: "#d41421",
        bone: "#fffaf0",
      },
      fontFamily: {
        display: ["var(--font-display)", "Arial Black", "Impact", "sans-serif"],
        sans: ["var(--font-sans)", "Inter", "Arial", "sans-serif"],
      },
      boxShadow: {
        luxury: "0 30px 90px rgba(0,0,0,.45)",
        red: "0 22px 80px rgba(212,20,33,.22)",
      },
    },
  },
  plugins: [],
};

export default config;
