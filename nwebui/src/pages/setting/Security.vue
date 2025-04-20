<template>
  <div>
    <h1 class="text-2xl font-bold">安全设置</h1>
    <div class="divider"></div>
    
    <form @submit.prevent="modify" class="space-y-4">
      <div class="form-control">
        <label class="label">
          <span class="label-text">用户名</span>
          <span class="label-text-alt">登录所用用户名</span>
        </label>
        <input type="text" v-model="setting.username" class="input input-bordered" />
      </div>

      <div class="form-control">
        <label class="label">
          <span class="label-text">密码</span>
          <span class="label-text-alt">登录所用密码, 留空为不修改</span>
        </label>
        <input type="password" v-model="setting.password" class="input input-bordered" />
      </div>

      <div class="form-control">
        <label class="label">
          <span class="label-text">二步验证</span>
          <span class="label-text-alt">二步验证字符串, 请添加至 Authy 或者 Google Authenticator, 若未设置, 此处会显示随机字符串供首次设定, 若已设置, 此处显示 ******</span>
        </label>
        <input type="text" v-model="setting.otp" class="input input-bordered" disabled />
      </div>

      <div class="form-control">
        <label class="label">
          <span class="label-text">二步验证验证码</span>
          <span class="label-text-alt">二步验证验证码, 除首次设定外, 不需要填写, 服务器当前时间: {{$moment(setting.time * 1000).format('HH:mm:ss')}}</span>
        </label>
        <input type="text" v-model="setting.otpPw" class="input input-bordered" />
      </div>

      <div class="form-control">
        <label class="label cursor-pointer">
          <span class="label-text">信任不安全的 SSL 证书</span>
          <span class="label-text-alt">默认不信任不安全的证书，勾选后信任所有 SSL 证书</span>
          <input type="checkbox" v-model="setting.trustAllCerts" class="toggle toggle-primary" />
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
          username: s.username,
          password: '',
          otp: s.otp
            ? '******'
            : new Array(16)
                .fill(1)
                .map(() => '234567ABCDEFGHIJKLMNOPQRSTUVWXYZ'[parseInt(Math.random() * 31)])
                .join(''),
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
.security-setting {
  height: calc(100% - 92px);
  width: 100%;
  max-width: 1440px;
  margin: 0 auto;
}
</style>