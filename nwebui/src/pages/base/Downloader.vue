<template>
  <div class="p-2 md:p-4">
    <h1 class="text-2xl font-bold">下载器</h1>
    <div class="divider"></div>

    <div class="downloader">
      <table class="table table-zebra w-full">
        <thead>
          <tr>
            <th>ID</th>
            <th>别名</th>
            <th>启用</th>
            <th>URL</th>
            <th>自动删种</th>
            <th>状态</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="record in downloaders" :key="record.id">
            <td>{{ record.id }}</td>
            <td>{{ record.alias }}</td>
            <td>
              <input
                type="checkbox"
                class="toggle toggle-primary"
                :checked="record.enable"
                :disabled="record.used"
                @change="enableDownloader(record)"
              />
            </td>
            <td>{{ record.clientUrl }}</td>
            <td>
              <span
                class="badge"
                :class="record.autoDelete ? 'badge-success' : 'badge-error'"
              >
                {{ record.autoDelete ? '启用' : '禁用' }}
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
              <div class="dropdown dropdown-end">
                <button class="btn btn-sm btn-primary" @click="goto(record)">
                  打开
                </button>
                <button class="btn btn-sm btn-secondary" @click="modifyClick(record)">
                  编辑
                </button>
                <button class="btn btn-sm btn-accent" @click="cloneClick(record)">
                  克隆
                </button>
                <div class="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52">
                  <button class="btn btn-sm btn-error" @click="deleteDownloader(record)">
                    删除
                  </button>
                  <button class="btn btn-sm" @click="gotoLog(record)">
                    日志
                  </button>
                </div>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="divider"></div>
    <h2 class="text-xl font-bold">新增 | 编辑下载器</h2>
    <form @submit.prevent="modifyDownloader" class="space-y-4">
      <div class="form-control">
        <label class="label">
          <span class="label-text">别名</span>
          <span class="label-text-alt text-xs text-opacity-60">给下载器取一个好记的名字</span>
        </label>
        <input
          type="text"
          v-model="downloader.alias"
          class="input input-bordered"
          required
        />
      </div>
      <div class="form-control">
        <label class="label">
          <span class="label-text">启用</span>
          <span class="label-text-alt text-xs text-opacity-60">选择是否启用下载器</span>
        </label>
        <input
          type="checkbox"
          v-model="downloader.enable"
          :disabled="downloader.used"
          class="toggle toggle-primary"
        />
      </div>
      <div class="form-control">
        <label class="label">
          <span class="label-text">下载器类型</span>
          <span class="label-text-alt text-xs text-opacity-60">下载器类型，目前完整支持 qBittorrent，Deluge 和 Transmission 不完全支持</span>
        </label>
        <select v-model="downloader.type" class="select select-bordered">
          <option value="qBittorrent">qBittorrent</option>
          <option value="Transmission">Transmission</option>
          <option value="deluge">Deluge</option>
        </select>
      </div>
      <div class="form-control">
        <label class="label">
          <span class="label-text">用户名</span>
        </label>
        <input
          type="text"
          v-model="downloader.username"
          class="input input-bordered"
          required
        />
      </div>
      <div class="form-control">
        <label class="label">
          <span class="label-text">密码</span>
        </label>
        <input
          type="password"
          v-model="downloader.password"
          class="input input-bordered"
          required
        />
      </div>
      <div class="form-control">
        <label class="label">
          <span class="label-text">URL</span>
          <span class="label-text-alt text-xs text-opacity-60">下载器的链接，最后的 / 需要删除</span>
        </label>
        <input
          type="text"
          v-model="downloader.clientUrl"
          class="input input-bordered"
          required
        />
      </div>
      <div class="form-control">
        <label class="label">
          <span class="label-text">推送通知</span>
        </label>
        <input
          type="checkbox"
          v-model="downloader.pushNotify"
          class="toggle toggle-primary"
        />
      </div>
      <div class="form-control" v-if="downloader.pushNotify">
        <label class="label">
          <span class="label-text">通知方式</span>
          <span class="label-text-alt text-xs text-opacity-60">通知方式，用于推送删种等信息，在通知工具页面创建</span>
        </label>
        <select v-model="downloader.notify" class="select select-bordered" required>
          <option v-for="notification in notifications" :key="notification.id" :value="notification.id">
            {{ notification.alias }}
          </option>
        </select>
      </div>
      <div class="form-control">
        <label class="label">
          <span class="label-text">监控频道</span>
        </label>
        <input
          type="checkbox"
          v-model="downloader.pushMonitor"
          class="toggle toggle-primary"
        />
      </div>
      <div class="form-control" v-if="downloader.pushMonitor">
        <label class="label">
          <span class="label-text">监控频道</span>
          <span class="label-text-alt text-xs text-opacity-60">下载器状态频道，仅支持 Telegram! 在推送工具页面创建</span>
        </label>
        <select v-model="downloader.monitor" class="select select-bordered" required>
          <option v-for="notification in notifications" :key="notification.id" :value="notification.id" :disabled="notification.type !== 'telegram'">
            {{ notification.alias }}
          </option>
        </select>
      </div>
      <div class="form-control">
        <label class="label">
          <span class="label-text">信息更新周期</span>
          <span class="label-text-alt text-xs text-opacity-60">下载器信息更新 Cron 表达式，默认为 4s 更新一次，种子量过多请考虑 一分钟 一次甚至 五分钟 一次</span>
        </label>
        <input
          type="text"
          v-model="downloader.cron"
          class="input input-bordered"
          placeholder="*/4 * * * * *"
        />
      </div>
      <div class="form-control">
        <label class="label">
          <span class="label-text">自动汇报</span>
          <span class="label-text-alt text-xs text-opacity-60">自动在种子添加后的第 2 分钟时汇报一次，获取更多 Peers</span>
        </label>
        <input
          type="checkbox"
          v-model="downloader.autoReannounce"
          class="toggle toggle-primary"
        />
      </div>
      <div class="form-control">
        <label class="label">
          <span class="label-text">先下载首尾文件块</span>
          <span class="label-text-alt text-xs text-opacity-60">先下载首尾文件块，同 qBittorrent 右键菜单 - 先下载首尾文件块</span>
        </label>
        <input
          type="checkbox"
          v-model="downloader.firstLastPiecePrio"
          class="toggle toggle-primary"
        />
      </div>
      <div class="form-control">
        <label class="label">
          <span class="label-text">空间警告</span>
          <span class="label-text-alt text-xs text-opacity-60">下载器剩余空间小于一定值时推送警告通知，15 分钟一次</span>
        </label>
        <input
          type="checkbox"
          v-model="downloader.spaceAlarm"
          class="toggle toggle-primary"
        />
      </div>
      <div class="form-control" v-if="downloader.spaceAlarm">
        <label class="label">
          <span class="label-text">空间</span>
        </label>
        <div class="flex gap-2">
          <input
            type="number"
            v-model="downloader.alarmSpace"
            class="input input-bordered flex-1"
            required
          />
          <select v-model="downloader.alarmSpaceUnit" class="select select-bordered w-32">
            <option value="KiB">KiB</option>
            <option value="MiB">MiB</option>
            <option value="GiB">GiB</option>
          </select>
        </div>
      </div>
      <div class="form-control">
        <label class="label">
          <span class="label-text">上限上传速度</span>
          <span class="label-text-alt text-xs text-opacity-60">若下载器的上传速度在此速度之上时，不再添加种子</span>
        </label>
        <div class="flex gap-2">
          <input
            type="number"
            v-model="downloader.maxUploadSpeed"
            class="input input-bordered flex-1"
          />
          <select v-model="downloader.maxUploadSpeedUnit" class="select select-bordered w-32">
            <option value="KiB">KiB/s</option>
            <option value="MiB">MiB/s</option>
            <option value="GiB">GiB/s</option>
          </select>
        </div>
      </div>
      <div class="form-control">
        <label class="label">
          <span class="label-text">上限下载速度</span>
          <span class="label-text-alt text-xs text-opacity-60">若下载器的下载速度在此速度之上时，不再添加种子</span>
        </label>
        <div class="flex gap-2">
          <input
            type="number"
            v-model="downloader.maxDownloadSpeed"
            class="input input-bordered flex-1"
          />
          <select v-model="downloader.maxDownloadSpeedUnit" class="select select-bordered w-32">
            <option value="KiB">KiB/s</option>
            <option value="MiB">MiB/s</option>
            <option value="GiB">GiB/s</option>
          </select>
        </div>
      </div>
      <div class="form-control">
        <label class="label">
          <span class="label-text">最小剩余空间</span>
          <span class="label-text-alt text-xs text-opacity-60">若下载器的剩余空间在此空间之下时，不再添加种子</span>
        </label>
        <div class="flex gap-2">
          <input
            type="number"
            v-model="downloader.minFreeSpace"
            class="input input-bordered flex-1"
          />
          <select v-model="downloader.minFreeSpaceUnit" class="select select-bordered w-32">
            <option value="KiB">KiB</option>
            <option value="MiB">MiB</option>
            <option value="GiB">GiB</option>
          </select>
        </div>
      </div>
      <div class="form-control">
        <label class="label">
          <span class="label-text">最大下载数量</span>
          <span class="label-text-alt text-xs text-opacity-60">最大的下载活动种子数量，在超过此数量时，将不会添加种子</span>
        </label>
        <input
          type="number"
          v-model="downloader.maxLeechNum"
          class="input input-bordered"
        />
      </div>
      <div class="form-control">
        <label class="label">
          <span class="label-text">自动删种</span>
        </label>
        <input
          type="checkbox"
          v-model="downloader.autoDelete"
          class="toggle toggle-primary"
        />
      </div>
      
      <!-- 新增的删种周期字段 -->
      <div class="form-control" v-if="downloader.autoDelete">
        <label class="label">
          <span class="label-text">删种周期</span>
          <span class="label-text-alt text-xs text-opacity-60">删种周期 Cron 表达式，默认为 1 分钟更新一次</span>
        </label>
        <input
          type="text"
          v-model="downloader.autoDeleteCron"
          class="input input-bordered"
          placeholder="* * * * *"
          required
        />
      </div>
      
      <!-- 新增的拒绝删种规则字段 -->
      <div class="form-control" v-if="downloader.autoDelete">
        <label class="label">
          <span class="label-text">拒绝删种规则</span>
          <span class="label-text-alt text-xs text-opacity-60">拒绝删种规则，种子状态符合其中一个时该种子不会被删除</span>
        </label>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-2">
          <label 
            v-for="deleteRule in deleteRules" 
            :key="deleteRule.id" 
            class="flex items-center gap-2 p-2 border rounded-lg"
          >
            <input
              type="checkbox"
              v-model="downloader.rejectDeleteRules"
              :value="deleteRule.id"
              class="checkbox checkbox-primary"
            />
            <span>{{ deleteRule.alias }}</span>
          </label>
        </div>
      </div>
      
      <!-- 新增的删种规则字段 -->
      <div class="form-control" v-if="downloader.autoDelete">
        <label class="label">
          <span class="label-text">删种规则</span>
          <span class="label-text-alt text-xs text-opacity-60">删种规则，种子状态符合其中一个时即触发删除种子操作</span>
        </label>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-2">
          <label 
            v-for="deleteRule in deleteRules" 
            :key="deleteRule.id" 
            class="flex items-center gap-2 p-2 border rounded-lg"
          >
            <input
              type="checkbox"
              v-model="downloader.deleteRules"
              :value="deleteRule.id"
              class="checkbox checkbox-primary"
            />
            <span>{{ deleteRule.alias }}</span>
          </label>
        </div>
      </div>
      
      <div class="form-control flex-row gap-2 pt-4">
        <button type="submit" class="btn btn-primary flex-1">应用 | 完成</button>
        <button type="button" class="btn btn-secondary flex-1" @click="clearDownloader">
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
      downloaders: [],
      notifications: [],
      deleteRules: [],
      downloader: {
        id: '',
        alias: '',
        username: '',
        password: '',
        clientUrl: '',
        enable: true,
        autoDelete: false,
        autoDeleteCron: '* * * * *',
        rejectDeleteRules: [],
        deleteRules: [],
        type: 'qBittorrent',
        pushNotify: false,
        notify: '',
        pushMonitor: false,
        monitor: '',
        cron: '*/4 * * * * *',
        autoReannounce: true,
        firstLastPiecePrio: true,
        spaceAlarm: false,
        alarmSpace: '',
        alarmSpaceUnit: 'GiB',
        maxUploadSpeed: '',
        maxUploadSpeedUnit: 'MiB',
        maxDownloadSpeed: '',
        maxDownloadSpeedUnit: 'MiB',
        minFreeSpace: '',
        minFreeSpaceUnit: 'GiB',
        maxLeechNum: ''
      },
      defaultDownloader: {
        id: '',
        alias: '',
        username: '',
        password: '',
        clientUrl: '',
        enable: true,
        autoDelete: false,
        autoDeleteCron: '* * * * *',
        rejectDeleteRules: [],
        deleteRules: [],
        type: 'qBittorrent',
        pushNotify: false,
        notify: '',
        pushMonitor: false,
        monitor: '',
        cron: '*/4 * * * * *',
        autoReannounce: true,
        firstLastPiecePrio: true,
        spaceAlarm: false,
        alarmSpace: '',
        alarmSpaceUnit: 'GiB',
        maxUploadSpeed: '',
        maxUploadSpeedUnit: 'MiB',
        maxDownloadSpeed: '',
        maxDownloadSpeedUnit: 'MiB',
        minFreeSpace: '',
        minFreeSpaceUnit: 'GiB',
        maxLeechNum: ''
      }
    };
  },
  methods: {
    async listDownloader() {
      try {
        const res = await this.$api().downloader.list();
        this.downloaders = res.data;
      } catch (e) {
        this.$message().error(e.message);
      }
    },
    async listNotification() {
      try {
        const res = await this.$api().notification.list();
        this.notifications = res.data;
      } catch (e) {
        this.$message().error(e.message);
      }
    },
    async listDeleteRule() {
      try {
        const res = await this.$api().deleteRule.list();
        this.deleteRules = res.data.sort((a, b) => a.alias.localeCompare(b.alias));
      } catch (e) {
        this.$message().error(e.message);
      }
    },
    async modifyDownloader() {
      try {
        await this.$api().downloader.modify({ ...this.downloader });
        this.$message().success((this.downloader.id ? '编辑' : '新增') + '成功, 列表正在刷新...');
        setTimeout(() => this.listDownloader(), 1000);
        this.clearDownloader();
      } catch (e) {
        this.$message().error(e.message);
      }
    },
    async deleteDownloader(record) {
      if (record.used) {
        this.$message().error('组件被占用, 取消占用后删除');
        return;
      }
      try {
        await this.$api().downloader.delete(record.id);
        this.$message().success('删除成功, 列表正在刷新...');
        await this.listDownloader();
      } catch (e) {
        this.$message().error(e.message);
      }
    },
    async enableDownloader(record) {
      try {
        await this.$api().downloader.modify({ ...record });
        this.$message().success('修改成功, 列表正在刷新...');
        setTimeout(() => this.listDownloader(), 1000);
        this.clearDownloader();
      } catch (e) {
        this.$message().error(e.message);
      }
    },
    modifyClick(record) {
      this.downloader = { ...record };
    },
    cloneClick(record) {
      this.downloader = { 
        ...record, 
        id: null, 
        alias: `${record.alias}-克隆`,
        deleteRules: Array.isArray(record.deleteRules) ? [...record.deleteRules] : [],
        rejectDeleteRules: Array.isArray(record.rejectDeleteRules) ? [...record.rejectDeleteRules] : []
      };
    },
    clearDownloader() {
      this.downloader = {
        ...this.defaultDownloader,
        deleteRules: [],
        rejectDeleteRules: []
      };
    },
    goto(record) {
      window.open(`/proxy/client/${record.id}/`);
    },
    gotoLog(record) {
      window.open(`/tool/clientLog?id=${record.id}`);
    }
  },
  async mounted() {
    this.clearDownloader();
    await Promise.all([
      this.listDownloader(), 
      this.listNotification(), 
      this.listDeleteRule()
    ]);
  }
};
</script>

<style scoped>
.downloader {
  width: 100%;
  max-width: 1440px;
  margin: 0 auto;
}
</style>