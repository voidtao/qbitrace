<template>
  <div class="container mx-auto p-4">
    <h1 class="text-2xl font-bold mb-4">rss历史记录</h1>
    <div class="divider"></div>
    
    <div class="alert alert-warning bg-warning/10 text-warning-content mb-6">
      <i class="fas fa-exclamation-triangle"></i>
      <span>遇到问题请先查阅Wiki中的常见问题，若仍未解决再到交流群咨询</span>
    </div>

    <div class="card bg-base-100 shadow-xl">
      <div class="card-body">
        <!-- 筛选表单 -->
        <div class="bg-base-200/50 rounded-lg p-4 mb-6">
          <div class="flex flex-col md:flex-row gap-4">
            <div class="form-control flex-1">
              <div class="input-group">
                <input 
                  type="text" 
                  placeholder="输入关键词筛选" 
                  class="input input-bordered w-full bg-base-100 transition-all duration-200 focus:ring-2 focus:ring-primary focus:ring-opacity-50" 
                  v-model="qs.key"
                />
                <button 
                  class="btn btn-primary transition-all duration-200 hover:shadow-lg"
                  @click="() => { qs.page = 1; listHistory(); }"
                  :disabled="loading"
                >
                  <span v-if="loading" class="loading loading-spinner"></span>
                  <span v-else>筛选</span>
                </button>
              </div>
            </div>
            
            <div class="form-control w-full md:w-48">
              <select 
                class="select select-bordered w-full bg-base-100 transition-all duration-200 focus:ring-2 focus:ring-primary focus:ring-opacity-50" 
                v-model="qs.rss" 
                @change="() => { qs.page = 1; listHistory(); }"
                :disabled="loading"
              >
                <option value="" class="text-base-content/60">全部 RSS</option>
                <option 
                  v-for="rss in rssList" 
                  :key="rss.id" 
                  :value="rss.id"
                  class="text-base-content/80"
                >
                  {{ rss.alias }}
                </option>
                <option value="deleted" class="text-base-content/80">已删除</option>
              </select>
            </div>
          </div>
        </div>

        <div class="overflow-x-auto">
          <table class="table table-zebra w-full">
            <thead>
              <tr class="bg-base-200/50">
                <th class="text-base-content/70">RSS</th>
                <th class="text-base-content/70">种子名称</th>
                <th class="text-base-content/70">大小</th>
                <th class="text-base-content/70">记录时间</th>
                <th class="text-base-content/70">状态</th>
                <th class="text-base-content/70">操作</th>
              </tr>
            </thead>
            <tbody>
              <tr 
                v-for="record in torrents" 
                :key="record.id"
                class="hover:bg-base-200/30 transition-colors duration-200"
              >
                <td class="text-base-content/80">{{ (rssList.filter(item => item.id === record.rssId)[0] || { alias: '已删除' }).alias }}</td>
                <td class="text-base-content/80">{{ record.name }}</td>
                <td class="text-base-content/80">{{ $formatSize(record.size) }}</td>
                <td class="text-base-content/80">{{ record.recordTime ? $moment(record.recordTime * 1000).format('YYYY-MM-DD HH:mm:ss') : '-' }}</td>
                <td>
                  <span class="badge badge-sm" :class="{
                    'badge-success bg-success/20 text-success-content': record.recordNote === 'success',
                    'badge-error bg-error/20 text-error-content': record.recordNote === 'error',
                    'badge-warning bg-warning/20 text-warning-content': record.recordNote.indexOf('wish') !== -1,
                    'badge-info bg-info/20 text-info-content': record.recordNote === 'skip'
                  }">
                    {{ record.recordNote.indexOf('wish') !== -1 ? '豆瓣' : 
                       record.recordNote === 'success' ? '成功' :
                       record.recordNote === 'error' ? '失败' : 
                       record.recordNote === 'skip' ? '跳过' : record.recordNote }}
                  </span>
                </td>
                <td>
                  <div class="flex gap-2">
                    <button 
                      class="btn btn-sm btn-primary btn-outline" 
                      @click="gotoDetail(record)"
                    >
                      <i class="fas fa-external-link-alt mr-1"></i>
                      打开
                    </button>
                    <button 
                      class="btn btn-sm btn-error btn-outline" 
                      @click="delRecord(record)"
                    >
                      <i class="fas fa-trash-alt mr-1"></i>
                      删除
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="flex justify-center mt-6">
          <div class="join">
            <button 
              class="join-item btn btn-sm md:btn-md" 
              :class="{ 'btn-disabled': qs.page === 1 }" 
              @click="() => { qs.page--; listHistory(); }"
              :disabled="qs.page === 1 || loading"
            >
              <i class="fas fa-chevron-left"></i>
            </button>
            <button class="join-item btn btn-sm md:btn-md">
              第 {{ qs.page }} 页
            </button>
            <button 
              class="join-item btn btn-sm md:btn-md" 
              :class="{ 'btn-disabled': torrents.length < qs.length }" 
              @click="() => { qs.page++; listHistory(); }"
              :disabled="torrents.length < qs.length || loading"
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
import { onMounted, ref } from 'vue'

export default {
  setup() {
    const loading = ref(false)
    const torrents = ref([])
    const rssList = ref([])
    const qs = ref({
      page: 1,
      length: 20,
      type: 'rss',
      rss: '',
      key: ''
    })

    const listHistory = async () => {
      loading.value = true
      try {
        const res = await window.$api.torrent.listHistory(qs.value)
        torrents.value = res.data.torrents
      } catch (e) {
        window.$toast.error(e.message)
      }
      loading.value = false
    }

    const listRss = async () => {
      try {
        const res = await window.$api.rss.list()
        rssList.value = res.data
      } catch (e) {
        window.$toast.error(e.message)
      }
    }

    const gotoDetail = async (record) => {
      if (!record.link) {
        window.$toast.error('链接不存在')
        return
      }
      window.open(record.link)
    }

    const delRecord = async (record) => {
      try {
        await window.$api.rss.delRecord({ id: record.id })
        window.$toast.success('删除成功, 列表刷新中....')
        listHistory()
      } catch (e) {
        window.$toast.error(e.message)
      }
    }

    onMounted(() => {
      listHistory()
      listRss()
    })

    return {
      loading,
      torrents,
      rssList,
      qs,
      listHistory,
      gotoDetail,
      delRecord
    }
  }
}
</script>

<style scoped>
.container {
  max-width: 1440px;
}
</style>