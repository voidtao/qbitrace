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
          DEFAULT: '#c084fc', // 浅紫
          focus: '#a855f7', // 深紫
          content: '#ffffff'
        },
        secondary: {
          DEFAULT: '#93c5fd', // 浅蓝
          focus: '#60a5fa', // 深蓝
          content: '#ffffff'
        },
        accent: {
          DEFAULT: '#f9a8d4', // 浅粉
          focus: '#f472b6', // 深粉
          content: '#ffffff'
        }
      }
    },
  },
  plugins: [require("daisyui")],
  daisyui: {
    themes: [{
      light: {
        "primary": "#c084fc", // 浅紫
        "primary-focus": "#a855f7", // 深紫
        "primary-content": "#ffffff",
        "secondary": "#93c5fd", // 浅蓝
        "secondary-focus": "#60a5fa", // 深蓝
        "secondary-content": "#ffffff",
        "accent": "#f9a8d4", // 浅粉
        "accent-focus": "#f472b6", // 深粉
        "accent-content": "#ffffff",
        "neutral": "#e5e7eb", // 浅灰
        "neutral-focus": "#d1d5db", // 深灰
        "neutral-content": "#1f2937",
        "base-100": "#fdf4ff", // 浅紫背景
        "base-200": "#f3e8ff", // 更深的浅紫
        "base-300": "#e9d5ff", // 深浅紫
        "base-content": "#4b5563",
        "info": "#93c5fd", // 浅蓝
        "success": "#86efac", // 浅绿
        "warning": "#fde047", // 浅黄
        "error": "#fca5a5" // 浅红
      },
      dark: {
        "primary": "#c084fc", // 浅紫
        "primary-focus": "#a855f7", // 深紫
        "primary-content": "#ffffff",
        "secondary": "#93c5fd", // 浅蓝
        "secondary-focus": "#60a5fa", // 深蓝
        "secondary-content": "#ffffff",
        "accent": "#f9a8d4", // 浅粉
        "accent-focus": "#f472b6", // 深粉
        "accent-content": "#ffffff",
        "neutral": "#1f2937", // 深灰
        "neutral-focus": "#111827", // 更深的灰
        "neutral-content": "#f3f4f6",
        "base-100": "#1e293b", // 深蓝背景
        "base-200": "#1c1f2e", // 更深的深蓝
        "base-300": "#131a2b", // 深蓝
        "base-content": "#e5e7eb",
        "info": "#93c5fd", // 浅蓝
        "success": "#86efac", // 浅绿
        "warning": "#fde047", // 浅黄
        "error": "#fca5a5" // 浅红
      }
    }],
  },
}