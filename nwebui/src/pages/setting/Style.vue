<template>
  <div class="container mx-auto p-4">
    <h1 class="text-2xl font-bold mb-4">主题设置</h1>
    <div class="divider"></div>
    
    <div class="card bg-base-100 shadow-xl">
      <div class="card-body">
        <form @submit.prevent="modify" class="space-y-6">
          <div class="form-control">
            <label class="label">
              <span class="label-text font-medium">主题</span>
            </label>
            <div class="flex flex-wrap gap-4">
              <label class="label cursor-pointer">
                <input type="radio" name="theme" value="light" v-model="setting.theme" class="radio radio-primary mr-2" />
                <span class="label-text">亮色</span>
              </label>
              <label class="label cursor-pointer">
                <input type="radio" name="theme" value="dark" v-model="setting.theme" class="radio radio-primary mr-2" />
                <span class="label-text">暗色</span>
              </label>
              <label class="label cursor-pointer">
                <input type="radio" name="theme" value="follow" v-model="setting.theme" class="radio radio-primary mr-2" />
                <span class="label-text">跟随系统</span>
              </label>
              <label class="label cursor-pointer">
                <input type="radio" name="theme" value="cyber" v-model="setting.theme" class="radio radio-primary mr-2" />
                <span class="label-text">赛博</span>
              </label>
            </div>
          </div>

          <div class="form-control" v-if="setting.theme === 'cyber'">
            <label class="label">
              <span class="label-text">背景图片</span>
            </label>
            <input 
              type="text" 
              v-model="setting.background"
              class="input input-bordered w-full"
              placeholder="背景图片链接"
            />
            <label class="label">
              <span class="label-text-alt">背景图片链接</span>
            </label>
          </div>

          <div class="form-control">
            <label class="label">
              <span class="label-text">通知默认封面</span>
            </label>
            <input 
              type="text" 
              v-model="setting.wechatCover"
              class="input input-bordered w-full"
              placeholder="通知时使用的默认封面, 留空显示 qbitrace Logo"
            />
            <label class="label">
              <span class="label-text-alt">通知时使用的默认封面, 留空显示 qbitrace Logo</span>
            </label>
          </div>

          <div class="form-control">
            <label class="label">
              <span class="label-text">首页显示内容</span>
            </label>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label class="flex items-center p-3 bg-base-200/20 rounded-lg cursor-pointer hover:bg-primary/5" 
                     v-for="type in contentType" 
                     :key="type.key">
                <input 
                  type="checkbox" 
                  v-model="setting.dashboardContent"
                  :value="type.key"
                  class="checkbox checkbox-primary mr-3"
                />
                <span>{{ type.text }}</span>
              </label>
            </div>
            <label class="label">
              <span class="label-text-alt">选择首页数据展示</span>
            </label>
          </div>

          <div class="form-control mt-4">
            <button type="submit" class="btn btn-primary w-full md:w-auto">保存</button>
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
      setting: {
        dashboardContent: []
      },
      contentType: [
        {
          key: 'downloader',
          text: '客户端'
        }, {
          key: 'tracker',
          text: 'Tracker 统计'
        }
      ]
    }
  },
  methods: {
    isMobile() {
      if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
        return true;
      } else {
        return false;
      }
    },
    async get() {
      try {
        const s = (await this.$api().setting.get()).data;
        this.setting = {
          theme: s.theme || 'follow',
          background: s.background,
          wechatCover: s.wechatCover,
          dashboardContent: s.dashboardContent || []
        };
      } catch (e) {
        await this.$message().error(e.message);
      }
    },
    async modify() {
      try {
        await this.$api().setting.modify(this.setting);
        await this.$message().success('修改成功, 部分设置可能需要刷新页面生效.');
        this.get();
      } catch (e) {
        await this.$message().error(e.message);
      }
    }
  },
  async mounted() {
    await this.get();
  }
};
</script>

<style scoped>
.container {
  max-width: 1440px;
}
</style>