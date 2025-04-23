<template>
  <div class="p-2 md:p-4">
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
              <input
                type="checkbox"
                class="toggle toggle-primary"
                :checked="record.enable"
                @change="enableNotification(record)"
              />
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
              <div class="dropdown dropdown-end inline-block">
                <button class="btn btn-sm btn-error">删除</button>
                <div class="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52">
                  <div class="p-2">
                    <p class="text-sm">确定要删除吗？</p>
                    <button class="btn btn-sm btn-error w-full mt-2" @click="deleteNotification(record)">
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
        <select v-model="notification.type" class="select select-bordered" required>
          <option value="telegram">Telegram</option>
          <option value="wechat">WeChat</option>
          <option value="slack">Slack</option>
          <option value="ntfy">Ntfy</option>
          <option value="webhook">Webhook</option>
        </select>
      </div>

      <!-- Telegram 配置 -->
      <template v-if="notification.type === 'telegram'">
        <div class="form-control">
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
        <div class="form-control">
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
      </template>

      <!-- WeChat 配置 -->
      <template v-if="notification.type === 'wechat'">
        <div class="form-control">
          <label class="label">
            <span class="label-text">企业 ID</span>
          </label>
          <input
            type="text"
            v-model="notification.corpid"
            class="input input-bordered"
            required
          />
        </div>
        <div class="form-control">
          <label class="label">
            <span class="label-text">Agent ID</span>
          </label>
          <input
            type="text"
            v-model="notification.agentid"
            class="input input-bordered"
            required
          />
        </div>
        <div class="form-control">
          <label class="label">
            <span class="label-text">Secret</span>
          </label>
          <input
            type="text"
            v-model="notification.corpsecret"
            class="input input-bordered"
            required
          />
        </div>
        <div class="form-control">
          <label class="label">
            <span class="label-text">ProxyKey</span>
          </label>
          <input
            type="text"
            v-model="notification.proxyKey"
            class="input input-bordered"
          />
        </div>
      </template>

      <!-- Ntfy 配置 -->
      <template v-if="notification.type === 'ntfy'">
        <div class="form-control">
          <label class="label">
            <span class="label-text">Ntfy URL</span>
          </label>
          <input
            type="text"
            v-model="notification.ntfyUrl"
            class="input input-bordered"
            placeholder="格式: https://ntfy.sh/mytopic"
            required
          />
        </div>
        <div class="form-control">
          <label class="label">
            <span class="label-text">用户名</span>
          </label>
          <input
            type="text"
            v-model="notification.ntfyUsername"
            class="input input-bordered"
          />
        </div>
        <div class="form-control">
          <label class="label">
            <span class="label-text">密码</span>
          </label>
          <input
            type="password"
            v-model="notification.ntfyPassword"
            class="input input-bordered"
          />
        </div>
        <div class="form-control">
          <label class="label">
            <span class="label-text">Token</span>
          </label>
          <input
            type="text"
            v-model="notification.ntfyToken"
            class="input input-bordered"
            placeholder="使用Token或用户名+密码进行认证"
          />
        </div>
        <div class="form-control">
          <label class="label">
            <span class="label-text">优先级</span>
          </label>
          <input
            type="number"
            v-model="notification.ntfyPriority"
            class="input input-bordered"
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
            <span class="label-text">Webhook</span>
          </label>
          <input
            type="text"
            v-model="notification.slackWebhook"
            class="input input-bordered"
            required
          />
        </div>
        <div class="form-control">
          <label class="label">
            <span class="label-text">Token</span>
          </label>
          <input
            type="text"
            v-model="notification.slackToken"
            class="input input-bordered"
            placeholder="如果仅使用推送通知功能，可随意填写内容"
            required
          />
        </div>
      </template>

      <!-- Webhook 配置 -->
      <template v-if="notification.type === 'webhook'">
        <div class="form-control">
          <label class="label">
            <span class="label-text">Url</span>
          </label>
          <input
            type="text"
            v-model="notification.webhookurl"
            class="input input-bordered"
            placeholder="填写目标地址, 请注意推送内容中包含敏感信息, 因此必须保证目标地址可信"
            required
          />
        </div>
        <div class="form-control">
          <label class="label">
            <span class="label-text">Token</span>
          </label>
          <input
            type="text"
            v-model="notification.token"
            class="input input-bordered"
            placeholder="在请求时会将 token 放入请求头的 x-qbitrace-token 中"
            required
          />
        </div>
      </template>

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
.notification {
  width: 100%;
  max-width: 1440px;
  margin: 0 auto;
}
</style>