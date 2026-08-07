import forms from '@tailwindcss/forms';
import containerQueries from '@tailwindcss/container-queries';

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "on-tertiary-fixed": "#002109",
        "on-secondary-fixed": "#00174b",
        "surface-container": "#eceef0",
        "outline-variant": "#e0c0b1",
        "primary": "#9d4300",
        "tertiary-container": "#00b251",
        "surface-tint": "#9d4300",
        "on-surface-variant": "#584237",
        "inverse-primary": "#ffb690",
        "border-subtle": "#E2E8F0",
        "surface-variant": "#e0e3e5",
        "secondary": "#0051d5",
        "on-tertiary": "#ffffff",
        "inverse-on-surface": "#eff1f3",
        "on-secondary-container": "#fefcff",
        "on-tertiary-container": "#003b16",
        "on-secondary": "#ffffff",
        "on-primary-container": "#582200",
        "surface-dim": "#d8dadc",
        "surface-bright": "#f7f9fb",
        "surface-container-highest": "#e0e3e5",
        "on-primary-fixed-variant": "#783200",
        "error": "#ba1a1a",
        "secondary-container": "#316bf3",
        "surface-container-lowest": "#ffffff",
        "outline": "#8c7164",
        "tertiary-fixed-dim": "#4ae176",
        "on-surface": "#191c1e",
        "secondary-fixed": "#dbe1ff",
        "surface": "#f7f9fb",
        "on-background": "#191c1e",
        "on-secondary-fixed-variant": "#003ea8",
        "on-tertiary-fixed-variant": "#005321",
        "tertiary-fixed": "#6bff8f",
        "error-container": "#ffdad6",
        "tertiary": "#006e2f",
        "primary-container": "#f97316",
        "on-primary-fixed": "#341100",
        "text-body": "#4B5563",
        "background": "#f7f9fb",
        "inverse-surface": "#2d3133",
        "surface-container-high": "#e6e8ea",
        "primary-fixed-dim": "#ffb690",
        "text-heading": "#1F2937",
        "on-primary": "#ffffff",
        "on-error": "#ffffff",
        "on-error-container": "#93000a",
        "surface-container-low": "#f2f4f6",
        "secondary-fixed-dim": "#b4c5ff",
        "primary-fixed": "#ffdbca",
        "text-muted": "#6B7280",
        "surface-card": "#FFFFFF"
      },
      borderRadius: {
        "DEFAULT": "0.25rem",
        "lg": "0.5rem",
        "xl": "0.75rem",
        "2xl": "1rem",
        "full": "9999px"
      },
      spacing: {
        "gutter": "1.5rem",
        "section-gap-desktop": "6rem",
        "container-max": "1280px",
        "section-gap-mobile": "3rem",
        "card-padding": "2rem"
      },
      fontFamily: {
        "label-md": ["Inter", "sans-serif"],
        "headline-xl": ["Plus Jakarta Sans", "sans-serif"],
        "headline-lg": ["Plus Jakarta Sans", "sans-serif"],
        "headline-xl-mobile": ["Plus Jakarta Sans", "sans-serif"],
        "headline-md": ["Plus Jakarta Sans", "sans-serif"],
        "body-md": ["Inter", "sans-serif"],
        "body-lg": ["Inter", "sans-serif"],
        "label-sm": ["Inter", "sans-serif"]
      }
    },
  },
  plugins: [
    forms,
    containerQueries,
  ],
}
