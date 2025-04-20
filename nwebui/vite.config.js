import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { fileURLToPath, URL } from 'url';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    vue(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'qbitrace',
        short_name: 'qbitrace',
        description: 'qbitrace',
        theme_color: '#4b5cc4',
        icons: [
          {
            src: '/assets/pwaicons/ios/512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: '/assets/pwaicons/ios/256.png',
            sizes: '256x256',
            type: 'image/png'
          },
          {
            src: '/assets/pwaicons/ios/128.png',
            sizes: '128x128',
            type: 'image/png'
          },
          {
            src: '/assets/pwaicons/ios/64.png',
            sizes: '64x64',
            type: 'image/png'
          },
          {
            src: '/assets/pwaicons/ios/32.png',
            sizes: '32x32',
            type: 'image/png'
          },
          {
            src: '/assets/pwaicons/ios/16.png',
            sizes: '16x16',
            type: 'image/png'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        exclude: [
          /\.map$/,
          /^manifest.*\.js(?:on)?$/,
          /^assets\/pwaicons\/.*ico$/,
          /^assets\/icons\/.*.ico/,
          /^api/,
          /^index/
        ]
      }
    })
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    port: 4000, // 保持端口不变
    proxy: {
      '/api/': {
        target: 'http://127.0.0.1:3000', // 与原 vue.config.js 保持一致
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '/api'),
        secure: false
      },
      '/proxy/': {
        target: 'http://127.0.0.1:3000', // 与原 vue.config.js 保持一致
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/proxy/, '/proxy'),
        secure: false
      }
    }
  },
  build: {
    outDir: '../app/static', // 输出目录与原 vue.config.js 保持一致
    assetsDir: 'assets', // 静态资源目录
    emptyOutDir: true // 构建时清空目标目录
  },
  define: {
    'process.env': {
      version: JSON.stringify({
        updateTime: new Date().toISOString(), // 替代 moment.js 的时间戳
        head: 'HEAD', // 可替换为动态获取的 Git 提交信息
        commitInfo: 'Initial Commit', // 可替换为动态获取的 Git 提交信息
        version: '1.0.0' // 可替换为 package.json 中的版本号
      })
    }
  }
});