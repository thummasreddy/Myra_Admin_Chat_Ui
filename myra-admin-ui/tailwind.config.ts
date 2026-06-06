import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";

const config = {
  darkMode: ["selector", '[data-theme="dark"]'],
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: "#1591DC",
          primaryHover: "#0F75B8",
          primarySoft: "#EAF5FF",
          primaryBorder: "#B4D4FF",
          accent: "#6A5CFF",
          secondary: "#37353E",
          secondaryHover: "#2B2932",
          secondarySoft: "#F3F4F6",
          background: "#080616",
          surface: "#1E1B2E",
          card: "#1E1B2E",
          muted: "#252236",
          sidebar: "#080616",
          text: {
            primary: "#080616",
            secondary: "#4B5563",
            muted: "#8A8F98",
            inverse: "#FFFFFF"
          },
          border: "#343044",
          borderStrong: "#CBD5E1",
          divider: "#E5E7EB",
          success: "#22C55E",
          warning: "#FBBF24",
          error: "#F87171",
          info: "#38BDF8"
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
