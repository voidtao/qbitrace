<template>
  <div class="container mx-auto p-4">
    <!-- 数据统计卡片 -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <div class="stats shadow">
        <div class="stat">
          <div class="stat-title">今日添加</div>
          <div class="stat-value text-primary">{{runInfo.addCountToday}}</div>
          <div class="stat-desc">ACCEPT</div>
        </div>
      </div>
      <div class="stats shadow">
        <div class="stat">
          <div class="stat-title">今日拒绝</div>
          <div class="stat-value text-secondary">{{runInfo.rejectCountToday}}</div>
          <div class="stat-desc">REJECT</div>
        </div>
      </div>
      <div class="stats shadow">
        <div class="stat">
          <div class="stat-title">累计上传</div>
          <div class="stat-value text-accent">{{$formatSize(runInfo.uploaded)}}</div>
          <div class="stat-desc">UPLOAD</div>
        </div>
      </div>
      <div class="stats shadow">
        <div class="stat">
          <div class="stat-title">累计下载</div>
          <div class="stat-value">{{$formatSize(runInfo.downloaded)}}</div>
          <div class="stat-desc">DOWNLOAD</div>
        </div>
      </div>
    </div>

    <!-- 累计统计卡片 -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
      <div class="stats shadow">
        <div class="stat">
          <div class="stat-title">累计添加</div>
          <div class="stat-value">{{runInfo.addCount}}</div>
          <div class="stat-desc">ACCEPT</div>
        </div>
      </div>
      <div class="stats shadow">
        <div class="stat">
          <div class="stat-title">累计拒绝</div>
          <div class="stat-value">{{runInfo.rejectCount}}</div>
          <div class="stat-desc">REJECT</div>
        </div>
      </div>
    </div>

    <!-- 下载器信息卡片 -->
    <div v-if="runInfo.dashboardContent?.includes('downloader')" class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div v-for="(downloader, index) in downloaders" 
           :key="downloader.id" 
           @click="gotoClient(`/proxy/client/${downloader.id}/`)"
           class="card bg-base-100 shadow-xl hover:shadow-2xl cursor-pointer transition-all duration-300">
        <div class="card-body">
          <h2 class="card-title">{{ downloader.alias }}</h2>
          <div class="text-sm opacity-70">
            累计数据: {{ $formatSize(downloader.allTimeUpload) }} ↑ / {{$formatSize(downloader.allTimeDownload)}} ↓
          </div>
          <div class="text-lg font-bold">
            {{ $formatSize(downloader.uploadSpeed) }}/s ↑ / {{$formatSize(downloader.downloadSpeed)}}/s ↓
          </div>
          <!-- 速度图表 -->
          <div class="h-24">
            <div ref="speedChart" :id="'speedChart-' + downloader.id"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { onMounted, onBeforeUnmount, ref } from 'vue'
import * as echarts from 'echarts'

export default {
  setup() {
    const runInfo = ref({
      dashboardContent: [],
      addCountToday: 0,
      rejectCountToday: 0,
      uploaded: 0,
      downloaded: 0,
      addCount: 0,
      rejectCount: 0,
      errors: []
    })
    const downloaders = ref([])
    const charts = ref({})
    let interval = null

    const speedChartOption = {
      grid: {
        left: 0,
        right: 0,
        top: 0,
        bottom: 0
      },
      xAxis: {
        type: 'category',
        show: false,
        boundaryGap: false,
        data: Array(30).fill('')
      },
      yAxis: {
        type: 'value',
        show: false
      },
      series: [
        {
          data: Array(30).fill(0),
          type: 'line',
          symbol: 'none',
          smooth: true,
          areaStyle: {
            opacity: 0.2,
            color: '#4b5cc4'
          },
          lineStyle: {
            opacity: 0.8,
            color: '#4b5cc4'
          }
        },
        {
          data: Array(30).fill(0),
          type: 'line',
          symbol: 'none',
          smooth: true,
          areaStyle: {
            opacity: 0.2,
            color: '#ff69b4'
          },
          lineStyle: {
            opacity: 0.8,
            color: '#ff69b4'
          }
        }
      ]
    }

    const getRunInfo = async () => {
      try {
        const res = await window.$api.setting.getRunInfo()
        runInfo.value = res.data
        // 处理错误信息
        for (const error of runInfo.value.errors.reverse()) {
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
    }

    const listDownloader = async () => {
      try {
        const res = await window.$api.downloader.listMainInfo()
        downloaders.value = res.data
          .sort((a, b) => a.alias.localeCompare(b.alias))
          .map(item => ({
            ...item,
            speedHistory: {
              upload: Array(30).fill(0),
              download: Array(30).fill(0)
            }
          }))
        
        // 初始化图表
        downloaders.value.forEach(downloader => {
          const chartDom = document.getElementById(`speedChart-${downloader.id}`)
          if (chartDom) {
            charts.value[downloader.id] = echarts.init(chartDom)
            charts.value[downloader.id].setOption(speedChartOption)
          }
        })
      } catch (e) {
        window.$toast.error(e.message)
      }
    }

    const updateDownloaderInfo = async () => {
      try {
        const res = await window.$api.downloader.listMainInfo()
        for (const downloader of downloaders.value) {
          const info = res.data.find(item => item.id === downloader.id)
          if (info) {
            downloader.uploadSpeed = info.uploadSpeed
            downloader.downloadSpeed = info.downloadSpeed
            
            // 更新速度历史
            downloader.speedHistory.upload.shift()
            downloader.speedHistory.upload.push(info.uploadSpeed)
            downloader.speedHistory.download.shift()
            downloader.speedHistory.download.push(info.downloadSpeed)
            
            // 更新图表
            if (charts.value[downloader.id]) {
              charts.value[downloader.id].setOption({
                series: [
                  { data: downloader.speedHistory.upload },
                  { data: downloader.speedHistory.download }
                ]
              })
            }
          }
        }
      } catch (e) {
        window.$toast.error(e.message)
      }
    }

    const gotoClient = (url) => {
      window.open(url)
    }

    onMounted(async () => {
      await getRunInfo()
      if (runInfo.value.dashboardContent?.includes('downloader')) {
        await listDownloader()
        await updateDownloaderInfo()
        interval = setInterval(updateDownloaderInfo, 3000)
      }
    })

    onBeforeUnmount(() => {
      if (interval) {
        clearInterval(interval)
      }
      // 销毁图表实例
      Object.values(charts.value).forEach(chart => {
        chart.dispose()
      })
    })

    return {
      runInfo,
      downloaders,
      gotoClient
    }
  }
}
</script>

<style scoped>
.container {
  max-width: 1440px;
}
</style>