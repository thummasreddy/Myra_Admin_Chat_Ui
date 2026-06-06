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
          secondary: "#37353E",
          secondaryHover: "#2B2932",
          secondarySoft: "#F3F4F6",
          background: "#F8FAFC",
          backgroundDark: "#080616",
          surface: "#FFFFFF",
          card: "#FFFFFF",
          muted: "#EEF4FA",
          sidebar: "#080616",
          text: {
            primary: "#080616",
            secondary: "#4B5563",
            muted: "#8A8F98",
            inverse: "#FFFFFF"
          },
          border: "#DDE3EA",
          borderStrong: "#CBD5E1",
          divider: "#E5E7EB",
          success: "#16A34A",
          warning: "#F59E0B",
          error: "#DC2626",
          info: "#0284C7"
        },
        border: "rgb(var(--color-border-rgb) / <alpha-value>)",
        input: "rgb(var(--color-chat-input-border-rgb, var(--color-border-rgb)) / <alpha-value>)",
        ring: "rgb(var(--color-primary-rgb) / <alpha-value>)",
        background: "rgb(var(--color-bg-main-rgb) / <alpha-value>)",
        foreground: "rgb(var(--color-text-main-rgb) / <alpha-value>)",
        primary: {
          DEFAULT: "rgb(var(--color-primary-rgb) / <alpha-value>)",
          foreground: "var(--color-button-primary-text)"
        },
        secondary: {
          DEFAULT: "rgb(var(--color-primary-rgb) / <alpha-value>)",
          foreground: "var(--color-button-primary-text)"
        },
        destructive: {
          DEFAULT: "rgb(var(--color-error-rgb) / <alpha-value>)",
          foreground: "#FFFFFF"
        },
        muted: {
          DEFAULT: "rgb(var(--color-bg-muted-rgb) / <alpha-value>)",
          foreground: "rgb(var(--color-text-muted-rgb) / <alpha-value>)"
        },
        accent: {
          DEFAULT: "rgb(var(--color-secondary-rgb) / <alpha-value>)",
          foreground: "rgb(var(--color-text-inverse-rgb) / <alpha-value>)"
        },
        popover: {
          DEFAULT: "rgb(var(--color-bg-card-rgb) / <alpha-value>)",
          foreground: "rgb(var(--color-text-main-rgb) / <alpha-value>)"
        },
        card: {
          DEFAULT: "rgb(var(--color-bg-card-rgb) / <alpha-value>)",
          foreground: "rgb(var(--color-text-main-rgb) / <alpha-value>)"
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
