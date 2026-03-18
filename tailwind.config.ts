import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        solo: {
          bg: "#0a0a0f",
          surface: "#12121a",
          border: "#1e1e2e",
          accent: "#6366f1",
          "accent-light": "#818cf8",
          success: "#22c55e",
          warning: "#f59e0b",
          error: "#ef4444",
          text: "#e2e8f0",
          "text-dim": "#64748b",
          "text-muted": "#475569",
          terminal: "#0d1117",
          "terminal-green": "#39d353",
          "terminal-yellow": "#e3b341",
          "terminal-red": "#f85149",
          "terminal-blue": "#58a6ff",
          "terminal-cyan": "#56d4dd",
        },
      },
      fontFamily: {
        mono: ["JetBrains Mono", "Fira Code", "monospace"],
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "typing": "typing 1.5s steps(3) infinite",
        "fade-in": "fadeIn 0.3s ease-in-out",
        "slide-up": "slideUp 0.3s ease-out",
        "glow": "glow 2s ease-in-out infinite alternate",
      },
      keyframes: {
        typing: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        glow: {
          "0%": { boxShadow: "0 0 5px rgba(99, 102, 241, 0.2)" },
          "100%": { boxShadow: "0 0 20px rgba(99, 102, 241, 0.4)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
