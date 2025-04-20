<template>
  <div>
    <h1 class="text-2xl font-bold">主题设置</h1>
    <div class="divider"></div>
    
    <form @submit.prevent="modify" class="space-y-4">
      <div class="form-control">
        <label class="label">
          <span class="label-text">主题</span>
        </label>
        <div class="flex gap-4">
          <label class="label cursor-pointer">
            <span class="label-text">亮色</span>
            <input type="radio" v-model="setting.theme" value="light" class="radio radio-primary" />
          </label>
          <label class="label cursor-pointer">
            <span class="label-text">暗色</span>
            <input type="radio" v-model="setting.theme" value="dark" class="radio radio-primary" />
          </label>
          <label class="label cursor-pointer">
            <span class="label-text">跟随系统</span>
            <input type="radio" v-model="setting.theme" value="follow" class="radio radio-primary" />
          </label>
          <label class="label cursor-pointer">
            <span class="label-text">赛博</span>
            <input type="radio" v-model="setting.theme" value="cyber" class="radio radio-primary" />
          </label>
        </div>
      </div>

      <div v-if="setting.theme === 'cyber'" class="form-control">
        <label class="label">
          <span class="label-text">背景图片</span>
          <span class="label-text-alt">背景图片链接</span>
        </label>
        <input type="text" v-model="setting.background" class="input input-bordered" />
      </div>

      <div class="form-control">
        <label class="label">
          <span class="label-text">通知默认封面</span>
          <span class="label-text-alt">通知时使用的默认封面, 留空显示 qbitrace Logo</span>
        </label>
        <input type="text" v-model="setting.wechatCover" class="input input-bordered" />
      </div>

      <div class="form-control">
        <label class="label">
          <span class="label-text">首页显示内容</span>
          <span class="label-text-alt">选择首页数据展示</span>
        </label>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-2">
          <label v-for="type of contentType" :key="type.key" 
                 class="label cursor-pointer">
            <span class="label-text">{{ type.text }}</span>
            <input type="checkbox" 
                   v-model="setting.dashboardContent"
                   :value="type.key"
                   class="checkbox checkbox-primary" />
          </label>
        </div>
      </div>

      <div class="form-control">
        <button type="submit" class="btn btn-primary">保存</button>
      </div>
    </form>
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
      return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
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
        await this.$message().success('修改成功, 部分设置可能需要刷新页面生效.');
        this.get();
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
.style-setting {
  height: calc(100% - 92px);
  width: 100%;
  max-width: 1440px;
  margin: 0 auto;
}
</style>