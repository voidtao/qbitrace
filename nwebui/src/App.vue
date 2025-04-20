<template>
  <div :data-theme="theme">
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
      theme: 'light'
    };
  },
  methods: {
    async getTheme () {
      try {
        const setting = (await this.$api().setting.get()).data;
        if (setting.theme === 'follow') {
          if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            this.theme = 'dark';
          } else {
            this.theme = 'light';
          }
        } else {
          this.theme = setting.theme;
        }
      } catch (e) {
        this.theme = 'light';
      }
    }
  },
  async mounted () {
    await this.getTheme();
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', this.getTheme);
  },
  beforeUnmount () {
    window.matchMedia('(prefers-color-scheme: dark)').removeEventListener('change', this.getTheme);
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
  src: url('../public/assets/fonts/consolas.woff');
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