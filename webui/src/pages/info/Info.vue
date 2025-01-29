<template>
  <div style="font-size: 24px; font-weight: bold;">相关信息</div>
  <a-divider></a-divider>
  <div class="info">
    <a-descriptions
      title="相关信息"
      :column="{ xxl: 4, xl: 3, lg: 3, md: 3, sm: 2, xs: 1 }"
    >
      <a-descriptions-item label="主版本">{{ version.version }}</a-descriptions-item>
      <a-descriptions-item label="编译版本">
        <a @click="gotoVersion">{{ version.head }}</a>
      </a-descriptions-item>
      <a-descriptions-item label="发布时间">{{ version.updateTime }}</a-descriptions-item>
      <a-descriptions-item label="更新信息">{{ version.commitInfo }}</a-descriptions-item>
    </a-descriptions>
    <a-divider></a-divider>
    <div style="font-size: 16px; font-weight: bold;">本项目由vertex-app/vertex项目修改而来，只保留了最核心的功能</div>
  </div>
</template>

<script>
export default {
  data () {
    return {
      version: {},
      runInfo: {}
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
    async getRunInfo () {
      try {
        const res = await this.$api().setting.getRunInfo();
        this.runInfo = res.data;
      } catch (e) {
        await this.$message().error(e.message);
      }
    }
  },
  async mounted () {
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