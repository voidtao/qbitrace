<template>
  <div class="container mx-auto p-4">
    <h1 class="text-2xl font-bold mb-4">网络测试</h1>
    <div class="divider"></div>
    
    <div class="card bg-base-100 shadow-xs hover:shadow-md transition-all duration-300">
      <div class="card-body">
        <h2 class="card-title mb-6 text-base-content">
          <fa-icon :icon="['fas','network-wired']" class="mr-2 text-primary" />
          网络连通性测试
        </h2>
        
        <form @submit.prevent="doTest" class="space-y-6">
          <div class="bg-base-200/50 rounded-lg p-4 space-y-4">
            <h3 class="font-medium text-base-content/80 mb-2">测试参数</h3>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="form-control">
                <label class="label">
                  <span class="label-text text-base-content/80">测试地址</span>
                </label>
                <input 
                  type="text" 
                  v-model="info.address"
                  class="input input-bordered w-full bg-base-100 transition-all duration-200 focus:ring-2 focus:ring-primary focus:ring-opacity-50"
                  placeholder="输入要测试的地址"
                  required
                />
              </div>

              <div class="form-control">
                <label class="label">
                  <span class="label-text text-base-content/80">Cookie</span>
                </label>
                <input 
                  type="text" 
                  v-model="info.cookie"
                  class="input input-bordered w-full bg-base-100 transition-all duration-200 focus:ring-2 focus:ring-primary focus:ring-opacity-50"
                  placeholder="输入 Cookie（可选）"
                />
              </div>
            </div>
            
            <div class="form-control mt-4">
              <button type="submit" class="btn btn-primary w-full md:w-auto">
                <fa-icon :icon="['fas','play']" class="mr-2" />
                执行测试
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>

    <!-- 测试结果卡片 -->
    <div class="card bg-base-100 shadow-xs hover:shadow-md transition-all duration-300 mt-8">
      <div class="card-body">
        <h2 class="card-title mb-4 text-base-content">
          <fa-icon :icon="['fas','terminal']" class="mr-2 text-primary" />
          测试结果
        </h2>
        <div class="form-control">
          <textarea 
            v-model="result" 
            class="textarea textarea-bordered w-full h-80 font-mono bg-base-100 transition-all duration-200 focus:ring-2 focus:ring-primary focus:ring-opacity-50"
            readonly
          ></textarea>
        </div>
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
    };
  },
  methods: {
    isMobile() {
      if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
        return true;
      } else {
        return false;
      }
    },
    async doTest() {
      try {
        const res = await this.$api().setting.networkTest(this.info);
        this.result = res.data;
      } catch (e) {
        await this.$message().error(e.message);
      }
    }
  }
};
</script>

<style scoped>
.container {
  max-width: 1440px;
}
</style>