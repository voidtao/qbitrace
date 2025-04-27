<template>
  <div class="container mx-auto p-4">
    <h1 class="text-2xl font-bold mb-4">定时脚本</h1>
    <div class="divider"></div>
    
    <div class="card bg-base-100 shadow-xs hover:shadow-md transition-all duration-300 mb-8">
      <div class="card-body">
        <h2 class="card-title mb-6 text-base-content">定时脚本列表</h2>
        <div class="overflow-x-auto">
          <table class="table table-zebra w-full">
            <thead>
              <tr class="bg-base-200/50">
                <th class="text-base-content/70">ID</th>
                <th class="text-base-content/70">别名</th>
                <th class="text-base-content/70">启用</th>
                <th class="text-base-content/70">周期</th>
                <th class="text-base-content/70">操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="script in scripts" :key="script.id" class="hover:bg-base-200/30 transition-colors duration-200">
                <td class="text-base-content/80">{{ script.id }}</td>
                <td class="text-base-content/80 font-medium">{{ script.alias }}</td>
                <td>
                  <span
                    class="badge badge-sm"
                    :class="script.enable ? 'badge-success' : 'badge-error'"
                  >
                    {{ script.enable ? '启用' : '禁用' }}
                  </span>
                </td>
                <td class="font-mono text-base-content/80">{{ script.cron }}</td>
                <td>
                  <div class="flex gap-2">
                    <button class="btn btn-sm btn-secondary btn-outline" @click="modifyClick(script)">
                      <i class="fas fa-edit mr-1"></i>
                      编辑
                    </button>
                    <div class="dropdown dropdown-end">
                      <label tabindex="0" class="btn btn-sm btn-error btn-outline">
                        <i class="fas fa-trash-alt mr-1"></i>
                        删除
                      </label>
                      <div tabindex="0" class="dropdown-content menu p-2 shadow-lg bg-base-100 rounded-lg w-52">
                        <div class="p-2 text-sm text-base-content/70 text-center">确认删除此脚本？</div>
                        <button class="btn btn-sm btn-error w-full" @click="deleteScript(script)">
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

    <div class="card bg-base-100 shadow-xs hover:shadow-md transition-all duration-300">
      <div class="card-body">
        <h2 class="card-title mb-6 text-base-content">
          <i class="fas fa-edit mr-2 text-primary"></i>
          新增 | 编辑定时脚本
        </h2>
        <form @submit.prevent="modifyScript" class="space-y-6">
          <div class="bg-base-200/50 rounded-lg p-4 space-y-4">
            <h3 class="font-medium text-base-content/80 mb-2">基本信息</h3>
            <div class="form-control">
              <label class="label">
                <span class="label-text text-base-content/80">别名</span>
              </label>
              <input 
                type="text" 
                v-model="script.alias"
                class="input input-bordered w-full bg-base-100 transition-all duration-200 focus:ring-2 focus:ring-primary focus:ring-opacity-50"
                placeholder="给定时脚本取一个好记的名字"
                required
              />
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              <div class="form-control bg-base-100 rounded-lg p-3">
                <div class="flex items-center justify-between">
                  <div>
                    <span class="text-base-content/80 font-medium">启用脚本</span>
                    <p class="text-xs text-base-content/60 mt-1">选择是否启用定时脚本</p>
                  </div>
                  <input
                    type="checkbox"
                    v-model="script.enable"
                    class="toggle toggle-primary"
                  />
                </div>
              </div>
            </div>

            <div class="form-control">
              <label class="label">
                <span class="label-text text-base-content/80">执行周期</span>
              </label>
              <input 
                type="text" 
                v-model="script.cron"
                class="input input-bordered w-full bg-base-100 transition-all duration-200 focus:ring-2 focus:ring-primary focus:ring-opacity-50"
                placeholder="* * * * *"
                required
              />
              <span class="text-xs text-base-content/60 mt-2">脚本的执行周期，默认 * * * * * 一分钟执行一次</span>
            </div>
          </div>

          <div class="bg-base-200/50 rounded-lg p-4">
            <h3 class="font-medium text-base-content/80 mb-4">脚本代码</h3>
            <div class="form-control">
              <textarea 
                v-model="script.script"
                class="textarea textarea-bordered w-full h-64 font-mono bg-base-100 transition-all duration-200 focus:ring-2 focus:ring-primary focus:ring-opacity-50"
                placeholder="logger.info('qbitrace IS THE BEST!')"
                required
              ></textarea>
              <span class="text-xs text-base-content/60 mt-2">
                <i class="fas fa-info-circle mr-1"></i>
                自定义JavaScript代码，可使用内置API如logger.info()等
              </span>
            </div>
          </div>

          <!-- 操作按钮 -->
          <div class="form-control mt-8">
            <div class="flex flex-col md:flex-row gap-4">
              <button type="submit" class="btn btn-primary flex-1">
                <i class="fas fa-save mr-2"></i>
                保存脚本
              </button>
              <button type="button" class="btn btn-secondary flex-1" @click="run">
                <i class="fas fa-play mr-2"></i>
                立即执行
              </button>
              <button type="button" class="btn btn-ghost flex-1" @click="clearScript">
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
export default {
  data() {
    const columns = [
      {
        title: 'ID',
        dataIndex: 'id',
        width: 18,
        fixed: true
      }, {
        title: '别名',
        dataIndex: 'alias',
        width: 20
      }, {
        title: '启用',
        dataIndex: 'enable',
        width: 15
      }, {
        title: '周期',
        dataIndex: 'cron',
        width: 24
      }, {
        title: '操作',
        width: 24
      }
    ];
    return {
      columns,
      scripts: [],
      script: {},
      defaultScript: {
        enable: true,
        cron: '* * * * *',
        script: 'logger.info(\'qbitrace IS THE BEST!\')'
      },
      loading: true
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
    async listScript() {
      this.loading = true;
      try {
        const res = await this.$api().script.list();
        this.scripts = res.data;
      } catch (e) {
        this.$message().error(e.message);
      }
      this.loading = false;
    },
    async modifyScript() {
      try {
        await this.$api().script.modify({ ...this.script });
        this.$message().success((this.script.id ? '编辑' : '新增') + '成功, 列表正在刷新...');
        setTimeout(() => this.listScript(), 1000);
        this.clearScript();
      } catch (e) {
        this.$message().error(e.message);
      }
    },
    async run() {
      try {
        await this.$api().script.run({ ...this.script });
        this.$message().success('执行成功, 执行结果或报错请查看日志');
        setTimeout(() => this.listScript(), 1000);
      } catch (e) {
        this.$message().error(e.message);
      }
    },
    modifyClick(row) {
      this.script = { ...row };
    },
    async deleteScript(row) {
      try {
        await this.$api().script.delete(row.id);
        this.$message().success('删除成功, 列表正在刷新...');
        await this.listScript();
      } catch (e) {
        this.$message().error(e.message);
      }
    },
    clearScript() {
      this.script = {
        ...this.defaultScript
      };
    }
  },
  async mounted() {
    this.clearScript();
    this.listScript();
  }
};
</script>

<style scoped>
.container {
  max-width: 1440px;
}
</style>