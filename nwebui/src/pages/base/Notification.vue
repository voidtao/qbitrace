<template>
  <div>
    <h1 class="text-2xl font-bold">通知工具</h1>
    <div class="divider"></div>

    <div class="notification">
      <table class="table table-zebra w-full">
        <thead>
          <tr>
            <th>ID</th>
            <th>别名</th>
            <th>推送类型</th>
            <th>启用</th>
            <th>状态</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="record in notifications" :key="record.id">
            <td>{{ record.id }}</td>
            <td>{{ record.alias }}</td>
            <td>{{ record.type }}</td>
            <td>
              <span
                class="badge"
                :class="record.enable ? 'badge-success' : 'badge-error'"
              >
                {{ record.enable ? '启用' : '禁用' }}
              </span>
            </td>
            <td>
              <span
                class="badge"
                :class="record.status ? 'badge-success' : 'badge-error'"
              >
                {{ record.status ? '正常' : '异常' }}
              </span>
            </td>
            <td>
              <button class="btn btn-sm btn-secondary" @click="modifyClick(record)">
                编辑
              </button>
              <button class="btn btn-sm btn-error" @click="deleteNotification(record)">
                删除
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="divider"></div>
    <h2 class="text-xl font-bold">新增 | 编辑通知工具</h2>
    <form @submit.prevent="modifyNotification" class="space-y-4">
      <div class="form-control">
        <label class="label">
          <span class="label-text">别名</span>
        </label>
        <input
          type="text"
          v-model="notification.alias"
          class="input input-bordered"
          required
        />
      </div>
      <div class="form-control">
        <label class="label">
          <span class="label-text">错误推送上限</span>
        </label>
        <input
          type="number"
          v-model="notification.maxErrorCount"
          class="input input-bordered"
          placeholder="默认值为 100"
        />
      </div>
      <div class="form-control">
        <label class="label">
          <span class="label-text">重置周期</span>
        </label>
        <input
          type="text"
          v-model="notification.clearCountCron"
          class="input input-bordered"
          placeholder="默认值为 0 * * * *"
        />
      </div>
      <div class="form-control">
        <label class="label">
          <span class="label-text">类型</span>
        </label>
        <select v-model="notification.type" class="select select-bordered">
          <option value="telegram">Telegram</option>
          <option value="wechat">WeChat</option>
          <option value="slack">Slack</option>
          <option value="ntfy">Ntfy</option>
          <option value="webhook">Webhook</option>
        </select>
      </div>
      <div v-if="notification.type === 'telegram'" class="form-control">
        <label class="label">
          <span class="label-text">机器人 Token</span>
        </label>
        <input
          type="text"
          v-model="notification.telegramBotToken"
          class="input input-bordered"
          required
        />
      </div>
      <div v-if="notification.type === 'telegram'" class="form-control">
        <label class="label">
          <span class="label-text">频道 ID</span>
        </label>
        <input
          type="text"
          v-model="notification.telegramChannel"
          class="input input-bordered"
          required
        />
      </div>
      <div class="form-control">
        <label class="label">
          <span class="label-text">推送类型</span>
        </label>
        <div class="flex flex-wrap gap-2">
          <label
            v-for="type in pushType"
            :key="type.key"
            class="flex items-center gap-2"
          >
            <input
              type="checkbox"
              v-model="notification.pushType"
              :value="type.key"
              class="checkbox checkbox-primary"
            />
            <span>{{ type.value }}</span>
          </label>
        </div>
      </div>
      <div class="form-control">
        <button type="submit" class="btn btn-primary">保存</button>
        <button type="button" class="btn btn-secondary" @click="clearNotification">
          清空
        </button>
      </div>
    </form>
  </div>
</template>

<script>
export default {
  data() {
    return {
      notifications: [],
      notification: {
        id: '',
        alias: '',
        maxErrorCount: '',
        clearCountCron: '',
        type: '',
        pushType: []
      },
      pushType: [
        { key: 'rssError', value: 'Rss 失败' },
        { key: 'scrapeError', value: '抓取免费或 HR 失败' },
        { key: 'addTorrent', value: '添加种子' },
        { key: 'addTorrentError', value: '添加种子失败' },
        { key: 'rejectTorrent', value: '拒绝种子' },
        { key: 'deleteTorrent', value: '删除种子' },
        { key: 'deleteTorrentError', value: '删除种子失败' },
        { key: 'reannounceTorrent', value: '重新汇报种子' },
        { key: 'reannounceTorrentError', value: '重新汇报种子失败' },
        { key: 'connectClient', value: '下载器已连接' },
        { key: 'clientLoginError', value: '下载器登陆失败' },
        { key: 'getMaindataError', value: '获取下载器信息失败' },
        { key: 'spaceAlarm', value: '空间警告' }
      ]
    };
  },
  methods: {
    async listNotification() {
      try {
        const res = await this.$api().notification.list();
        this.notifications = res.data;
      } catch (e) {
        this.$message().error(e.message);
      }
    },
    async modifyNotification() {
      try {
        await this.$api().notification.modify({ ...this.notification });
        this.$message().success(
          (this.notification.id ? '编辑' : '新增') + '成功, 列表正在刷新...'
        );
        this.listNotification();
        this.clearNotification();
      } catch (e) {
        this.$message().error(e.message);
      }
    },
    modifyClick(record) {
      this.notification = { ...record };
    },
    clearNotification() {
      this.notification = {
        id: '',
        alias: '',
        maxErrorCount: '',
        clearCountCron: '',
        type: '',
        pushType: []
      };
    },
    async deleteNotification(record) {
      try {
        await this.$api().notification.delete(record.id);
        this.$message().success('删除成功, 列表正在刷新...');
        this.listNotification();
      } catch (e) {
        this.$message().error(e.message);
      }
    }
  },
  async mounted() {
    this.listNotification();
  }
};
</script>

<style scoped>
.notification {
  width: 100%;
  max-width: 1440px;
  margin: 0 auto;
}
</style>