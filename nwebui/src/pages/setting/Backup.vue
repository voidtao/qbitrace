<template>
  <div class="container mx-auto p-4">
    <h1 class="text-2xl font-bold mb-4">备份设置</h1>
    <div class="divider"></div>
    
    <div class="card bg-base-100 shadow-sm hover:shadow-md transition-all duration-300">
      <div class="card-body">
        <form @submit.prevent="modify" class="space-y-6">
          <!-- 提示信息 -->
          <div class="alert alert-info bg-info/10 text-info-content mb-6">
            <i class="fas fa-info-circle"></i>
            <span>定期备份可以帮助您保护重要数据，建议开启自动备份功能</span>
          </div>
          <!-- 备份路径设置 -->
          <div class="form-control bg-base-200/50 rounded-lg p-4">
            <label class="label">
              <span class="label-text text-base-content/80 font-medium">备份路径</span>
            </label>
            <input 
              type="text" 
              v-model="setting.backupPath"
              class="input input-bordered w-full bg-base-100 transition-all duration-200 focus:ring-2 focus:ring-primary focus:ring-opacity-50"
              placeholder="备份文件保存路径"
            />
            <span class="text-xs text-base-content/60 mt-2">
              <i class="fas fa-folder-open mr-1"></i>
              备份文件保存路径，留空则使用默认路径
            </span>
          </div>

          <!-- 备份间隔设置 -->
          <div class="form-control bg-base-200/50 rounded-lg p-4">
            <label class="label">
              <span class="label-text text-base-content/80 font-medium">备份间隔</span>
            </label>
            <input 
              type="number" 
              v-model="setting.backupInterval"
              class="input input-bordered w-full bg-base-100 transition-all duration-200 focus:ring-2 focus:ring-primary focus:ring-opacity-50"
              placeholder="备份间隔（小时）"
              min="0"
            />
            <span class="text-xs text-base-content/60 mt-2">
              <i class="fas fa-clock mr-1"></i>
              自动备份的时间间隔，单位为小时，设置为0表示禁用自动备份
            </span>
          </div>

          <!-- 备份数量设置 -->
          <div class="form-control bg-base-200/50 rounded-lg p-4">
            <label class="label">
              <span class="label-text text-base-content/80 font-medium">保留备份数量</span>
            </label>
            <input 
              type="number" 
              v-model="setting.backupCount"
              class="input input-bordered w-full bg-base-100 transition-all duration-200 focus:ring-2 focus:ring-primary focus:ring-opacity-50"
              placeholder="保留的备份文件数量"
              min="1"
            />
            <span class="text-xs text-base-content/60 mt-2">
              <i class="fas fa-archive mr-1"></i>
              保留的备份文件数量，超过此数量将自动删除最旧的备份
            </span>
          </div>

          <!-- 自动备份开关 -->
          <div class="form-control bg-base-200/50 rounded-lg p-4">
            <div class="flex items-center justify-between mb-2">
              <span class="label-text text-base-content/80 font-medium">启用自动备份</span>
              <input 
                type="checkbox" 
                v-model="setting.autoBackup"
                class="checkbox checkbox-primary"
              />
            </div>
            <span class="text-xs text-base-content/60">
              <i class="fas fa-sync-alt mr-1"></i>
              开启后将按照设定的时间间隔自动进行备份
            </span>
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
  backupPath: '',
  backupInterval: 24,
  backupCount: 7,
  autoBackup: true
})

const get = async () => {
  try {
    const response = await fetch('/api/setting/backup')
    const data = await response.json()
    setting.value = {
      backupPath: data.backupPath,
      backupInterval: data.backupInterval,
      backupCount: data.backupCount,
      autoBackup: data.autoBackup
    }
  } catch (error) {
    toast.error(error.message)
  }
}

const modify = async () => {
  try {
    const response = await fetch('/api/setting/backup', {
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