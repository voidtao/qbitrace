<template>
  <div class="container mx-auto p-4">
    <h1 class="text-2xl font-bold mb-4">安全设置</h1>
    <div class="divider"></div>

    <div class="card bg-base-100 shadow-xs hover:shadow-md transition-all duration-300">
      <div class="card-body">
        <form @submit.prevent="modify" class="space-y-6">
          <!-- 安全提示 -->
          <div class="alert alert-info bg-info/10 text-info-content mb-6">
            <i class="fas fa-shield-alt"></i>
            <span>请谨慎修改安全设置，确保记住您的登录凭据</span>
          </div>
          <!-- 用户名输入 -->
          <div class="form-control bg-base-200/50 rounded-lg p-4">
            <label class="label">
              <span class="label-text text-base-content/80 font-medium">用户名</span>
            </label>
            <input
              type="text"
              v-model="setting.username"
              class="input input-bordered w-full bg-base-100 transition-all duration-200 focus:ring-2 focus:ring-primary focus:ring-opacity-50"
              placeholder="设置登录用户名"
            />
            <span class="text-xs text-base-content/60 mt-2">登录所用用户名</span>
          </div>

          <!-- 密码输入 -->
          <div class="form-control bg-base-200/50 rounded-lg p-4">
            <label class="label">
              <span class="label-text text-base-content/80 font-medium">密码</span>
            </label>
            <input
              type="password"
              v-model="setting.password"
              class="input input-bordered w-full bg-base-100 transition-all duration-200 focus:ring-2 focus:ring-primary focus:ring-opacity-50"
              placeholder="设置登录密码"
              autocomplete="new-password"
            />
            <span class="text-xs text-base-content/60 mt-2">登录所用密码, 留空为不修改</span>
          </div>

          <!-- 两步验证密钥 -->
          <div class="form-control bg-base-200/50 rounded-lg p-4">
            <label class="label">
              <span class="label-text text-base-content/80 font-medium">二步验证</span>
            </label>
            <input
              type="text"
              v-model="setting.otp"
              class="input input-bordered w-full bg-base-100 transition-all duration-200 focus:ring-2 focus:ring-primary focus:ring-opacity-50"
              placeholder="二步验证密钥"
              disabled
            />
            <span class="text-xs text-base-content/60 mt-2">二步验证字符串, 请添加至 Authy 或者 Goole Authenticator, 若未设置, 此处会显示随机字符串供首次设定, 若已设置, 此处显示 ******</span>
          </div>

          <!-- 两步验证验证码 -->
          <div class="form-control bg-base-200/50 rounded-lg p-4">
            <label class="label">
              <span class="label-text text-base-content/80 font-medium">二步验证验证码</span>
            </label>
            <input
              type="text"
              v-model="setting.otpPw"
              class="input input-bordered w-full bg-base-100 transition-all duration-200 focus:ring-2 focus:ring-primary focus:ring-opacity-50"
              placeholder="输入当前验证码"
              autocomplete="one-time-code"
            />
            <span class="text-xs text-base-content/60 mt-2">
              二步验证验证码, 除首次设定外, 不需要填写, 服务器当前时间: {{ $moment(setting.time * 1000).format('HH:mm:ss') }}
            </span>
          </div>

          <!-- SSL证书设置 -->
          <div class="form-control bg-base-200/50 rounded-lg p-4">
            <div class="flex items-center justify-between mb-2">
              <span class="label-text text-base-content/80 font-medium">信任不安全的 SSL 证书</span>
              <input
                type="checkbox"
                v-model="setting.trustAllCerts"
                class="checkbox checkbox-primary"
              />
            </div>
            <span class="text-xs text-base-content/60">默认不信任不安全的证书，勾选后信任所有 SSL 证书</span>
          </div>

          <!-- 保存按钮 -->
          <div class="form-control mt-8">
            <button type="submit" class="btn btn-primary w-full md:w-auto">
              <i class="fas fa-save mr-2"></i>
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
          username: s.username,
          password: '',
          otp: s.otp ? '******' : (new Array(16)).fill(1).map(() => '234567ABCDEFGHIJKLMNOPQRSTUVWXYZ'[parseInt(Math.random() * 31)]).join(''),
          otpPw: '',
          time: s.time,
          trustAllCerts: s.trustAllCerts
        };
      } catch (e) {
        await this.$message().error(e.message);
      }
    },
    async modify() {
      try {
        const setting = { ...this.setting };
        if (setting.password) {
          setting.password = this.$md5(setting.password);
        }
        await this.$api().setting.modify(setting);
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