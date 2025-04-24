<template>
  <div class="container mx-auto p-4">
    <h1 class="text-2xl font-bold mb-4">http代理</h1>
    <div class="divider"></div>
    
    <div class="card bg-base-100 shadow-xl">
      <div class="card-body">
        <div class="form-control mb-4">
          <label class="label">
            <span class="label-text">HTTP 代理</span>
          </label>
          <input 
            type="text" 
            v-model="proxy"
            class="input input-bordered w-full"
            placeholder="http://192.168.1.1:8080"
          />
        </div>

        <div class="form-control mb-4">
          <label class="label">
            <span class="label-text">域名列表</span>
          </label>
          <textarea 
            v-model="domains" 
            class="textarea textarea-bordered h-48"
            placeholder="www.baidu.com"
          ></textarea>
        </div>

        <div class="form-control mb-6">
          <button class="btn btn-primary w-full md:w-auto" @click="save">保存</button>
        </div>

        <div class="alert alert-info">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="stroke-current shrink-0 w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          <div>
            <div class="font-bold">说明:</div>
            <ol class="list-decimal list-inside mt-2 space-y-1 text-sm">
              <li>http proxy 格式为 http://192.168.1.1:8080</li>
              <li>domains 指走 http proxy 的域名列表, 一行一个</li>
              <li>域名需完全匹配, 例: www.baidu.com</li>
              <li>代理设置不支持绕过 Cloudflare 时使用</li>
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
      proxy: '',
      domains: ''
    }
  },
  methods: {
    isMobile() {
      return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    },
    async getProxy() {
      try {
        const res = await window.$api.setting.getProxy()
        this.domains = res.data.domains
        this.proxy = res.data.proxy
      } catch (e) {
        window.$toast.error(e.message)
      }
    },
    async save() {
      try {
        await window.$api.setting.saveProxy({ proxy: this.proxy, domains: this.domains })
        window.$toast.success('保存成功')
      } catch (e) {
        window.$toast.error(e.message)
      }
    }
  },
  mounted() {
    this.getProxy()
  }
}
</script>

<style scoped>
.container {
  max-width: 1440px;
}
</style>
