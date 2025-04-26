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
          <p class="text-xl font-bold text-primary">{{runInfo.addCountToday}}</p>
        </div>
      </div>
      
      <div class="card bg-base-100 shadow-xs hover:shadow-md border border-base-200">
        <div class="card-body">
          <h3 class="text-lg font-bold">今日拒绝</h3>
          <p class="text-sm text-base-content/70">REJECT</p>
          <p class="text-xl font-bold text-primary">{{runInfo.rejectCountToday}}</p>
        </div>
      </div>
    </div>
    
    <!-- 累计统计卡片 -->
    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      <div class="card bg-accent/10 shadow-xs hover:shadow-md border border-accent/20">
        <div class="card-body">
          <h3 class="text-lg font-bold">累计上传</h3>
          <p class="text-sm text-base-content/70">UPLOAD</p>
          <p class="text-xl font-bold text-accent">{{$formatSize(runInfo.uploaded)}}</p>
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
    <div v-if="runInfo.dashboardContent?.includes('downloader')" class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div v-for="(downloader, index) in downloaders" :key="downloader.id" 
           class="card bg-base-100 shadow-xs hover:shadow-md border cursor-pointer transition-all duration-300"
           :class="{ 'bg-primary/10 border-primary/20': index === 0, 'border-base-200': index !== 0 }"
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
      runInfo: {
        dashboardContent: []
      },
      downloaders: [],
      loading: true
    }
  },
  methods: {
    isMobile() {
      return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    },
    async getRunInfo() {
      try {
        const res = await window.$api.setting.getRunInfo()
        this.runInfo = res.data
        for (const error of this.runInfo.errors?.reverse() || []) {
          window.$toast.error(error.map(item => {
            if (typeof item === 'object') {
              return item.message || item.code || item.description
            }
            return item
          }).join(', '))
        }
      } catch (e) {
        window.$toast.error(e.message)
      }
    },
    async listDownloader() {
      try {
        const res = await window.$api.downloader.listMainInfo()
        this.downloaders = res.data.sort((a, b) => a.alias.localeCompare(b.alias))
      } catch (e) {
        window.$toast.error(e.message)
      }
    },
    async listDownloaderInfo() {
      try {
        const res = await window.$api.downloader.listMainInfo()
        for (const downloader of this.downloaders) {
          const info = res.data.find(item => item.id === downloader.id)
          if (info) {
            downloader.uploadSpeed = info.uploadSpeed
            downloader.downloadSpeed = info.downloadSpeed
          }
        }
      } catch (e) {
        window.$toast.error(e.message)
      }
    },
    gotoClient(url) {
      window.open(url)
    }
  },
  mounted() {
    this.getRunInfo()
    
    // 设置定时器
    this.interval = setInterval(() => {
      const hasDownloader = !!this.runInfo.dashboardContent?.includes('downloader')
      if (hasDownloader) {
        this.listDownloaderInfo()
      }
    }, 3000)
    
    // 初始化下载器列表
    setTimeout(() => {
      const hasDownloader = !!this.runInfo.dashboardContent?.includes('downloader')
      if (hasDownloader) {
        this.listDownloader()
        this.listDownloaderInfo()
      }
    }, 300)
  },
  beforeUnmount() {
    clearInterval(this.interval)
  }
}
</script>

<style scoped>
.container {
  max-width: 1440px;
}
</style>