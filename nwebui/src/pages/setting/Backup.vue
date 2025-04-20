<template>
  <div>
    <h1 class="text-2xl font-bold">备份还原</h1>
    <div class="divider"></div>
    
    <form class="space-y-4">
      <div class="form-control">
        <label class="label cursor-pointer">
          <span class="label-text">种子文件</span>
          <span class="label-text-alt">备份时是否备份种子文件, 如不备份, 恢复时将清空所有已有种子</span>
          <input type="checkbox" v-model="setting.backupTorrent" class="toggle toggle-primary" />
        </label>
      </div>

      <div class="form-control">
        <label class="label">
          <span class="label-text">备份</span>
        </label>
        <button type="button" class="btn btn-primary" @click="backupqbitrace">下载备份</button>
      </div>

      <div class="form-control">
        <label class="label">
          <span class="label-text">恢复</span>
        </label>
        <input type="file" 
               class="file-input file-input-bordered w-full" 
               @change="handleFileChange"
               accept=".zip" />
      </div>
    </form>
  </div>
</template>

<script>
export default {
  data() {
    return {
      setting: {
        backupTorrent: false
      }
    };
  },
  methods: {
    isMobile() {
      return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    },
    async backupqbitrace() {
      const url = this.setting.backupTorrent
        ? '/api/setting/backupqbitrace?bt=true'
        : '/api/setting/backupqbitrace';
      window.open(url);
    },
    async handleFileChange(event) {
      const file = event.target.files[0];
      if (!file) return;

      const formData = new FormData();
      formData.append('file', file);

      try {
        const res = await fetch('/api/setting/restoreqbitrace', {
          method: 'POST',
          body: formData
        });

        if (res.ok) {
          this.$message.success('恢复备份成功, 重启后生效');
        } else {
          this.$message.error('恢复备份失败');
        }
      } catch (e) {
        this.$message.error('恢复备份失败');
      }
    }
  }
};
</script>

<style scoped>
.backup {
  height: calc(100% - 92px);
  width: 100%;
  max-width: 1440px;
  margin: 0 auto;
}
</style>