<template>
  <div>
    <h1 class="text-2xl font-bold">相关信息</h1>
    <div class="divider"></div>
    
    <div class="stats shadow">
      <div class="stat">
        <div class="stat-title">主版本</div>
        <div class="stat-value">{{ version.version }}</div>
      </div>
      <div class="stat">
        <div class="stat-title">编译版本</div>
        <div class="stat-value">
          <a @click="gotoVersion" class="link link-primary">{{ version.head }}</a>
        </div>
      </div>
      <div class="stat">
        <div class="stat-title">发布时间</div>
        <div class="stat-value">{{ version.updateTime }}</div>
      </div>
      <div class="stat">
        <div class="stat-title">更新信息</div>
        <div class="stat-value">{{ version.commitInfo }}</div>
      </div>
    </div>

    <div class="divider"></div>
    <p class="text-lg font-bold">本项目由vertex-app/vertex项目修改而来，只保留了最核心的功能</p>
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
    async getRunInfo() {
      try {
        const res = await this.$api().setting.getRunInfo();
        this.runInfo = res.data;
      } catch (e) {
        await this.$message().error(e.message);
      }
    },
    gotoVersion() {
      window.open(`https://github.com/vertex-app/vertex/commit/${this.version.head}`);
    }
  },
  async mounted() {
    this.getRunInfo();
    this.version = process.env.version;
  }
};
</script>

<style scoped>
.info {
  width: 100%;
  max-width: 1440px;
  margin: 0 auto;
}
</style>