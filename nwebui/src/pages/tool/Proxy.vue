<template>
  <div class="container mx-auto p-4">
    <h1 class="text-2xl font-bold mb-4">HTTP代理</h1>
    <div class="divider"></div>
    
    <div class="card bg-base-100 shadow-xs hover:shadow-md transition-all duration-300">
      <div class="card-body">
        <h2 class="card-title mb-6 text-base-content">
          <fa-icon :icon="['fas','globe']" class="mr-2 text-primary" />
          HTTP 代理设置
        </h2>
        
        <div class="bg-base-200/50 rounded-lg p-4 space-y-4 mb-6">
          <h3 class="font-medium text-base-content/80 mb-2">代理配置</h3>
          
          <div class="form-control">
            <label class="label">
              <span class="label-text text-base-content/80">HTTP 代理</span>
            </label>
            <input 
              type="text" 
              v-model="proxy"
              class="input input-bordered w-full bg-base-100 transition-all duration-200 focus:ring-2 focus:ring-primary focus:ring-opacity-50"
              placeholder="http://192.168.1.1:8080"
            />
            <span class="text-xs text-base-content/60 mt-2">格式为 http://192.168.1.1:8080</span>
          </div>

          <div class="form-control mt-4">
            <label class="label mb-2">
              <span class="label-text text-base-content/80">域名列表</span>
            </label>
            <textarea 
              v-model="domains" 
              class="textarea textarea-bordered h-48 w-full font-mono bg-base-100 transition-all duration-200 focus:ring-2 focus:ring-primary focus:ring-opacity-50"
              placeholder="www.baidu.com"
            ></textarea>
            <span class="text-xs text-base-content/60 mt-2">需要走 HTTP 代理的域名，一行一个，域名需完全匹配</span>
          </div>
          
          <div class="form-control mt-6">
            <button class="btn btn-primary w-full md:w-auto" @click="save">
              <fa-icon :icon="['fas','save']" class="mr-2" />
              保存
            </button>
          </div>
        </div>

        <div class="alert alert-info bg-info/10 text-info-content shadow-xs">
          <fa-icon :icon="['fas','info-circle']" class="mr-2 text-info" />
          <div>
            <div class="font-medium">说明:</div>
            <ul class="list-disc list-inside mt-2 space-y-1 text-sm text-base-content/80">
              <li>HTTP proxy 格式为 http://192.168.1.1:8080</li>
              <li>domains 指走 HTTP proxy 的域名列表，一行一个</li>
              <li>域名需完全匹配，例: www.baidu.com</li>
              <li>代理设置不支持绕过 Cloudflare 时使用</li>
            </ul>
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
    async getProxy() {
      try {
        const res = await this.$api().setting.getProxy();
        this.domains = res.data.domains;
        this.proxy = res.data.proxy;
      } catch (e) {
        await this.$message().error(e.message);
      }
    },
    async save() {
      try {
        await this.$api().setting.saveProxy({ proxy: this.proxy, domains: this.domains });
        await this.$message().success('保存成功');
      } catch (e) {
        await this.$message().error(e.message);
      }
    }
  },
  async mounted() {
    this.getProxy();
  }
};
</script>

<style scoped>
.container {
  max-width: 1440px;
}
</style>
