<template>
  <div class="container mx-auto p-4">
    <h1 class="text-2xl font-bold mb-4">RSS 规则管理</h1>
    <div class="divider"></div>
    
    <div class="card bg-base-100 shadow-xs hover:shadow-md transition-all duration-300 mb-8">
      <div class="card-body">
        <h2 class="card-title mb-6 text-base-content">规则列表</h2>
        <div class="overflow-x-auto">
          <table class="table table-zebra w-full">
            <thead>
              <tr class="bg-base-200/50">
                <th class="text-base-content/70">ID</th>
                <th class="text-base-content/70">别名</th>
                <th class="text-base-content/70">下载器</th>
                <th class="text-base-content/70">优先级</th>
                <th class="text-base-content/70">操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="rule in rssRuleList" 
                  :key="rule.id"
                  class="hover:bg-base-200/30 transition-colors duration-200">
                <td class="text-base-content/80">{{ rule.id }}</td>
                <td class="text-base-content/80 font-medium">{{ rule.alias }}</td>
                <td>
                  <select 
                    class="select select-bordered select-sm w-full bg-base-100 transition-all duration-200 focus:ring-2 focus:ring-primary focus:ring-opacity-50" 
                    v-model="rule.client"
                    @change="modifyRssRuleDownloader(rule)"
                  >
                    <option value="" class="text-base-content/60">选择下载器</option>
                    <option v-for="downloader in downloaders" 
                            :key="downloader.id" 
                            :value="downloader.id"
                            class="text-base-content/80">
                      {{ downloader.alias }}
                    </option>
                  </select>
                </td>
                <td class="text-base-content/80">{{ rule.priority || 0 }}</td>
                <td>
                  <div class="flex gap-2">
                    <button class="btn btn-sm btn-primary btn-outline" 
                            @click="cloneClick(rule)">
                      <i class="fas fa-copy mr-1"></i>
                      克隆
                    </button>
                    <button class="btn btn-sm btn-secondary btn-outline" 
                            @click="modifyClick(rule)">
                      <i class="fas fa-edit mr-1"></i>
                      编辑
                    </button>
                    <div class="dropdown dropdown-end">
                      <label tabindex="0" 
                             class="btn btn-sm btn-error btn-outline">
                        <i class="fas fa-trash-alt mr-1"></i>
                        删除
                      </label>
                      <div tabindex="0" 
                           class="dropdown-content menu p-2 shadow-lg bg-base-100 rounded-lg w-52">
                        <div class="p-2 text-sm text-base-content/70 text-center">确认删除此规则？</div>
                        <button class="btn btn-sm btn-error w-full" 
                                @click="deleteRssRule(rule)">
                          确认删除
                        </button>
                      </div>
                    </div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <div class="card bg-base-100 shadow-xs hover:shadow-md transition-all duration-300">
      <div class="card-body">
        <h2 class="card-title mb-6 text-base-content">
          <i class="fas fa-edit mr-2 text-primary"></i>
          新增 | 编辑 RSS 规则
        </h2>
        <form @submit.prevent="modifyRssRule" class="space-y-6">
          <!-- 基本信息 -->
          <div class="bg-base-200/50 rounded-lg p-4 space-y-4">
            <h3 class="font-medium text-base-content/80 mb-2">基本信息</h3>
            <div class="form-control">
              <label class="label">
                <span class="label-text text-base-content/80">规则别名</span>
              </label>
              <input 
                type="text" 
                v-model="rssRule.alias" 
                class="input input-bordered w-full bg-base-100 transition-all duration-200 focus:ring-2 focus:ring-primary focus:ring-opacity-50"
                placeholder="输入规则名称"
                required
              />
              <span class="text-xs text-base-content/60 mt-2">给RSS规则取一个好记的名字</span>
            </div>

            <div class="form-control">
              <label class="label">
                <span class="label-text text-base-content/80">分类</span>
              </label>
              <input 
                type="text" 
                v-model="rssRule.category" 
                class="input input-bordered w-full bg-base-100 transition-all duration-200 focus:ring-2 focus:ring-primary focus:ring-opacity-50"
                placeholder="输入分类名称"
              />
              <span class="text-xs text-base-content/60 mt-2">留空则使用RSS任务设置的分类</span>
            </div>

            <div class="form-control">
              <label class="label">
                <span class="label-text text-base-content/80">保存路径</span>
              </label>
              <input 
                type="text" 
                v-model="rssRule.savePath" 
                class="input input-bordered w-full bg-base-100 transition-all duration-200 focus:ring-2 focus:ring-primary focus:ring-opacity-50"
                placeholder="输入保存路径"
              />
              <span class="text-xs text-base-content/60 mt-2">留空则使用RSS任务设置的保存路径</span>
            </div>

            <div class="form-control">
              <label class="label">
                <span class="label-text text-base-content/80">下载器</span>
              </label>
              <select 
                class="select select-bordered w-full bg-base-100 transition-all duration-200 focus:ring-2 focus:ring-primary focus:ring-opacity-50" 
                v-model="rssRule.client"
              >
                <option value="" class="text-base-content/60">选择下载器</option>
                <option 
                  v-for="downloader in downloaders" 
                  :key="downloader.id" 
                  :value="downloader.id"
                  class="text-base-content/80"
                >
                  {{ downloader.alias }}
                </option>
              </select>
              <span class="text-xs text-base-content/60 mt-2">该选项会覆盖RSS任务的下载器选择</span>
            </div>

            <div class="form-control">
              <label class="label">
                <span class="label-text text-base-content/80">优先级</span>
              </label>
              <input 
                type="number" 
                v-model="rssRule.priority" 
                class="input input-bordered w-full bg-base-100 transition-all duration-200 focus:ring-2 focus:ring-primary focus:ring-opacity-50"
                placeholder="输入优先级数值"
              />
              <span class="text-xs text-base-content/60 mt-2">优先级高的规则会优先匹配</span>
            </div>
          </div>

          <!-- 规则类型 -->
          <div class="bg-base-200/50 rounded-lg p-4">
            <h3 class="font-medium text-base-content/80 mb-4">规则类型</h3>
            <select 
              v-model="rssRule.type" 
              class="select select-bordered w-full bg-base-100 transition-all duration-200 focus:ring-2 focus:ring-primary focus:ring-opacity-50" 
              required
            >
              <option value="normal" class="text-base-content/80">普通规则</option>
              <option value="javascript" class="text-base-content/80">JavaScript脚本</option>
            </select>
            <span class="text-xs text-base-content/60 mt-2">
              <i class="fas fa-info-circle mr-1"></i>
              选择规则类型：普通规则使用条件匹配，JavaScript脚本使用自定义代码
            </span>
          </div>

          <div v-if="rssRule.type === 'normal'" class="bg-base-200/50 rounded-lg p-4">
            <div class="flex items-center justify-between mb-4">
              <h3 class="font-medium text-base-content/80">匹配条件</h3>
              <button 
                type="button"
                class="btn btn-primary btn-sm btn-outline"
                @click="rssRule.conditions.push({ ...condition })"
              >
                <i class="fas fa-plus mr-2"></i>
                新增条件
              </button>
            </div>
            
            <div class="overflow-x-auto">
              <table class="table table-zebra w-full">
                <thead>
                  <tr class="bg-base-200/50">
                    <th class="text-base-content/70">选项</th>
                    <th class="text-base-content/70">比较类型</th>
                    <th class="text-base-content/70">值</th>
                    <th class="text-base-content/70">操作</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(condition, index) in rssRule.conditions" 
                      :key="index"
                      class="hover:bg-base-200/30 transition-colors duration-200">
                    <td>
                      <select 
                        v-model="condition.key" 
                        class="select select-bordered select-sm w-full bg-base-100 transition-all duration-200 focus:ring-2 focus:ring-primary focus:ring-opacity-50"
                      >
                        <option 
                          v-for="key in conditionKeys" 
                          :key="key.key" 
                          :value="key.key"
                          class="text-base-content/80"
                        >
                          {{ key.name }}
                        </option>
                      </select>
                    </td>
                    <td>
                      <select 
                        v-model="condition.compareType" 
                        class="select select-bordered select-sm w-full bg-base-100 transition-all duration-200 focus:ring-2 focus:ring-primary focus:ring-opacity-50"
                      >
                        <option value="equals" class="text-base-content/80">等于</option>
                        <option value="bigger" class="text-base-content/80">大于</option>
                        <option value="smaller" class="text-base-content/80">小于</option>
                        <option value="contain" class="text-base-content/80">包含</option>
                        <option value="includeIn" class="text-base-content/80">包含于</option>
                        <option value="notContain" class="text-base-content/80">不包含</option>
                        <option value="notIncludeIn" class="text-base-content/80">不包含于</option>
                        <option value="regExp" class="text-base-content/80">正则匹配</option>
                        <option value="notRegExp" class="text-base-content/80">正则不匹配</option>
                      </select>
                    </td>
                    <td>
                      <input 
                        type="text" 
                        v-model="condition.value" 
                        class="input input-bordered input-sm w-full bg-base-100 transition-all duration-200 focus:ring-2 focus:ring-primary focus:ring-opacity-50" 
                      />
                    </td>
                    <td>
                      <button 
                        type="button"
                        class="btn btn-sm btn-error btn-outline"
                        @click="rssRule.conditions.splice(index, 1)"
                      >
                        <i class="fas fa-trash-alt"></i>
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            <span class="text-xs text-base-content/60 mt-4 block">
              <i class="fas fa-info-circle mr-1"></i>
              所有条件都满足时才会匹配该规则
            </span>
          </div>

          <div v-if="rssRule.type === 'javascript'" class="bg-base-200/50 rounded-lg p-4">
            <h3 class="font-medium text-base-content/80 mb-4">JavaScript 脚本</h3>
            <textarea 
              v-model="rssRule.code" 
              class="textarea textarea-bordered w-full h-64 font-mono bg-base-100 transition-all duration-200 focus:ring-2 focus:ring-primary focus:ring-opacity-50" 
              placeholder="输入JavaScript代码"
              required
            ></textarea>
            <span class="text-xs text-base-content/60 mt-2">
              <i class="fas fa-info-circle mr-1"></i>
              返回true表示匹配该规则，可使用内置API如logger.info()等
            </span>
          </div>

          <!-- 操作按钮 -->
          <div class="form-control mt-8">
            <div class="flex flex-col md:flex-row gap-4">
              <button 
                type="submit" 
                class="btn btn-primary flex-1"
              >
                <i class="fas fa-save mr-2"></i>
                保存规则
              </button>
              <button 
                type="button" 
                class="btn btn-ghost flex-1"
                @click="clearRssRule"
              >
                <i class="fas fa-trash-alt mr-2"></i>
                清空表单
              </button>
            </div>
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
      rssRuleList: [],
      downloaders: [],
      rssRule: {
        alias: '',
        category: '',
        savePath: '',
        client: '',
        priority: 0,
        type: 'normal',
        conditions: [],
        code: '(torrent) => {\n  return false;\n}'
      },
      condition: {
        key: '',
        compareType: 'equals',
        value: ''
      },
      conditionKeys: [
        { key: 'name', name: '种子名称' },
        { key: 'size', name: '种子大小' },
        { key: 'description', name: '种子简介' }
      ],
      defaultRssRule: {
        conditions: [{
          key: '',
          compareType: '',
          value: ''
        }],
        alias: '',
        type: '',
        code: '(torrent) => {\n  return false;\n}'
      },
      loading: false
    }
  },
  methods: {
    isMobile() {
      return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    },
    async listRssRule() {
      try {
        const res = await this.$api().rssRule.list()
        this.rssRuleList = res.data
      } catch (e) {
        await this.$message().error(e.message)
      }
    },
    async modifyRssRuleDownloader(rssRule) {
      try {
        await this.$api().rssRule.modify({ ...rssRule })
        await this.$message().success((rssRule.id ? '编辑' : '新增') + '成功, 列表正在刷新...')
        setTimeout(() => this.listRssRule(), 1000)
        this.clearRssRule()
      } catch (e) {
        await this.$message().error(e.message)
      }
    },
    async modifyRssRule() {
      try {
        await this.$api().rssRule.modify({ ...this.rssRule })
        await this.$message().success((this.rssRule.id ? '编辑' : '新增') + '成功, 列表正在刷新...')
        setTimeout(() => this.listRssRule(), 1000)
        this.clearRssRule()
      } catch (e) {
        await this.$message().error(e.message)
      }
    },
    modifyClick(row) {
      this.rssRule = { ...row }
    },
    cloneClick(row) {
      this.rssRule = { ...row, id: undefined }
    },
    async deleteRssRule(row) {
      if (row.used) {
        await this.$message().error('组件被占用, 取消占用后删除')
        return
      }
      try {
        await this.$api().rssRule.delete(row.id)
        await this.$message().success('删除成功, 列表正在刷新...')
        await this.listRssRule()
      } catch (e) {
        await this.$message().error(e.message)
      }
    },
    async listDownloader() {
      try {
        const res = await this.$api().downloader.list()
        this.downloaders = res.data.sort((a, b) => a.alias.localeCompare(b.alias))
      } catch (e) {
        await this.$message().error(e.message)
      }
    },
    clearRssRule() {
      this.rssRule = { ...this.defaultRssRule, conditions: [{ ...this.condition }] }
    }
  },
  async mounted() {
    this.clearRssRule()
    this.listDownloader()
    await this.listRssRule()
  }
}
</script>

<style scoped>
.container {
  max-width: 1440px;
}
</style>