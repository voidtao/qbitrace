<template>
  <div class="container mx-auto p-4">
    <h1 class="text-2xl font-bold mb-4">通知工具管理</h1>
    <div class="divider"></div>

    <!-- 规则列表 Card -->
    <div class="card bg-base-100 shadow-xs hover:shadow-md transition-all duration-300 mb-8">
      <div class="card-body">
        <h2 class="card-title mb-6 text-base-content">通知工具列表</h2>
        <div class="overflow-x-auto">
          <table class="table table-zebra w-full">
            <thead>
              <tr class="bg-base-200/50">
                <th class="text-base-content/70">ID</th>
                <th class="text-base-content/70">别名</th>
                <th class="text-base-content/70">推送类型</th>
                <th class="text-base-content/70">启用</th>
                <th class="text-base-content/70">状态</th>
                <th class="text-base-content/70">操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="record in notifications" :key="record.id" class="hover:bg-base-200/30 transition-colors duration-200">
                <td class="text-base-content/80">{{ record.id }}</td>
                <td class="text-base-content/80 font-medium">{{ record.alias }}</td>
                <td class="text-base-content/80">{{ record.type }}</td>
                <td>
                  <input
                    type="checkbox"
                    class="toggle toggle-primary toggle-sm"
                    :checked="record.enable"
                    @change="enableNotification(record)"
                  />
                </td>
                <td>
                  <span
                    class="badge badge-sm"
                    :class="record.status ? 'badge-success' : 'badge-error'"
                  >
                    {{ record.status ? '正常' : '异常' }}
                  </span>
                </td>
                <td>
                  <div class="flex gap-2">
                    <button class="btn btn-sm btn-secondary btn-outline" @click="modifyClick(record)">
                      <i class="fas fa-edit mr-1"></i>
                      编辑
                    </button>
                    <div class="dropdown dropdown-end">
                      <label tabindex="0" class="btn btn-sm btn-error btn-outline">
                        <i class="fas fa-trash-alt mr-1"></i>
                        删除
                      </label>
                      <div tabindex="0" class="dropdown-content menu p-2 shadow-lg bg-base-100 rounded-lg w-52">
                        <div class="p-2 text-sm text-base-content/70 text-center">确认删除此工具？</div>
                        <button class="btn btn-sm btn-error w-full" @click="deleteNotification(record)">
                          确认删除
                        </button>
                      </div>
                    </div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- 新增 | 编辑 Card -->
    <div class="card bg-base-100 shadow-xs hover:shadow-md transition-all duration-300">
      <div class="card-body">
        <h2 class="card-title mb-6 text-base-content">
          <i class="fas fa-edit mr-2 text-primary"></i>
          新增 | 编辑通知工具
        </h2>
        <form @submit.prevent="modifyNotification" class="space-y-6">
          <!-- 基本信息 -->
          <div class="bg-base-200/50 rounded-lg p-4 space-y-4">
            <h3 class="font-medium text-base-content/80 mb-2">基本信息</h3>
            <div class="form-control">
              <label class="label">
                <span class="label-text text-base-content/80">别名</span>
              </label>
              <input
                type="text"
                v-model="notification.alias"
                class="input input-bordered w-full bg-base-100 transition-all duration-200 focus:ring-2 focus:ring-primary focus:ring-opacity-50"
                placeholder="输入工具名称"
                required
              />
              <span class="text-xs text-base-content/60 mt-2">给通知工具取一个好记的名字</span>
            </div>
            <div class="form-control">
              <label class="label">
                <span class="label-text text-base-content/80">错误推送上限</span>
              </label>
              <input
                type="number"
                v-model="notification.maxErrorCount"
                class="input input-bordered w-full bg-base-100 transition-all duration-200 focus:ring-2 focus:ring-primary focus:ring-opacity-50"
                placeholder="默认值为 100"
              />
              <span class="text-xs text-base-content/60 mt-2">单个周期内允许推送错误通知的最大次数</span>
            </div>
            <div class="form-control">
              <label class="label">
                <span class="label-text text-base-content/80">重置周期 (Cron)</span>
              </label>
              <input
                type="text"
                v-model="notification.clearCountCron"
                class="input input-bordered w-full bg-base-100 transition-all duration-200 focus:ring-2 focus:ring-primary focus:ring-opacity-50"
                placeholder="默认值为 0 * * * *"
              />
              <span class="text-xs text-base-content/60 mt-2">使用 Cron 表达式定义错误计数重置周期</span>
            </div>
          </div>

          <!-- 类型选择 -->
          <div class="bg-base-200/50 rounded-lg p-4 space-y-4">
            <h3 class="font-medium text-base-content/80 mb-2">推送类型</h3>
            <div class="form-control">
              <label class="label">
                <span class="label-text text-base-content/80">选择类型</span>
              </label>
              <select v-model="notification.type" class="select select-bordered w-full bg-base-100 transition-all duration-200 focus:ring-2 focus:ring-primary focus:ring-opacity-50" required>
                <option value="" disabled class="text-base-content/60">请选择推送类型</option>
                <option value="telegram" class="text-base-content/80">Telegram</option>
                <option value="wechat" class="text-base-content/80">WeChat</option>
                <option value="slack" class="text-base-content/80">Slack</option>
                <option value="ntfy" class="text-base-content/80">Ntfy</option>
                <option value="webhook" class="text-base-content/80">Webhook</option>
              </select>
            </div>

            <!-- Telegram 配置 -->
            <template v-if="notification.type === 'telegram'">
              <div class="form-control">
                <label class="label">
                  <span class="label-text text-base-content/80">机器人 Token</span>
                </label>
                <input
                  type="text"
                  v-model="notification.telegramBotToken"
                  class="input input-bordered w-full bg-base-100 transition-all duration-200 focus:ring-2 focus:ring-primary focus:ring-opacity-50"
                  required
                />
              </div>
              <div class="form-control">
                <label class="label">
                  <span class="label-text text-base-content/80">频道 ID</span>
                </label>
                <input
                  type="text"
                  v-model="notification.telegramChannel"
                  class="input input-bordered w-full bg-base-100 transition-all duration-200 focus:ring-2 focus:ring-primary focus:ring-opacity-50"
                  required
                />
              </div>
            </template>

            <!-- WeChat 配置 -->
            <template v-if="notification.type === 'wechat'">
              <div class="form-control">
                <label class="label">
                  <span class="label-text text-base-content/80">企业 ID</span>
                </label>
                <input
                  type="text"
                  v-model="notification.corpid"
                  class="input input-bordered w-full bg-base-100 transition-all duration-200 focus:ring-2 focus:ring-primary focus:ring-opacity-50"
                  required
                />
              </div>
              <div class="form-control">
                <label class="label">
                  <span class="label-text text-base-content/80">Agent ID</span>
                </label>
                <input
                  type="text"
                  v-model="notification.agentid"
                  class="input input-bordered w-full bg-base-100 transition-all duration-200 focus:ring-2 focus:ring-primary focus:ring-opacity-50"
                  required
                />
              </div>
              <div class="form-control">
                <label class="label">
                  <span class="label-text text-base-content/80">Secret</span>
                </label>
                <input
                  type="text"
                  v-model="notification.corpsecret"
                  class="input input-bordered w-full bg-base-100 transition-all duration-200 focus:ring-2 focus:ring-primary focus:ring-opacity-50"
                  required
                />
              </div>
              <div class="form-control">
                <label class="label">
                  <span class="label-text text-base-content/80">ProxyKey</span>
                </label>
                <input
                  type="text"
                  v-model="notification.proxyKey"
                  class="input input-bordered w-full bg-base-100 transition-all duration-200 focus:ring-2 focus:ring-primary focus:ring-opacity-50"
                />
                <span class="text-xs text-base-content/60 mt-2">可选，用于企业微信代理</span>
              </div>
            </template>

            <!-- Ntfy 配置 -->
            <template v-if="notification.type === 'ntfy'">
              <div class="form-control">
                <label class="label">
                  <span class="label-text text-base-content/80">Ntfy URL</span>
                </label>
                <input
                  type="text"
                  v-model="notification.ntfyUrl"
                  class="input input-bordered w-full bg-base-100 transition-all duration-200 focus:ring-2 focus:ring-primary focus:ring-opacity-50"
                  placeholder="格式: https://ntfy.sh/mytopic"
                  required
                />
              </div>
              <div class="form-control">
                <label class="label">
                  <span class="label-text text-base-content/80">用户名</span>
                </label>
                <input
                  type="text"
                  v-model="notification.ntfyUsername"
                  class="input input-bordered w-full bg-base-100 transition-all duration-200 focus:ring-2 focus:ring-primary focus:ring-opacity-50"
                />
              </div>
              <div class="form-control">
                <label class="label">
                  <span class="label-text text-base-content/80">密码</span>
                </label>
                <input
                  type="password"
                  v-model="notification.ntfyPassword"
                  class="input input-bordered w-full bg-base-100 transition-all duration-200 focus:ring-2 focus:ring-primary focus:ring-opacity-50"
                />
              </div>
              <div class="form-control">
                <label class="label">
                  <span class="label-text text-base-content/80">Token</span>
                </label>
                <input
                  type="text"
                  v-model="notification.ntfyToken"
                  class="input input-bordered w-full bg-base-100 transition-all duration-200 focus:ring-2 focus:ring-primary focus:ring-opacity-50"
                  placeholder="使用Token或用户名+密码进行认证"
                />
              </div>
              <div class="form-control">
                <label class="label">
                  <span class="label-text text-base-content/80">优先级</span>
                </label>
                <input
                  type="number"
                  v-model="notification.ntfyPriority"
                  class="input input-bordered w-full bg-base-100 transition-all duration-200 focus:ring-2 focus:ring-primary focus:ring-opacity-50"
                  placeholder="5最高, 1最低, 不填写为默认值3"
                  min="1"
                  max="5"
                />
              </div>
            </template>

            <!-- Slack 配置 -->
            <template v-if="notification.type === 'slack'">
              <div class="form-control">
                <label class="label">
                  <span class="label-text text-base-content/80">Webhook</span>
                </label>
                <input
                  type="text"
                  v-model="notification.slackWebhook"
                  class="input input-bordered w-full bg-base-100 transition-all duration-200 focus:ring-2 focus:ring-primary focus:ring-opacity-50"
                  required
                />
              </div>
              <div class="form-control">
                <label class="label">
                  <span class="label-text text-base-content/80">Token</span>
                </label>
                <input
                  type="text"
                  v-model="notification.slackToken"
                  class="input input-bordered w-full bg-base-100 transition-all duration-200 focus:ring-2 focus:ring-primary focus:ring-opacity-50"
                  placeholder="如果仅使用推送通知功能，可随意填写内容"
                  required
                />
              </div>
            </template>

            <!-- Webhook 配置 -->
            <template v-if="notification.type === 'webhook'">
              <div class="form-control">
                <label class="label">
                  <span class="label-text text-base-content/80">Url</span>
                </label>
                <input
                  type="text"
                  v-model="notification.webhookurl"
                  class="input input-bordered w-full bg-base-100 transition-all duration-200 focus:ring-2 focus:ring-primary focus:ring-opacity-50"
                  placeholder="填写目标地址, 请注意推送内容中包含敏感信息, 因此必须保证目标地址可信"
                  required
                />
              </div>
              <div class="form-control">
                <label class="label">
                  <span class="label-text text-base-content/80">Token</span>
                </label>
                <input
                  type="text"
                  v-model="notification.token"
                  class="input input-bordered w-full bg-base-100 transition-all duration-200 focus:ring-2 focus:ring-primary focus:ring-opacity-50"
                  placeholder="在请求时会将 token 放入请求头的 x-qbitrace-token 中"
                  required
                />
              </div>
            </template>
          </div>

          <!-- 推送事件选择 -->
          <div class="bg-base-200/50 rounded-lg p-4 space-y-4">
             <h3 class="font-medium text-base-content/80 mb-2">推送事件</h3>
            <div class="form-control">
              <label class="label">
                <span class="label-text text-base-content/80">选择需要推送的事件类型</span>
              </label>
              <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-2">
                <label
                  v-for="type in pushType"
                  :key="type.key"
                  class="flex items-center gap-2 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    v-model="notification.pushType"
                    :value="type.key"
                    class="checkbox checkbox-primary checkbox-sm"
                  />
                  <span class="text-sm text-base-content/80">{{ type.value }}</span>
                </label>
              </div>
            </div>
          </div>

          <!-- 操作按钮 -->
          <div class="form-control mt-8">
            <div class="flex flex-col md:flex-row gap-4">
              <button type="submit" class="btn btn-primary flex-1">
                <i class="fas fa-save mr-2"></i>
                保存工具
              </button>
              <button type="button" class="btn btn-ghost flex-1" @click="clearNotification">
                 <i class="fas fa-trash-alt mr-2"></i>
                清空表单
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
// ... existing script ...
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
        pushType: [],
        enable: true,
        // Telegram
        telegramBotToken: '',
        telegramChannel: '',
        // WeChat
        corpid: '',
        agentid: '',
        corpsecret: '',
        proxyKey: '',
        // Ntfy
        ntfyUrl: '',
        ntfyUsername: '',
        ntfyPassword: '',
        ntfyToken: '',
        ntfyPriority: '',
        // Slack
        slackWebhook: '',
        slackToken: '',
        // Webhook
        webhookurl: '',
        token: ''
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
    async enableNotification(record) {
      try {
        await this.$api().notification.modify({ ...record, enable: !record.enable });
        this.$message().success('状态更新成功');
        this.listNotification();
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
        pushType: [],
        enable: true,
        // Telegram
        telegramBotToken: '',
        telegramChannel: '',
        // WeChat
        corpid: '',
        agentid: '',
        corpsecret: '',
        proxyKey: '',
        // Ntfy
        ntfyUrl: '',
        ntfyUsername: '',
        ntfyPassword: '',
        ntfyToken: '',
        ntfyPriority: '',
        // Slack
        slackWebhook: '',
        slackToken: '',
        // Webhook
        webhookurl: '',
        token: ''
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
.container {
  max-width: 1440px; /* Keep max-width if desired */
}
</style>