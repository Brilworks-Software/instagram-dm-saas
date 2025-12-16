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
        // Dark theme inspired by Linear/Vercel
        background: {
          DEFAULT: "#0a0a0b",
          secondary: "#111113",
          tertiary: "#18181b",
          elevated: "#1f1f23",
        },
        foreground: {
          DEFAULT: "#fafafa",
          muted: "#a1a1aa",
          subtle: "#71717a",
        },
        border: {
          DEFAULT: "#27272a",
          hover: "#3f3f46",
        },
        accent: {
          DEFAULT: "#e11d48", // Rose-600 for Instagram vibe
          hover: "#f43f5e",
          muted: "#fda4af",
        },
        success: {
          DEFAULT: "#10b981",
          muted: "#6ee7b7",
        },
        warning: {
          DEFAULT: "#f59e0b",
          muted: "#fcd34d",
        },
        error: {
          DEFAULT: "#ef4444",
          muted: "#fca5a5",
        },
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "monospace"],
      },
      animation: {
        "fade-in": "fadeIn 0.3s ease-out",
        "slide-in": "slideIn 0.3s ease-out",
        "slide-up": "slideUp 0.4s ease-out",
        "pulse-subtle": "pulseSubtle 2s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideIn: {
          "0%": { opacity: "0", transform: "translateX(-10px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        pulseSubtle: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.7" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
