<template>
  <div class="container mx-auto p-4">
    <h1 class="text-2xl font-bold mb-4">qbit数据</h1>
    
    <div class="card bg-base-100 shadow-xl">
      <div class="card-body">
        <div class="overflow-x-auto">
          <table class="table table-zebra">
            <thead>
              <tr>
                <th class="cursor-pointer" @click="sortBy('alias')">
                  别名
                  <span v-if="sortKey === 'alias'" class="ml-1">
                    {{ sortOrder === 'asc' ? '↑' : '↓' }}
                  </span>
                </th>
                <th class="cursor-pointer" @click="sortBy('speed')">
                  实时速度
                  <span v-if="sortKey === 'speed'" class="ml-1">
                    {{ sortOrder === 'asc' ? '↑' : '↓' }}
                  </span>
                </th>
                <th class="cursor-pointer" @click="sortBy('seedingCount')">
                  当前任务
                  <span v-if="sortKey === 'seedingCount'" class="ml-1">
                    {{ sortOrder === 'asc' ? '↑' : '↓' }}
                  </span>
                </th>
                <th class="cursor-pointer" @click="sortBy('allTimeUpload')">
                  累计数据
                  <span v-if="sortKey === 'allTimeUpload'" class="ml-1">
                    {{ sortOrder === 'asc' ? '↑' : '↓' }}
                  </span>
                </th>
                <th class="cursor-pointer" @click="sortBy('usedSpace')">
                  做种大小
                  <span v-if="sortKey === 'usedSpace'" class="ml-1">
                    {{ sortOrder === 'asc' ? '↑' : '↓' }}
                  </span>
                </th>
                <th class="cursor-pointer" @click="sortBy('freeSpaceOnDisk')">
                  剩余空间
                  <span v-if="sortKey === 'freeSpaceOnDisk'" class="ml-1">
                    {{ sortOrder === 'asc' ? '↑' : '↓' }}
                  </span>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="downloader in sortedDownloaders" :key="downloader.id">
                <td>{{ downloader.alias }}</td>
                <td>{{ $formatSize(downloader.uploadSpeed) }}/s / {{ $formatSize(downloader.downloadSpeed) }}/s</td>
                <td>{{ downloader.seedingCount }} / {{ downloader.leechingCount }}</td>
                <td>{{ $formatSize(downloader.allTimeUpload) }} / {{ $formatSize(downloader.allTimeDownload) }}</td>
                <td>{{ $formatSize(downloader.usedSpace) }}</td>
                <td>{{ $formatSize(downloader.freeSpaceOnDisk) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { onMounted, onBeforeUnmount, ref, computed } from 'vue'

export default {
  setup() {
    const loading = ref(false)
    const downloaders = ref([])
    const sortKey = ref('alias')
    const sortOrder = ref('asc')
    let interval = null

    const sortedDownloaders = computed(() => {
      return [...downloaders.value].sort((a, b) => {
        let valueA = a[sortKey.value]
        let valueB = b[sortKey.value]

        if (sortKey.value === 'alias') {
          return sortOrder.value === 'asc' 
            ? valueA.localeCompare(valueB)
            : valueB.localeCompare(valueA)
        }

        if (sortKey.value === 'speed') {
          valueA = a.uploadSpeed
          valueB = b.uploadSpeed
        }

        return sortOrder.value === 'asc' 
          ? valueA - valueB
          : valueB - valueA
      })
    })

    const sortBy = (key) => {
      if (sortKey.value === key) {
        sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
      } else {
        sortKey.value = key
        sortOrder.value = 'asc'
      }
    }

    const listDownloader = async () => {
      try {
        const res = await window.$api.downloader.listMainInfo()
        downloaders.value = res.data
      } catch (e) {
        window.$toast.error(e.message)
      }
    }

    onMounted(() => {
      listDownloader()
      interval = setInterval(listDownloader, 5000)
    })

    onBeforeUnmount(() => {
      if (interval) {
        clearInterval(interval)
      }
    })

    return {
      loading,
      downloaders: sortedDownloaders,
      sortKey,
      sortOrder,
      sortBy
    }
  }
}
</script>

<style scoped>
.container {
  max-width: 1440px;
}
</style>