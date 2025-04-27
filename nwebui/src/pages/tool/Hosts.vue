<template>
  <div class="container mx-auto p-4">
    <h1 class="text-2xl font-bold mb-4">修改hosts</h1>
    <div class="divider"></div>
    
    <div class="card bg-base-100 shadow-xs hover:shadow-md transition-all duration-300">
      <div class="card-body">
        <h2 class="card-title mb-6 text-base-content">
          <i class="fas fa-network-wired mr-2 text-primary"></i>
          修改系统 Hosts
        </h2>
        
        <div class="bg-base-200/50 rounded-lg p-4 mb-6">
          <div class="form-control mb-4">
            <label class="label mb-2">
              <span class="label-text text-base-content/80">Hosts 内容</span>
            </label>
            <textarea 
              v-model="hosts" 
              class="textarea textarea-bordered h-48 w-full bg-base-100 transition-all duration-200 focus:ring-2 focus:ring-primary focus:ring-opacity-50 font-mono"
              placeholder="输入 hosts 内容"
            ></textarea>
          </div>

          <div class="flex flex-wrap gap-2">
            <button class="btn btn-primary" @click="save">
              <i class="fas fa-save mr-1"></i>
              保存
            </button>
            <button class="btn btn-secondary btn-outline" @click="_export">
              <i class="fas fa-file-export mr-1"></i>
              导出
            </button>
            <button class="btn btn-accent btn-outline" @click="_import">
              <i class="fas fa-file-import mr-1"></i>
              导入
            </button>
          </div>
        </div>

        <div class="alert alert-info bg-info/10 text-info-content shadow-xs">
          <i class="fas fa-info-circle mr-2 text-info"></i>
          <div>
            <div class="font-medium">说明:</div>
            <ol class="list-decimal list-inside mt-2 space-y-1 text-sm text-base-content/80">
              <li>输入框内容实时读取自文件 /etc/hosts</li>
              <li>保存是指将内容保存至 /etc/hosts</li>
              <li>导出是指将内容保存至 /etc/hosts 的内容复制至 qbitrace/data/hosts</li>
              <li>导入是指将内容保存至 qbitrace/data/hosts 的内容复制至 /etc/hosts</li>
              <li>内容格式同普通的 hosts</li>
              <li class="ml-8">例: 127.0.0.1 localhost</li>
              <li>输入框结尾至少保留一个空行</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      hosts: ''
    }
  },
  methods: {
    isMobile() {
      return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    },
    async getHosts() {
      try {
        const res = await this.$api().setting.getHosts()
        this.hosts = res.data
      } catch (e) {
        await this.$message().error(e.message)
      }
    },
    async save() {
      try {
        await this.$api().setting.save({ hosts: this.hosts })
        await this.$message().success('保存成功')
      } catch (e) {
        await this.$message().error(e.message)
      }
    },
    async _export() {
      try {
        await this.$api().setting.export()
        await this.$message().success('导出成功')
      } catch (e) {
        await this.$message().error(e.message)
      }
    },
    async _import() {
      try {
        await this.$api().setting.import()
        await this.$message().success('导入成功')
        this.getHosts()
      } catch (e) {
        await this.$message().error(e.message)
      }
    }
  },
  async mounted() {
    this.getHosts()
  }
}
</script>

<style scoped>
.container {
  max-width: 1440px;
}
</style>
