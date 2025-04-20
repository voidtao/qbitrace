import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { fileURLToPath, URL } from 'url';

export default defineConfig({
  plugins: [vue()],
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