<template>
  <div class="container mx-auto p-4">
    <h1 class="text-2xl font-bold mb-4">基础设置</h1>
    <div class="divider"></div>
    
    <div class="card bg-base-100 shadow-xs hover:shadow-md transition-all duration-300">
      <div class="card-body">
        <form @submit.prevent="modify" class="space-y-6">
          <div class="form-control">
            <label class="label">
              <span class="label-text text-base-content/80">User-Agent</span>
            </label>
            <input 
              type="text" 
              v-model="setting.userAgent"
              class="input input-bordered w-full transition-all duration-200 focus:ring-2 focus:ring-primary focus:ring-opacity-50"
              placeholder="所有网络请求所用的 User-Agent, 默认为 qbitrace"
            />
          </div>

          <div class="form-control">
            <label class="label">
              <span class="label-text text-base-content/80">日志级别</span>
            </label>
            <select 
              v-model="setting.loggerLevel"
              class="select select-bordered w-full transition-all duration-200 focus:ring-2 focus:ring-primary focus:ring-opacity-50"
            >
              <option value="info">INFO</option>
              <option value="debug">DEBUG</option>
              <option value="trace">TRACE</option>
              <option value="all">ALL</option>
            </select>
            <label class="label">
              <span class="label-text-alt">选择日志记录的最低级别, qbitrace默认记录所有日志, 重启后生效</span>
            </label>
          </div>

          <div class="form-control">
            <label class="label">
              <span class="label-text text-base-content/80">Telegram 代理</span>
            </label>
            <input 
              type="text" 
              v-model="setting.telegramProxy"
              class="input input-bordered w-full transition-all duration-200 focus:ring-2 focus:ring-primary focus:ring-opacity-50"
              placeholder="Nginx 或 Caddy 等软件反代 Telegram 域名 api.telegram.org 后的地址, 格式: http(s)://ip:port"
            />
          </div>

          <div class="form-control">
            <label class="label">
              <span class="label-text text-base-content/80">企业微信代理</span>
            </label>
            <input 
              type="text" 
              v-model="setting.wechatProxy"
              class="input input-bordered w-full transition-all duration-200 focus:ring-2 focus:ring-primary focus:ring-opacity-50"
              placeholder="Nginx 或 Caddy 等软件反代企业微信域名 qyapi.weixin.qq.com 后的地址, 格式: http(s)://ip:port/"
            />
          </div>

          <div class="form-control bg-base-200/50 rounded-lg p-4">
            <label class="label cursor-pointer justify-between">
              <span class="label-text text-base-content/80">隐藏报错提示</span>
              <input 
                type="checkbox" 
                v-model="setting.ignoreError"
                class="checkbox checkbox-primary transition-all duration-200"
              />
            </label>
            <label class="label mt-1">
              <span class="label-text-alt text-base-content/60">进入首页后不提示报错信息</span>
            </label>
          </div>

          <div class="form-control bg-base-200/50 rounded-lg p-4">
            <label class="label cursor-pointer justify-between">
              <span class="label-text text-base-content/80">取消部分依赖检查</span>
              <input 
                type="checkbox" 
                v-model="setting.ignoreDependCheck"
                class="checkbox checkbox-primary transition-all duration-200"
              />
            </label>
            <label class="label mt-1">
              <span class="label-text-alt text-base-content/60">取消部分依赖检查，请谨慎使用</span>
            </label>
          </div>

          <div class="form-control mt-8">
            <button type="submit" 
                    class="btn btn-primary w-full md:w-auto transition-all duration-200 hover:shadow-lg">
              保存设置
            </button>
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
      setting: {}
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
    async get() {
      try {
        const s = (await this.$api().setting.get()).data;
        this.setting = {
          userAgent: s.userAgent,
          loggerLevel: s.loggerLevel,
          telegramProxy: s.telegramProxy,
          wechatProxy: s.wechatProxy,
          ignoreError: s.ignoreError,
          ignoreDependCheck: s.ignoreDependCheck
        };
      } catch (e) {
        await this.$message().error(e.message);
      }
    },
    async modify() {
      try {
        await this.$api().setting.modify(this.setting);
        await this.$message().success('修改成功, 部分设置可能需要刷新页面生效.');
        this.get();
      } catch (e) {
        await this.$message().error(e.message);
      }
    }
  },
  async mounted() {
    await this.get();
  }
};
</script>

<style scoped>
.container {
  max-width: 1440px;
}
</style>