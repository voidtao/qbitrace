<template>
  <div class="container mx-auto p-4">
    <h1 class="text-2xl font-bold mb-4">定时脚本</h1>
    <div class="divider"></div>
    
    <div class="card bg-base-100 shadow-xl mb-6">
      <div class="card-body">
        <h2 class="text-xl font-bold mb-4">定时脚本列表</h2>
        <div class="overflow-x-auto">
          <table class="table table-zebra w-full">
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
              <tr v-for="script in scripts" :key="script.id">
                <td>{{ script.id }}</td>
                <td>{{ script.alias }}</td>
                <td>
                  <div class="badge" :class="script.enable ? 'badge-success' : 'badge-error'">
                    {{ script.enable ? '启用' : '禁用' }}
                  </div>
                </td>
                <td class="font-mono">{{ script.cron }}</td>
                <td>
                  <div class="flex gap-2">
                    <button class="btn btn-sm btn-primary" @click="modifyClick(script)">编辑</button>
                    <div class="dropdown dropdown-end">
                      <label tabindex="0" class="btn btn-sm btn-error">删除</label>
                      <ul tabindex="0" class="dropdown-content z-1 menu p-2 shadow-sm bg-base-100 rounded-box w-52">
                        <li>
                          <button @click="deleteScript(script)" class="text-error">确认删除</button>
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

    <div class="card bg-base-100 shadow-xl">
      <div class="card-body">
        <h2 class="card-title mb-4">新增 | 编辑定时脚本</h2>
        
        <form @submit.prevent="modifyScript" class="space-y-4">
          <div class="form-control">
            <label class="label">
              <span class="label-text">别名</span>
            </label>
            <input 
              type="text" 
              v-model="script.alias"
              class="input input-bordered w-full"
              placeholder="给定时脚本取一个好记的名字"
              required
            />
            <label class="label">
              <span class="label-text-alt">给定时脚本取一个好记的名字</span>
            </label>
          </div>

          <div class="form-control">
            <label class="label cursor-pointer">
              <span class="label-text">启用</span>
              <input type="checkbox" v-model="script.enable" class="checkbox checkbox-primary" />
            </label>
            <label class="label">
              <span class="label-text-alt">选择是否启用定时脚本</span>
            </label>
          </div>

          <div class="form-control">
            <label class="label">
              <span class="label-text">执行周期</span>
            </label>
            <input 
              type="text" 
              v-model="script.cron"
              class="input input-bordered w-full"
              placeholder="* * * * *"
              required
            />
            <label class="label">
              <span class="label-text-alt">脚本的执行周期, 默认 * * * * * 一分钟执行一次</span>
            </label>
          </div>

          <div class="form-control">
            <label class="label">
              <span class="label-text">Code</span>
            </label>
            <textarea 
              v-model="script.script"
              class="textarea textarea-bordered w-full h-48 font-mono"
              placeholder="logger.info('qbitrace IS THE BEST!')"
              required
            ></textarea>
          </div>

          <div class="flex flex-wrap gap-2 mt-6">
            <button type="submit" class="btn btn-primary">应用 | 完成</button>
            <button type="button" class="btn btn-secondary" @click="run">立即执行一次</button>
            <button type="button" class="btn" @click="clearScript">清空</button>
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
      scripts: [],
      script: {},
      defaultScript: {
        enable: true,
        cron: '* * * * *',
        script: 'logger.info(\'qbitrace IS THE BEST!\')'
      },
      loading: false
    }
  },
  methods: {
    isMobile() {
      return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    },
    async listScript() {
      this.loading = true
      try {
        const res = await window.$api.script.list()
        this.scripts = res.data
      } catch (e) {
        window.$toast.error(e.message)
      }
      this.loading = false
    },
    async modifyScript() {
      try {
        await window.$api.script.modify({ ...this.script })
        window.$toast.success((this.script.id ? '编辑' : '新增') + '成功, 列表正在刷新...')
        setTimeout(() => this.listScript(), 1000)
        this.clearScript()
      } catch (e) {
        window.$toast.error(e.message)
      }
    },
    async run() {
      try {
        await window.$api.script.run({ ...this.script })
        window.$toast.success('执行成功, 执行结果或报错请查看日志')
        setTimeout(() => this.listScript(), 1000)
      } catch (e) {
        window.$toast.error(e.message)
      }
    },
    modifyClick(row) {
      this.script = { ...row }
    },
    async deleteScript(row) {
      try {
        await window.$api.script.delete(row.id)
        window.$toast.success('删除成功, 列表正在刷新...')
        await this.listScript()
      } catch (e) {
        window.$toast.error(e.message)
      }
    },
    clearScript() {
      this.script = {
        ...this.defaultScript
      }
    }
  },
  mounted() {
    this.clearScript()
    this.listScript()
  }
}
</script>

<style scoped>
.container {
  max-width: 1440px;
}
</style>