import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        navy: {
          50: "#f1f5fb",
          100: "#e2eaf5",
          200: "#c6d5e9",
          300: "#9bb5d6",
          400: "#688cbd",
          500: "#466ca3",
          600: "#355487",
          700: "#2b446d",
          800: "#1d315a",
          900: "#122345",
          950: "#0a1830",
        },
        tech: {
          50: "#eff8ff",
          100: "#daefff",
          200: "#bde4ff",
          300: "#8fd3ff",
          400: "#59b9ff",
          500: "#329cfa",
          600: "#1b7def",
          700: "#1465dc",
          800: "#1752b2",
          900: "#19488c",
          950: "#142d55",
        },
        accent: {
          400: "#ffb648",
          500: "#f59e0b",
          600: "#d97706",
        },
      },
      fontFamily: {
        sans: [
          "var(--font-sans)",
          "Segoe UI",
          "system-ui",
          "-apple-system",
          "sans-serif",
        ],
        display: [
          "var(--font-display)",
          "Segoe UI",
          "system-ui",
          "-apple-system",
          "sans-serif",
        ],
      },
      boxShadow: {
        card: "0 1px 2px rgba(10, 24, 48, 0.04), 0 8px 24px -12px rgba(10, 24, 48, 0.18)",
        lift: "0 18px 45px -18px rgba(18, 35, 69, 0.35)",
      },
      container: {
        center: true,
        padding: { DEFAULT: "1rem", lg: "1.5rem" },
        screens: { "2xl": "1280px" },
      },
    },
  },
  plugins: [],
};

export default config;
