<template>
  <div class="container mx-auto p-4">
    <h1 class="text-2xl font-bold mb-4">RSS 历史记录</h1>
    <div class="divider"></div>
    
    <div class="alert alert-warning bg-warning/10 text-warning-content mb-6 shadow-xs">
      <i class="fas fa-exclamation-triangle mr-2"></i>
      <span>遇到问题请先查阅 Wiki 中的常见问题，若仍未解决再到交流群咨询</span>
    </div>

    <div class="card bg-base-100 shadow-xs hover:shadow-md transition-all duration-300">
      <div class="card-body">
        <!-- 筛选表单 -->
        <div class="bg-base-200/50 rounded-lg p-4 mb-6">
          <h3 class="font-medium text-base-content/80 mb-4">筛选条件</h3>
          <div class="flex items-end gap-4">
            <div class="form-control flex-1">
              <label class="label">
                <span class="label-text text-base-content/80">关键词</span>
              </label>
              <input 
                type="text" 
                placeholder="输入关键词筛选" 
                class="input input-bordered w-full bg-base-100 transition-all duration-200 focus:ring-2 focus:ring-primary focus:ring-opacity-50" 
                v-model="qs.key"
              />
            </div>
            
            <div class="form-control w-64">
              <label class="label">
                <span class="label-text text-base-content/80">RSS 来源</span>
              </label>
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

            <button 
              class="btn btn-primary h-12 transition-all duration-200 px-6"
              @click="() => { qs.page = 1; listHistory(); }"
              :disabled="loading"
            >
              <span v-if="loading" class="loading loading-spinner loading-sm mr-1"></span>
              <i v-else class="fas fa-search mr-1"></i>
              筛选
            </button>
          </div>
        </div>

        <h2 class="card-title mb-6 text-base-content">
          <i class="fas fa-history mr-2 text-primary"></i>
          历史记录
        </h2>
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
                <td class="text-base-content/80 font-medium">{{ (rssList.filter(item => item.id === record.rssId)[0] || { alias: '已删除' }).alias }}</td>
                <td class="text-base-content/80">{{ record.name }}</td>
                <td class="text-base-content/80">{{ $formatSize(record.size) }}</td>
                <td class="text-base-content/80">{{ record.recordTime ? $moment(record.recordTime * 1000).format('YYYY-MM-DD HH:mm:ss') : '-' }}</td>
                <td>
                  <span class="badge badge-sm" :class="{
                    'badge-success': record.recordNote === 'success',
                    'badge-error': record.recordNote === 'error',
                    'badge-warning': record.recordNote.indexOf('wish') !== -1,
                    'badge-info': record.recordNote === 'skip'
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
                      class="btn btn-sm btn-secondary btn-outline" 
                      @click="gotoDetail(record)"
                    >
                      <i class="fas fa-external-link-alt mr-1"></i>
                      打开
                    </button>
                    <div class="dropdown dropdown-end">
                      <label tabindex="0" class="btn btn-sm btn-error btn-outline">
                        <i class="fas fa-trash-alt mr-1"></i>
                        删除
                      </label>
                      <div tabindex="0" class="dropdown-content menu p-2 shadow-lg bg-base-100 rounded-lg w-52">
                        <div class="p-2 text-sm text-base-content/70 text-center">确认删除此记录？</div>
                        <button class="btn btn-sm btn-error w-full" @click="delRecord(record)">
                          确认删除
                        </button>
                      </div>
                    </div>
                  </div>
                </td>
              </tr>
              <tr v-if="torrents.length === 0">
                <td colspan="6" class="text-center text-base-content/60 py-4">暂无记录</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="flex justify-center mt-6">
          <div class="join">
            <button 
              class="join-item btn" 
              :class="{ 'btn-disabled': qs.page === 1 }" 
              @click="() => { qs.page--; listHistory(); }"
              :disabled="qs.page === 1 || loading"
            >
              <i class="fas fa-chevron-left"></i>
            </button>
            <button class="join-item btn">
              第 {{ qs.page }} 页
            </button>
            <button 
              class="join-item btn" 
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