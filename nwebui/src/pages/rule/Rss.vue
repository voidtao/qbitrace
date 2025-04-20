<template>
  <div class="container mx-auto p-4">
    <h1 class="text-2xl font-bold mb-4">RSS 规则</h1>
    
    <div class="card bg-base-100 shadow-xl mb-8">
      <div class="card-body">
        <h2 class="card-title mb-4">RSS 规则列表</h2>
        <div class="overflow-x-auto">
          <table class="table table-zebra">
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
                  <select 
                    class="select select-bordered select-sm w-full" 
                    v-model="rule.client"
                    @change="modifyRssRuleDownloader(rule)"
                  >
                    <option value="">未选择</option>
                    <option v-for="downloader in downloaders" :key="downloader.id" :value="downloader.id">
                      {{ downloader.alias }}
                    </option>
                  </select>
                </td>
                <td>
                  <div class="flex gap-2">
                    <button class="btn btn-sm btn-primary" @click="cloneClick(rule)">克隆</button>
                    <button class="btn btn-sm btn-secondary" @click="modifyClick(rule)">编辑</button>
                    <div class="dropdown dropdown-end">
                      <button class="btn btn-sm btn-error">删除</button>
                      <ul class="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52">
                        <li><a @click="deleteRssRule(rule)">确认删除</a></li>
                      </ul>
                    </div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <div class="card bg-base-100 shadow-xl">
      <div class="card-body">
        <h2 class="card-title mb-4">新增 | 编辑 RSS 规则</h2>
        <form @submit.prevent="modifyRssRule" class="space-y-4">
          <div class="form-control">
            <label class="label">
              <span class="label-text">别名</span>
              <span class="label-text-alt">给 RSS 规则取一个好记的名字</span>
            </label>
            <input type="text" v-model="rssRule.alias" class="input input-bordered" required />
          </div>

          <div class="form-control">
            <label class="label">
              <span class="label-text">分类</span>
              <span class="label-text-alt">添加种子时下载器内的分类,留空使用 RSS 任务设置的分类</span>
            </label>
            <input type="text" v-model="rssRule.category" class="input input-bordered" />
          </div>

          <div class="form-control">
            <label class="label">
              <span class="label-text">保存路径</span>
              <span class="label-text-alt">添加种子时下载器内的保存路径,留空使用 RSS 任务设置的保存路径</span>
            </label>
            <input type="text" v-model="rssRule.savePath" class="input input-bordered" />
          </div>

          <div class="form-control">
            <label class="label">
              <span class="label-text">下载器</span>
              <span class="label-text-alt">添加种子时选择的下载器,该选项会直接覆盖 RSS 任务的下载器选择</span>
            </label>
            <select class="select select-bordered" v-model="rssRule.client">
              <option value="">未选择</option>
              <option v-for="downloader in downloaders" :key="downloader.id" :value="downloader.id">
                {{ downloader.alias }}
              </option>
            </select>
          </div>

          <div class="form-control">
            <label class="label">
              <span class="label-text">优先级</span>
              <span class="label-text-alt">优先级最高的规则最先匹配,留空则按默认顺序</span>
            </label>
            <input type="number" v-model="rssRule.priority" class="input input-bordered" />
          </div>

          <div class="form-control">
            <label class="label">
              <span class="label-text">类型</span>
            </label>
            <select v-model="rssRule.type" class="select select-bordered" required>
              <option value="normal">普通</option>
              <option value="javascript">JavaScript</option>
            </select>
          </div>

          <div v-if="rssRule.type === 'normal'" class="form-control">
            <label class="label">
              <span class="label-text">限制条件</span>
            </label>
            <div class="overflow-x-auto">
              <table class="table table-zebra">
                <thead>
                  <tr>
                    <th>选项</th>
                    <th>比较类型</th>
                    <th>值</th>
                    <th>操作</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(condition, index) in rssRule.conditions" :key="index">
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
                        <option value="includeIn">包含于</option>
                        <option value="notContain">不包含</option>
                        <option value="notIncludeIn">不包含于</option>
                        <option value="regExp">正则匹配</option>
                        <option value="notRegExp">正则不匹配</option>
                      </select>
                    </td>
                    <td>
                      <input type="text" v-model="condition.value" class="input input-bordered" />
                    </td>
                    <td>
                      <button class="btn btn-sm btn-error" @click="rssRule.conditions.splice(index, 1)">
                        删除
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <button class="btn btn-primary mt-2" @click="rssRule.conditions.push({ ...condition })">
              新增条件
            </button>
          </div>

          <div v-if="rssRule.type === 'javascript'" class="form-control">
            <label class="label">
              <span class="label-text">自定义代码</span>
            </label>
            <textarea v-model="rssRule.code" class="textarea textarea-bordered h-32" required></textarea>
          </div>

          <div class="flex gap-2 mt-6">
            <button type="submit" class="btn btn-primary">应用 | 完成</button>
            <button type="button" class="btn" @click="clearRssRule">清空</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { onMounted, ref } from 'vue'

export default {
  setup() {
    const rssRuleList = ref([])
    const downloaders = ref([])
    const rssRule = ref({
      alias: '',
      category: '',
      savePath: '',
      client: '',
      priority: '',
      type: 'normal',
      conditions: [],
      code: ''
    })

    const condition = {
      key: '',
      compareType: 'equals',
      value: ''
    }

    const conditionKeys = [
      { key: 'title', name: '标题' },
      { key: 'size', name: '大小' },
      { key: 'category', name: '分类' },
      { key: 'link', name: '链接' },
      { key: 'description', name: '描述' },
      { key: 'pubDate', name: '发布时间' }
    ]

    const listRssRule = async () => {
      try {
        const res = await window.$api.rule.listRssRule()
        rssRuleList.value = res.data
      } catch (e) {
        window.$toast.error(e.message)
      }
    }

    const listDownloader = async () => {
      try {
        const res = await window.$api.downloader.list()
        downloaders.value = res.data
      } catch (e) {
        window.$toast.error(e.message)
      }
    }

    const modifyRssRule = async () => {
      try {
        await window.$api.rule.modifyRssRule(rssRule.value)
        window.$toast.success('规则保存成功')
        listRssRule()
        clearRssRule()
      } catch (e) {
        window.$toast.error(e.message)
      }
    }

    const modifyRssRuleDownloader = async (rule) => {
      try {
        await window.$api.rule.modifyRssRule(rule)
        window.$toast.success('下载器更新成功')
        listRssRule()
      } catch (e) {
        window.$toast.error(e.message)
      }
    }

    const deleteRssRule = async (rule) => {
      try {
        await window.$api.rule.deleteRssRule(rule.id)
        window.$toast.success('规则删除成功')
        listRssRule()
      } catch (e) {
        window.$toast.error(e.message)
      }
    }

    const modifyClick = (rule) => {
      rssRule.value = { ...rule }
    }

    const cloneClick = (rule) => {
      rssRule.value = { ...rule, id: undefined }
    }

    const clearRssRule = () => {
      rssRule.value = {
        alias: '',
        category: '',
        savePath: '',
        client: '',
        priority: '',
        type: 'normal',
        conditions: [],
        code: ''
      }
    }

    onMounted(() => {
      listRssRule()
      listDownloader()
    })

    return {
      rssRuleList,
      downloaders,
      rssRule,
      condition,
      conditionKeys,
      modifyRssRule,
      modifyRssRuleDownloader,
      deleteRssRule,
      modifyClick,
      cloneClick,
      clearRssRule
    }
  }
}
</script>

<style scoped>
.container {
  max-width: 1440px;
}
</style>