<template>
  <div class="container mx-auto p-4">
    <h1 class="text-2xl font-bold mb-4">日志</h1>
    <div class="divider"></div>
    
    <div class="card bg-base-100 shadow-xl">
      <div class="card-body">
        <form class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div class="form-control md:col-span-1">
            <label class="label">
              <span class="label-text">日志等级</span>
            </label>
            <select class="select select-bordered w-full" v-model="type" @change="getLog">
              <option value="info">信息</option>
              <option value="sc">定时脚本</option>
              <option value="error">错误</option>
              <option value="debug">调试</option>
              <option value="access">跟踪</option>
            </select>
          </div>
          
          <div class="form-control md:col-span-1 flex items-end">
            <button class="btn btn-primary mb-2" @click.prevent="getLog">查询</button>
          </div>
          
          <div class="md:col-span-4">
            <div class="alert alert-error text-sm">
              <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              <div>
                <h3 class="font-bold">截图日志注意事项</h3>
                <div>
                  <p>1. 务必把版本: {{version.head}}/{{version.updateTime}} 带上</p>
                  <p>2. 注意上方的日志等级以及日志的时间</p>
                  <p>3. 注意报错的 message / code / status 附近的内容</p>
                  <p>4. 偶尔报错请直接忽略, 周期性报错需要注意</p>
                </div>
              </div>
            </div>
          </div>
          
          <div class="form-control md:col-span-4">
            <label class="label mb-2">
              <span class="label-text">日志内容</span>
            </label>
            <textarea class="textarea textarea-bordered h-96 w-full font-mono" v-model="log" readonly></textarea>
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
      type: 'error',
      log: '',
      version: {}
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
    async getLog() {
      try {
        const res = await this.$api().log.get(this.type);
        this.log = res.data;
        this.log = res ? '[202' + res.data.split('[202').reverse().join('[202') : '';
        this.log = this.log.replace(new RegExp(`\\[${this.$moment().format('YYYY')}-`, 'g'), '[').replace(/\[[^\d]*? console\] \d*/g, '').replace(/\[202/g, '');
      } catch (e) {
        await this.$message().error(e.message);
      }
    }
  },
  async mounted() {
    this.version = process.env.version;
    this.getLog();
  }
};
</script>

<style scoped>
.container {
  max-width: 1440px;
}
</style>