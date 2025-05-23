import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: "#f97316", // Orange
        secondary: "#f3f4f6", // Light gray
        textColor: "#111827", // Soft black
        success: "#10b981", // Green
        error: "#ef4444", // Red
      },
    },
  },
  plugins: [],
} satisfies Config;
