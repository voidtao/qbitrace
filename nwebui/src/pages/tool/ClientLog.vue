<template>
  <div class="container mx-auto p-4">
    <h1 class="text-2xl font-bold mb-4">下载器日志</h1>
    <div class="divider"></div>
    
    <div class="card bg-base-100 shadow-xs hover:shadow-md transition-all duration-300">
      <div class="card-body">
        <h2 class="card-title mb-6 text-base-content">
          <i class="fas fa-file-alt mr-2 text-primary"></i>
          下载器日志
        </h2>
        
        <div class="bg-base-200/50 rounded-lg p-4 mb-6">
          <div class="flex justify-between items-center">
            <div class="text-sm text-base-content/70">
              显示下载器记录的最新日志
            </div>
            <div class="join">
              <button 
                class="join-item btn btn-sm" 
                @click="currentPage = Math.max(1, currentPage - 1)"
                :disabled="currentPage === 1"
              >
                <i class="fas fa-chevron-left"></i>
              </button>
              <button class="join-item btn btn-sm">
                第 {{ currentPage }}/{{ totalPages }} 页
              </button>
              <button 
                class="join-item btn btn-sm" 
                @click="currentPage = Math.min(totalPages, currentPage + 1)"
                :disabled="currentPage === totalPages"
              >
                <i class="fas fa-chevron-right"></i>
              </button>
            </div>
          </div>
        </div>
        
        <div class="overflow-x-auto">
          <table class="table table-zebra w-full">
            <thead>
              <tr class="bg-base-200/50">
                <th class="w-1/4 text-base-content/70">时间</th>
                <th class="text-base-content/70">信息</th>
              </tr>
            </thead>
            <tbody>
              <tr 
                v-for="log in paginatedLogs" 
                :key="log.timestamp"
                class="hover:bg-base-200/30 transition-colors duration-200"
              >
                <td class="text-base-content/80 font-mono">{{ formatTimestamp(log.timestamp) }}</td>
                <td :class="{ 'text-error': log.type === 4, 'text-base-content/80': log.type !== 4 }">{{ log.message }}</td>
              </tr>
              <tr v-if="paginatedLogs.length === 0">
                <td colspan="2" class="text-center text-base-content/60 py-4">暂无日志记录</td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <div class="flex justify-center mt-6">
          <div class="join">
            <button 
              class="join-item btn" 
              :class="{ 'btn-disabled': currentPage === 1 }" 
              @click="currentPage = Math.max(1, currentPage - 1)"
              :disabled="currentPage === 1"
            >
              <i class="fas fa-chevron-left"></i>
            </button>
            <button class="join-item btn">
              第 {{ currentPage }} 页
            </button>
            <button 
              class="join-item btn" 
              :class="{ 'btn-disabled': currentPage === totalPages }" 
              @click="currentPage = Math.min(totalPages, currentPage + 1)"
              :disabled="currentPage === totalPages"
            >
              <i class="fas fa-chevron-right"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useToast } from 'vue-toastification'
import { useRoute } from 'vue-router'

export default {
  setup() {
    const toast = useToast()
    const route = useRoute()
    
    return {
      toast,
      route
    }
  },
  data() {
    return {
      logs: [],
      currentPage: 1,
      pageSize: 100
    }
  },
  computed: {
    totalPages() {
      return Math.ceil(this.logs.length / this.pageSize)
    },
    paginatedLogs() {
      const start = (this.currentPage - 1) * this.pageSize
      const end = start + this.pageSize
      return this.logs.slice(start, end)
    }
  },
  methods: {
    formatTimestamp(timestamp) {
      return window.$moment(timestamp > 1e11 ? timestamp : timestamp * 1e3).format('YYYY-MM-DD HH:mm:ss')
    },
    isMobile() {
      return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    },
    async getLog() {
      try {
        const res = await window.$api.downloader.getLogs(this.route.query.id)
        this.logs = res.data.reverse()
      } catch (e) {
        this.toast.error(e.message)
      }
    }
  },
  async mounted() {
    if (!this.route.query.id) {
      this.toast.error('当前页面需要从下载器页面进入!')
      return
    }
    await this.getLog()
  }
}
</script>

<style scoped>
.container {
  max-width: 1440px;
}
</style>
