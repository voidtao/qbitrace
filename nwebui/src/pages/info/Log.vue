<template>
  <div>
    <h1 class="text-2xl font-bold">日志</h1>
    <div class="divider"></div>
    
    <div class="flex flex-col gap-4">
      <div class="flex gap-2">
        <select v-model="type" class="select select-bordered">
          <option value="info">信息</option>
          <option value="sc">定时脚本</option>
          <option value="error">错误</option>
          <option value="debug">调试</option>
          <option value="access">跟踪</option>
        </select>
        <button class="btn btn-primary" @click="getLog">查询</button>
      </div>

      <div class="overflow-x-auto">
        <textarea
          v-model="log"
          class="textarea textarea-bordered w-full"
          rows="20"
          readonly
        ></textarea>
      </div>

      <div class="text-red-500 font-bold">
        <p>截图日志务必把版本: {{ version.head }}/{{ version.updateTime }} 带上, 并注意上方的日志等级以及日志的时间</p>
        <p>注意报错的 message / code / status 附近的内容</p>
        <p>偶尔报错请直接忽略, 周期性报错需要注意。</p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      type: 'error', // 默认日志类型
      log: '', // 日志内容
      version: {} // 版本信息
    };
  },
  methods: {
    isMobile() {
      return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      );
    },
    async getLog() {
      try {
        // 调用旧版 API 获取日志
        const res = await this.$api().log.get(this.type);
        this.log = res.data;

        // 格式化日志内容
        this.log = res
          ? '[202' + res.data.split('[202').reverse().join('[202')
          : '';
        this.log = this.log
          .replace(new RegExp(`\\[${this.$moment().format('YYYY')}-`, 'g'), '[')
          .replace(/\[[^\d]*? console\] \d*/g, '')
          .replace(/\[202/g, '');
      } catch (e) {
        await this.$message().error(e.message);
      }
    }
  },
  async mounted() {
    // 获取版本信息
    this.version = process.env.version;

    // 默认加载日志
    this.getLog();
  }
};
</script>

<style scoped>
.log {
  width: 100%;
  margin: 0 auto;
}
</style>