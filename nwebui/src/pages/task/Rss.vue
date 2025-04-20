<template>
  <div>
    <h1 class="text-2xl font-bold">RSS 任务</h1>
    <div class="divider"></div>
    
    <div class="overflow-x-auto">
      <table class="table table-zebra">
        <thead>
          <tr>
            <th>ID</th>
            <th>别名</th>
            <th>启用</th>
            <th>下载器</th>
            <th>RssUrl</th>
            <th>推送通知</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="record in rssList" :key="record.id">
            <td>{{ record.id }}</td>
            <td>{{ record.alias }}</td>
            <td>
              <input type="checkbox" class="toggle toggle-primary" 
                     :checked="record.enable" 
                     @change="enableTask(record)" />
            </td>
            <td>{{ downloaders.filter(item => record.clientArr.indexOf(item.id) !== -1).map(item => item.alias).join(' / ') }}</td>
            <td>{{ record.rssUrls.join(', ') }}</td>
            <td>
              <span class="badge" :class="record.pushNotify ? 'badge-success' : 'badge-error'">
                {{ record.pushNotify ? '启用' : '禁用' }}
              </span>
            </td>
            <td>
              <div class="flex gap-2">
                <button class="btn btn-sm btn-primary" @click="modifyClick(record)">编辑</button>
                <button class="btn btn-sm btn-secondary" @click="cloneClick(record)">克隆</button>
                <button class="btn btn-sm btn-error" @click="deleteRss(record)">删除</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="divider"></div>
    <h2 class="text-xl font-bold">新增 | 编辑RSS 任务</h2>
    
    <form @submit.prevent="modifyRss" class="space-y-4">
      <div class="form-control">
        <label class="label">
          <span class="label-text">别名</span>
          <span class="label-text-alt">给 RSS 任务取一个好记的名字</span>
        </label>
        <input type="text" v-model="rss.alias" class="input input-bordered" required />
      </div>

      <div class="form-control">
        <label class="label cursor-pointer">
          <span class="label-text">启用</span>
          <span class="label-text-alt">选择是否启用 RSS 任务</span>
          <input type="checkbox" v-model="rss.enable" class="toggle toggle-primary" />
        </label>
      </div>

      <div class="form-control">
        <label class="label">
          <span class="label-text">下载器</span>
          <span class="label-text-alt">选择下载器, 仅可选择已经启用的下载器</span>
        </label>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-2">
          <label v-for="downloader of downloaders" :key="downloader.id" 
                 class="label cursor-pointer">
            <span class="label-text">{{ downloader.alias }}</span>
            <input type="checkbox" 
                   :disabled="!downloader.enable && !rss.clientArr.includes(downloader.id)"
                   v-model="rss.clientArr"
                   :value="downloader.id"
                   class="checkbox checkbox-primary" />
          </label>
        </div>
      </div>

      <div class="form-control">
        <label class="label">
          <span class="label-text">选择规则</span>
          <span class="label-text-alt">选择规则, 种子状态符合其中一个时即触发添加种子操作</span>
        </label>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-2">
          <label v-for="rssRule of rssRules" :key="rssRule.id" 
                 class="label cursor-pointer">
            <span class="label-text">{{ rssRule.alias }}</span>
            <input type="checkbox" 
                   v-model="rss.acceptRules"
                   :value="rssRule.id"
                   class="checkbox checkbox-primary" />
          </label>
        </div>
      </div>

      <div class="form-control">
        <button type="submit" class="btn btn-primary">应用 | 完成</button>
      </div>
    </form>
  </div>
</template>

<script>
export default {
  data () {
    return {
      rssList: [],
      downloaders: [],
      rssRules: [],
      rss: {
        alias: '',
        enable: false,
        clientArr: [],
        acceptRules: [],
        rssUrls: ['']
      }
    };
  },
  methods: {
    async listRss () {
      try {
        const res = await this.$api().rss.list();
        this.rssList = res.data;
      } catch (e) {
        this.$message().error(e.message);
      }
    },
    async listDownloader () {
      try {
        const res = await this.$api().downloader.list();
        this.downloaders = res.data;
      } catch (e) {
        this.$message().error(e.message);
      }
    },
    async listRssRule () {
      try {
        const res = await this.$api().rssRule.list();
        this.rssRules = res.data;
      } catch (e) {
        this.$message().error(e.message);
      }
    },
    async modifyRss () {
      try {
        await this.$api().rss.modify({ ...this.rss });
        this.$message().success((this.rss.id ? '编辑' : '新增') + '成功, 列表正在刷新...');
        this.listRss();
        this.clearRss();
      } catch (e) {
        this.$message().error(e.message);
      }
    },
    async enableTask (record) {
      try {
        await this.$api().rss.modify({ ...record });
        this.$message().success('修改成功, 列表正在刷新...');
        this.listRss();
      } catch (e) {
        this.$message().error(e.message);
      }
    },
    modifyClick (row) {
      this.rss = { ...row };
    },
    cloneClick (row) {
      this.rss = { ...row, id: null, alias: row.alias + '-克隆' };
    },
    async deleteRss (row) {
      try {
        await this.$api().rss.delete(row.id);
        this.$message().success('删除成功, 列表正在刷新...');
        this.listRss();
      } catch (e) {
        this.$message().error(e.message);
      }
    },
    clearRss () {
      this.rss = {
        alias: '',
        enable: false,
        clientArr: [],
        acceptRules: [],
        rssUrls: ['']
      };
    }
  },
  async mounted () {
    this.listRss();
    this.listDownloader();
    this.listRssRule();
  }
};
</script>

<style scoped>
.rss {
  width: 100%;
  max-width: 1440px;
  margin: 0 auto;
}
</style>