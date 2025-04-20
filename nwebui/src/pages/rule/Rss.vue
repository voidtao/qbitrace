<template>
  <div>
    <h1 class="text-2xl font-bold">RSS 规则</h1>
    <div class="divider"></div>
    <div class="rss-rule">
      <table class="table table-zebra w-full">
        <thead>
          <tr>
            <th>ID</th>
            <th>别名</th>
            <th>下载器</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="rule in rssRuleList" :key="rule.id">
            <td>{{ rule.id }}</td>
            <td>{{ rule.alias }}</td>
            <td>
              <select v-model="rule.client" class="select select-bordered" @change="modifyRssRuleDownloader(rule)">
                <option v-for="downloader in downloaders" :key="downloader.id" :value="downloader.id">
                  {{ downloader.alias }}
                </option>
              </select>
            </td>
            <td>
              <button class="btn btn-sm btn-secondary" @click="cloneClick(rule)">克隆</button>
              <button class="btn btn-sm btn-primary" @click="modifyClick(rule)">编辑</button>
              <button class="btn btn-sm btn-error" @click="deleteRssRule(rule)">删除</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="divider"></div>
    <h2 class="text-xl font-bold">新增 | 编辑 RSS 规则</h2>
    <form @submit.prevent="modifyRssRule" class="space-y-4">
      <div class="form-control">
        <label class="label">
          <span class="label-text">别名</span>
        </label>
        <input type="text" v-model="rssRule.alias" class="input input-bordered" required />
      </div>
      <div class="form-control">
        <label class="label">
          <span class="label-text">分类</span>
        </label>
        <input type="text" v-model="rssRule.category" class="input input-bordered" />
      </div>
      <div class="form-control">
        <label class="label">
          <span class="label-text">保存路径</span>
        </label>
        <input type="text" v-model="rssRule.savePath" class="input input-bordered" />
      </div>
      <div class="form-control">
        <label class="label">
          <span class="label-text">下载器</span>
        </label>
        <select v-model="rssRule.client" class="select select-bordered">
          <option v-for="downloader in downloaders" :key="downloader.id" :value="downloader.id">
            {{ downloader.alias }}
          </option>
        </select>
      </div>
      <div class="form-control">
        <label class="label">
          <span class="label-text">优先级</span>
        </label>
        <input type="number" v-model="rssRule.priority" class="input input-bordered" />
      </div>
      <div class="form-control">
        <label class="label">
          <span class="label-text">类型</span>
        </label>
        <select v-model="rssRule.type" class="select select-bordered">
          <option value="normal">普通</option>
          <option value="javascript">JavaScript</option>
        </select>
      </div>
      <div v-if="rssRule.type === 'normal'" class="form-control">
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
              <tr v-for="condition in rssRule.conditions" :key="condition.key">
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
                  <input type="text" v-model="condition.value" class="input input-bordered" />
                </td>
                <td>
                  <button class="btn btn-sm btn-error" @click="rssRule.conditions = rssRule.conditions.filter(c => c !== condition)">
                    删除
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <button class="btn btn-sm btn-primary mt-2" @click="addCondition">新增条件</button>
      </div>
      <div v-if="rssRule.type === 'javascript'" class="form-control">
        <label class="label">
          <span class="label-text">自定义代码</span>
        </label>
        <textarea v-model="rssRule.code" class="textarea textarea-bordered" rows="10"></textarea>
      </div>
      <div class="form-control">
        <button type="submit" class="btn btn-primary">保存</button>
        <button type="button" class="btn btn-secondary" @click="clearRssRule">清空</button>
      </div>
    </form>
  </div>
</template>

<script>
export default {
  data() {
    return {
      rssRuleList: [],
      rssRule: {
        alias: '',
        category: '',
        savePath: '',
        client: '',
        priority: 0,
        type: 'normal',
        conditions: [],
        code: ''
      },
      conditionKeys: [
        { key: 'name', name: '种子名称' },
        { key: 'size', name: '种子大小' },
        { key: 'description', name: '种子简介' }
      ],
      downloaders: []
    };
  },
  methods: {
    async listRssRule() {
      try {
        const res = await this.$api().rssRule.list();
        this.rssRuleList = res.data;
      } catch (e) {
        this.$message().error(e.message);
      }
    },
    async modifyRssRuleDownloader(rule) {
      try {
        await this.$api().rssRule.modify({ ...rule });
        this.$message().success('规则更新成功');
        this.listRssRule();
      } catch (e) {
        this.$message().error(e.message);
      }
    },
    async modifyRssRule() {
      try {
        await this.$api().rssRule.modify({ ...this.rssRule });
        this.$message().success('规则保存成功');
        this.listRssRule();
        this.clearRssRule();
      } catch (e) {
        this.$message().error(e.message);
      }
    },
    async deleteRssRule(rule) {
      try {
        await this.$api().rssRule.delete(rule.id);
        this.$message().success('规则删除成功');
        this.listRssRule();
      } catch (e) {
        this.$message().error(e.message);
      }
    },
    modifyClick(rule) {
      this.rssRule = { ...rule };
    },
    cloneClick(rule) {
      this.rssRule = { ...rule, id: undefined };
    },
    clearRssRule() {
      this.rssRule = {
        alias: '',
        category: '',
        savePath: '',
        client: '',
        priority: 0,
        type: 'normal',
        conditions: [],
        code: ''
      };
    },
    addCondition() {
      this.rssRule.conditions.push({ key: '', compareType: '', value: '' });
    },
    async listDownloader() {
      try {
        const res = await this.$api().downloader.list();
        this.downloaders = res.data;
      } catch (e) {
        this.$message().error(e.message);
      }
    }
  },
  async mounted() {
    await this.listDownloader();
    await this.listRssRule();
  }
};
</script>

<style scoped>
.rss-rule {
  width: 100%;
  max-width: 1440px;
  margin: 0 auto;
}
</style>