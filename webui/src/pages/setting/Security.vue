<template>
  <div style="font-size: 24px; font-weight: bold;">安全设置</div>
  <a-divider></a-divider>
  <div class="security-setting" >
    <div style="text-align: left; ">
      <a-form
        labelAlign="right"
        :labelWrap="true"
        :model="setting"
        size="small"
        @finish="modify"
        :labelCol="{ span: 3 }"
        :wrapperCol="{ span: 21 }"
        autocomplete="off"
        :class="`container-form-${ isMobile() ? 'mobile' : 'pc' }`">
        <a-form-item
          label="用户名"
          name="username"
          extra="登录所用用户名">
          <a-input size="small" v-model:value="setting.username"/>
        </a-form-item>
        <a-form-item
          label="密码"
          name="password"
          extra="登录所用密码, 留空为不修改">
          <a-input size="small" v-model:value="setting.password"/>
        </a-form-item>
        <a-form-item
          label="二步验证"
          name="otp"
          extra="二步验证字符串, 请添加至 Authy 或者 Goole Authenticator, 若未设置, 此处会显示随机字符串供首次设定, 若已设置, 此处显示 ****** ">
          <a-input size="small" disabled v-model:value="setting.otp"/>
        </a-form-item>
        <a-form-item
          label="二步验证验证码"
          name="otpPw"
          :extra="`二步验证验证码, 除首次设定外, 不需要填写, 服务器当前时间: ${$moment(setting.time * 1000).format('HH:mm:ss')}`">
          <a-input size="small" v-model:value="setting.otpPw"/>
        </a-form-item>
        <a-form-item
          label="信任不安全的 SSL 证书"
          extra="默认不信任不安全的证书，勾选后信任所有 SSL 证书">
          <a-checkbox v-model:checked="setting.trustAllCerts">启用</a-checkbox>
        </a-form-item>
        <a-form-item
          :wrapperCol="isMobile() ? { span:24 } : { span: 21, offset: 3 }">
          <a-button type="primary" html-type="submit" style="margin-top: 24px; margin-bottom: 48px;">保存</a-button>
        </a-form-item>
      </a-form>
    </div>
  </div>
</template>
<script>
export default {
  data () {
    return {
      setting: {}
    };
  },
  methods: {
    isMobile () {
      if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
        return true;
      } else {
        return false;
      }
    },
    async get () {
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
    async modify () {
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
  async mounted () {
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
  text-align: center;
}
</style>
