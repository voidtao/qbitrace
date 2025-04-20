<template>
  <div class="drawer lg:drawer-open">
    <input id="my-drawer" type="checkbox" class="drawer-toggle" v-model="visible" />
    
    <div class="drawer-content flex flex-col">
      <div class="w-full navbar bg-base-100 lg:hidden">
        <div class="flex-none">
          <label for="my-drawer" class="btn btn-square btn-ghost">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="inline-block w-5 h-5 stroke-current">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
            </svg>
          </label>
        </div>
        <div class="flex-1">
          <div class="flex items-center justify-center">
            <div class="w-6 h-6 mr-2">
              <img src="/assets/images/logo.svg" alt="logo" class="w-full h-full" />
            </div>
            <span class="text-xl font-bold">qbitrace</span>
          </div>
        </div>
      </div>
      
      <div class="p-4">
        <router-view></router-view>
      </div>
    </div>
    
    <div class="drawer-side">
      <label for="my-drawer" class="drawer-overlay"></label>
      <ul class="menu p-4 w-80 h-full bg-base-200 text-base-content">
        <li v-for="menu in menus" :key="menu.key">
          <router-link :to="menu.key" :class="{'active': $route.path === menu.key}">
            <font-awesome-icon :icon="menu.icon" />
            {{ menu.text }}
          </router-link>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
export default {
  data () {
    return {
      menus: [
        {
          key: '/',
          text: '仪表盘',
          icon: ['fas', 'chart-line']
        },
        {
          key: '/task/rss',
          text: 'RSS任务',
          icon: ['fas', 'rss']
        },
        {
          key: '/task/script',
          text: '定时脚本',
          icon: ['fas', 'clock']
        },
        {
          key: '/setting/style',
          text: '主题设置',
          icon: ['fas', 'palette']
        },
        {
          key: '/setting/base',
          text: '基础设置',
          icon: ['fas', 'cog']
        },
        {
          key: '/setting/security',
          text: '安全设置',
          icon: ['fas', 'shield-alt']
        },
        {
          key: '/setting/backup',
          text: '备份还原',
          icon: ['fas', 'archive']
        },
        {
          key: '/info/info',
          text: '相关信息',
          icon: ['fas', 'info-circle']
        },
        {
          key: '/info/log',
          text: '日志',
          icon: ['fas', 'clipboard-list']
        }
      ],
      visible: false
    };
  },
  methods: {
    isMobile () {
      if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
        return true;
      } else {
        return false;
      }
    },
    async getUserInfo () {
      try {
        await this.$api().user.info();
      } catch (e) {
        if (e.message === '需要登录') {
          this.$router.push('/user/login');
        }
      }
    }
  },
  async mounted () {
    await this.getUserInfo();
  }
};
</script>

<style scoped>
.menu .active {
  @apply bg-primary text-primary-content;
}
</style>