import typography from "@tailwindcss/typography";
import containerQueries from "@tailwindcss/container-queries";
import animate from "tailwindcss-animate";

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: ["index.html", "src/**/*.{js,ts,jsx,tsx,html,css}"],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "oklch(var(--border) / <alpha-value>)",
        input: "oklch(var(--input) / <alpha-value>)",
        ring: "oklch(var(--ring) / <alpha-value>)",
        background: "oklch(var(--background) / <alpha-value>)",
        foreground: "oklch(var(--foreground) / <alpha-value>)",
        primary: {
          DEFAULT: "oklch(var(--primary) / <alpha-value>)",
          foreground: "oklch(var(--primary-foreground) / <alpha-value>)",
        },
        secondary: {
          DEFAULT: "oklch(var(--secondary) / <alpha-value>)",
          foreground: "oklch(var(--secondary-foreground) / <alpha-value>)",
        },
        destructive: {
          DEFAULT: "oklch(var(--destructive) / <alpha-value>)",
          foreground: "oklch(var(--destructive-foreground) / <alpha-value>)",
        },
        success: {
          DEFAULT: "oklch(var(--success) / <alpha-value>)",
          foreground: "oklch(var(--success-foreground) / <alpha-value>)",
        },
        warning: {
          DEFAULT: "oklch(var(--warning) / <alpha-value>)",
          foreground: "oklch(var(--warning-foreground) / <alpha-value>)",
        },
        "admin-surface": {
          DEFAULT: "oklch(var(--admin-surface) / <alpha-value>)",
          foreground: "oklch(var(--admin-surface-foreground) / <alpha-value>)",
        },
        "admin-border": "oklch(var(--admin-border) / <alpha-value>)",
        muted: {
          DEFAULT: "oklch(var(--muted) / <alpha-value>)",
          foreground: "oklch(var(--muted-foreground) / <alpha-value>)",
        },
        accent: {
          DEFAULT: "oklch(var(--accent) / <alpha-value>)",
          foreground: "oklch(var(--accent-foreground) / <alpha-value>)",
        },
        popover: {
          DEFAULT: "oklch(var(--popover) / <alpha-value>)",
          foreground: "oklch(var(--popover-foreground) / <alpha-value>)",
        },
        card: {
          DEFAULT: "oklch(var(--card) / <alpha-value>)",
          foreground: "oklch(var(--card-foreground) / <alpha-value>)",
        },
        chart: {
          1: "oklch(var(--chart-1) / <alpha-value>)",
          2: "oklch(var(--chart-2) / <alpha-value>)",
          3: "oklch(var(--chart-3) / <alpha-value>)",
          4: "oklch(var(--chart-4) / <alpha-value>)",
          5: "oklch(var(--chart-5) / <alpha-value>)",
        },
        sidebar: {
          DEFAULT: "oklch(var(--sidebar) / <alpha-value>)",
          foreground: "oklch(var(--sidebar-foreground) / <alpha-value>)",
          primary: "oklch(var(--sidebar-primary) / <alpha-value>)",
          "primary-foreground": "oklch(var(--sidebar-primary-foreground) / <alpha-value>)",
          accent: "oklch(var(--sidebar-accent) / <alpha-value>)",
          "accent-foreground": "oklch(var(--sidebar-accent-foreground) / <alpha-value>)",
          border: "oklch(var(--sidebar-border) / <alpha-value>)",
          ring: "oklch(var(--sidebar-ring) / <alpha-value>)",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "serif"],
        body: ["var(--font-body)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      fontSize: {
        "2xs": ["0.75rem", { lineHeight: "1.5" }],
        xs: ["0.8125rem", { lineHeight: "1.55" }],
        sm: ["0.9375rem", { lineHeight: "1.6" }],
        base: ["1.0625rem", { lineHeight: "1.7" }],
        lg: ["1.1875rem", { lineHeight: "1.65" }],
        xl: ["1.375rem", { lineHeight: "1.5" }],
        "2xl": ["1.625rem", { lineHeight: "1.35" }],
        "3xl": ["2rem", { lineHeight: "1.25" }],
        "4xl": ["2.5rem", { lineHeight: "1.15" }],
        "5xl": ["3.125rem", { lineHeight: "1.08" }],
        "6xl": ["3.75rem", { lineHeight: "1.04" }],
        "7xl": ["4.5rem", { lineHeight: "1.02" }],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      boxShadow: {
        xs: "0 1px 2px 0 oklch(0.247 0 0 / 0.05)",
        subtle: "0 1px 2px 0 oklch(0.247 0 0 / 0.05), 0 1px 3px 0 oklch(0.247 0 0 / 0.04)",
        elevated: "0 4px 6px -1px oklch(0.247 0 0 / 0.07), 0 12px 26px -8px oklch(0.247 0 0 / 0.12)",
        float: "0 14px 36px -10px oklch(0.247 0 0 / 0.16), 0 4px 10px -4px oklch(0.247 0 0 / 0.08)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-in-up": {
          from: { opacity: "0", transform: "translateY(12px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "scale-in": {
          from: { opacity: "0", transform: "scale(0.97)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
        "slide-in-right": {
          from: { opacity: "0", transform: "translateX(16px)" },
          to: { opacity: "1", transform: "translateX(0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in-up": "fade-in-up 0.5s cubic-bezier(0.22, 1, 0.36, 1) both",
        "fade-in": "fade-in 0.4s ease-out both",
        "scale-in": "scale-in 0.35s cubic-bezier(0.22, 1, 0.36, 1) both",
        "slide-in-right": "slide-in-right 0.35s cubic-bezier(0.22, 1, 0.36, 1) both",
        shimmer: "shimmer 2s linear infinite",
      },
    },
  },
  plugins: [
    typography,
    containerQueries,
    animate,
    ({ addUtilities }) => {
      addUtilities({
        "@media (prefers-reduced-motion: reduce)": {
          ".animate-fade-in, .animate-fade-in-up, .animate-scale-in, .animate-slide-in-right":
            {
              animation: "none",
            },
        },
      });
    },
  ],
};
