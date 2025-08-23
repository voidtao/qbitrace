<template>
  <div class="min-h-screen bg-base-200">
    <!-- Desktop Layout -->
    <div class="drawer lg:drawer-open">
      <input id="drawer" type="checkbox" class="drawer-toggle" v-model="visible"/>
      
      <!-- Main Content -->
      <div class="drawer-content flex flex-col">
        <!-- Mobile Header -->
        <div class="navbar bg-base-100 shadow-sm lg:hidden">
          <div class="flex-none">
            <label for="drawer" class="btn btn-square btn-ghost">
              <fa-icon :icon="['fas', 'bars']"/>
            </label>
          </div>
          <div class="flex-1">
            <div class="flex items-center cursor-pointer" @click="gotoWiki">
              <img src="/assets/images/logo.svg" class="w-7 h-7 lg:w-6 lg:h-6 mr-4 lg:mr-4 flex-shrink-0" alt="logo"/>
              <span class="text-lg font-bold ml-2">qbitrace</span>
            </div>
          </div>
        </div>
        
        <!-- Page Content -->
        <main class="flex-1 p-6 lg:p-8">
          <router-view :key="$route.fullPath"></router-view>
        </main>
      </div>
      
      <!-- Sidebar -->
      <div class="drawer-side">
        <label for="drawer" class="drawer-overlay lg:hidden"></label>
        <aside class="h-screen w-60 lg:w-50 bg-base-100 shadow-lg overflow-y-auto">
          <!-- Enlarged Logo Header -->
          <div class="m-2 lg:m-2 rounded-xl">
            <div 
              class="flex items-center cursor-pointer rounded-lg pl-6 pr-3 py-4 lg:pl-6 lg:pr-4 lg:py-4 bg-gradient-to-r from-primary/20 to-secondary/20 transition-all duration-200"
              @click="gotoWiki"
            >
              <img src="/assets/images/logo.svg" class="w-7 h-7 mr-4 flex-shrink-0" alt="logo"/>
              <span class="text-xl font-bold">qbitrace</span>
            </div>
          </div>
          
          <!-- Navigation Menu -->
          <nav class="px-2 lg:px-2 pb-2">
            <template v-for="item in menu" :key="item.path">
              <!-- Single Menu Item -->
              <div v-if="!item.hidden && !item.sub" class="mb-1 lg:mb-1">
                <button 
                  @click="goto(item.path)"
                  :class="[
                    'w-full flex items-center pl-6 pr-3 py-3 lg:pl-6 lg:pr-4 lg:py-2 rounded-lg transition-all duration-200 text-left',
                    selectedKeys.includes(item.path) 
                      ? 'bg-primary text-primary-content shadow-md' 
                      : 'hover:bg-base-200 text-base-content'
                  ]"
                >
                  <fa-icon :icon="item.icon" class="w-5 h-5 lg:w-4 lg:h-4 mr-6 lg:mr-6 flex-shrink-0"/>
                  <span class="font-medium">{{ item.title }}</span>
                </button>
              </div>
              
              <!-- Menu Group -->
              <div v-else-if="!item.hidden && item.sub" class="mb-1">
                <div class="collapse collapse-plus">
                  <input 
                    type="checkbox" 
                    :checked="openKeys.includes(item.path)"
                    @change="toggleGroup(item.path)"
                  />
                  <div class="collapse-title flex items-center px-4 py-3 lg:px-4 lg:py-2 hover:bg-base-200 rounded-lg transition-all duration-200 min-h-0">
                    <fa-icon :icon="item.icon" class="w-5 h-5 lg:w-4 lg:h-4 mr-6 lg:mr-6"/>
                    <span class="font-medium lg:text-sm">{{ item.title }}</span>
                  </div>
                  <div class="collapse-content px-0">
                    <div class="ml-4 mt-1 space-y-1">
                      <button
                        v-for="subItem in item.sub"
                        :key="subItem.path"
                        v-show="!subItem.hidden"
                        @click="goto(subItem.path)"
                        :class="[
                          'w-full flex items-center px-4 py-2 lg:px-2 lg:py-1 rounded-lg transition-all duration-200 text-left text-sm lg:text-xs',
                          selectedKeys.includes(subItem.path)
                            ? 'bg-primary text-primary-content shadow-sm'
                            : 'hover:bg-base-200 text-base-content/80'
                        ]"
                      >
                        <fa-icon :icon="subItem.icon" class="w-4 h-4 lg:w-3 lg:h-3 mr-5 lg:mr-5 ml-6 lg:ml-6"/>
                        <span>{{ subItem.title }}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </template>
          </nav>
        </aside>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      selectedKeys: [],
      openKeys: [],
      visible: false,
      menu: []
    };
  },
  methods: {
    isMobile() {
      return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    },
    
    async goto(to) {
      this.$goto(to, this.$router);
      this.visible = false;
      this.selectedKeys = [to];
      this.openKeys = this.menu
        .filter(item => item.sub && to.startsWith(item.path))
        .map(item => item.path);
    },
    
    async gotoWiki() {
      window.open('https://wiki.vertex-app.top');
    },
    
    toggleGroup(path) {
      const index = this.openKeys.indexOf(path);
      if (index > -1) {
        this.openKeys.splice(index, 1);
      } else {
        this.openKeys.push(path);
      }
    },
    
    updateActiveStates() {
      // Update selected keys
      this.selectedKeys = [this.$route.path];
      
      // Update open keys based on current route
      this.openKeys = this.menu
        .filter(item => item.sub && this.$route.path.startsWith(item.path))
        .map(item => item.path);
    },
    
    setViewportHeight() {
      // Fix 100vh issue on mobile devices
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    }
  },
  
  watch: {
    '$route'(to, from) {
      // Update active states when route changes
      this.updateActiveStates();
    }
  },
  
  async mounted() {
    // Initialize active states
    this.updateActiveStates();
    
    try {
      const res = await this.$api().user.get();
      this.$message().success('欢迎回来');
      this.menu = res.data.menu;
      
      // Update active states after menu is loaded
      this.updateActiveStates();
    } catch (e) {
      this.$message().error(e.message);
    }
    
    // Set viewport height for mobile
    this.setViewportHeight();
    window.addEventListener('resize', this.setViewportHeight);
  },
  
  beforeUnmount() {
    window.removeEventListener('resize', this.setViewportHeight);
  }
};
</script>

<style scoped>
/* Clean modern styles for the layout */
.min-h-screen {
  min-height: 100vh;
  min-height: calc(var(--vh, 1vh) * 100);
}

/* Mobile drawer improvements */
@media (max-width: 1023px) {
  .drawer-side {
    z-index: 20;
  }
  
  .drawer-overlay {
    background-color: rgba(0, 0, 0, 0.5);
  }
  
  .drawer-content {
    min-height: 100vh;
    min-height: calc(var(--vh, 1vh) * 100);
  }
}

/* Enhanced navigation styles */
.collapse-title {
  padding-left: 0.5rem !important;
  padding-right: 1rem !important;
}

@media (min-width: 1024px) {
  .collapse-title {
    padding-left: 0.5rem !important;
    padding-right: 1rem !important;
  }
}

.collapse-content {
  padding-bottom: 0 !important;
}

/* Smooth transitions for all interactive elements */
button, .collapse-title {
  transition: all 0.2s ease;
}

/* Focus states for accessibility */
button:focus-visible {
  outline: 2px solid hsl(var(--p));
  outline-offset: 2px;
}
</style>