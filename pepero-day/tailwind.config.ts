import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        baby: "#DCEEFF",
        navy: { DEFAULT: "#243C5A", soft: "#3A5577" },
        powder: "#A9C9E8",
        cream: "#F5EBDD",
        blush: "#E8C8D6",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        serif: ["var(--font-serif)", "Georgia", "serif"],
      },
      boxShadow: {
        soft: "0 20px 60px -20px rgba(36, 60, 90, 0.25)",
        card: "0 10px 40px -12px rgba(36, 60, 90, 0.18)",
      },
    },
  },
  plugins: [],
};

export default config;
