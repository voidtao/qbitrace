<template>
  <div class="container mx-auto px-4 py-8 max-w-7xl">
    <h1 class="text-2xl font-bold mb-6">下载器日志</h1>
    <div class="divider"></div>
    
    <div class="card bg-base-100 shadow-xl">
      <div class="card-body">
        <div class="overflow-x-auto">
          <table class="table table-zebra">
            <thead>
              <tr>
                <th>时间</th>
                <th>信息</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="log in logs" :key="log.timestamp">
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

<script setup>
import { ref, onMounted } from 'vue'
import { useToast } from 'vue-toastification'
import { useRoute } from 'vue-router'
import moment from 'moment'

const toast = useToast()
const route = useRoute()
const logs = ref([])

const formatTimestamp = (timestamp) => {
  return moment(timestamp > 1e11 ? timestamp : timestamp * 1e3).format('YYYY-MM-DD HH:mm:ss')
}

const getLog = async () => {
  try {
    const response = await fetch(`/api/downloader/logs/${route.query.id}`)
    const data = await response.json()
    logs.value = data.reverse()
  } catch (error) {
    toast.error(error.message)
  }
}

onMounted(async () => {
  if (!route.query.id) {
    toast.error('当前页面需要从下载器页面进入!')
    return
  }
  await getLog()
})
</script>

<style scoped>
.container {
  max-width: 1440px;
}
</style>
