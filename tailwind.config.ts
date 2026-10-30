import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#f0fdf4",
          100: "#dcfce7",
          200: "#bbf7d0",
          300: "#86efac",
          400: "#4ade80",
          500: "#22c55e", // Fresh Green
          600: "#16a34a",
          700: "#15803d",
          800: "#166534", // Forest Green primary
          900: "#14532d",
          950: "#052e16",
          DEFAULT: "#166534",
        },
        fresh: {
          DEFAULT: "#22c55e",
          hover: "#16a34a",
          light: "#dcfce7",
        },
        forest: {
          DEFAULT: "#166534",
          dark: "#14532d",
          light: "#15803d",
        },
        background: "#F8FAF7",
        surface: "#FFFFFF",
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px 0 rgba(0, 0, 0, 0.03)",
        cardHover: "0 10px 15px -3px rgba(0, 0, 0, 0.07), 0 4px 6px -2px rgba(0, 0, 0, 0.03)",
        subtle: "0 2px 4px rgba(22, 101, 52, 0.04)",
      },
    },
  },
  plugins: [],
};
export default config;
