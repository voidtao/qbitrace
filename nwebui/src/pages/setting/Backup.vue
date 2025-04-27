<template>
  <div class="container mx-auto p-4">
    <h1 class="text-2xl font-bold mb-4">备份还原</h1>
    <div class="divider"></div>
    
    <div class="card bg-base-100 shadow-xs hover:shadow-md transition-all duration-300">
      <div class="card-body">
        <div class="space-y-6">
          <!-- 备份种子文件选项 -->
          <div class="form-control bg-base-200/50 rounded-lg p-4">
            <div class="flex items-center justify-between mb-2">
              <span class="label-text text-base-content/80 font-medium">种子文件</span>
              <input 
                type="checkbox" 
                v-model="setting.backupTorrent"
                class="checkbox checkbox-primary"
              />
            </div>
            <span class="text-xs text-base-content/60">
              <i class="fas fa-file-archive mr-1"></i>
              备份时是否备份种子文件，如不备份，恢复时将清空所有已有种子
            </span>
          </div>

          <!-- 备份 -->
          <div class="form-control bg-base-200/50 rounded-lg p-4">
            <label class="label">
              <span class="label-text text-base-content/80 font-medium">备份</span>
            </label>
            
            <div class="mt-2">
              <button type="button" class="btn btn-primary" @click="backupqbitrace">
                <i class="fas fa-download mr-2"></i>
                下载备份
              </button>
            </div>
          </div>
          
          <!-- 恢复 -->
          <div class="form-control bg-base-200/50 rounded-lg p-4">
            <label class="label">
              <span class="label-text text-base-content/80 font-medium">恢复</span>
            </label>
            
            <div class="relative">
              <input 
                type="file" 
                id="backup-file" 
                class="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                @change="handleFileUpload"
              />
              <button type="button" class="btn btn-primary btn-danger">
                <i class="fas fa-upload mr-2"></i>
                点击选择文件
              </button>
            </div>
            
            <!-- 显示上传状态 -->
            <div v-if="fileList.length > 0" class="mt-4">
              <div class="text-left">
                <div v-for="file in fileList" :key="file.uid" class="flex items-center mb-2">
                  <span class="mr-2">{{ file.name }}</span>
                  <span v-if="file.status === 'uploading'" class="text-primary">上传中...</span>
                  <span v-else-if="file.status === 'done'" class="text-success">上传完成</span>
                  <span v-else-if="file.status === 'error'" class="text-error">上传失败</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      setting: {
        backupTorrent: false
      },
      fileList: []
    }
  },
  methods: {
    isMobile() {
      return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    },
    async backupqbitrace() {
      if (this.setting.backupTorrent) {
        window.open('/api/setting/backupqbitrace?bt=true')
      } else {
        window.open('/api/setting/backupqbitrace')
      }
    },
    async handleFileUpload(event) {
      const file = event.target.files[0]
      if (!file) return
      
      // 创建文件对象，模拟 ant design 的文件列表结构
      const fileObj = {
        uid: Date.now().toString(),
        name: file.name,
        status: 'uploading',
        size: file.size,
        type: file.type
      }
      
      this.fileList = [fileObj]
      
      const formData = new FormData()
      formData.append('file', file)
      
      try {
        const response = await fetch('/api/setting/restoreqbitrace', {
          method: 'POST',
          body: formData
        })
        
        if (response.ok) {
          fileObj.status = 'done'
          this.fileList = [fileObj]
          
          // 使用 $notification 如同 webui
          if (window.$notification) {
            await window.$notification().open({
              message: '恢复备份成功',
              description: '恢复备份成功, 重启后生效',
              duration: 0
            })
          } else {
            // 降级到 toast
            window.$toast.success('恢复备份成功, 重启后生效')
          }
        } else {
          fileObj.status = 'error'
          this.fileList = [fileObj]
          
          if (window.$notification) {
            await window.$notification().open({
              message: '恢复备份失败',
              description: '恢复备份失败',
              duration: 0
            })
          } else {
            window.$toast.error('恢复备份失败')
          }
        }
      } catch (error) {
        fileObj.status = 'error'
        this.fileList = [fileObj]
        
        if (window.$notification) {
          await window.$notification().open({
            message: '恢复备份失败',
            description: error.message,
            duration: 0
          })
        } else {
          window.$toast.error(`恢复备份失败: ${error.message}`)
        }
      }
      
      // 清除文件选择，允许再次选择同一文件
      event.target.value = ''
    }
  }
}
</script>

<style scoped>
.container {
  max-width: 1440px;
}

</style>