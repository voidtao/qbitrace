<template>
  <div class="container mx-auto px-4 py-8 max-w-7xl">
    <h1 class="text-2xl font-bold mb-6">HTTP 代理</h1>
    <div class="divider"></div>
    
    <div class="card bg-base-100 shadow-xl">
      <div class="card-body">
        <div class="space-y-4">
          <div class="form-control">
            <label class="label">
              <span class="label-text">HTTP 代理</span>
            </label>
            <input 
              type="text" 
              v-model="proxy"
              class="input input-bordered"
              placeholder="http://192.168.1.1:8080"
            />
          </div>

          <div class="form-control">
            <label class="label">
              <span class="label-text">域名列表</span>
            </label>
            <textarea 
              v-model="domains" 
              class="textarea textarea-bordered h-48"
              placeholder="www.baidu.com"
            ></textarea>
          </div>

          <div class="form-control">
            <button class="btn btn-primary" @click="save">保存</button>
          </div>

          <div class="alert alert-info">
            <div class="flex flex-col gap-2">
              <span>说明:</span>
              <span>1. http proxy 格式为 http://192.168.1.1:8080</span>
              <span>2. domains 指走 http proxy 的域名列表, 一行一个</span>
              <span>3. 域名需完全匹配, 例: www.baidu.com</span>
              <span>4. 代理设置不支持绕过 Cloudflare 时使用</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useToast } from 'vue-toastification'

const toast = useToast()
const proxy = ref('')
const domains = ref('')

const getProxy = async () => {
  try {
    const response = await fetch('/api/setting/proxy')
    const data = await response.json()
    proxy.value = data.proxy
    domains.value = data.domains
  } catch (error) {
    toast.error(error.message)
  }
}

const save = async () => {
  try {
    const response = await fetch('/api/setting/proxy', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        proxy: proxy.value,
        domains: domains.value
      })
    })
    if (!response.ok) throw new Error('保存失败')
    toast.success('保存成功')
  } catch (error) {
    toast.error(error.message)
  }
}

onMounted(() => {
  getProxy()
})
</script>

<style scoped>
.container {
  max-width: 1440px;
}
</style>
