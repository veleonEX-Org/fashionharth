// Design system tokens for the app.
// Keep this file as the single source of truth for colors, spacing, and typography.

export const colors = {
  background: "#ffffff",
  foreground: "#0a0a0a",
  primary: "#a87b50",
  primaryForeground: "#ffffff",
  muted: "#f4f4f5",
  border: "#e4e4e7"
} as const;

export const spacing = {
  xs: "0.25rem",
  sm: "0.5rem",
  md: "1rem",
  lg: "1.5rem",
  xl: "2rem"
} as const;

export const fontSizes = {
  xs: "0.75rem",
  sm: "0.875rem",
  base: "1rem",
  lg: "1.125rem",
  xl: "1.25rem",
  "2xl": "1.5rem"
} as const;

export const theme = {
  colors,
  spacing,
  fontSizes
};






