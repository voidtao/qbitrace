<template>
  <div>
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
        </label>
        <input
          type="checkbox"
          v-model="downloader.enable"
          class="toggle toggle-primary"
        />
      </div>
      <div class="form-control">
        <label class="label">
          <span class="label-text">下载器类型</span>
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
        </label>
        <select v-model="downloader.notify" class="select select-bordered">
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
        </label>
        <select v-model="downloader.monitor" class="select select-bordered">
          <option v-for="notification in notifications" :key="notification.id" :value="notification.id" :disabled="notification.type !== 'telegram'">
            {{ notification.alias }}
          </option>
        </select>
      </div>
      <div class="form-control">
        <label class="label">
          <span class="label-text">信息更新周期</span>
        </label>
        <input
          type="text"
          v-model="downloader.cron"
          class="input input-bordered"
          placeholder="默认为 4s 更新一次"
        />
      </div>
      <div class="form-control">
        <label class="label">
          <span class="label-text">自动汇报</span>
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
      <div class="form-control">
        <button type="submit" class="btn btn-primary">保存</button>
        <button type="button" class="btn btn-secondary" @click="clearDownloader">
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
      downloader: {
        id: '',
        alias: '',
        username: '',
        password: '',
        clientUrl: '',
        enable: true,
        autoDelete: false,
        type: 'qBittorrent',
        pushNotify: false,
        notify: '',
        pushMonitor: false,
        monitor: '',
        cron: '',
        autoReannounce: false,
        firstLastPiecePrio: false,
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
    async modifyDownloader() {
      try {
        await this.$api().downloader.modify({ ...this.downloader });
        this.$message().success('保存成功');
        this.listDownloader();
        this.clearDownloader();
      } catch (e) {
        this.$message().error(e.message);
      }
    },
    async deleteDownloader(record) {
      try {
        await this.$api().downloader.delete(record.id);
        this.$message().success('删除成功');
        this.listDownloader();
      } catch (e) {
        this.$message().error(e.message);
      }
    },
    async enableDownloader(record) {
      try {
        await this.$api().downloader.modify({ ...record });
        this.$message().success('状态更新成功');
        this.listDownloader();
      } catch (e) {
        this.$message().error(e.message);
      }
    },
    modifyClick(record) {
      this.downloader = { ...record };
    },
    cloneClick(record) {
      this.downloader = { ...record, id: null, alias: `${record.alias}-克隆` };
    },
    clearDownloader() {
      this.downloader = {
        id: '',
        alias: '',
        username: '',
        password: '',
        clientUrl: '',
        enable: true,
        autoDelete: false,
        type: 'qBittorrent',
        pushNotify: false,
        notify: '',
        pushMonitor: false,
        monitor: '',
        cron: '',
        autoReannounce: false,
        firstLastPiecePrio: false,
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
      };
    },
    goto(record) {
      window.open(`/proxy/client/${record.id}/`);
    },
    gotoLog(record) {
      window.open(`/proxy/client/${record.id}/log`);
    }
  },
  async mounted() {
    await Promise.all([this.listDownloader(), this.listNotification()]);
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