<template>
  <div class="app-container">
    <!-- PC端布局 -->
    <div class="hidden md:flex">
      <!-- 侧边栏 - 只在非移动设备上显示 -->
      <div class="sidebar-container">
        <div class="h-full flex flex-col">
          <div class="p-4 header-bg">
            <div class="flex items-center cursor-pointer" @click="gotoWiki">
              <img src="/assets/images/logo.svg" class="w-7 h-7" alt="logo"/>
              <span class="text-lg font-bold ml-2 text-header">qbitrace</span>
            </div>
          </div>
          
          <div class="flex-1 overflow-y-auto sidebar-scroll">
            <ul class="menu p-3 text-base-content">
              <template v-for="item of menu">
                <li v-if="!item.hidden && !item.sub" class="my-1">
                  <a 
                    class="rounded-lg transition-colors duration-200 hover:bg-primary hover:bg-opacity-10 text-sm"
                    :class="{ 'bg-primary bg-opacity-20 text-primary font-medium': selectedKeys.includes(item.path) }"
                    @click="goto(item.path)"
                  >
                    <i class="w-6">
                      <fa-icon :icon="item.icon"/>
                    </i>
                    {{ item.title }}
                  </a>
                </li>
                
                <li v-if="!item.hidden && item.sub" class="my-1">
                  <details 
                    :open="openKeys.includes(item.path)"
                    class="rounded-lg"
                  >
                    <summary class="rounded-lg transition-colors duration-200 hover:bg-primary hover:bg-opacity-10 text-sm">
                      <i class="w-6">
                        <fa-icon :icon="item.icon"/>
                      </i>
                      {{ item.title }}
                    </summary>
                    <ul class="menu menu-compact">
                      <li 
                        v-for="subItem of item.sub" 
                        :key="subItem.path"
                        v-if="!subItem.hidden"
                        class="ml-3"
                      >
                        <a 
                          class="rounded-lg transition-colors duration-200 hover:bg-primary hover:bg-opacity-10 text-sm"
                          :class="{ 'bg-primary bg-opacity-20 text-primary font-medium': selectedKeys.includes(subItem.path) }"
                          @click="goto(subItem.path)"
                        >
                          <i class="w-6">
                            <fa-icon :icon="subItem.icon"/>
                          </i>
                          {{ subItem.title }}
                        </a>
                      </li>
                    </ul>
                  </details>
                </li>
              </template>
            </ul>
          </div>
        </div>
      </div>

      <!-- PC端内容区域 -->
      <div class="content-container">
        <router-view></router-view>
      </div>
    </div>

    <!-- 移动端布局 -->
    <div class="drawer block md:hidden w-full h-full">
      <input id="drawer" type="checkbox" class="drawer-toggle" v-model="visible"/>
      <div class="drawer-content flex flex-col">
        <div class="navbar bg-base-100 shadow-sm fixed top-0 left-0 right-0 z-10">
          <div class="flex-none">
            <label for="drawer" class="btn btn-square btn-ghost">
              <fa-icon :icon="['fas', 'bars']"/>
            </label>
          </div>
          <div class="flex-1">
            <div class="flex items-center">
              <img src="/assets/images/logo.svg" class="w-7 h-7" alt="logo"/>
              <span class="text-lg font-bold ml-2">qbitrace</span>
            </div>
          </div>
        </div>
        <div class="pt-16 pb-4 flex-1 overflow-y-auto">
          <router-view></router-view>
        </div>
      </div>
      <div class="drawer-side z-20">
        <label for="drawer" class="drawer-overlay"></label>
        <!-- 美化移动端抽屉菜单，使其风格与PC端保持一致 -->
        <div class="bg-base-100 h-full w-64 overflow-y-auto shadow-lg">
          <!-- 抽屉内的标题区域，与PC端保持一致 -->
          <div class="p-4 header-bg mx-2 mt-2 rounded-lg">
            <div class="flex items-center cursor-pointer" @click="gotoWiki">
              <img src="/assets/images/logo.svg" class="w-7 h-7" alt="logo"/>
              <span class="text-lg font-bold ml-2 text-header">qbitrace</span>
            </div>
          </div>
          
          <!-- 菜单内容 - 使用与PC端相同的样式 -->
          <ul class="menu p-3 text-base-content">
            <template v-for="item of menu">
              <li v-if="!item.hidden && !item.sub" class="my-1">
                <a 
                  class="rounded-lg transition-colors duration-200 hover:bg-primary hover:bg-opacity-10 text-sm"
                  :class="{ 'bg-primary bg-opacity-20 text-primary font-medium': selectedKeys.includes(item.path) }"
                  @click="goto(item.path); visible = false"
                >
                  <i class="w-6">
                    <fa-icon :icon="item.icon"/>
                  </i>
                  {{ item.title }}
                </a>
              </li>
              
              <li v-if="!item.hidden && item.sub" class="my-1">
                <details 
                  :open="openKeys.includes(item.path)"
                  class="rounded-lg"
                >
                  <summary class="rounded-lg transition-colors duration-200 hover:bg-primary hover:bg-opacity-10 text-sm">
                    <i class="w-6">
                      <fa-icon :icon="item.icon"/>
                    </i>
                    {{ item.title }}
                  </summary>
                  <ul class="menu menu-compact">
                    <li 
                      v-for="subItem of item.sub" 
                      :key="subItem.path"
                      v-if="!subItem.hidden"
                      class="ml-3"
                    >
                      <a 
                        class="rounded-lg transition-colors duration-200 hover:bg-primary hover:bg-opacity-10 text-sm"
                        :class="{ 'bg-primary bg-opacity-20 text-primary font-medium': selectedKeys.includes(subItem.path) }"
                        @click="goto(subItem.path); visible = false"
                      >
                        <i class="w-6">
                          <fa-icon :icon="subItem.icon"/>
                        </i>
                        {{ subItem.title }}
                      </a>
                    </li>
                  </ul>
                </details>
              </li>
            </template>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data () {
    return {
      selectedKeys: [],
      openKeys: [],
      visible: false,
      menu: []
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
    async goto (to) {
      this.$goto(to, this.$router);
      setTimeout(() => {
        this.selectedKeys = [this.$route.path];
        const keys = [];
        for (const item of this.menu.filter(item => item.sub)) {
          if (this.$route.path.startsWith(item.path)) {
            keys.push(item.path);
          }
        }
        this.openKeys = keys;
      }, 100);
    },
    async gotoWiki () {
      window.open('https://wiki.vertex-app.top');
    },
    setVh() {
      // 解决移动端100vh问题
      let vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
      
      // Add meta viewport tag dynamically if needed
      let viewport = document.querySelector('meta[name="viewport"]');
      if (!viewport) {
        viewport = document.createElement('meta');
        viewport.name = 'viewport';
        document.head.appendChild(viewport);
      }
      viewport.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
    }
  },
  async mounted () {
    this.selectedKeys = [this.$route.path];
    try {
      const res = await this.$api().user.get();
      this.$message().success('欢迎回来');
      this.menu = res.data.menu;
      const keys = [];
      for (const item of this.menu.filter(item => item.sub)) {
        if (this.$route.path.startsWith(item.path)) {
          keys.push(item.path);
        }
      }
      this.openKeys = keys;
    } catch (e) {
      this.$message().error(e.message);
    }
    
    // 设置vh变量用于移动端
    this.setVh();
    window.addEventListener('resize', this.setVh);
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.setVh);
  }
};
</script>

