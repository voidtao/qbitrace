<template>
  <div>
    <h1 class="text-2xl font-bold">定时脚本</h1>
    <div class="divider"></div>
    
    <div class="overflow-x-auto">
      <table class="table table-zebra">
        <thead>
          <tr>
            <th>ID</th>
            <th>别名</th>
            <th>启用</th>
            <th>周期</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="record in scripts" :key="record.id">
            <td>{{ record.id }}</td>
            <td>{{ record.alias }}</td>
            <td>
              <span class="badge" :class="record.enable ? 'badge-success' : 'badge-error'">
                {{ record.enable ? '启用' : '禁用' }}
              </span>
            </td>
            <td>{{ record.cron }}</td>
            <td>
              <div class="flex gap-2">
                <button class="btn btn-sm btn-primary" @click="modifyClick(record)">编辑</button>
                <div class="dropdown dropdown-end">
                  <label tabindex="0" class="btn btn-sm btn-error">删除</label>
                  <div tabindex="0" class="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52">
                    <button class="btn btn-sm btn-error" @click="deleteScript(record)">确认删除</button>
                  </div>
                </div>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="divider"></div>
    <h2 class="text-xl font-bold">新增 | 编辑定时脚本</h2>
    
    <form @submit.prevent="modifyScript" class="space-y-4">
      <div class="form-control">
        <label class="label">
          <span class="label-text">别名</span>
          <span class="label-text-alt">给定时脚本取一个好记的名字</span>
        </label>
        <input type="text" v-model="script.alias" class="input input-bordered" required />
      </div>

      <div class="form-control">
        <label class="label cursor-pointer">
          <span class="label-text">启用</span>
          <span class="label-text-alt">选择是否启用定时脚本</span>
          <input type="checkbox" v-model="script.enable" class="toggle toggle-primary" />
        </label>
      </div>

      <div class="form-control">
        <label class="label">
          <span class="label-text">执行周期</span>
          <span class="label-text-alt">脚本的执行周期, 默认 * * * * * 一分钟执行一次</span>
        </label>
        <input type="text" v-model="script.cron" class="input input-bordered" required />
      </div>

      <div class="form-control">
        <label class="label">
          <span class="label-text">Code</span>
        </label>
        <textarea v-model="script.script" class="textarea textarea-bordered h-32" required></textarea>
      </div>

      <div class="flex gap-2">
        <button type="submit" class="btn btn-primary">应用 | 完成</button>
        <button type="button" class="btn btn-secondary" @click="run">立即执行一次</button>
        <button type="button" class="btn btn-ghost" @click="clearScript">清空</button>
      </div>
    </form>
  </div>
</template>

<script>
export default {
  data () {
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
    isMobile () {
      if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
        return true;
      } else {
        return false;
      }
    },
    async listScript () {
      this.loading = true;
      try {
        const res = await this.$api().script.list();
        this.scripts = res.data;
      } catch (e) {
        this.$message().error(e.message);
      }
      this.loading = false;
    },
    async modifyScript () {
      try {
        await this.$api().script.modify({ ...this.script });
        this.$message().success((this.script.id ? '编辑' : '新增') + '成功, 列表正在刷新...');
        setTimeout(() => this.listScript(), 1000);
        this.clearScript();
      } catch (e) {
        this.$message().error(e.message);
      }
    },
    async run () {
      try {
        await this.$api().script.run({ ...this.script });
        this.$message().success('执行成功, 执行结果或报错请查看日志');
        setTimeout(() => this.listScript(), 1000);
      } catch (e) {
        this.$message().error(e.message);
      }
    },
    modifyClick (row) {
      this.script = { ...row };
    },
    async deleteScript (row) {
      try {
        await this.$api().script.delete(row.id);
        this.$message().success('删除成功, 列表正在刷新...');
        await this.listScript();
      } catch (e) {
        this.$message().error(e.message);
      }
    },
    clearScript () {
      this.script = {
        ...this.defaultScript
      };
    }
  },
  async mounted () {
    this.clearScript();
    this.listScript();
  }
};
</script>
