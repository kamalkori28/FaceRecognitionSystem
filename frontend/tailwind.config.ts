import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: "hsl(var(--card))",
        cardForeground: "hsl(var(--card-foreground))",
        muted: "hsl(var(--muted))",
        mutedForeground: "hsl(var(--muted-foreground))",
        primary: "hsl(var(--primary))",
        primaryForeground: "hsl(var(--primary-foreground))",
        secondary: "hsl(var(--secondary))",
        secondaryForeground: "hsl(var(--secondary-foreground))",
        border: "hsl(var(--border))",
        accent: "hsl(var(--accent))",
        accentForeground: "hsl(var(--accent-foreground))",
        success: "hsl(var(--success))",
        danger: "hsl(var(--danger))",
      },
      backgroundImage: {
        aurora:
          "radial-gradient(circle at 15% 20%, rgba(31, 110, 245, 0.28), transparent 30%), radial-gradient(circle at 85% 15%, rgba(0, 208, 132, 0.2), transparent 30%), radial-gradient(circle at 50% 80%, rgba(244, 151, 48, 0.22), transparent 28%)",
      },
      boxShadow: {
        glass: "0 24px 60px rgba(15, 23, 42, 0.14)",
      },
      fontFamily: {
        sans: ["DM Sans", "sans-serif"],
        display: ["Space Grotesk", "sans-serif"],
      },
      keyframes: {
        shimmer: {
          "0%": { backgroundPosition: "200% 0" },
          "100%": { backgroundPosition: "-200% 0" },
        },
      },
      animation: {
        shimmer: "shimmer 2.2s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
