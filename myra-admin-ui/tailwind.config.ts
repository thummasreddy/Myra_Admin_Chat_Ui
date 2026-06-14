import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";

const config = {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        myra: {
          primary: "#2563EB",
          primaryHover: "#1D4ED8",
          primarySoft: "#EFF6FF",
          primaryBorder: "#93C5FD",
          accent: "#7C3AED",
          secondary: "#1E1B2E",
          secondaryHover: "#16132A",
          secondarySoft: "#F8FAFC",
          background: "#0A0118",
          surface: "#140F26",
          card: "#1A1530",
          muted: "#1E1840",
          sidebar: "#0A0118",
          text: {
            primary: "#F8FAFC",
            secondary: "#A1A1AA",
            muted: "#6B7280",
            inverse: "#0A0118"
          },
          border: "#2D2654",
          borderStrong: "#4338CA",
          divider: "#1E1840",
          success: "#10B981",
          warning: "#F59E0B",
          error: "#EF4444",
          info: "#3B82F6"
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
