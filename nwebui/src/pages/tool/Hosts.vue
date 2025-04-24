<template>
  <div class="container mx-auto p-4">
    <h1 class="text-2xl font-bold mb-4">修改hosts</h1>
    <div class="divider"></div>
    
    <div class="card bg-base-100 shadow-xl">
      <div class="card-body">
        <div class="form-control mb-4">
          <textarea 
            v-model="hosts" 
            class="textarea textarea-bordered h-48"
            placeholder="输入 hosts 内容"
          ></textarea>
        </div>

        <div class="flex gap-2 mb-6">
          <button class="btn btn-primary" @click="save">保存</button>
          <button class="btn btn-secondary btn-sm" @click="_export">导出</button>
          <button class="btn btn-accent btn-sm ml-2" @click="_import">导入</button>
        </div>

        <div class="alert alert-info">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="stroke-current shrink-0 w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          <div>
            <div class="font-bold">说明:</div>
            <ol class="list-decimal list-inside mt-2 space-y-1 text-sm">
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
        const res = await window.$api.setting.getHosts()
        this.hosts = res.data
      } catch (e) {
        window.$toast.error(e.message)
      }
    },
    async save() {
      try {
        await window.$api.setting.save({ hosts: this.hosts })
        window.$toast.success('保存成功')
      } catch (e) {
        window.$toast.error(e.message)
      }
    },
    async _export() {
      try {
        await window.$api.setting.export()
        window.$toast.success('导出成功')
      } catch (e) {
        window.$toast.error(e.message)
      }
    },
    async _import() {
      try {
        await window.$api.setting.import()
        window.$toast.success('导入成功')
        this.getHosts()
      } catch (e) {
        window.$toast.error(e.message)
      }
    }
  },
  mounted() {
    this.getHosts()
  }
}
</script>

<style scoped>
.container {
  max-width: 1440px;
}
</style>
