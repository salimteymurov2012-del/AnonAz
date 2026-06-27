import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        background: "#0B0B0B",
        surface: "#111111",
        elevated: "#1A1A1A",
        accent: "#8B5CF6"
      },
      boxShadow: {
        glass: "0 10px 40px rgba(139, 92, 246, 0.18)"
      },
      backgroundImage: {
        radial: "radial-gradient(circle at top, rgba(139,92,246,0.25), transparent 38%)"
      }
    }
  },
  plugins: []
};

export default config;
