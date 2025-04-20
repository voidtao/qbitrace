<template>
  <div class="container mx-auto p-4">
    <h1 class="text-2xl font-bold mb-4">RSS 历史</h1>
    <div class="alert alert-warning mb-4">
      <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
      <span>遇到问题先去看 Wiki，特别是 Wiki 里的常见问题, 实在找不到再去交流群问, 别 TM Wiki 不看直接在群里问。</span>
    </div>

    <div class="card bg-base-100 shadow-xl">
      <div class="card-body">
        <div class="flex flex-col md:flex-row gap-4 mb-4">
          <div class="form-control w-full md:w-64">
            <div class="input-group">
              <input type="text" placeholder="筛选关键词" class="input input-bordered w-full" v-model="qs.key" />
              <button class="btn btn-primary" @click="() => { qs.page = 1; listHistory(); }">筛选</button>
            </div>
          </div>
          <div class="form-control w-full md:w-48">
            <select class="select select-bordered" v-model="qs.rss" @change="() => { qs.page = 1; listHistory(); }">
              <option value="">全部 RSS</option>
              <option v-for="rss in rssList" :key="rss.id" :value="rss.id">{{ rss.alias }}</option>
              <option value="deleted">已删除</option>
            </select>
          </div>
        </div>

        <div class="overflow-x-auto">
          <table class="table table-zebra">
            <thead>
              <tr>
                <th>RSS</th>
                <th>种子名称</th>
                <th>种子大小</th>
                <th>记录时间</th>
                <th>种子状态</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="record in torrents" :key="record.id">
                <td>{{ (rssList.filter(item => item.id === record.rssId)[0] || { alias: '已删除' }).alias }}</td>
                <td>{{ record.name }}</td>
                <td>{{ $formatSize(record.size) }}</td>
                <td>{{ record.recordTime ? $moment(record.recordTime * 1000).format('YYYY-MM-DD HH:mm:ss') : '-' }}</td>
                <td>{{ record.recordNote.indexOf('wish') !== -1 ? '豆瓣' : record.recordNote }}</td>
                <td>
                  <div class="flex gap-2">
                    <button class="btn btn-sm btn-primary" @click="gotoDetail(record)">打开</button>
                    <div class="dropdown dropdown-end">
                      <button class="btn btn-sm btn-error" @click="delRecord(record)">删除</button>
                    </div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="flex justify-center mt-4">
          <div class="join">
            <button class="join-item btn" :class="{ 'btn-disabled': qs.page === 1 }" @click="() => { qs.page--; listHistory(); }">«</button>
            <button class="join-item btn">第 {{ qs.page }} 页</button>
            <button class="join-item btn" :class="{ 'btn-disabled': torrents.length < qs.length }" @click="() => { qs.page++; listHistory(); }">»</button>
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