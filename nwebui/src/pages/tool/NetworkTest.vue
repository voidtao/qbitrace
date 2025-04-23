<template>
  <div class="container mx-auto p-4">
    <h1 class="text-2xl font-bold mb-4">网络测试</h1>
    
    <div class="card bg-base-100 shadow-xl">
      <div class="card-body">
        <form @submit.prevent="doTest" class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div class="form-control md:col-span-4">
            <label class="label">
              <span class="label-text">地址</span>
            </label>
            <input 
              type="text" 
              v-model="info.address"
              class="input input-bordered w-full"
              placeholder="输入要测试的地址"
              required
            />
          </div>

          <div class="form-control md:col-span-4">
            <label class="label">
              <span class="label-text">Cookie</span>
            </label>
            <input 
              type="text" 
              v-model="info.cookie"
              class="input input-bordered w-full"
              placeholder="输入 Cookie（可选）"
            />
          </div>

          <div class="form-control md:col-span-4">
            <button type="submit" class="btn btn-primary w-full md:w-auto">执行</button>
          </div>

          <div class="form-control md:col-span-4">
            <label class="label">
              <span class="label-text">结果</span>
            </label>
            <textarea 
              v-model="result" 
              class="textarea textarea-bordered h-96"
              readonly
            ></textarea>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      info: {
        address: '',
        cookie: ''
      },
      result: ''
    }
  },
  methods: {
    isMobile() {
      return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    },
    async doTest() {
      try {
        const res = await window.$api.setting.networkTest(this.info)
        this.result = res.data
      } catch (e) {
        window.$toast.error(e.message)
      }
    }
  }
}
</script>

<style scoped>
.container {
  max-width: 1440px;
}
</style>
