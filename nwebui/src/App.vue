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
      theme: 'pastel',
      background: ''
    };
  },
  methods: {
    updateTheme(theme) {
      document.documentElement.setAttribute('data-theme', theme);
      this.theme = theme;
    },
    updateBackground(backgroundUrl) {
      if (backgroundUrl && backgroundUrl.trim() !== '') {
        document.body.classList.add('has-bg-image');
        document.documentElement.style.setProperty('--bg-image', `url('${backgroundUrl}')`);
        this.background = backgroundUrl;
      } else {
        document.body.classList.remove('has-bg-image');
        document.documentElement.style.removeProperty('--bg-image');
        this.background = '';
      }
    },
    async checkSettings() {
      try {
        const response = await this.$api().setting.get();
        if (response.data) {
          // 更新主题
          if (response.data.theme) {
            this.updateTheme(response.data.theme);
          }
          
          // 更新背景图片
          if (response.data.background) {
            this.updateBackground(response.data.background);
          }
        }
      } catch (error) {
        console.error('获取设置失败', error);
      }
    }
  },
  async mounted() {
    // 初始加载时检查主题和背景设置
    await this.checkSettings();
    
    // 监听主题变化的事件
    window.addEventListener('theme-changed', (event) => {
      if (event.detail && event.detail.theme) {
        this.updateTheme(event.detail.theme);
      }
    });
    
    // 监听背景变化的事件
    window.addEventListener('background-changed', (event) => {
      if (event.detail) {
        this.updateBackground(event.detail.background);
      }
    });
  },
  beforeUnmount() {
    // 移除事件监听器
    window.removeEventListener('theme-changed', this.updateTheme);
    window.removeEventListener('background-changed', this.updateBackground);
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