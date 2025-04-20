<template>
  <div>
    <h1 class="text-2xl font-bold">RSS 历史</h1>
    <div class="divider"></div>

    <div class="rss">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-lg font-bold">RSS 历史</h2>
        <div class="flex items-center gap-2">
          <input
            type="text"
            v-model="qs.key"
            class="input input-bordered input-sm"
            placeholder="筛选关键词"
          />
          <button class="btn btn-sm btn-primary" @click="filterHistory">筛选</button>
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="table table-zebra w-full">
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
              <td>
                {{
                  (rssList.find((item) => item.id === record.rssId) || {
                    alias: '已删除'
                  }).alias
                }}
              </td>
              <td>{{ record.name }}</td>
              <td>{{ $formatSize(record.size) }}</td>
              <td>
                {{
                  record.recordTime
                    ? $moment(record.recordTime * 1000).format(
                        'YYYY-MM-DD HH:mm:ss'
                      )
                    : ''
                }}
              </td>
              <td>
                <span>
                  {{
                    record.recordNote.includes('wish')
                      ? '豆瓣'
                      : record.recordNote
                  }}
                </span>
              </td>
              <td>
                <button
                  class="btn btn-xs btn-primary"
                  @click="gotoDetail(record)"
                >
                  打开
                </button>
                <button
                  class="btn btn-xs btn-error"
                  @click="delRecord(record)"
                >
                  删除
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="mt-4 flex justify-end">
        <button
          class="btn btn-sm btn-secondary"
          :disabled="qs.page <= 1"
          @click="prevPage"
        >
          上一页
        </button>
        <button
          class="btn btn-sm btn-secondary"
          :disabled="qs.page >= totalPages"
          @click="nextPage"
        >
          下一页
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      loading: true,
      qs: {
        page: 1,
        length: 20,
        type: 'rss',
        rss: '',
        key: ''
      },
      torrents: [],
      rssList: [],
      totalPages: 0
    };
  },
  methods: {
    async listHistory() {
      this.loading = true;
      try {
        const res = (await this.$api().torrent.listHistory(this.qs)).data;
        this.torrents = res.torrents;
        this.totalPages = Math.ceil(res.total / this.qs.length);
      } catch (e) {
        await this.$message().error(e.message);
      }
      this.loading = false;
    },
    async listRss() {
      try {
        const res = await this.$api().rss.list();
        this.rssList = res.data;
      } catch (e) {
        this.$message().error(e.message);
      }
    },
    async gotoDetail(record) {
      if (!record.link) return await this.$message().error('链接不存在');
      window.open(record.link);
    },
    async delRecord(record) {
      try {
        await this.$api().rss.delRecord({ id: record.id });
        this.$message().success('删除成功, 列表刷新中....');
        this.listHistory();
      } catch (e) {
        await this.$message().error(e.message);
      }
    },
    filterHistory() {
      this.qs.page = 1;
      this.listHistory();
    },
    prevPage() {
      if (this.qs.page > 1) {
        this.qs.page--;
        this.listHistory();
      }
    },
    nextPage() {
      if (this.qs.page < this.totalPages) {
        this.qs.page++;
        this.listHistory();
      }
    }
  },
  async mounted() {
    await this.listHistory();
    await this.listRss();
  }
};
</script>

<style scoped>
.rss {
  height: calc(100% - 92px);
  width: 100%;
  max-width: 1440px;
  margin: 0 auto;
}
</style>