<style scoped>
.app-container {
  display: flex;
  min-height: 100vh;
  height: 100vh;
  width: 100%;
  background-color: var(--layout-background);
}

.sidebar-container {
  width: 180px;
  height: 100vh;
  background-color: var(--sidebar-background);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  z-index: 10;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.content-container {
  flex: 1;
  margin-left: 180px;
  height: 100vh;
  overflow-y: auto;
  padding: 1.5rem;
}

.sidebar-scroll {
  scrollbar-width: thin;
  overflow-y: auto;
}

.header-bg {
  background-color: rgba(189, 152, 227, 0.4);
  margin: 0.7rem 0.5rem; /* Add margin to create space on both sides */
  border-radius: 0.5rem; /* Add rounded corners */
  margin-bottom: -0.4rem; /* Reduce the gap between the top block and navigation bar */
}

.menu a {
  display: flex;
  align-items: center;
  justify-content: flex-start; /* Keep text and icons left-aligned */
  text-align: left;
  padding-left: 1rem; /* Add padding to center the block within the sidebar */
}

.drawer-side {
  background-color: var(--sidebar-background); /* Match the sidebar background */
  border-radius: 0.5rem; /* Add rounded corners for a more modern look */
  margin: 0.5rem; /* Add spacing around the drawer */
  width: 70%; /* 将宽度调整为屏幕的80% */
  max-width: 320px; /* 设置最大宽度为320px，适合大部分移动设备 */
}

/* 添加移动设备下的内容区样式，覆盖默认样式 */
@media (max-width: 768px) {
  .content-container {
    margin-left: 0;
    width: 100%;
  }
  
  .drawer-content {
    min-height: 100vh;
    height: calc(var(--vh, 1vh) * 100);
  }
  
  .drawer-content > div:nth-child(2) {
    padding: 1.25rem;
    padding-top: calc(4rem + 1.25rem);
  }
}

/* 移动端抽屉菜单中的文本样式，增加字体大小 */
@media (max-width: 768px) {
  .drawer-side .menu a,
  .drawer-side .menu summary {
    font-size: 1.3rem !important; /* 增加字体大小到原来的1.5倍左右 */
    padding: 0.75rem 1rem; /* 增加内边距 */
    width: 100%; /* 确保宽度占满父元素 */
  }
  
  .drawer-side .menu i {
    width: 1.5rem !important; /* 扩大图标宽度 */
    font-size: 1.1rem; /* 增加图标大小 */
    margin-right: 0.75rem; /* 增加图标与文本间距 */
  }
  
  .drawer-side .menu li {
    margin: 0.5rem 0; /* 增加菜单项之间的间距 */
  }
  
  .drawer-side .header-bg {
    padding: 0.75rem 1rem; /* 增加头部区域的内边距 */
  }
  
  .drawer-side .header-bg .text-lg {
    font-size: 1.3rem !important; /* 增加标题文本大小 */
  }
  
  .drawer-side .header-bg img {
    width: 1.75rem !important;
    height: 1.75rem !important;
  }
  
  .content-container {
    margin-left: 0;
    width: 100%;
  }
  
  .drawer-content {
    min-height: 100vh;
    height: calc(var(--vh, 1vh) * 100);
  }
  
  .drawer-content > div:nth-child(2) {
    padding: 1.25rem;
    padding-top: calc(4rem + 1.25rem);
  }
}
</style>