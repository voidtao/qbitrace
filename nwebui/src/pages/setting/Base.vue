<template>
  <div>
    <h1 class="text-2xl font-bold">基础设置</h1>
    <div class="divider"></div>
    
    <form @submit.prevent="modify" class="space-y-4">
      <div class="form-control">
        <label class="label">
          <span class="label-text">User-Agent</span>
          <span class="label-text-alt">所有网络请求所用的 User-Agent, 默认为 qbitrace</span>
        </label>
        <input type="text" v-model="setting.userAgent" class="input input-bordered" />
      </div>

      <div class="form-control">
        <label class="label">
          <span class="label-text">日志级别</span>
          <span class="label-text-alt">选择日志记录的最低级别, qbitrace默认记录所有日志, 重启后生效</span>
        </label>
        <select v-model="setting.loggerLevel" class="select select-bordered w-full">
          <option value="info">INFO</option>
          <option value="debug">DEBUG</option>
          <option value="trace">TRACE</option>
          <option value="all">ALL</option>
        </select>
      </div>

      <div class="form-control">
        <label class="label">
          <span class="label-text">Telegram 代理</span>
          <span class="label-text-alt">Nginx 或 Caddy 等软件反代 Telegram 域名 api.telegram.org 后的地址, 格式: http(s)://ip:port</span>
        </label>
        <input type="text" v-model="setting.telegramProxy" class="input input-bordered" />
      </div>

      <div class="form-control">
        <label class="label">
          <span class="label-text">企业微信代理</span>
          <span class="label-text-alt">Nginx 或 Caddy 等软件反代企业微信域名 qyapi.weixin.qq.com 后的地址, 格式: http(s)://ip:port/</span>
        </label>
        <input type="text" v-model="setting.wechatProxy" class="input input-bordered" />
      </div>

      <div class="form-control">
        <label class="label cursor-pointer">
          <span class="label-text">隐藏报错提示</span>
          <span class="label-text-alt">进入首页后不提示报错信息</span>
          <input type="checkbox" v-model="setting.ignoreError" class="toggle toggle-primary" />
        </label>
      </div>

      <div class="form-control">
        <label class="label cursor-pointer">
          <span class="label-text">取消部分依赖检查</span>
          <span class="label-text-alt">取消部分依赖检查，请谨慎使用</span>
          <input type="checkbox" v-model="setting.ignoreDependCheck" class="toggle toggle-primary" />
        </label>
      </div>

      <div class="form-control">
        <button type="submit" class="btn btn-primary">保存</button>
      </div>
    </form>
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
      return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
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
.base-setting {
  height: calc(100% - 92px);
  width: 100%;
  max-width: 1440px;
  margin: 0 auto;
}
</style>