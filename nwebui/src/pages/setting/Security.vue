<template>
  <div class="container mx-auto p-4">
    <h1 class="text-2xl font-bold mb-4">安全设置</h1>
    <div class="divider"></div>
    
    <div class="card bg-base-100 shadow-sm hover:shadow-md transition-all duration-300">
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
            <span class="text-xs text-base-content/60 mt-2">用于系统登录的用户名</span>
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
            />
            <span class="text-xs text-base-content/60 mt-2">留空表示不修改密码</span>
          </div>

          <!-- 两步验证设置 -->
          <div class="form-control bg-base-200/50 rounded-lg p-4">
            <label class="label">
              <span class="label-text text-base-content/80 font-medium">两步验证密钥</span>
            </label>
            <input 
              type="text" 
              v-model="setting.twoFactorSecret"
              class="input input-bordered w-full bg-base-100 transition-all duration-200 focus:ring-2 focus:ring-primary focus:ring-opacity-50"
              placeholder="输入两步验证密钥"
            />
            <span class="text-xs text-base-content/60 mt-2">用于生成两步验证码的密钥，留空则禁用两步验证</span>
          </div>

          <!-- SSL证书设置 -->
          <div class="form-control bg-base-200/50 rounded-lg p-4">
            <div class="flex items-center justify-between mb-2">
              <span class="label-text text-base-content/80 font-medium">信任所有 SSL 证书</span>
              <input 
                type="checkbox" 
                v-model="setting.trustAllCertificates"
                class="checkbox checkbox-primary"
              />
            </div>
            <span class="text-xs text-base-content/60">信任所有 SSL 证书，请谨慎使用此选项</span>
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

<script setup>
import { ref, onMounted } from 'vue'
import { useToast } from 'vue-toastification'

const toast = useToast()
const setting = ref({
  username: '',
  password: '',
  twoFactorSecret: '',
  trustAllCertificates: false
})

const get = async () => {
  try {
    const response = await fetch('/api/setting/security')
    const data = await response.json()
    setting.value = {
      username: data.username,
      password: '',
      twoFactorSecret: data.twoFactorSecret,
      trustAllCertificates: data.trustAllCertificates
    }
  } catch (error) {
    toast.error(error.message)
  }
}

const modify = async () => {
  try {
    const response = await fetch('/api/setting/security', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(setting.value)
    })
    if (!response.ok) throw new Error('保存失败')
    toast.success('修改成功')
    await get()
  } catch (error) {
    toast.error(error.message)
  }
}

onMounted(() => {
  get()
})
</script>

<style scoped>
.container {
  max-width: 1440px;
}
</style>