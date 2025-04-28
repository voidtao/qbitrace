import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { fileURLToPath, URL } from 'url';
import { VitePWA } from 'vite-plugin-pwa';
import tailwindcss from '@tailwindcss/vite'
import { execSync } from 'child_process'; // 新增：导入 execSync
import moment from 'moment'; // 新增：导入 moment
import packageJson from '../package.json'; // 修改：修正 package.json 的路径

export default defineConfig({
  plugins: [
    tailwindcss(),
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
        globIgnores: [
          '**/*.map',
          'manifest.*.js',
          'assets/pwaicons/**/*.ico',
          'assets/icons/**/*.ico',
          'api/**',
          'index/**'
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
    port: 4000,
    proxy: {
      '/api/': {
        target: 'http://127.0.0.1:3000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '/api'),
        secure: false
      },
      '/proxy/': {
        target: 'http://127.0.0.1:3000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/proxy/, '/proxy'),
        secure: false
      }
    }
  },
  build: {
    outDir: '../app/static',
    assetsDir: 'assets',
    emptyOutDir: true
  },
  define: {
    'import.meta.env.VERSION': JSON.stringify({
      updateTime: moment(execSync('git log --pretty=format:%at -1').toString().trim() * 1000).utcOffset(8).format('YYYY-MM-DD HH:mm:ss'),
      head: execSync('git rev-parse HEAD').toString().trim().substring(0, 12),
      commitInfo: execSync('git log --pretty=format:%s -1').toString().trim(),
      version: packageJson.version
    })
  }
});