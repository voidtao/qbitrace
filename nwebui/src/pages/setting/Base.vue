<template>
  <div class="container mx-auto px-4 py-8 max-w-7xl">
    <h1 class="text-2xl font-bold mb-6">基础设置</h1>
    <div class="divider"></div>
    
    <div class="card bg-base-100 shadow-xl">
      <div class="card-body">
        <form @submit.prevent="modify" class="space-y-6">
          <div class="form-control">
            <label class="label">
              <span class="label-text">User-Agent</span>
            </label>
            <input 
              type="text" 
              v-model="setting.userAgent"
              class="input input-bordered"
              placeholder="所有网络请求所用的 User-Agent, 默认为 qbitrace"
            />
          </div>

          <div class="form-control">
            <label class="label">
              <span class="label-text">日志级别</span>
            </label>
            <select 
              v-model="setting.loggerLevel"
              class="select select-bordered"
            >
              <option value="info">INFO</option>
              <option value="debug">DEBUG</option>
              <option value="trace">TRACE</option>
              <option value="all">ALL</option>
            </select>
            <label class="label">
              <span class="label-text-alt">选择日志记录的最低级别, qbitrace默认记录所有日志, 重启后生效</span>
            </label>
          </div>

          <div class="form-control">
            <label class="label">
              <span class="label-text">Telegram 代理</span>
            </label>
            <input 
              type="text" 
              v-model="setting.telegramProxy"
              class="input input-bordered"
              placeholder="Nginx 或 Caddy 等软件反代 Telegram 域名 api.telegram.org 后的地址, 格式: http(s)://ip:port"
            />
          </div>

          <div class="form-control">
            <label class="label">
              <span class="label-text">企业微信代理</span>
            </label>
            <input 
              type="text" 
              v-model="setting.wechatProxy"
              class="input input-bordered"
              placeholder="Nginx 或 Caddy 等软件反代企业微信域名 qyapi.weixin.qq.com 后的地址, 格式: http(s)://ip:port/"
            />
          </div>

          <div class="form-control">
            <label class="label cursor-pointer">
              <span class="label-text">隐藏报错提示</span>
              <input 
                type="checkbox" 
                v-model="setting.ignoreError"
                class="checkbox checkbox-primary"
              />
            </label>
            <label class="label">
              <span class="label-text-alt">进入首页后不提示报错信息</span>
            </label>
          </div>

          <div class="form-control">
            <label class="label cursor-pointer">
              <span class="label-text">取消部分依赖检查</span>
              <input 
                type="checkbox" 
                v-model="setting.ignoreDependCheck"
                class="checkbox checkbox-primary"
              />
            </label>
            <label class="label">
              <span class="label-text-alt">取消部分依赖检查，请谨慎使用</span>
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
  userAgent: '',
  loggerLevel: 'info',
  telegramProxy: '',
  wechatProxy: '',
  ignoreError: false,
  ignoreDependCheck: false
})

const get = async () => {
  try {
    const response = await fetch('/api/setting')
    const data = await response.json()
    setting.value = {
      userAgent: data.userAgent,
      loggerLevel: data.loggerLevel,
      telegramProxy: data.telegramProxy,
      wechatProxy: data.wechatProxy,
      ignoreError: data.ignoreError,
      ignoreDependCheck: data.ignoreDependCheck
    }
  } catch (error) {
    toast.error(error.message)
  }
}

const modify = async () => {
  try {
    const response = await fetch('/api/setting', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(setting.value)
    })
    if (!response.ok) throw new Error('保存失败')
    toast.success('修改成功, 部分设置可能需要刷新页面生效.')
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