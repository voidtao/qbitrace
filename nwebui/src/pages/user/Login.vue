<template>
  <div class="min-h-screen flex bg-base-100">
    <!-- 左侧图片区 -->
    <div class="hidden md:block w-1/3 bg-gradient-to-b from-primary to-primary-focus">
      <div class="h-full flex flex-col items-center justify-center p-8">
        <img src="/assets/images/logo.svg" class="w-48 mb-8" alt="logo"/>
        <h2 class="text-3xl font-bold text-white mb-2">qbitrace</h2>
        <p class="text-white/80">for qbittorrent racing</p>
      </div>
    </div>
    
    <!-- 右侧登录区 -->
    <div class="w-full md:w-2/3 flex flex-col items-center justify-center p-6">
      <div class="w-full max-w-md">
        <div class="text-center mb-8">
          <img src="/assets/images/logo.svg" class="w-16 mx-auto mb-4 md:hidden" alt="logo"/>
          <h1 class="text-4xl font-bold mb-2">qbitrace</h1>
          <p class="text-gray-500">for qbittorrent racing</p>
        </div>

        <form @submit.prevent="login" class="space-y-6">
          <!-- 用户名 -->
          <div class="form-control">
            <label class="label">
              <span class="label-text text-base-content/80">用户名</span>
            </label>
            <input 
              type="text" 
              v-model="user.username"
              class="input input-bordered w-full bg-base-100 transition-all duration-200 focus:ring-2 focus:ring-primary focus:ring-opacity-50"
              placeholder="请输入用户名"
              required
            />
          </div>

          <!-- 密码 -->
          <div class="form-control">
            <label class="label">
              <span class="label-text text-base-content/80">密码</span>
            </label>
            <input 
              type="password" 
              v-model="user.password"
              class="input input-bordered w-full bg-base-100 transition-all duration-200 focus:ring-2 focus:ring-primary focus:ring-opacity-50"
              placeholder="请输入密码"
              required
            />
          </div>

          <!-- 二步验证 -->
          <div class="form-control">
            <label class="label">
              <span class="label-text text-base-content/80">二步验证</span>
            </label>
            <input 
              type="text" 
              v-model="user.otpPw"
              class="input input-bordered w-full bg-base-100 transition-all duration-200 focus:ring-2 focus:ring-primary focus:ring-opacity-50"
              placeholder="请输入二步验证码（可选）"
            />
          </div>

          <!-- 登录按钮 -->
          <div class="form-control mt-8">
            <button 
              type="submit" 
              class="btn btn-primary w-full transition-all duration-200 hover:shadow-lg"
              :disabled="loading"
            >
              <span v-if="loading" class="loading loading-spinner"></span>
              <span v-else>登录</span>
            </button>
          </div>
        </form>

        <!-- 错误提示 -->
        <div v-if="error" class="alert alert-error bg-error/10 text-error-content mt-6">
          <i class="fas fa-exclamation-circle"></i>
          <span>{{ error }}</span>
        </div>

        <!-- 底部链接 -->
        <div class="mt-8 text-center space-y-2">
          <a href="#" class="link link-primary hover:text-primary-focus transition-colors duration-200">
            <i class="fas fa-question-circle mr-1"></i>
            忘记密码？
          </a>
          <div class="text-sm text-base-content/60">
            没有账号？<a href="#" class="link link-primary hover:text-primary-focus transition-colors duration-200">联系管理员</a>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'

const router = useRouter()
const toast = useToast()
const user = ref({
  username: '',
  password: '',
  otpPw: ''
})

const login = async () => {
  try {
    const response = await fetch('/api/user/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(user.value)
    })
    if (!response.ok) throw new Error('登录失败')
    toast.success('登录成功')
    router.push('/index')
  } catch (error) {
    toast.error(error.message)
  }
}
</script>

<style scoped>
.min-h-screen {
  min-height: 100vh;
}
</style>