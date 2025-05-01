<template>
  <div class="container mx-auto p-4">
    <h1 class="text-2xl font-bold mb-4">删种规则</h1>
    <div class="divider"></div>
    
    <div class="card bg-base-100 shadow-xs hover:shadow-md transition-all duration-300 mb-8">
      <div class="card-body">
        <h2 class="card-title mb-6 text-base-content">删种规则列表</h2>
        <div class="overflow-x-auto">
          <table class="table table-zebra w-full">
            <thead>
              <tr class="bg-base-200/50">
                <th class="text-base-content/70 cursor-pointer" @click="sortBy('id')">
                  ID
                  <fa-icon v-if="sortKey === 'id'" :icon="['fas', sortOrder === 'asc' ? 'sort-up' : 'sort-down']" class="ml-1" />
                </th>
                <th class="text-base-content/70 cursor-pointer" @click="sortBy('alias')">
                  别名
                  <fa-icon v-if="sortKey === 'alias'" :icon="['fas', sortOrder === 'asc' ? 'sort-up' : 'sort-down']" class="ml-1" />
                </th>
                <th class="text-base-content/70">类型</th>
                <th class="text-base-content/70">持续时间</th>
                <th class="text-base-content/70">优先级</th>
                <th class="text-base-content/70">操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="rule in sortedDeleteRuleList" :key="rule.id" class="hover:bg-base-200/30 transition-colors duration-200">
                <td class="text-base-content/80">{{ rule.id }}</td>
                <td class="text-base-content/80 font-medium">{{ rule.alias }}</td>
                <td class="text-base-content/80">{{ rule.type === 'normal' ? '普通' : 'JavaScript' }}</td>
                <td class="text-base-content/80">{{ rule.fitTime || '-' }}</td>
                <td class="text-base-content/80">{{ rule.priority }}</td>
                <td>
                  <div class="flex gap-2">
                    <button class="btn btn-sm btn-secondary btn-outline" @click="modifyClick(rule)">
                      <fa-icon :icon="['fas','edit']" class="mr-1" />
                      编辑
                    </button>
                    <div class="dropdown dropdown-end">
                      <label tabindex="0" class="btn btn-sm btn-error btn-outline">
                        <fa-icon :icon="['fas','trash-alt']" class="mr-1" />
                        删除
                      </label>
                      <div tabindex="0" class="dropdown-content menu p-2 shadow-lg bg-base-100 rounded-lg w-52">
                        <div class="p-2 text-sm text-base-content/70 text-center">确认删除此规则？</div>
                        <button class="btn btn-sm btn-error w-full" @click="deleteDeleteRule(rule)">
                          确认删除
                        </button>
                      </div>
                    </div>
                  </div>
                </td>
              </tr>
              <tr v-if="sortedDeleteRuleList.length === 0">
                <td colspan="6" class="text-center text-base-content/60 py-4">暂无删种规则</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <div class="card bg-base-100 shadow-xs hover:shadow-md transition-all duration-300">
      <div class="card-body">
        <h2 class="card-title mb-6 text-base-content">
          <fa-icon :icon="['fas','edit']" class="mr-2 text-primary" />
          新增 | 编辑删种规则
        </h2>
        <form @submit.prevent="modifyDeleteRule" class="space-y-6">
          <!-- 基本信息 -->
          <div class="bg-base-200/50 rounded-lg p-4 space-y-4">
            <h3 class="font-medium text-base-content/80 mb-2">基本信息</h3>
            <div class="form-control">
              <label class="label">
                <span class="label-text text-base-content/80">别名</span>
              </label>
              <input 
                type="text" 
                v-model="deleteRule.alias" 
                class="input input-bordered w-full bg-base-100 transition-all duration-200 focus:ring-2 focus:ring-primary focus:ring-opacity-50" 
                placeholder="给删种规则取一个好记的名字"
                required 
              />
              <span class="text-xs text-base-content/60 mt-2">给删种规则取一个好记的名字</span>
            </div>

            <div class="form-control">
              <label class="label">
                <span class="label-text text-base-content/80">持续时间</span>
              </label>
              <input 
                type="number" 
                v-model="deleteRule.fitTime" 
                class="input input-bordered w-full bg-base-100 transition-all duration-200 focus:ring-2 focus:ring-primary focus:ring-opacity-50" 
                placeholder="符合删种规则的持续时间(秒)"
              />
              <span class="text-xs text-base-content/60 mt-2">符合删种规则的持续时间，单位为秒，不启用留空</span>
            </div>

            <div class="form-control">
              <label class="label">
                <span class="label-text text-base-content/80">优先级</span>
              </label>
              <input 
                type="number" 
                v-model="deleteRule.priority" 
                class="input input-bordered w-full bg-base-100 transition-all duration-200 focus:ring-2 focus:ring-primary focus:ring-opacity-50" 
                placeholder="优先级数值，默认为0"
              />
              <span class="text-xs text-base-content/60 mt-2">优先级越高的规则越先执行，默认为0</span>
            </div>

            <div class="form-control">
              <label class="label">
                <span class="label-text text-base-content/80">单次删种数量</span>
              </label>
              <input 
                type="number" 
                v-model="deleteRule.deleteNum" 
                class="input input-bordered w-full bg-base-100 transition-all duration-200 focus:ring-2 focus:ring-primary focus:ring-opacity-50" 
                placeholder="单次删除种子数量"
              />
              <span class="text-xs text-base-content/60 mt-2">单次删种任务的删除种子的数量，留空为单次只删除一个</span>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              <div class="form-control bg-base-100 rounded-lg p-3">
                <div class="flex items-center justify-between">
                  <div>
                    <span class="text-base-content/80 font-medium">暂停种子</span>
                    <p class="text-xs text-base-content/60 mt-1">默认为删除种子，启用该选项后用暂停种子替代</p>
                  </div>
                  <input
                    type="checkbox"
                    v-model="deleteRule.pause"
                    class="toggle toggle-primary"
                  />
                </div>
              </div>
              <div class="form-control bg-base-100 rounded-lg p-3">
                <div class="flex items-center justify-between">
                  <div>
                    <span class="text-base-content/80 font-medium">仅删除种子</span>
                    <p class="text-xs text-base-content/60 mt-1">仅删除种子，若勾选，删除种子时不删除文件</p>
                  </div>
                  <input
                    type="checkbox"
                    v-model="deleteRule.onlyDeleteTorrent"
                    class="toggle toggle-primary"
                  />
                </div>
              </div>
            </div>

            <div class="form-control mt-4">
              <label class="label">
                <span class="label-text text-base-content/80">限制下载速度</span>
              </label>
              <input 
                type="number" 
                v-model="deleteRule.limitSpeed" 
                class="input input-bordered w-full bg-base-100 transition-all duration-200 focus:ring-2 focus:ring-primary focus:ring-opacity-50" 
                placeholder="下载速度限制(字节/秒)"
              />
              <span class="text-xs text-base-content/60 mt-2">单位为字节每秒 Byte/s，留空为不启用</span>
            </div>
          </div>

          <!-- 规则类型 -->
          <div class="bg-base-200/50 rounded-lg p-4">
            <h3 class="font-medium text-base-content/80 mb-4">规则类型</h3>
            <select 
              v-model="deleteRule.type" 
              class="select select-bordered w-full bg-base-100 transition-all duration-200 focus:ring-2 focus:ring-primary focus:ring-opacity-50" 
              required
            >
              <option value="normal" class="text-base-content/80">普通规则</option>
              <option value="javascript" class="text-base-content/80">JavaScript脚本</option>
            </select>
            <span class="text-xs text-base-content/60 mt-2 block">
              <fa-icon :icon="['fas','info-circle']" class="mr-1" />
              选择规则类型：普通规则使用条件匹配，JavaScript脚本使用自定义代码
            </span>
          </div>

          <!-- 普通规则 -->
          <div v-if="deleteRule.type === 'normal'" class="bg-base-200/50 rounded-lg p-4">
            <div class="flex items-center justify-between mb-4">
              <h3 class="font-medium text-base-content/80">限制条件</h3>
              <button 
                type="button"
                class="btn btn-primary btn-sm btn-outline" 
                @click="deleteRule.conditions.push({ ...condition })"
              >
                <fa-icon :icon="['fas','plus']" class="mr-2" />
                新增条件
              </button>
            </div>
            <div class="overflow-x-auto">
              <table class="table table-zebra w-full">
                <thead>
                  <tr class="bg-base-200/50">
                    <th class="text-base-content/70">条件</th>
                    <th class="text-base-content/70">比较类型</th>
                    <th class="text-base-content/70">值</th>
                    <th class="text-base-content/70">操作</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(condition, index) in deleteRule.conditions" 
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
                        @click="deleteRule.conditions.splice(index, 1)"
                      >
                        <fa-icon :icon="['fas','trash-alt']" />
                      </button>
                    </td>
                  </tr>
                  <tr v-if="deleteRule.conditions.length === 0">
                    <td colspan="4" class="text-center text-base-content/60 py-4">
                      暂无条件，请点击"新增条件"按钮添加
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <span class="text-xs text-base-content/60 mt-4 block">
              <fa-icon :icon="['fas','info-circle']" class="mr-1" />
              所有条件都满足时才会触发删种操作
            </span>
          </div>

          <!-- JavaScript 脚本 -->
          <div v-if="deleteRule.type === 'javascript'" class="bg-base-200/50 rounded-lg p-4">
            <h3 class="font-medium text-base-content/80 mb-4">JavaScript 脚本</h3>
            <textarea 
              v-model="deleteRule.code" 
              class="textarea textarea-bordered w-full h-64 font-mono bg-base-100 transition-all duration-200 focus:ring-2 focus:ring-primary focus:ring-opacity-50" 
              placeholder="输入JavaScript代码"
              required
            ></textarea>
            <span class="text-xs text-base-content/60 mt-2 block">
              <fa-icon :icon="['fas','info-circle']" class="mr-1" />
              返回true表示需要删除该种子，可使用内置API如logger.info()等
            </span>
          </div>

          <!-- 操作按钮 -->
          <div class="form-control mt-8">
            <div class="flex flex-col md:flex-row gap-4">
              <button 
                type="submit" 
                class="btn btn-primary flex-1"
              >
                <fa-icon :icon="['fas','save']" class="mr-2" />
                保存规则
              </button>
              <button 
                type="button" 
                class="btn btn-ghost flex-1"
                @click="clearDeleteRule"
              >
                <fa-icon :icon="['fas','trash-alt']" class="mr-2" />
                清空表单
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>

    <!-- 说明卡片 -->
    <div class="card bg-base-100 shadow-xs hover:shadow-md transition-all duration-300 mt-8">
      <div class="card-body">
        <h2 class="card-title mb-4 text-base-content">
          <fa-icon :icon="['fas','info-circle']" class="mr-2 text-info" />
          条件说明
        </h2>
        <div class="space-y-2 text-base-content/80">
          <p><span class="font-bold">01. 分享率一:</span> 上传 / 选中文件大小 的结果</p>
          <p><span class="font-bold">02. 分享率二:</span> 上传 / 下载 的结果</p>
          <p><span class="font-bold">03. 分享率三:</span> 上传 / 种子总大小 的结果</p>
          <p><span class="font-bold">04. 站点域名:</span> 种子的 Tracker 地址的域名部分</p>
          <p><span class="font-bold">05. 各类时间:</span> 选项时间到当前时间的差值, 单位为 秒/s</p>
          <p><span class="font-bold">06. 各类大小:</span> 单位为 字节 / Byte, 可以使用 * 做乘法运算</p>
          <p><span class="font-bold">07. 各类速度:</span> 单位为 字节/s / Byte/s</p>
          <p><span class="font-bold">08. 种子状态:</span> 参照 qBittorrent 对种子状态的定义</p>
          <p class="ml-4 text-base-content/70">上传中: uploading, 下载中: downloading</p>
          <p class="ml-4 text-base-content/70">等待下载: stalledDL, 做种但无上传: stalledUP</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      conditionKeys: [{
        name: '种子名称',
        key: 'name'
      }, {
        name: '种子进度',
        key: 'progress'
      }, {
        name: '上传速度',
        key: 'uploadSpeed'
      }, {
        name: '下载速度',
        key: 'downloadSpeed'
      }, {
        name: '种子分类',
        key: 'category'
      }, {
        name: '种子标签',
        key: 'tags'
      }, {
        name: '选择大小',
        key: 'size'
      }, {
        name: '种子大小',
        key: 'totalSize'
      }, {
        name: '种子状态',
        key: 'state'
      }, {
        name: '站点域名',
        key: 'tracker'
      }, {
        name: '已完成量',
        key: 'completed'
      }, {
        name: '已下载量',
        key: 'downloaded'
      }, {
        name: '已上传量',
        key: 'uploaded'
      }, {
        name: '分享率一',
        key: 'ratio'
      }, {
        name: '分享率二',
        key: 'trueRatio'
      }, {
        name: '分享率三',
        key: 'ratio3'
      }, {
        name: '添加时间',
        key: 'addedTime'
      }, {
        name: '完成时间',
        key: 'completedTime'
      }, {
        name: '保存路径',
        key: 'savePath'
      }, {
        name: '做种连接',
        key: 'seeder'
      }, {
        name: '下载连接',
        key: 'leecher'
      }, {
        name: '剩余空间',
        key: 'freeSpace'
      }, {
        name: '下载任务',
        key: 'leechingCount'
      }, {
        name: '做种任务',
        key: 'seedingCount'
      }, {
        name: '全局上传',
        key: 'globalUploadSpeed'
      }, {
        name: '全局下载',
        key: 'globalDownloadSpeed'
      }, {
        name: '当前时间',
        key: 'secondFromZero'
      }],
      deleteRuleList: [],
      deleteRule: {},
      defaultDeleteRule: {
        conditions: [],
        alias: '',
        type: 'normal', // Default type to normal
        priority: 0,
        code: '(maindata, torrent) => {\n' +
              '  return false;\n' +
              '}'
      },
      condition: {
        key: '',
        compareType: '',
        value: ''
      },
      sortKey: 'alias', // Default sort key
      sortOrder: 'asc' // Default sort order
    };
  },
  computed: {
    sortedDeleteRuleList() {
      return [...this.deleteRuleList].sort((a, b) => {
        let modifier = 1;
        if (this.sortOrder === 'desc') modifier = -1;

        const valA = a[this.sortKey];
        const valB = b[this.sortKey];

        // Handle potential null/undefined or different types if necessary
        if (typeof valA === 'number' && typeof valB === 'number') {
          return (valA - valB) * modifier;
        } else {
          const strA = String(valA).toLowerCase();
          const strB = String(valB).toLowerCase();
          if (strA < strB) return -1 * modifier;
          if (strA > strB) return 1 * modifier;
          return 0;
        }
      });
    }
  },
  methods: {
    async listDeleteRule() {
      try {
        const res = await this.$api().deleteRule.list();
        this.deleteRuleList = res.data;
      } catch (e) {
        this.$message().error(e.message);
      }
    },
    async modifyDeleteRule() {
      try {
        await this.$api().deleteRule.modify({ ...this.deleteRule });
        this.$message().success((this.deleteRule.id ? '编辑' : '新增') + '成功, 列表正在刷新...');
        setTimeout(() => this.listDeleteRule(), 1000);
        this.clearDeleteRule();
      } catch (e) {
        this.$message().error(e.message);
      }
    },
    modifyClick(row) {
      this.deleteRule = { ...row };
    },
    async deleteDeleteRule(rule) {
      if (rule.used) {
        this.$message().error('组件被占用, 取消占用后删除');
        return;
      }
      try {
        await this.$api().deleteRule.delete(rule.id);
        this.$message().success('删除成功, 列表正在刷新...');
        await this.listDeleteRule();
      } catch (e) {
        this.$message().error(e.message);
      }
    },
    clearDeleteRule() {
      this.deleteRule = { 
        ...this.defaultDeleteRule, 
        conditions: [{ ...this.condition }],
        type: 'normal' // Ensure type is set on clear
      };
    },
    sortBy(key) {
      if (this.sortKey === key) {
        this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
      } else {
        this.sortKey = key;
        this.sortOrder = 'asc';
      }
    }
  },
  async mounted() {
    this.clearDeleteRule();
    await this.listDeleteRule();
  }
};
</script>

<style scoped>
.container {
  max-width: 1440px;
}
</style>