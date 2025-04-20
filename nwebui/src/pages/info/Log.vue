<template>
  <div class="container mx-auto p-4">
    <h1 class="text-2xl font-bold mb-4">日志</h1>
    
    <div class="card bg-base-100 shadow-xl">
      <div class="card-body">
        <div class="form-control">
          <label class="label">
            <span class="label-text">日志等级</span>
          </label>
          <select class="select select-bordered" v-model="type" @change="getLog">
            <option value="info">信息</option>
            <option value="sc">定时脚本</option>
            <option value="error">错误</option>
            <option value="debug">调试</option>
            <option value="access">跟踪</option>
          </select>
        </div>

        <div class="alert alert-error mt-4">
          <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          <div>
            <h3 class="font-bold">截图日志注意事项</h3>
            <div class="text-xs">
              <p>1. 务必把版本: {{version.head}}/{{version.updateTime}} 带上</p>
              <p>2. 注意上方的日志等级以及日志的时间</p>
              <p>3. 注意报错的 message / code / status 附近的内容</p>
              <p>4. 偶尔报错请直接忽略, 周期性报错需要注意</p>
            </div>
          </div>
        </div>

        <div class="form-control mt-4">
          <label class="label">
            <span class="label-text">日志内容</span>
          </label>
          <textarea class="textarea textarea-bordered h-96 font-mono" v-model="log" readonly></textarea>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { onMounted, ref } from 'vue'

export default {
  setup() {
    const type = ref('error')
    const log = ref('')
    const version = ref({})

    const getLog = async () => {
      try {
        const res = await window.$api.log.get(type.value)
        if (res.data) {
          // 处理日志格式
          let processedLog = '[202' + res.data.split('[202').reverse().join('[202')
          processedLog = processedLog
            .replace(new RegExp(`\\[${window.$moment().format('YYYY')}-`, 'g'), '[')
            .replace(/\[[^\d]*? console\] \d*/g, '')
            .replace(/\[202/g, '')
          log.value = processedLog
        } else {
          log.value = ''
        }
      } catch (e) {
        window.$toast.error(e.message)
      }
    }

    onMounted(() => {
      version.value = process.env.version
      getLog()
    })

    return {
      type,
      log,
      version,
      getLog
    }
  }
}
</script>

<style scoped>
.container {
  max-width: 1440px;
}
</style>