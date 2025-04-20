<template>
  <div class="min-h-screen flex">
    <div class="hidden md:block w-1/3 bg-primary">
      <div class="h-full flex items-center justify-center">
        <img src="/assets/images/logo.svg" class="w-48" alt="logo"/>
      </div>
    </div>
    
    <div class="w-full md:w-2/3 flex flex-col items-center justify-center p-4">
      <div class="w-full max-w-md">
        <div class="text-center mb-8">
          <img src="/assets/images/logo.svg" class="w-16 mx-auto mb-4 md:hidden" alt="logo"/>
          <h1 class="text-4xl font-bold mb-2">qbitrace</h1>
          <p class="text-gray-500">for qbittorrent racing</p>
        </div>

        <form @submit.prevent="login" class="space-y-4">
          <div class="form-control">
            <label class="label">
              <span class="label-text">用户名</span>
            </label>
            <input 
              type="text" 
              v-model="user.username"
              class="input input-bordered"
              placeholder="请输入用户名"
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
              placeholder="请输入密码"
              required
            />
          </div>

          <div class="form-control">
            <label class="label">
              <span class="label-text">二步验证</span>
            </label>
            <input 
              type="text" 
              v-model="user.otpPw"
              class="input input-bordered"
              placeholder="请输入二步验证码（可选）"
            />
          </div>

          <div class="form-control mt-6">
            <button type="submit" class="btn btn-primary w-full">登录</button>
          </div>
        </form>
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