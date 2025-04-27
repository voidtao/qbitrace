<template>
  <div class="container mx-auto p-4">
    <h1 class="text-2xl font-bold mb-4">相关信息</h1>
    <div class="divider"></div>
    
    <div class="card bg-base-100 shadow-xl">
      <div class="card-body">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div class="stat bg-base-200/50 rounded-lg p-4">
            <div class="stat-title text-base-content/80">主版本</div>
            <div class="stat-value text-primary">{{ version.version }}</div>
          </div>
          
          <div class="stat bg-base-200/50 rounded-lg p-4">
            <div class="stat-title text-base-content/80">编译版本</div>
            <div class="stat-value">
              <a 
                class="link link-primary hover:text-primary-focus transition-colors duration-200" 
                @click="gotoVersion"
              >
                {{ version.head }}
              </a>
            </div>
          </div>
          
          <div class="stat bg-base-200/50 rounded-lg p-4">
            <div class="stat-title text-base-content/80">发布时间</div>
            <div class="stat-value">{{ version.updateTime }}</div>
          </div>
          
          <div class="stat bg-base-200/50 rounded-lg p-4">
            <div class="stat-title text-base-content/80">更新信息</div>
            <div class="stat-desc">{{ version.commitInfo }}</div>
          </div>
        </div>

        <div class="divider"></div>

        <div class="alert alert-info bg-info/10 text-info-content">
          <i class="fas fa-code-branch"></i>
          <span>
            本项目基于
            <a 
              href="https://github.com/vertex-app/vertex" 
              target="_blank"
              class="link link-info hover:text-info-focus transition-colors duration-200"
            >
              vertex-app/vertex
            </a> 
            项目修改而来，只保留了最核心的功能
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      version: {},
      runInfo: {}
    };
  },
  methods: {
    isMobile() {
      if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
        return true;
      } else {
        return false;
      }
    },
    gotoVersion() {
      window.open('https://github.com/vertex-app/vertex');
    },
    async getRunInfo() {
      try {
        const res = await this.$api().setting.getRunInfo();
        this.runInfo = res.data;
      } catch (e) {
        await this.$message().error(e.message);
      }
    }
  },
  async mounted() {
    this.getRunInfo();
    this.version = process.env.version;
  }
};
</script>

<style scoped>
.container {
  max-width: 1440px;
}
</style>