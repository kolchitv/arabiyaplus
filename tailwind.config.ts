import type { Config } from "tailwindcss";

// Design tokens for ArabiaEasy — derived from the book-builder brief.
// Ink Indigo = editor chrome, Canvas Cream = the page/paper surface,
// Amber Signal = interactive/hotspot accents, Palm Teal = success/navigation.
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "#1E2A45",
          light: "#2C3B5E",
          dark: "#131B2E"
        },
        canvas: {
          DEFAULT: "#FAF6EE",
          dark: "#EFE8D8"
        },
        amber: {
          DEFAULT: "#E7A33D",
          light: "#F3C077",
          dark: "#C6832199"
        },
        palm: {
          DEFAULT: "#2F7B6F",
          light: "#3F9E8F",
          dark: "#215A52"
        },
        ash: {
          DEFAULT: "#6B7280",
          light: "#9CA3AF"
        }
      },
      fontFamily: {
        display: ["Cairo", "sans-serif"],
        body: ["Tajawal", "sans-serif"],
        ui: ["'IBM Plex Sans Arabic'", "sans-serif"],
        classic: ["Amiri", "serif"]
      },
      borderRadius: {
        xl2: "1.25rem"
      },
      boxShadow: {
        soft: "0 8px 30px -8px rgba(30, 42, 69, 0.25)",
        seal: "0 0 0 4px rgba(231, 163, 61, 0.25)"
      },
      keyframes: {
        "seal-pulse": {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(231, 163, 61, 0.55)" },
          "50%": { boxShadow: "0 0 0 8px rgba(231, 163, 61, 0)" }
        },
        "page-turn": {
          "0%": { transform: "rotateY(0deg)" },
          "100%": { transform: "rotateY(-8deg)" }
        }
      },
      animation: {
        "seal-pulse": "seal-pulse 2.2s ease-in-out infinite",
        "page-turn": "page-turn 0.35s ease-out forwards"
      }
    }
  },
  plugins: []
} satisfies Config;
