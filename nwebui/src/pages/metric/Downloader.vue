<template>
  <div class="container mx-auto p-4">
    <h1 class="text-2xl font-bold mb-4 text-base-content">qbit数据</h1>
    <div class="divider"></div>

    <div class="card bg-base-100 shadow-xl">
      <div class="card-body">
        <div class="overflow-x-auto">
          <div v-if="loading" class="flex justify-center p-4">
            <span class="loading loading-spinner loading-lg"></span>
          </div>
          <table v-else class="table table-zebra w-full">
            <thead>
              <tr>
                <th class="cursor-pointer" @click="sortBy('alias')">
                  别名
                  <span v-if="sortKey === 'alias'" class="ml-1">
                    {{ sortOrder === 'asc' ? '↑' : '↓' }}
                  </span>
                </th>
                <th class="cursor-pointer" @click="sortBy('uploadSpeed')">
                  实时速度
                  <span v-if="sortKey === 'uploadSpeed'" class="ml-1">
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
              <tr v-for="downloader in paginatedDownloaders" :key="downloader.id" class="hover:bg-base-200/30">
                <td>{{ downloader.alias }}</td>
                <td>{{ $formatSize(downloader.uploadSpeed) }}/s / {{ $formatSize(downloader.downloadSpeed) }}/s</td>
                <td>{{ downloader.seedingCount }} / {{ downloader.leechingCount }}</td>
                <td>{{ $formatSize(downloader.allTimeUpload) }} / {{ $formatSize(downloader.allTimeDownload) }}</td>
                <td>{{ $formatSize(downloader.usedSpace) }}</td>
                <td>{{ $formatSize(downloader.freeSpaceOnDisk) }}</td>
              </tr>
            </tbody>
          </table>

          <!-- 分页 -->
          <div class="flex justify-center mt-4" v-if="sortedDownloaders.length > pageSize">
            <div class="btn-group">
              <button 
                class="btn btn-sm" 
                :class="{'btn-active': currentPage === i}" 
                v-for="i in totalPages" 
                :key="i" 
                @click="currentPage = i"
              >
                {{ i }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      loading: false,
      downloaders: [],
      sortKey: 'alias',
      sortOrder: 'asc',
      pageSize: 20,
      currentPage: 1
    };
  },
  computed: {
    sortedDownloaders() {
      return [...this.downloaders].sort((a, b) => {
        let valueA = a[this.sortKey];
        let valueB = b[this.sortKey];

        if (this.sortKey === 'alias') {
          return this.sortOrder === 'asc'
            ? valueA.localeCompare(valueB)
            : valueB.localeCompare(valueA);
        }

        return this.sortOrder === 'asc'
          ? valueA - valueB
          : valueB - valueA;
      });
    },
    paginatedDownloaders() {
      const start = (this.currentPage - 1) * this.pageSize;
      const end = start + this.pageSize;
      return this.sortedDownloaders.slice(start, end);
    },
    totalPages() {
      return Math.ceil(this.sortedDownloaders.length / this.pageSize);
    }
  },
  methods: {
    isMobile() {
      if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
        return true;
      } else {
        return false;
      }
    },
    sortBy(key) {
      if (this.sortKey === key) {
        this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
      } else {
        this.sortKey = key;
        this.sortOrder = 'asc';
      }
    },
    async listDownloader() {
      try {
        this.loading = true;
        const res = await this.$api().downloader.listMainInfo();
        this.downloaders = res.data;
      } catch (e) {
        await this.$message().error(e.message);
      } finally {
        this.loading = false;
      }
    }
  },
  async mounted() {
    this.listDownloader();
    this.interval = setInterval(() => {
      this.listDownloader();
    }, 30000);
  },
  beforeUnmount() {
    if (this.interval) {
      clearInterval(this.interval);
    }
  }
};
</script>

<style scoped>
.container {
  max-width: 1440px;
}
.card-body {
  padding: 1.25rem;
}
</style>