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
              <button class="btn btn-sm btn-primary" @click="goto(record)">
                打开
              </button>
              <button class="btn btn-sm btn-secondary" @click="modifyClick(record)">
                编辑
              </button>
              <button class="btn btn-sm btn-accent" @click="cloneClick(record)">
                克隆
              </button>
              <button
                class="btn btn-sm btn-error"
                @click="deleteDownloader(record)"
              >
                删除
              </button>
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
      downloader: {
        id: '',
        alias: '',
        username: '',
        password: '',
        clientUrl: '',
        enable: true,
        autoDelete: false,
        type: 'qBittorrent'
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
        type: 'qBittorrent'
      };
    },
    goto(record) {
      window.open(`/proxy/client/${record.id}/`);
    }
  },
  async mounted() {
    this.listDownloader();
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