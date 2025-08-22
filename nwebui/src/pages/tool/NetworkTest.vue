<template>
  <div class="container mx-auto p-4">
    <h1 class="text-2xl font-bold mb-4">网络工具</h1>
    <div class="divider"></div>
    
    <!-- 网络测试 -->
    <div class="card bg-base-100 shadow-xs hover:shadow-md transition-all duration-300">
      <div class="card-body">
        <h2 class="card-title mb-6 text-base-content">
          <fa-icon :icon="['fas','network-wired']" class="mr-2 text-primary" />
          网络测试
        </h2>
        
        <form @submit.prevent="doTest" class="space-y-6">
          <div class="bg-base-200/50 rounded-lg p-4 space-y-4">
            <h3 class="font-medium text-base-content/80 mb-2">测试参数</h3>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="form-control">
                <label class="label">
                  <span class="label-text text-base-content/80">测试地址</span>
                </label>
                <input 
                  type="text" 
                  v-model="info.address"
                  class="input input-bordered w-full bg-base-100 transition-all duration-200 focus:ring-2 focus:ring-primary focus:ring-opacity-50"
                  placeholder="输入要测试的地址"
                  required
                />
              </div>

              <div class="form-control">
                <label class="label">
                  <span class="label-text text-base-content/80">Cookie</span>
                </label>
                <input 
                  type="text" 
                  v-model="info.cookie"
                  class="input input-bordered w-full bg-base-100 transition-all duration-200 focus:ring-2 focus:ring-primary focus:ring-opacity-50"
                  placeholder="输入 Cookie（可选）"
                />
              </div>
            </div>
            
            <div class="form-control mt-4">
              <button type="submit" class="btn btn-primary w-full md:w-auto">
                <fa-icon :icon="['fas','play']" class="mr-2" />
                执行测试
              </button>
            </div>
          </div>
        </form>

        <!-- 测试结果 -->
        <div class="mt-6">
          <h3 class="font-medium text-base-content/80 mb-4">测试结果</h3>
          <div class="form-control">
            <textarea 
              v-model="result" 
              class="textarea textarea-bordered w-full h-60 font-mono bg-base-100 transition-all duration-200 focus:ring-2 focus:ring-primary focus:ring-opacity-50"
              readonly
            ></textarea>
          </div>
        </div>
      </div>
    </div>

    <!-- 修改hosts -->
    <div class="card bg-base-100 shadow-xs hover:shadow-md transition-all duration-300 mt-8">
      <div class="card-body">
        <h2 class="card-title mb-6 text-base-content">
          <fa-icon :icon="['fas','network-wired']" class="mr-2 text-primary" />
          修改hosts
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
            <button class="btn btn-primary" @click="saveHosts">
              <fa-icon :icon="['fas','save']" class="mr-1" />
              保存
            </button>
            <button class="btn btn-secondary btn-outline" @click="exportHosts">
              <fa-icon :icon="['fas','file-export']" class="mr-1" />
              导出
            </button>
            <button class="btn btn-accent btn-outline" @click="importHosts">
              <fa-icon :icon="['fas','file-import']" class="mr-1" />
              导入
            </button>
          </div>
        </div>

        <div class="alert alert-info bg-info/10 text-info-content shadow-xs">
          <fa-icon :icon="['fas','info-circle']" class="mr-2 text-info" />
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

    <!-- HTTP代理 -->
    <div class="card bg-base-100 shadow-xs hover:shadow-md transition-all duration-300 mt-8">
      <div class="card-body">
        <h2 class="card-title mb-6 text-base-content">
          <fa-icon :icon="['fas','globe']" class="mr-2 text-primary" />
          HTTP代理
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
            <button class="btn btn-primary w-full md:w-auto" @click="saveProxy">
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
      info: {
        address: '',
        cookie: ''
      },
      result: '',
      hosts: '',
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
    async doTest() {
      try {
        const res = await this.$api().setting.networkTest(this.info);
        this.result = res.data;
      } catch (e) {
        await this.$message().error(e.message);
      }
    },
    async getHosts() {
      try {
        const res = await this.$api().setting.getHosts();
        this.hosts = res.data;
      } catch (e) {
        await this.$message().error(e.message);
      }
    },
    async saveHosts() {
      try {
        await this.$api().setting.save({ hosts: this.hosts });
        await this.$message().success('保存成功');
      } catch (e) {
        await this.$message().error(e.message);
      }
    },
    async exportHosts() {
      try {
        await this.$api().setting.export();
        await this.$message().success('导出成功');
      } catch (e) {
        await this.$message().error(e.message);
      }
    },
    async importHosts() {
      try {
        await this.$api().setting.import();
        await this.$message().success('导入成功');
        this.getHosts();
      } catch (e) {
        await this.$message().error(e.message);
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
    async saveProxy() {
      try {
        await this.$api().setting.saveProxy({ proxy: this.proxy, domains: this.domains });
        await this.$message().success('保存成功');
      } catch (e) {
        await this.$message().error(e.message);
      }
    }
  },
  async mounted() {
    this.getHosts();
    this.getProxy();
  }
};
</script>

<style scoped>
.container {
  max-width: 1440px;
}
</style>