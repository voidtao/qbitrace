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
      },
      backgroundColor: {
        layout: '#ffffff',
        header: '#c084fc',
        sidebar: '#f3e8ff',
      },
      textColor: {
        header: '#ffffff',
      },
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
        "neutral": "#f3f4f6", // 浅灰
        "neutral-focus": "#e5e7eb", // 深灰
        "neutral-content": "#1f2937",
        "base-100": "#ffffff", // 白色背景
        "base-200": "#f9fafb", // 浅灰背景
        "base-300": "#f3f4f6", // 更深的浅灰
        "base-content": "#4b5563",
        "info": "#93c5fd", // 浅蓝
        "success": "#86efac", // 浅绿
        "warning": "#fde047", // 浅黄
        "error": "#fca5a5" // 浅红
      }
    }],
    styled: true,
    base: true,
    utils: true,
    logs: true,
    rtl: false,
  },
}