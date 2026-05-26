import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/data/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        night: "#0a0a0a",
        paper: "#fbfbf8",
        surface: "#ffffff",
        panel: "#f1efe5",
        elevated: "#e8e5d8",
        ink: "#0a0a0a",
        soft: "#1a1a1a",
        muted: "#6a6a6a",
        line: "#0a0a0a",
        ocean: "#1a3a3a",
        mint: "#a4d4c5",
        amberline: "#e8b94a",
        pink: "#ff4d8b",
        lavender: "#b8a4ed",
        peach: "#ffb084",
        coral: "#ff6b5a"
      },
      boxShadow: {
        data: "0 18px 50px rgba(26, 58, 58, 0.12)"
      }
    }
  },
  plugins: []
};

export default config;
