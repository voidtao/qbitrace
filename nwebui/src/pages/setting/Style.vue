<template>
  <div class="container mx-auto px-4 py-8 max-w-7xl">
    <h1 class="text-2xl font-bold mb-6">主题设置</h1>
    <div class="divider"></div>
    
    <div class="card bg-base-100 shadow-xl">
      <div class="card-body">
        <form @submit.prevent="modify" class="space-y-6">
          <div class="form-control">
            <label class="label">
              <span class="label-text">主题</span>
            </label>
            <div class="flex gap-4">
              <label class="label cursor-pointer gap-2">
                <input 
                  type="radio" 
                  v-model="setting.theme"
                  value="light"
                  class="radio radio-primary"
                />
                <span class="label-text">亮色</span>
              </label>
              <label class="label cursor-pointer gap-2">
                <input 
                  type="radio" 
                  v-model="setting.theme"
                  value="dark"
                  class="radio radio-primary"
                />
                <span class="label-text">暗色</span>
              </label>
              <label class="label cursor-pointer gap-2">
                <input 
                  type="radio" 
                  v-model="setting.theme"
                  value="follow"
                  class="radio radio-primary"
                />
                <span class="label-text">跟随系统</span>
              </label>
              <label class="label cursor-pointer gap-2">
                <input 
                  type="radio" 
                  v-model="setting.theme"
                  value="cyber"
                  class="radio radio-primary"
                />
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
              class="input input-bordered"
              placeholder="背景图片链接"
            />
          </div>

          <div class="form-control">
            <label class="label">
              <span class="label-text">通知默认封面</span>
            </label>
            <input 
              type="text" 
              v-model="setting.wechatCover"
              class="input input-bordered"
              placeholder="通知时使用的默认封面, 留空显示 qbitrace Logo"
            />
          </div>

          <div class="form-control">
            <label class="label">
              <span class="label-text">首页显示内容</span>
            </label>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label class="label cursor-pointer gap-2" v-for="type in contentType" :key="type.key">
                <input 
                  type="checkbox" 
                  v-model="setting.dashboardContent"
                  :value="type.key"
                  class="checkbox checkbox-primary"
                />
                <span class="label-text">{{ type.text }}</span>
              </label>
            </div>
          </div>

          <div class="form-control mt-6">
            <button type="submit" class="btn btn-primary">保存</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data () {
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
    };
  },
  methods: {
    isMobile () {
      if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
        return true;
      } else {
        return false;
      }
    },
    async get () {
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
    async modify () {
      try {
        await this.$api().setting.modify(this.setting);
        await this.$message().success('保存成功');
      } catch (e) {
        await this.$message().error(e.message);
      }
    }
  },
  async mounted () {
    await this.get();
  }
};
</script>

<style scoped>
.max-w-7xl {
  max-width: 1440px;
}
</style>