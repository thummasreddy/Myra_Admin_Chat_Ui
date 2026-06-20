import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";

const config = {
  darkMode: ["selector", '[data-theme="dark"]'],
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: "#001B5A",
          primaryHover: "#234D9A",
          primarySoft: "#F0F4FA",
          primaryBorder: "#234D9A",
          accent: "#C89A4B",
          accentLight: "#D8B06A",
          secondary: "#234D9A",
          secondaryHover: "#001B5A",
          secondarySoft: "#F7F8FA",
          background: "#001B5A",
          surface: "#001B5A",
          card: "#001B5A",
          muted: "#0A2A6B",
          sidebar: "#001B5A",
          text: {
            primary: "#001B5A",
            secondary: "#234D9A",
            muted: "#6B7280",
            inverse: "#FFFFFF"
          },
          border: "#0A2A6B",
          borderStrong: "#CBD5E1",
          divider: "#E5E7EB",
          success: "#22C55E",
          warning: "#D8B06A",
          error: "#F87171",
          info: "#234D9A"
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))"
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))"
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))"
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))"
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))"
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))"
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))"
        }
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)"
      }
    }
  },
  plugins: [animate]
} satisfies Config;

export default config;
