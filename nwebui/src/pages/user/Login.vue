<template>
  <div class="login">
    <div class="left-rect">
      <div class="logo">
        <img src="/assets/images/logo.svg" />
      </div>
    </div>
    <div class="right-rect">
      <div class="logo">
        <img src="/assets/images/logo.svg" />
      </div>
      <form @submit.prevent="login" class="login-form login-layout space-y-4">
        <div class="text-center">
          <h1 class="text-3xl font-bold">qbitrace</h1>
          <p class="text-gray-500">for qbittorrent racing</p>
        </div>
        <div class="form-control">
          <label class="label">
            <span class="label-text">用户名</span>
          </label>
          <input
            type="text"
            v-model="user.username"
            class="input input-bordered"
            required
          />
        </div>
        <div class="form-control">
          <label class="label">
            <span class="label-text">密码</span>
          </label>
          <input
            type="password"
            v-model="user.password"
            class="input input-bordered"
            required
          />
        </div>
        <div v-if="user.otp" class="form-control">
          <label class="label">
            <span class="label-text">二步验证</span>
          </label>
          <input
            type="text"
            v-model="user.otpPw"
            class="input input-bordered"
            required
          />
        </div>
        <div class="form-control mt-6">
          <button type="submit" class="btn btn-primary w-full">登录</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      user: {
        username: '',
        password: '',
        otp: false, // 是否需要二步验证
        otpPw: '' // 二步验证密码
      }
    };
  },
  methods: {
    isMobile() {
      return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      );
    },
    async login() {
      try {
        const user = { ...this.user };

        // 调用登录 API
        await this.$api().user.login(user.username, user.password, user.otpPw);

        // 登录成功后跳转到首页
        this.$goto('/index', this.$router);
      } catch (e) {
        if (e.message === '需要二步验证') {
          // 如果需要二步验证，显示二步验证字段
          this.user.otp = true;
          this.user.otpPw = '';
        } else {
          // 显示错误信息
          this.$message().error(e.message);
        }
      }
    }
  }
};
</script>

<style scoped>
.login-form {
  width: min(100vw, 360px);
  border-radius: 4px;
  padding: 6px;
  margin: 0 auto;
  height: 460px;
  transition: all 0.5s;
}

.left-rect {
  float: left;
  transition: all 0.5s;
}

.right-rect {
  float: left;
}

.logo {
  transition: all 0.5s;
}

@media screen and (min-width: 800px) {
  .login-form {
    margin-top: calc(50vh - 360px);
  }
  .left-rect {
    width: 300px;
    background: #e18dac;
    height: 100vh;
  }
  .right-rect {
    width: calc(100vw - 320px);
    height: 100vh;
  }
  .left-rect > .logo {
    margin: 0 auto;
    width: 180px;
    padding-top: calc(50vh - 180px);
    border-radius: 32px;
  }
  .right-rect > .logo {
    overflow: hidden;
    height: 0;
    margin: 0 auto;
    width: 160px;
    padding-top: 64px;
    border-radius: 32px;
  }
}

@media screen and (max-width: 800px) {
  .left-rect {
    width: 0;
    background: #e18dac;
    height: 100vh;
    overflow: hidden;
  }
  .right-rect {
    width: 100vw;
    height: 100vh;
    transition: all 0.5s;
  }
  .left-rect > .logo {
    overflow: hidden;
    margin: 0 auto;
    width: 0;
    border-radius: 32px;
    padding-top: calc(50vh - 180px);
  }
  .right-rect > .logo {
    margin: 0 auto;
    width: 120px;
    padding-top: 6px;
    border-radius: 32px;
  }
}
</style>