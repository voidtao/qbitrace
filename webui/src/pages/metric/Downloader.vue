<template>
  <div style="font-size: 24px; font-weight: bold;">qbit数据</div>
  <a-divider></a-divider>
  <div class="downloader-metric" >
    <a-table
      :style="`font-size: ${isMobile() ? '12px': '14px'};`"
      :columns="columns"
      size="small"
      :loading="loading"
      :data-source="downloaders"
      :scroll="{ x: 640 }"
      :pagination="{ pageSize: 20 }"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.dataIndex === 'speed'">
          {{ $formatSize(record.uploadSpeed) }}/s / {{ $formatSize(record.downloadSpeed) }}/s
        </template>
        <template v-if="column.dataIndex === 'seedingCount'">
          {{ record.seedingCount + ' / ' + record.leechingCount }}
        </template>
        <template v-if="column.dataIndex === 'allTimeUpload'">
            {{ $formatSize(record.allTimeUpload) }} / {{ $formatSize(record.allTimeDownload) }}
        </template>
        <template v-if="column.dataIndex === 'usedSpace'">
            {{ $formatSize(record.usedSpace) }}
        </template>
        <template v-if="column.dataIndex === 'freeSpaceOnDisk'">
            {{ $formatSize(record.freeSpaceOnDisk) }}
        </template>
      </template>
    </a-table>
  </div>
</template>
<script>
export default {
  data () {
    const columns = [
      {
        title: '别名',
        dataIndex: 'alias',
        width: 32,
        defaultSortOrder: 'ascend',
        fixed: true,
        sorter: (a, b) => a.alias.localeCompare(b.alias)
      }, {
        title: '实时速度',
        dataIndex: 'speed',
        width: 48,
        sorter: (a, b) => a.uploadSpeed - b.uploadSpeed
      }, {
        title: '当前任务',
        dataIndex: 'seedingCount',
        width: 32,
        sorter: (a, b) => a.seedingCount - b.seedingCount
      }, {
        title: '累计数据',
        dataIndex: 'allTimeUpload',
        width: 48,
        sorter: (a, b) => a.allTimeUpload - b.allTimeUpload
      }, {
        title: '做种大小',
        dataIndex: 'usedSpace',
        width: 32,
        sorter: (a, b) => a.usedSpace - b.usedSpace
      }, {
        title: '剩余空间',
        dataIndex: 'freeSpaceOnDisk',
        width: 32,
        sorter: (a, b) => a.freeSpaceOnDisk - b.freeSpaceOnDisk
      }
    ];
    return {
      loading: false,
      columns,
      downloaders: []
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
    async listDownloader () {
      try {
        const res = (await this.$api().downloader.listMainInfo()).data;
        this.downloaders = res;
      } catch (e) {
        await this.$message().error(e.message);
      }
    }
  },
  async mounted () {
    this.listDownloader();
    this.interval = setInterval(() => {
      this.listDownloader();
    }, 5000);
  },
  beforeUnmount () {
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