/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "rgb(var(--color-background) / <alpha-value>)",
        foreground: "rgb(var(--color-foreground) / <alpha-value>)",
        primary: {
          DEFAULT: "rgb(var(--color-primary) / <alpha-value>)",
          foreground: "rgb(var(--color-primary-foreground) / <alpha-value>)"
        },
        muted: {
          DEFAULT: "rgb(var(--color-muted) / <alpha-value>)",
          foreground: "rgb(var(--color-muted-foreground) / <alpha-value>)"
        },
        accent: {
          DEFAULT: "rgb(var(--color-accent) / <alpha-value>)",
          foreground: "rgb(var(--color-accent-foreground) / <alpha-value>)"
        },
        popover: {
          DEFAULT: "rgb(var(--color-popover) / <alpha-value>)",
          foreground: "rgb(var(--color-popover-foreground) / <alpha-value>)"
        },
        card: {
          DEFAULT: "rgb(var(--color-card) / <alpha-value>)",
          foreground: "rgb(var(--color-card-foreground) / <alpha-value>)"
        },
        destructive: {
          DEFAULT: "rgb(var(--color-destructive) / <alpha-value>)",
          foreground: "rgb(var(--color-destructive-foreground) / <alpha-value>)"
        },
        approve: {
          DEFAULT: "rgb(var(--color-approve) / <alpha-value>)",
          foreground: "rgb(var(--color-approve-foreground) / <alpha-value>)"
        },
        pending: {
          DEFAULT: "rgb(var(--color-pending) / <alpha-value>)",
          foreground: "rgb(var(--color-pending-foreground) / <alpha-value>)"
        },
        info: {
          DEFAULT: "rgb(var(--color-info) / <alpha-value>)",
          foreground: "rgb(var(--color-info-foreground) / <alpha-value>)"
        },
        border: "rgb(var(--color-border) / <alpha-value>)",
        input: "rgb(var(--color-input) / <alpha-value>)",
        ring: "rgb(var(--color-ring) / <alpha-value>)",
        
        secondary: {
          DEFAULT: "rgb(var(--color-secondary) / <alpha-value>)",
          foreground: "rgb(var(--color-secondary-foreground) / <alpha-value>)"
        },
        black: "rgb(var(--color-black) / <alpha-value>)",
        white: "rgb(var(--color-white) / <alpha-value>)",
        gray: {
          50: "rgb(var(--color-gray-50) / <alpha-value>)",
          100: "rgb(var(--color-gray-100) / <alpha-value>)",
          200: "rgb(var(--color-gray-200) / <alpha-value>)",
          300: "rgb(var(--color-gray-300) / <alpha-value>)",
          400: "rgb(var(--color-gray-400) / <alpha-value>)",
          500: "rgb(var(--color-gray-500) / <alpha-value>)",
          600: "rgb(var(--color-gray-600) / <alpha-value>)",
          700: "rgb(var(--color-gray-700) / <alpha-value>)",
          800: "rgb(var(--color-gray-800) / <alpha-value>)",
          900: "rgb(var(--color-gray-900) / <alpha-value>)",
          950: "rgb(var(--color-gray-950) / <alpha-value>)",
        },
        red: {
          50: "rgb(var(--color-red-50) / <alpha-value>)",
          100: "rgb(var(--color-red-100) / <alpha-value>)",
          200: "rgb(var(--color-red-200) / <alpha-value>)",
          400: "rgb(var(--color-red-400) / <alpha-value>)",
          500: "rgb(var(--color-red-500) / <alpha-value>)",
          600: "rgb(var(--color-red-600) / <alpha-value>)",
        },
        green: {
          50: "rgb(var(--color-green-50) / <alpha-value>)",
          100: "rgb(var(--color-green-100) / <alpha-value>)",
          400: "rgb(var(--color-green-400) / <alpha-value>)",
          500: "rgb(var(--color-green-500) / <alpha-value>)",
          600: "rgb(var(--color-green-600) / <alpha-value>)",
          700: "rgb(var(--color-green-700) / <alpha-value>)",
        },
        emerald: {
          400: "rgb(var(--color-emerald-400) / <alpha-value>)",
          500: "rgb(var(--color-emerald-500) / <alpha-value>)",
        },
        blue: {
          100: "rgb(var(--color-blue-100) / <alpha-value>)",
          500: "rgb(var(--color-blue-500) / <alpha-value>)",
          600: "rgb(var(--color-blue-600) / <alpha-value>)",
          700: "rgb(var(--color-blue-700) / <alpha-value>)",
        },
        yellow: {
          100: "rgb(var(--color-yellow-100) / <alpha-value>)",
          400: "rgb(var(--color-yellow-400) / <alpha-value>)",
          500: "rgb(var(--color-yellow-500) / <alpha-value>)",
          700: "rgb(var(--color-yellow-700) / <alpha-value>)",
        },
        purple: {
          100: "rgb(var(--color-purple-100) / <alpha-value>)",
          700: "rgb(var(--color-purple-700) / <alpha-value>)",
          900: "rgb(var(--color-purple-900) / <alpha-value>)",
        },
        indigo: {
          900: "rgb(var(--color-indigo-900) / <alpha-value>)",
        }
      },
      spacing: {
        xs: "var(--space-xs)",
        sm: "var(--space-sm)",
        md: "var(--space-md)",
        lg: "var(--space-lg)",
        xl: "var(--space-xl)"
      },
      fontSize: {
        xs: "var(--font-size-xs)",
        sm: "var(--font-size-sm)",
        base: "var(--font-size-base)",
        lg: "var(--font-size-lg)",
        xl: "var(--font-size-xl)",
        "2xl": "var(--font-size-2xl)"
      }
    }
  },
  plugins: []
};






