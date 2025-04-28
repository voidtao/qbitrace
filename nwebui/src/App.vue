<template>
  <div>
    <router-view></router-view>
  </div>
</template>

<script>
export default {
  name: 'App',
  components: {
  },
  data () {
    return {
      theme: 'pastel'
    };
  },
  methods: {
    updateTheme(theme) {
      document.documentElement.setAttribute('data-theme', theme);
      this.theme = theme;
    },
    async checkTheme() {
      try {
        const response = await this.$api().setting.get();
        if (response.data && response.data.theme) {
          this.updateTheme(response.data.theme);
        }
      } catch (error) {
        console.error('获取主题设置失败', error);
      }
    }
  },
  async mounted() {
    // 初始加载时检查主题设置
    await this.checkTheme();
    
    // 监听主题变化的事件
    window.addEventListener('theme-changed', (event) => {
      if (event.detail && event.detail.theme) {
        this.updateTheme(event.detail.theme);
      }
    });
  },
  beforeUnmount() {
    // 移除事件监听器
    window.removeEventListener('theme-changed', this.updateTheme);
  }
};
</script>

<style>
@import './style/theme.css';
@tailwind base;
@tailwind components;
@tailwind utilities;

html, body {
  margin: 0;
  padding: 0;
  height: 100%;
  width: 100%;
}

#app {
  height: 100%;
  width: 100%;
}


@font-face {
  font-family: 'consolas';
  src: url('/assets/fonts/consolas.woff');
}

body {
  font-family: consolas, -apple-system, system-ui, BlinkMacSystemFont, Helvetica, Helvetica Neue, PingFang SC, 'Hiragino Sans GB',
    'Microsoft YaHei', '\u5fae\u8f6f\u96c5\u9ed1', '微软雅黑', Arial, sans-serif;
}

.container-form-mobile {
  border-radius: 0.5rem;
  padding: 0.75rem;
  transition: all 0.5s;
}

.container-form-pc {
  border-radius: 0.5rem;
  padding: 0.75rem;
  transition: all 0.5s;
}

img[lazy=loading] {
  object-fit: cover;
}

*::-webkit-scrollbar-thumb {
  border-radius: 0.5rem;
  background-color: var(--primary);
}

*::-webkit-scrollbar {
  width: 3px;
  height: 3px;
}

*::-webkit-scrollbar-track {
  box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.2);
  background: var(--base-200);
  border-radius: 0.5rem;
}
</style>