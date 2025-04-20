<template>
  <div class="container mx-auto px-4 py-8 max-w-7xl">
    <h1 class="text-2xl font-bold mb-6">界面设置</h1>
    <div class="divider"></div>
    
    <div class="card bg-base-100 shadow-xl">
      <div class="card-body">
        <form @submit.prevent="modify" class="space-y-6">
          <div class="form-control">
            <label class="label">
              <span class="label-text">主题</span>
            </label>
            <select 
              v-model="setting.theme"
              class="select select-bordered"
            >
              <option value="light">浅色</option>
              <option value="dark">深色</option>
              <option value="system">跟随系统</option>
            </select>
            <label class="label">
              <span class="label-text-alt">选择界面主题，跟随系统将根据系统设置自动切换</span>
            </label>
          </div>

          <div class="form-control">
            <label class="label">
              <span class="label-text">语言</span>
            </label>
            <select 
              v-model="setting.language"
              class="select select-bordered"
            >
              <option value="zh-CN">简体中文</option>
              <option value="en-US">English</option>
            </select>
            <label class="label">
              <span class="label-text-alt">选择界面语言</span>
            </label>
          </div>

          <div class="form-control">
            <label class="label">
              <span class="label-text">字体大小</span>
            </label>
            <select 
              v-model="setting.fontSize"
              class="select select-bordered"
            >
              <option value="small">小</option>
              <option value="medium">中</option>
              <option value="large">大</option>
            </select>
            <label class="label">
              <span class="label-text-alt">选择界面字体大小</span>
            </label>
          </div>

          <div class="form-control">
            <label class="label cursor-pointer">
              <span class="label-text">紧凑模式</span>
              <input 
                type="checkbox" 
                v-model="setting.compactMode"
                class="checkbox checkbox-primary"
              />
            </label>
            <label class="label">
              <span class="label-text-alt">启用紧凑模式，减少界面元素间距</span>
            </label>
          </div>

          <div class="form-control">
            <label class="label cursor-pointer">
              <span class="label-text">动画效果</span>
              <input 
                type="checkbox" 
                v-model="setting.animation"
                class="checkbox checkbox-primary"
              />
            </label>
            <label class="label">
              <span class="label-text-alt">启用界面动画效果</span>
            </label>
          </div>

          <div class="form-control mt-6">
            <button type="submit" class="btn btn-primary">保存</button>
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
  theme: 'system',
  language: 'zh-CN',
  fontSize: 'medium',
  compactMode: false,
  animation: true
})

const get = async () => {
  try {
    const response = await fetch('/api/setting/style')
    const data = await response.json()
    setting.value = {
      theme: data.theme,
      language: data.language,
      fontSize: data.fontSize,
      compactMode: data.compactMode,
      animation: data.animation
    }
  } catch (error) {
    toast.error(error.message)
  }
}

const modify = async () => {
  try {
    const response = await fetch('/api/setting/style', {
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