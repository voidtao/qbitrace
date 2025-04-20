/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#4b5cc4',
          focus: '#3a4bb3',
          content: '#ffffff'
        },
        secondary: {
          DEFAULT: '#9c27b0',
          focus: '#8b16a0',
          content: '#ffffff'
        },
        accent: {
          DEFAULT: '#ff69b4',
          focus: '#ee58a3',
          content: '#ffffff'
        }
      }
    },
  },
  plugins: [require("daisyui")],
  daisyui: {
    themes: [{
      light: {
        "primary": "#4b5cc4",
        "primary-focus": "#3a4bb3",
        "primary-content": "#ffffff",
        "secondary": "#9c27b0",
        "secondary-focus": "#8b16a0",
        "secondary-content": "#ffffff",
        "accent": "#ff69b4",
        "accent-focus": "#ee58a3",
        "accent-content": "#ffffff",
        "neutral": "#2a2e37",
        "neutral-focus": "#16181d",
        "neutral-content": "#ffffff",
        "base-100": "#ffffff",
        "base-200": "#f9fafb",
        "base-300": "#f3f4f6",
        "base-content": "#1f2937",
        "info": "#3abff8",
        "success": "#36d399",
        "warning": "#fbbd23",
        "error": "#f87272"
      },
      dark: {
        "primary": "#4b5cc4",
        "primary-focus": "#3a4bb3",
        "primary-content": "#ffffff",
        "secondary": "#9c27b0",
        "secondary-focus": "#8b16a0",
        "secondary-content": "#ffffff",
        "accent": "#ff69b4",
        "accent-focus": "#ee58a3",
        "accent-content": "#ffffff",
        "neutral": "#2a2e37",
        "neutral-focus": "#16181d",
        "neutral-content": "#ffffff",
        "base-100": "#1f2937",
        "base-200": "#111827",
        "base-300": "#0f172a",
        "base-content": "#f3f4f6",
        "info": "#3abff8",
        "success": "#36d399",
        "warning": "#fbbd23",
        "error": "#f87272"
      }
    }],
  },
}
