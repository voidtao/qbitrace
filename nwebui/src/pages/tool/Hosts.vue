<template>
  <div class="container mx-auto px-4 py-8 max-w-7xl">
    <h1 class="text-2xl font-bold mb-6">修改 HOSTS</h1>
    <div class="divider"></div>
    
    <div class="card bg-base-100 shadow-xl">
      <div class="card-body">
        <div class="space-y-4">
          <div class="form-control">
            <textarea 
              v-model="hosts" 
              class="textarea textarea-bordered h-48"
              placeholder="输入 hosts 内容"
            ></textarea>
          </div>

          <div class="flex gap-2">
            <button class="btn btn-primary" @click="save">保存</button>
            <button class="btn btn-secondary" @click="_export">导出</button>
            <button class="btn btn-accent" @click="_import">导入</button>
          </div>

          <div class="alert alert-info">
            <div class="flex flex-col gap-2">
              <span>说明:</span>
              <span>1. 输入框内容实时读取自文件 /etc/hosts</span>
              <span>2. 保存是指将内容保存至 /etc/hosts</span>
              <span>3. 导出是指将内容保存至 /etc/hosts 的内容复制至 qbitrace/data/hosts</span>
              <span>4. 导入是指将内容保存至 qbitrace/data/hosts 的内容复制至 /etc/hosts</span>
              <span>5. 内容格式同普通的 hosts</span>
              <span class="ml-4">例: 127.0.0.1 localhost</span>
              <span>6. 输入框结尾至少保留一个空行</span>
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
const hosts = ref('')

const getHosts = async () => {
  try {
    const response = await fetch('/api/setting/hosts')
    const data = await response.json()
    hosts.value = data
  } catch (error) {
    toast.error(error.message)
  }
}

const save = async () => {
  try {
    const response = await fetch('/api/setting/hosts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ hosts: hosts.value })
    })
    if (!response.ok) throw new Error('保存失败')
    toast.success('保存成功')
  } catch (error) {
    toast.error(error.message)
  }
}

const _export = async () => {
  try {
    const response = await fetch('/api/setting/hosts/export', {
      method: 'POST'
    })
    if (!response.ok) throw new Error('导出失败')
    toast.success('导出成功')
  } catch (error) {
    toast.error(error.message)
  }
}

const _import = async () => {
  try {
    const response = await fetch('/api/setting/hosts/import', {
      method: 'POST'
    })
    if (!response.ok) throw new Error('导入失败')
    toast.success('导入成功')
    await getHosts()
  } catch (error) {
    toast.error(error.message)
  }
}

onMounted(() => {
  getHosts()
})
</script>

<style scoped>
.container {
  max-width: 1440px;
}
</style>
