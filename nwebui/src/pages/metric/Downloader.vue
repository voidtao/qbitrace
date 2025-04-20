<template>
  <div>
    <h1 class="text-2xl font-bold">qbit数据</h1>
    <div class="divider"></div>
    <div class="downloader-metric">
      <table class="table table-zebra w-full">
        <thead>
          <tr>
            <th>别名</th>
            <th>实时速度</th>
            <th>当前任务</th>
            <th>累计数据</th>
            <th>做种大小</th>
            <th>剩余空间</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="record in downloaders" :key="record.alias">
            <td>{{ record.alias }}</td>
            <td>{{ $formatSize(record.uploadSpeed) }}/s / {{ $formatSize(record.downloadSpeed) }}/s</td>
            <td>{{ record.seedingCount }} / {{ record.leechingCount }}</td>
            <td>{{ $formatSize(record.allTimeUpload) }} / {{ $formatSize(record.allTimeDownload) }}</td>
            <td>{{ $formatSize(record.usedSpace) }}</td>
            <td>{{ $formatSize(record.freeSpaceOnDisk) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      loading: false,
      downloaders: []
    };
  },
  methods: {
    isMobile() {
      return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      );
    },
    async listDownloader() {
      try {
        const res = await this.$api().downloader.listMainInfo();
        this.downloaders = res.data;
      } catch (e) {
        await this.$message().error(e.message);
      }
    }
  },
  async mounted() {
    this.listDownloader();
    this.interval = setInterval(() => {
      this.listDownloader();
    }, 5000);
  },
  beforeUnmount() {
    clearInterval(this.interval);
  }
};
</script>

<style scoped>
.downloader-metric {
  height: calc(100% - 92px);
  width: 100%;
  max-width: 1440px;
  margin: 0 auto;
}
</style>