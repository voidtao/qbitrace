<template>
  <div class="container mx-auto p-4">
    <h1 class="text-2xl font-bold mb-4">基础设置</h1>
    <div class="divider"></div>
    
    <div class="card bg-base-100 shadow-xs hover:shadow-md transition-all duration-300">
      <div class="card-body">
        <form @submit.prevent="modify" class="space-y-6">
          <!-- 原有的基础设置 -->
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

          <!-- 主题设置部分 -->
          <div class="divider my-6"></div>
          <h2 class="text-lg font-semibold mb-4 text-base-content/80">主题设置</h2>

          <div class="form-control">
            <label class="label">
              <span class="label-text text-base-content/80">主题</span>
            </label>
            <div class="flex flex-wrap gap-4">
              <label class="label cursor-pointer bg-base-200/30 rounded-lg px-3 py-2 transition-all duration-200 hover:bg-primary/10">
                <input type="radio" name="theme" value="pastel" v-model="setting.theme" class="radio radio-primary mr-2" />
                <span class="label-text">可爱</span>
              </label>
              <label class="label cursor-pointer bg-base-200/30 rounded-lg px-3 py-2 transition-all duration-200 hover:bg-primary/10">
                <input type="radio" name="theme" value="dim" v-model="setting.theme" class="radio radio-primary mr-2" />
                <span class="label-text">暗色</span>
              </label>
              <label class="label cursor-pointer bg-base-200/30 rounded-lg px-3 py-2 transition-all duration-200 hover:bg-primary/10">
                <input type="radio" name="theme" value="cmyk" v-model="setting.theme" class="radio radio-primary mr-2" />
                <span class="label-text">亮色</span>
              </label>
            </div>
          </div>

          <div class="form-control">
            <label class="label">
              <span class="label-text text-base-content/80">背景图片</span>
            </label>
            <input 
              type="text" 
              v-model="setting.background"
              class="input input-bordered w-full transition-all duration-200 focus:ring-2 focus:ring-primary focus:ring-opacity-50"
              placeholder="背景图片链接"
            />
            <label class="label">
              <span class="label-text-alt text-base-content/60">背景图片链接</span>
            </label>
          </div>

          <div class="form-control">
            <label class="label">
              <span class="label-text text-base-content/80">通知默认封面</span>
            </label>
            <input 
              type="text" 
              v-model="setting.wechatCover"
              class="input input-bordered w-full transition-all duration-200 focus:ring-2 focus:ring-primary focus:ring-opacity-50"
              placeholder="通知时使用的默认封面, 留空显示 qbitrace Logo"
            />
            <label class="label">
              <span class="label-text-alt text-base-content/60">通知时使用的默认封面, 留空显示 qbitrace Logo</span>
            </label>
          </div>

          <div class="form-control">
            <label class="label">
              <span class="label-text text-base-content/80">首页显示内容</span>
            </label>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
              <label class="flex items-center p-3 bg-base-200/30 rounded-lg cursor-pointer hover:bg-primary/5 transition-all duration-200" 
                     v-for="type in contentType" 
                     :key="type.key">
                <input 
                  type="checkbox" 
                  v-model="setting.dashboardContent"
                  :value="type.key"
                  class="checkbox checkbox-primary mr-3 transition-all duration-200"
                />
                <span class="text-base-content/80">{{ type.text }}</span>
              </label>
            </div>
            <label class="label">
              <span class="label-text-alt text-base-content/60">选择首页数据展示</span>
            </label>
          </div>

          <div class="divider my-6"></div>

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
              <fa-icon :icon="['fas','save']" class="mr-2" />
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
      setting: {
        dashboardContent: []
      },
      contentType: [
        {
          key: 'downloader',
          text: '客户端'
        }
      ]
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
          ignoreDependCheck: s.ignoreDependCheck,
          theme: s.theme || 'pastel',
          background: s.background,
          wechatCover: s.wechatCover,
          dashboardContent: s.dashboardContent || []
        };
      } catch (e) {
        await this.$message().error(e.message);
      }
    },
    async modify() {
      try {
        await this.$api().setting.modify(this.setting);
        
        // 发布主题变化事件，通知 App.vue 更新主题
        window.dispatchEvent(new CustomEvent('theme-changed', { 
          detail: { theme: this.setting.theme }
        }));
        
        // 发布背景图片变化事件，通知 App.vue 更新背景
        window.dispatchEvent(new CustomEvent('background-changed', {
          detail: { background: this.setting.background }
        }));
        
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