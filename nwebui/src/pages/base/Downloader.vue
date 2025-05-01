<template>
  <div class="container mx-auto p-4">
    <h1 class="text-2xl font-bold mb-4 text-base-content">下载器管理</h1>
    <div class="divider"></div>

    <!-- Downloader List Card -->
    <div class="card bg-base-100 shadow-xs hover:shadow-md transition-all duration-300 mb-8">
      <div class="card-body">
        <h2 class="card-title mb-4 text-base-content/90">下载器列表</h2>
        <div class="overflow-x-auto">
          <table class="table table-zebra w-full">
            <thead>
              <tr class="bg-base-200/50">
                <th class="text-base-content/70">ID</th>
                <th class="text-base-content/70">别名</th>
                <th class="text-base-content/70">启用</th>
                <th class="text-base-content/70">URL</th>
                <th class="text-base-content/70">自动删种</th>
                <th class="text-base-content/70">状态</th>
                <th class="text-base-content/70">操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="record in downloaders" 
                  :key="record.id"
                  class="hover:bg-base-200/30 transition-colors duration-200">
                <td class="text-base-content/80 text-sm">{{ record.id }}</td>
                <td class="text-base-content/90 font-medium">{{ record.alias }}</td>
                <td>
                  <input
                    type="checkbox"
                    class="toggle toggle-primary toggle-md"
                    :checked="record.enable"
                    :disabled="record.used"
                    @change="enableDownloader(record)"
                  />
                </td>
                <td class="text-base-content/80 text-sm">{{ record.clientUrl }}</td>
                <td>
                  <span
                    class="badge badge-sm"
                    :class="record.autoDelete ? 'badge-success' : 'badge-error'"
                  >
                    {{ record.autoDelete ? '启用' : '禁用' }}
                  </span>
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
                    <button class="btn btn-xs btn-outline btn-info" @click="goto(record)">
                      <fa-icon :icon="['fas', 'external-link-alt']" class="mr-1" />打开
                    </button>
                    <div class="dropdown dropdown-end">
                      <label tabindex="0" class="btn btn-xs btn-outline btn-secondary">
                        <fa-icon :icon="['fas', 'ellipsis-h']" class="mr-1" />操作
                      </label>
                      <ul tabindex="0" class="dropdown-content z-1 menu p-2 shadow-lg bg-base-100 rounded-lg w-32">
                        <li><a @click="modifyClick(record)"><fa-icon :icon="['fas', 'edit']" class="w-4 mr-2" />编辑</a></li>
                        <li><a @click="cloneClick(record)"><fa-icon :icon="['fas', 'copy']" class="w-4 mr-2" />克隆</a></li>
                        <li><a @click="gotoLog(record)"><fa-icon :icon="['fas', 'file-alt']" class="w-4 mr-2" />日志</a></li>
                        <li><hr class="my-1 border-base-300"></li>
                        <li>
                          <details>
                             <summary class="text-error"><fa-icon :icon="['fas', 'trash-alt']" class="w-4 mr-2" />删除</summary>
                             <ul class="p-2 bg-base-100 rounded-t-none">
                               <li><a class="text-error" @click="deleteDownloader(record)">确认删除</a></li>
                             </ul>
                           </details>
                        </li>
                      </ul>
                    </div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Add/Edit Downloader Card -->
    <div class="card bg-base-100 shadow-xs hover:shadow-md transition-all duration-300">
      <div class="card-body">
        <h2 class="card-title mb-6 text-base-content/90">
          <fa-icon :icon="['fas', 'edit']" class="mr-2 text-primary" />
          新增 | 编辑下载器
        </h2>
        
        <form @submit.prevent="modifyDownloader" class="space-y-6">
          <!-- 基本信息区域 -->
          <div class="bg-base-200/50 rounded-lg p-4 space-y-4">
             <h3 class="font-medium text-base-content/80 mb-2">基本信息</h3>
             <div class="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                <div class="form-control w-full">
                  <label class="label">
                    <span class="label-text text-base-content/80">别名</span>
                  </label>
                  <input
                    type="text"
                    v-model="downloader.alias"
                    class="input input-bordered w-full bg-base-100 transition-all duration-200 focus:ring-2 focus:ring-primary focus:ring-opacity-50"
                    placeholder="输入别名"
                    required
                  />
                  <span class="text-xs text-base-content/60 mt-1">给下载器取一个好记的名字</span>
                </div>
                
                <div class="form-control w-full">
                  <label class="label">
                    <span class="label-text text-base-content/80">下载器类型</span>
                  </label>
                  <select v-model="downloader.type" class="select select-bordered w-full bg-base-100 transition-all duration-200 focus:ring-2 focus:ring-primary focus:ring-opacity-50">
                    <option value="qBittorrent">qBittorrent</option>
                    <option value="Transmission">Transmission</option>
                    <option value="deluge">Deluge</option>
                  </select>
                  <span class="text-xs text-base-content/60 mt-1">目前完整支持 qBittorrent</span>
                </div>
                
                <div class="form-control w-full">
                  <label class="label">
                    <span class="label-text text-base-content/80">用户名</span>
                  </label>
                  <input
                    type="text"
                    v-model="downloader.username"
                    class="input input-bordered w-full bg-base-100 transition-all duration-200 focus:ring-2 focus:ring-primary focus:ring-opacity-50"
                    placeholder="输入用户名"
                    required
                  />
                </div>
                
                <div class="form-control w-full">
                  <label class="label">
                    <span class="label-text text-base-content/80">密码</span>
                  </label>
                  <input
                    type="password"
                    v-model="downloader.password"
                    class="input input-bordered w-full bg-base-100 transition-all duration-200 focus:ring-2 focus:ring-primary focus:ring-opacity-50"
                    placeholder="输入密码"
                    required
                  />
                </div>
                
                <div class="form-control w-full md:col-span-2">
                  <label class="label">
                    <span class="label-text text-base-content/80">URL</span>
                  </label>
                  <input
                    type="text"
                    v-model="downloader.clientUrl"
                    class="input input-bordered w-full bg-base-100 transition-all duration-200 focus:ring-2 focus:ring-primary focus:ring-opacity-50"
                    placeholder="例如 http://192.168.1.100:8080"
                    required
                  />
                  <span class="text-xs text-base-content/60 mt-1">下载器的链接, 结尾不要带 /</span>
                </div>
                
                <div class="form-control w-full">
                  <label class="label cursor-pointer justify-start gap-4">
                    <span class="label-text text-base-content/80">启用</span>
                    <input
                      type="checkbox"
                      v-model="downloader.enable"
                      :disabled="downloader.used"
                      class="toggle toggle-primary toggle-md"
                    />
                  </label>
                  <span class="text-xs text-base-content/60 mt-1">选择是否启用下载器</span>
                </div>
                
                <div class="form-control w-full">
                  <label class="label">
                    <span class="label-text text-base-content/80">信息更新周期 (Cron)</span>
                  </label>
                  <input
                    type="text"
                    v-model="downloader.cron"
                    class="input input-bordered w-full bg-base-100 transition-all duration-200 focus:ring-2 focus:ring-primary focus:ring-opacity-50"
                    placeholder="*/4 * * * * *"
                  />
                  <span class="text-xs text-base-content/60 mt-1">默认 4s 更新一次, 种子量过多请增加间隔</span>
                </div>
             </div>
          </div>
          
          <!-- 通知设置 -->
          <div class="bg-base-200/50 rounded-lg p-4 space-y-4">
            <h3 class="font-medium text-base-content/80 mb-2">通知设置</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                <div class="form-control w-full">
                  <label class="label cursor-pointer justify-start gap-4">
                    <span class="label-text text-base-content/80">推送通知</span>
                    <input
                      type="checkbox"
                      v-model="downloader.pushNotify"
                      class="toggle toggle-primary toggle-md"
                    />
                  </label>
                  <span class="text-xs text-base-content/60 mt-1">启用后，删种等操作会发送通知</span>
                </div>
                
                <div class="form-control w-full" v-if="downloader.pushNotify">
                  <label class="label">
                    <span class="label-text text-base-content/80">通知方式</span>
                  </label>
                  <select v-model="downloader.notify" class="select select-bordered w-full bg-base-100 transition-all duration-200 focus:ring-2 focus:ring-primary focus:ring-opacity-50" required>
                    <option disabled value="">选择通知方式</option>
                    <option v-for="notification in notifications" :key="notification.id" :value="notification.id">
                      {{ notification.alias }}
                    </option>
                  </select>
                  <span class="text-xs text-base-content/60 mt-1">在 <router-link to="/setting/notification" class="link link-primary">通知工具</router-link> 页面创建</span>
                </div>
                
                <div class="form-control w-full">
                  <label class="label cursor-pointer justify-start gap-4">
                    <span class="label-text text-base-content/80">监控频道</span>
                    <input
                      type="checkbox"
                      v-model="downloader.pushMonitor"
                      class="toggle toggle-primary toggle-md"
                    />
                  </label>
                   <span class="text-xs text-base-content/60 mt-1">启用后，下载器异常会发送通知</span>
                </div>
                
                <div class="form-control w-full" v-if="downloader.pushMonitor">
                  <label class="label">
                    <span class="label-text text-base-content/80">监控频道 (Telegram)</span>
                  </label>
                  <select v-model="downloader.monitor" class="select select-bordered w-full bg-base-100 transition-all duration-200 focus:ring-2 focus:ring-primary focus:ring-opacity-50" required>
                     <option disabled value="">选择 Telegram 通知方式</option>
                    <option v-for="notification in notifications" :key="notification.id" :value="notification.id" :disabled="notification.type !== 'telegram'">
                      {{ notification.alias }}
                    </option>
                  </select>
                   <span class="text-xs text-base-content/60 mt-1">仅支持 Telegram, 在 <router-link to="/setting/notification" class="link link-primary">通知工具</router-link> 页面创建</span>
                </div>
            </div>
          </div>
          
          <!-- 下载设置 -->
          <div class="bg-base-200/50 rounded-lg p-4 space-y-4">
            <h3 class="font-medium text-base-content/80 mb-2">下载设置</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                <div class="form-control w-full">
                  <label class="label cursor-pointer justify-start gap-4">
                    <span class="label-text text-base-content/80">自动汇报</span>
                    <input
                      type="checkbox"
                      v-model="downloader.autoReannounce"
                      class="toggle toggle-primary toggle-md"
                    />
                  </label>
                  <span class="text-xs text-base-content/60 mt-1">添加种子 2 分钟后自动汇报 Tracker</span>
                </div>
                
                <div class="form-control w-full">
                  <label class="label cursor-pointer justify-start gap-4">
                    <span class="label-text text-base-content/80">优先下载首尾块</span>
                    <input
                      type="checkbox"
                      v-model="downloader.firstLastPiecePrio"
                      class="toggle toggle-primary toggle-md"
                    />
                  </label>
                  <span class="text-xs text-base-content/60 mt-1">同 qBittorrent 设置</span>
                </div>
                
                <div class="form-control w-full">
                  <label class="label">
                    <span class="label-text text-base-content/80">最大下载数量</span>
                  </label>
                  <input
                    type="number"
                    v-model="downloader.maxLeechNum"
                    class="input input-bordered w-full bg-base-100 transition-all duration-200 focus:ring-2 focus:ring-primary focus:ring-opacity-50"
                    placeholder="留空表示不限制"
                  />
                  <span class="text-xs text-base-content/60 mt-1">下载中的种子超过此数量则不添加新种</span>
                </div>
            </div>
          </div>
          
          <!-- 限速和空间设置 -->
          <div class="bg-base-200/50 rounded-lg p-4 space-y-4">
            <h3 class="font-medium text-base-content/80 mb-2">限速与空间</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                <div class="form-control w-full">
                  <label class="label">
                    <span class="label-text text-base-content/80">上传速度上限</span>
                  </label>
                  <div class="join w-full">
                    <input
                      type="number"
                      v-model="downloader.maxUploadSpeed"
                      class="input input-bordered join-item flex-1 bg-base-100 transition-all duration-200 focus:ring-2 focus:ring-primary focus:ring-opacity-50"
                      placeholder="留空不限制"
                    />
                    <select v-model="downloader.maxUploadSpeedUnit" class="select select-bordered join-item w-28 bg-base-100 transition-all duration-200 focus:ring-2 focus:ring-primary focus:ring-opacity-50">
                      <option value="KiB">KiB/s</option>
                      <option value="MiB">MiB/s</option>
                      <option value="GiB">GiB/s</option>
                    </select>
                  </div>
                  <span class="text-xs text-base-content/60 mt-1">上传速度超过此值则不添加新种</span>
                </div>
                
                <div class="form-control w-full">
                  <label class="label">
                    <span class="label-text text-base-content/80">下载速度上限</span>
                  </label>
                   <div class="join w-full">
                    <input
                      type="number"
                      v-model="downloader.maxDownloadSpeed"
                      class="input input-bordered join-item flex-1 bg-base-100 transition-all duration-200 focus:ring-2 focus:ring-primary focus:ring-opacity-50"
                      placeholder="留空不限制"
                    />
                    <select v-model="downloader.maxDownloadSpeedUnit" class="select select-bordered join-item w-28 bg-base-100 transition-all duration-200 focus:ring-2 focus:ring-primary focus:ring-opacity-50">
                      <option value="KiB">KiB/s</option>
                      <option value="MiB">MiB/s</option>
                      <option value="GiB">GiB/s</option>
                    </select>
                  </div>
                  <span class="text-xs text-base-content/60 mt-1">下载速度超过此值则不添加新种</span>
                </div>
                
                <div class="form-control w-full">
                  <label class="label">
                    <span class="label-text text-base-content/80">最小剩余空间</span>
                  </label>
                  <div class="join w-full">
                    <input
                      type="number"
                      v-model="downloader.minFreeSpace"
                      class="input input-bordered join-item flex-1 bg-base-100 transition-all duration-200 focus:ring-2 focus:ring-primary focus:ring-opacity-50"
                      placeholder="留空不限制"
                    />
                    <select v-model="downloader.minFreeSpaceUnit" class="select select-bordered join-item w-28 bg-base-100 transition-all duration-200 focus:ring-2 focus:ring-primary focus:ring-opacity-50">
                      <option value="KiB">KiB</option>
                      <option value="MiB">MiB</option>
                      <option value="GiB">GiB</option>
                    </select>
                  </div>
                  <span class="text-xs text-base-content/60 mt-1">剩余空间低于此值则不添加新种</span>
                </div>
                
                <div class="form-control w-full">
                  <label class="label cursor-pointer justify-start gap-4">
                    <span class="label-text text-base-content/80">空间警告</span>
                    <input
                      type="checkbox"
                      v-model="downloader.spaceAlarm"
                      class="toggle toggle-primary toggle-md"
                    />
                  </label>
                  <span class="text-xs text-base-content/60 mt-1">启用后，空间低于阈值会发送通知</span>
                </div>
                
                <div class="form-control w-full" v-if="downloader.spaceAlarm">
                  <label class="label">
                    <span class="label-text text-base-content/80">空间警告阈值</span>
                  </label>
                  <div class="join w-full">
                    <input
                      type="number"
                      v-model="downloader.alarmSpace"
                      class="input input-bordered join-item flex-1 bg-base-100 transition-all duration-200 focus:ring-2 focus:ring-primary focus:ring-opacity-50"
                      placeholder="输入阈值"
                      required
                    />
                    <select v-model="downloader.alarmSpaceUnit" class="select select-bordered join-item w-28 bg-base-100 transition-all duration-200 focus:ring-2 focus:ring-primary focus:ring-opacity-50">
                      <option value="KiB">KiB</option>
                      <option value="MiB">MiB</option>
                      <option value="GiB">GiB</option>
                    </select>
                  </div>
                  <span class="text-xs text-base-content/60 mt-1">剩余空间低于此值发送通知 (15分钟/次)</span>
                </div>
            </div>
          </div>
          
          <!-- 自动删种设置 -->
          <div class="bg-base-200/50 rounded-lg p-4 space-y-4">
            <h3 class="font-medium text-base-content/80 mb-2">自动删种</h3>
            
            <div class="form-control w-full">
              <label class="label cursor-pointer justify-start gap-4">
                <span class="label-text text-base-content/80">启用自动删种</span>
                <input
                  type="checkbox"
                  v-model="downloader.autoDelete"
                  class="toggle toggle-primary toggle-md"
                />
              </label>
            </div>
            
            <div v-if="downloader.autoDelete" class="space-y-4 pt-2 border-t border-base-300/50">
                <div class="form-control w-full">
                  <label class="label">
                    <span class="label-text text-base-content/80">删种周期 (Cron)</span>
                  </label>
                  <input
                    type="text"
                    v-model="downloader.autoDeleteCron"
                    class="input input-bordered w-full bg-base-100 transition-all duration-200 focus:ring-2 focus:ring-primary focus:ring-opacity-50"
                    placeholder="* * * * *"
                    required
                  />
                  <span class="text-xs text-base-content/60 mt-1">默认 1 分钟检查一次</span>
                </div>
                
                <div class="form-control w-full">
                  <label class="label">
                    <span class="label-text text-base-content/80">拒绝删种规则</span>
                  </label>
                  <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 p-3 border rounded-lg bg-base-100/50">
                    <label 
                      v-for="deleteRule in deleteRules" 
                      :key="deleteRule.id" 
                      class="flex items-center gap-2 cursor-pointer p-1 rounded-sm hover:bg-base-200/50"
                    >
                      <input
                        type="checkbox"
                        v-model="downloader.rejectDeleteRules"
                        :value="deleteRule.id"
                        class="checkbox checkbox-primary checkbox-xs"
                      />
                      <span class="text-sm text-base-content/90">{{ deleteRule.alias }}</span>
                    </label>
                  </div>
                  <span class="text-xs text-base-content/60 mt-1">满足任一选中规则的种子 <span class="font-bold text-warning">不会</span> 被自动删除</span>
                </div>
                
                <div class="form-control w-full">
                  <label class="label">
                    <span class="label-text text-base-content/80">删种规则</span>
                  </label>
                  <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 p-3 border rounded-lg bg-base-100/50">
                    <label 
                      v-for="deleteRule in deleteRules" 
                      :key="deleteRule.id" 
                      class="flex items-center gap-2 cursor-pointer p-1 rounded-sm hover:bg-base-200/50"
                    >
                      <input
                        type="checkbox"
                        v-model="downloader.deleteRules"
                        :value="deleteRule.id"
                        class="checkbox checkbox-primary checkbox-xs"
                      />
                      <span class="text-sm text-base-content/90">{{ deleteRule.alias }}</span>
                    </label>
                  </div>
                   <span class="text-xs text-base-content/60 mt-1">满足任一选中规则的种子 <span class="font-bold text-error">会</span> 被自动删除 (需同时不满足拒绝规则)</span>
                </div>
            </div>
          </div>
          
          <!-- Action Buttons -->
          <div class="form-control pt-4">
             <div class="flex flex-col md:flex-row gap-4">
                <button type="submit" class="btn btn-primary flex-1">
                  <fa-icon :icon="['fas', 'save']" class="mr-2" />
                  {{ downloader.id ? '保存修改' : '确认新增' }}
                </button>
                <button type="button" class="btn btn-ghost flex-1" @click="clearDownloader">
                  <fa-icon :icon="['fas', 'times']" class="mr-2" />
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
export default {
  data() {
    return {
      downloaders: [],
      notifications: [],
      deleteRules: [],
      downloader: {},
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
    isMobile() {
      if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
        return true;
      } else {
        return false;
      }
    },
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
        // 排序保持一致
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
        // 如果当前正在编辑的是被删除的下载器，清空表单
        if (this.downloader.id === record.id) {
          this.clearDownloader();
        }
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
      // 滚动到表单
      this.$el.querySelector('form').scrollIntoView({ behavior: 'smooth' });
    },
    cloneClick(record) {
      this.downloader = { ...record, deleteRules: [...record.deleteRules] };
      this.downloader.id = null;
      this.downloader.alias = this.downloader.alias + '-克隆';
      // 滚动到表单
      this.$el.querySelector('form').scrollIntoView({ behavior: 'smooth' });
    },
    clearDownloader() {
      // 重置为默认状态
      this.downloader = {
        ...this.defaultDownloader,
        deleteRules: []
      };
    },
    goto(record) {
      window.open(`/proxy/client/${record.id}/`, '_blank');
    },
    gotoLog(record) {
      window.open(`/tool/clientLog?id=${record.id}`, '_blank');
    }
  },
  async mounted() {
    this.clearDownloader();
    // 并行加载初始数据
    await Promise.all([
      this.listDownloader(),
      this.listNotification(),
      this.listDeleteRule()
    ]);
  }
};
</script>

<style scoped>

.container {
  max-width: 1440px;
}

/* Improve spacing for joined inputs/selects */
.join > *:not(:first-child) {
  margin-left: -1px; 
}

/* Consistent height for form elements */
.select, .input {
  min-height: 2.5rem; /* Adjust as needed */
  height: 2.5rem;
}
.textarea {
  min-height: 6rem;
}
.toggle {
  height: 1.5rem; /* Adjust toggle size if needed */
}

/* Ensure dropdown content is above other elements */
.dropdown-content {
  z-index: 50; 
}
</style>