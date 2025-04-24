<template>
  <div class="container mx-auto p-4">
    <h1 class="text-2xl font-bold mb-4">下载器日志</h1>
    <div class="divider"></div>
    
    <div class="card bg-base-100 shadow-xl">
      <div class="card-body">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-bold">下载器日志</h2>
          <div class="pagination">
            <div class="btn-group">
              <button 
                class="btn btn-sm" 
                @click="currentPage = Math.max(1, currentPage - 1)"
                :disabled="currentPage === 1"
              >
                «
              </button>
              <button class="btn btn-sm">页码 {{ currentPage }}/{{ totalPages }}</button>
              <button 
                class="btn btn-sm" 
                @click="currentPage = Math.min(totalPages, currentPage + 1)"
                :disabled="currentPage === totalPages"
              >
                »
              </button>
            </div>
          </div>
        </div>
        
        <div class="overflow-x-auto">
          <table class="table table-zebra w-full">
            <thead>
              <tr>
                <th class="w-1/4">时间</th>
                <th>信息</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="log in paginatedLogs" :key="log.timestamp">
                <td>{{ formatTimestamp(log.timestamp) }}</td>
                <td :class="{ 'text-error': log.type === 4 }">{{ log.message }}</td>
              </tr>
            </tbody>
          </table>
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
