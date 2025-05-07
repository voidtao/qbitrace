<template>
  <div class="container mx-auto p-4">
    <h1 class="text-2xl font-bold mb-4">仪表盘</h1>
    <div class="divider"></div>
    
    <!-- 今日统计卡片 -->
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
      <div class="card bg-base-100 shadow-xs hover:shadow-md border border-base-200">
        <div class="card-body">
          <h3 class="text-lg font-bold">今日添加</h3>
          <p class="text-sm text-base-content/70">ACCEPT</p>
          <p class="text-xl font-bold">{{runInfo.addCountToday}}</p>
        </div>
      </div>
      
      <div class="card bg-base-100 shadow-xs hover:shadow-md border border-base-200">
        <div class="card-body">
          <h3 class="text-lg font-bold">今日拒绝</h3>
          <p class="text-sm text-base-content/70">REJECT</p>
          <p class="text-xl font-bold">{{runInfo.rejectCountToday}}</p>
        </div>
      </div>
    </div>
    
    <!-- 累计统计卡片 -->
    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      <div class="card bg-base-100 shadow-xs hover:shadow-md border border-base-200">
        <div class="card-body">
          <h3 class="text-lg font-bold">累计上传</h3>
          <p class="text-sm text-base-content/70">UPLOAD</p>
          <p class="text-xl font-bold">{{$formatSize(runInfo.uploaded)}}</p>
        </div>
      </div>
      
      <div class="card bg-base-100 shadow-xs hover:shadow-md border border-base-200">
        <div class="card-body">
          <h3 class="text-lg font-bold">累计下载</h3>
          <p class="text-sm text-base-content/70">DOWNLOAD</p>
          <p class="text-xl font-bold">{{$formatSize(runInfo.downloaded)}}</p>
        </div>
      </div>
      
      <div class="card bg-base-100 shadow-xs hover:shadow-md border border-base-200">
        <div class="card-body">
          <h3 class="text-lg font-bold">累计添加</h3>
          <p class="text-sm text-base-content/70">ACCEPT</p>
          <p class="text-xl font-bold">{{runInfo.addCount}}</p>
        </div>
      </div>
      
      <div class="card bg-base-100 shadow-xs hover:shadow-md border border-base-200">
        <div class="card-body">
          <h3 class="text-lg font-bold">累计拒绝</h3>
          <p class="text-sm text-base-content/70">REJECT</p>
          <p class="text-xl font-bold">{{runInfo.rejectCount}}</p>
        </div>
      </div>
    </div>

    <!-- 下载器卡片 -->
    <div v-if="runInfo.dashboardContent?.filter(item => item === 'downloader')[0]" class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div v-for="(downloader, index) in downloaders" :key="downloader.id" 
           class="card bg-base-100 shadow-xs hover:shadow-md border cursor-pointer transition-all duration-300 border-base-200"
           @click="gotoClient(`/proxy/client/${downloader.id}/`)">
        <div class="card-body">
          <h2 class="card-title">{{ downloader.alias }}</h2>
          <p class="text-sm">累计数据: {{ $formatSize(downloader.allTimeUpload) }} ↑ / {{$formatSize(downloader.allTimeDownload)}} ↓</p>
          <p class="text-lg font-bold">{{ $formatSize(downloader.uploadSpeed) }}/s ↑ / {{$formatSize(downloader.downloadSpeed)}}/s ↓</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      speedChart: {
        grid: {
          left: 0,
          right: 0,
          top: 0,
          bottom: 0,
          z: 0
        },
        xAxis: {
          type: 'category',
          show: false,
          boundaryGap: false,
          data: []
        },
        yAxis: {
          type: 'value',
          show: false
        },
        series: [
          {
            data: [],
            type: 'line',
            symbol: 'none',
            smooth: true,
            areaStyle: {
              opacity: 0.2,
              color: '#BEC23F'
            },
            lineStyle: {
              opacity: 0,
              color: '#BEC23F'
            }
          }, {
            data: [],
            type: 'line',
            symbol: 'none',
            smooth: true,
            areaStyle: {
              opacity: 0,
              color: '#C46243'
            },
            lineStyle: {
              opacity: 0,
              color: '#C46243'
            }
          }
        ]
      },
      runInfo: {
        dashboardContent: []
      },
      downloaders: [],
      loading: true
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
    async getRunInfo() {
      try {
        const res = await this.$api().setting.getRunInfo();
        this.runInfo = res.data;
        for (const error of this.runInfo.errors.reverse()) {
          await this.$notification().error({
            message: '存在错误信息, 请检查日志',
            description: error.map(item => {
              if (typeof item === 'object') {
                return item.message || item.code || item.description;
              }
              return item;
            }).join(', '),
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
        this.downloaders = res.data
          .sort((a, b) => a.alias.localeCompare(b.alias))
          .map(item => ({
            ...item,
            speedChart: JSON.parse(JSON.stringify(this.speedChart))
          }));
      } catch (e) {
        await this.$message().error(e.message);
      }
    },
    async listDownloaderInfo() {
      try {
        const res = await this.$api().downloader.listMainInfo();
        for (const downloader of this.downloaders) {
          const upload = res.data.filter(item => item.id === downloader.id)[0]?.uploadSpeed || 0;
          const download = res.data.filter(item => item.id === downloader.id)[0]?.downloadSpeed || 0;
          downloader.uploadSpeed = upload;
          downloader.downloadSpeed = download;
        }
      } catch (e) {
        await this.$message().error(e.message);
      }
    },
    async gotoClient(url) {
      window.open(url);
    }
  },
  async mounted() {
    await this.getRunInfo();
    const downloader = !!this.runInfo.dashboardContent.filter(item => item === 'downloader')[0];
    if (downloader) {
      this.listDownloader();
      this.listDownloaderInfo();
    }
    this.interval = setInterval(() => {
      if (downloader) {
        this.listDownloaderInfo();
      }
    }, 3000);
  },
  beforeUnmount() {
    clearInterval(this.interval);
  }
}
</script>

<style scoped>
.container {
  max-width: 1440px;
}
</style>