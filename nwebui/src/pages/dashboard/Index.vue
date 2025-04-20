<template>
  <div class="index">
    <div class="stats shadow">
      <div class="stat">
        <div class="stat-title">今日添加</div>
        <div class="stat-desc">ACCEPT</div>
        <div class="stat-value text-primary">{{ runInfo.addCountToday }}</div>
      </div>
      <div class="stat">
        <div class="stat-title">今日拒绝</div>
        <div class="stat-desc">REJECT</div>
        <div class="stat-value text-secondary">{{ runInfo.rejectCountToday }}</div>
      </div>
    </div>

    <div class="stats shadow mt-8">
      <div class="stat">
        <div class="stat-title">累计上传</div>
        <div class="stat-desc">UPLOAD</div>
        <div class="stat-value text-accent">{{ $formatSize(runInfo.uploaded) }}</div>
      </div>
      <div class="stat">
        <div class="stat-title">累计下载</div>
        <div class="stat-desc">DOWNLOAD</div>
        <div class="stat-value text-primary">{{ $formatSize(runInfo.downloaded) }}</div>
      </div>
      <div class="stat">
        <div class="stat-title">累计添加</div>
        <div class="stat-desc">ACCEPT</div>
        <div class="stat-value text-secondary">{{ runInfo.addCount }}</div>
      </div>
      <div class="stat">
        <div class="stat-title">累计拒绝</div>
        <div class="stat-desc">REJECT</div>
        <div class="stat-value text-accent">{{ runInfo.rejectCount }}</div>
      </div>
    </div>

    <div v-if="runInfo.dashboardContent.includes('downloader')" class="mt-8">
      <div
        v-for="(downloader, index) in downloaders"
        :key="downloader.id"
        class="card bg-base-100 shadow-xl mb-4 cursor-pointer"
        @click="gotoClient(`/proxy/client/${downloader.id}/`)"
      >
        <div class="card-body" :class="{ 'bg-primary text-primary-content': index === 0 }">
          <h2 class="card-title">{{ downloader.alias }}</h2>
          <p class="text-sm">
            累计数据: {{ $formatSize(downloader.allTimeUpload) }} ↑ /
            {{ $formatSize(downloader.allTimeDownload) }} ↓
          </p>
          <p class="text-lg">
            {{ $formatSize(downloader.uploadSpeed) }}/s ↑ /
            {{ $formatSize(downloader.downloadSpeed) }}/s ↓
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      runInfo: {
        dashboardContent: []
      },
      downloaders: [],
      loading: true
    };
  },
  methods: {
    async getRunInfo() {
      try {
        const res = await this.$api().setting.getRunInfo();
        this.runInfo = res.data;

        // 显示错误通知
        for (const error of this.runInfo.errors.reverse()) {
          await this.$notification().error({
            message: '存在错误信息, 请检查日志',
            description: error
              .map((item) =>
                typeof item === 'object'
                  ? item.message || item.code || item.description
                  : item
              )
              .join(', '),
            duration: 0
          });
        }
      } catch (e) {
        await this.$message().error(e.message);
      }
    },
    async listDownloader() {
      try {
        const res = await this.$api().downloader.listMainInfo();
        this.downloaders = res.data.sort((a, b) =>
          a.alias.localeCompare(b.alias)
        );
      } catch (e) {
        await this.$message().error(e.message);
      }
    },
    async listDownloaderInfo() {
      try {
        const res = await this.$api().downloader.listMainInfo();
        for (const downloader of this.downloaders) {
          const matched = res.data.find((item) => item.id === downloader.id);
          downloader.uploadSpeed = matched?.uploadSpeed || 0;
          downloader.downloadSpeed = matched?.downloadSpeed || 0;
        }
      } catch (e) {
        await this.$message().error(e.message);
      }
    },
    gotoClient(url) {
      window.open(url);
    }
  },
  async mounted() {
    await this.getRunInfo();
    if (this.runInfo.dashboardContent.includes('downloader')) {
      await this.listDownloader();
      this.listDownloaderInfo();
      this.interval = setInterval(() => {
        this.listDownloaderInfo();
      }, 3000);
    }
  },
  beforeUnmount() {
    clearInterval(this.interval);
  }
};
</script>

<style scoped>
.index {
  width: min(calc(100vw - 40px), 960px);
  margin: 0 auto;
  height: 100%;
}
</style>