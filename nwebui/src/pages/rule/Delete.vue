<template>
  <div>
    <h1 class="text-2xl font-bold">删种规则</h1>
    <div class="divider"></div>
    <div class="delete-rule">
      <table class="table table-zebra w-full">
        <thead>
          <tr>
            <th>ID</th>
            <th>别名</th>
            <th>持续时间</th>
            <th>优先级</th>
            <th>类型</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="rule in deleteRuleList" :key="rule.id">
            <td>{{ rule.id }}</td>
            <td>{{ rule.alias }}</td>
            <td>{{ rule.fitTime }}</td>
            <td>{{ rule.priority }}</td>
            <td>{{ rule.type === 'normal' ? '普通' : 'JavaScript' }}</td>
            <td>
              <button class="btn btn-sm btn-secondary" @click="modifyClick(rule)">编辑</button>
              <button class="btn btn-sm btn-error" @click="deleteDeleteRule(rule)">删除</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="divider"></div>
    <h2 class="text-xl font-bold">新增 | 编辑删种规则</h2>
    <form @submit.prevent="modifyDeleteRule" class="space-y-4">
      <div class="form-control">
        <label class="label">
          <span class="label-text">别名</span>
        </label>
        <input
          type="text"
          v-model="deleteRule.alias"
          class="input input-bordered"
          required
        />
      </div>
      <div class="form-control">
        <label class="label">
          <span class="label-text">持续时间</span>
        </label>
        <input
          type="number"
          v-model="deleteRule.fitTime"
          class="input input-bordered"
          placeholder="单位: 秒"
        />
      </div>
      <div class="form-control">
        <label class="label">
          <span class="label-text">优先级</span>
        </label>
        <input
          type="number"
          v-model="deleteRule.priority"
          class="input input-bordered"
          placeholder="默认为 0"
        />
      </div>
      <div class="form-control">
        <label class="label">
          <span class="label-text">类型</span>
        </label>
        <select v-model="deleteRule.type" class="select select-bordered">
          <option value="normal">普通</option>
          <option value="javascript">JavaScript</option>
        </select>
      </div>
      <div v-if="deleteRule.type === 'normal'" class="form-control">
        <label class="label">
          <span class="label-text">限制条件</span>
        </label>
        <div class="overflow-x-auto">
          <table class="table table-zebra w-full">
            <thead>
              <tr>
                <th>选项</th>
                <th>比较类型</th>
                <th>值</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="condition in deleteRule.conditions" :key="condition.key">
                <td>
                  <select v-model="condition.key" class="select select-bordered">
                    <option v-for="key in conditionKeys" :key="key.key" :value="key.key">
                      {{ key.name }}
                    </option>
                  </select>
                </td>
                <td>
                  <select v-model="condition.compareType" class="select select-bordered">
                    <option value="equals">等于</option>
                    <option value="bigger">大于</option>
                    <option value="smaller">小于</option>
                    <option value="contain">包含</option>
                    <option value="notContain">不包含</option>
                    <option value="regExp">正则匹配</option>
                    <option value="notRegExp">正则不匹配</option>
                  </select>
                </td>
                <td>
                  <input
                    type="text"
                    v-model="condition.value"
                    class="input input-bordered"
                  />
                </td>
                <td>
                  <button
                    class="btn btn-sm btn-error"
                    @click="deleteRule.conditions = deleteRule.conditions.filter(c => c !== condition)"
                  >
                    删除
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <button class="btn btn-sm btn-primary mt-2" @click="addCondition">新增条件</button>
      </div>
      <div v-if="deleteRule.type === 'javascript'" class="form-control">
        <label class="label">
          <span class="label-text">自定义代码</span>
        </label>
        <textarea
          v-model="deleteRule.code"
          class="textarea textarea-bordered"
          rows="10"
        ></textarea>
      </div>
      <div class="form-control">
        <button type="submit" class="btn btn-primary">保存</button>
        <button type="button" class="btn btn-secondary" @click="clearDeleteRule">
          清空
        </button>
      </div>
    </form>
  </div>
</template>

<script>
export default {
  data() {
    return {
      deleteRuleList: [],
      deleteRule: {
        alias: '',
        fitTime: '',
        priority: 0,
        type: 'normal',
        conditions: [],
        code: ''
      },
      conditionKeys: [
        { key: 'name', name: '种子名称' },
        { key: 'progress', name: '种子进度' },
        { key: 'uploadSpeed', name: '上传速度' },
        { key: 'downloadSpeed', name: '下载速度' },
        { key: 'category', name: '种子分类' },
        { key: 'tags', name: '种子标签' },
        { key: 'size', name: '选择大小' },
        { key: 'totalSize', name: '种子大小' },
        { key: 'state', name: '种子状态' },
        { key: 'tracker', name: '站点域名' },
        { key: 'completed', name: '已完成量' },
        { key: 'downloaded', name: '已下载量' },
        { key: 'uploaded', name: '已上传量' },
        { key: 'ratio', name: '分享率一' },
        { key: 'trueRatio', name: '分享率二' },
        { key: 'ratio3', name: '分享率三' },
        { key: 'addedTime', name: '添加时间' },
        { key: 'completedTime', name: '完成时间' },
        { key: 'savePath', name: '保存路径' },
        { key: 'seeder', name: '做种连接' },
        { key: 'leecher', name: '下载连接' },
        { key: 'freeSpace', name: '剩余空间' },
        { key: 'leechingCount', name: '下载任务' },
        { key: 'seedingCount', name: '做种任务' },
        { key: 'globalUploadSpeed', name: '全局上传' },
        { key: 'globalDownloadSpeed', name: '全局下载' },
        { key: 'secondFromZero', name: '当前时间' }
      ]
    };
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
        await this.$api().deleteRule.modify(this.deleteRule);
        this.$message().success('规则保存成功');
        this.listDeleteRule();
        this.clearDeleteRule();
      } catch (e) {
        this.$message().error(e.message);
      }
    },
    async deleteDeleteRule(rule) {
      try {
        await this.$api().deleteRule.delete(rule.id);
        this.$message().success('规则删除成功');
        this.listDeleteRule();
      } catch (e) {
        this.$message().error(e.message);
      }
    },
    modifyClick(rule) {
      this.deleteRule = { ...rule };
    },
    clearDeleteRule() {
      this.deleteRule = {
        alias: '',
        fitTime: '',
        priority: 0,
        type: 'normal',
        conditions: [],
        code: ''
      };
    },
    addCondition() {
      this.deleteRule.conditions.push({ key: '', compareType: '', value: '' });
    }
  },
  async mounted() {
    this.listDeleteRule();
  }
};
</script>

<style scoped>
.delete-rule {
  width: 100%;
  max-width: 1440px;
  margin: 0 auto;
}
</style>