<template>
  <div class="container mx-auto p-4">
    <h1 class="text-2xl font-bold mb-4">相关信息</h1>
    
    <div class="card bg-base-100 shadow-xl">
      <div class="card-body">
        <div class="stats stats-vertical lg:stats-horizontal shadow">
          <div class="stat">
            <div class="stat-title">主版本</div>
            <div class="stat-value">{{ version.version }}</div>
          </div>
          
          <div class="stat">
            <div class="stat-title">编译版本</div>
            <div class="stat-value">
              <a class="link link-primary" @click="gotoVersion">{{ version.head }}</a>
            </div>
          </div>
          
          <div class="stat">
            <div class="stat-title">发布时间</div>
            <div class="stat-value">{{ version.updateTime }}</div>
          </div>
          
          <div class="stat">
            <div class="stat-title">更新信息</div>
            <div class="stat-value">{{ version.commitInfo }}</div>
          </div>
        </div>
      </div>
    </div>

    <div class="card bg-base-100 shadow-xl mt-4">
      <div class="card-body">
        <div class="alert alert-info">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="stroke-current shrink-0 w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          <span>本项目由vertex-app/vertex项目修改而来，只保留了最核心的功能</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { onMounted, ref } from 'vue'

export default {
  setup() {
    const version = ref({})
    const runInfo = ref({})

    const getRunInfo = async () => {
      try {
        const res = await window.$api.setting.getRunInfo()
        runInfo.value = res.data
      } catch (e) {
        window.$toast.error(e.message)
      }
    }

    const gotoVersion = () => {
      window.open('https://github.com/vertex-app/vertex')
    }

    onMounted(() => {
      getRunInfo()
      version.value = process.env.version
    })

    return {
      version,
      runInfo,
      gotoVersion
    }
  }
}
</script>

<style scoped>
.container {
  max-width: 1440px;
}
</style>