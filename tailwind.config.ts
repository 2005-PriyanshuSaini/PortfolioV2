import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: "#0a0a0a",
          soft: "#0f0f0f",
          card: "#121212"
        },
        fg: {
          DEFAULT: "#f5f5f5",
          muted: "#888888"
        },
        accent: {
          DEFAULT: "#6366f1",
          soft: "#818cf8"
        },
        border: "rgba(245,245,245,0.12)"
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(99,102,241,0.35), 0 0 40px rgba(99,102,241,0.12)"
      }
    }
  },
  plugins: []
} satisfies Config;

