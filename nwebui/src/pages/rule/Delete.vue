<template>
  <div class="container mx-auto p-4">
    <h1 class="text-2xl font-bold mb-4">删种规则</h1>
    <div class="divider"></div>
    
    <div class="card bg-base-100 shadow-xl mb-8">
      <div class="card-body">
        <h2 class="card-title mb-4">删种规则列表</h2>
        <div class="overflow-x-auto">
          <table class="table table-zebra">
            <thead>
              <tr>
                <th>别名</th>
                <th>类型</th>
                <th>持续时间</th>
                <th>优先级</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="rule in deleteRuleList" :key="rule.id">
                <td>{{ rule.alias }}</td>
                <td>{{ rule.type === 'normal' ? '普通' : 'JavaScript' }}</td>
                <td>{{ rule.fitTime || '-' }}</td>
                <td>{{ rule.priority }}</td>
                <td>
                  <div class="flex gap-2">
                    <button class="btn btn-sm btn-primary" @click="modifyClick(rule)">编辑</button>
                    <div class="dropdown dropdown-end">
                      <button class="btn btn-sm btn-error">删除</button>
                      <ul class="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52">
                        <li><a @click="deleteDeleteRule(rule)">确认删除</a></li>
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
        <h2 class="card-title mb-4">新增 | 编辑删种规则</h2>
        <form @submit.prevent="modifyDeleteRule" class="space-y-4">
          <div class="form-control">
            <label class="label">
              <span class="label-text">别名</span>
              <span class="label-text-alt">给删种规则取一个好记的名字</span>
            </label>
            <input type="text" v-model="deleteRule.alias" class="input input-bordered" required />
          </div>

          <div class="form-control">
            <label class="label">
              <span class="label-text">持续时间</span>
              <span class="label-text-alt">符合删种规则的持续时间,单位为秒,不启用留空</span>
            </label>
            <input type="number" v-model="deleteRule.fitTime" class="input input-bordered" />
          </div>

          <div class="form-control">
            <label class="label">
              <span class="label-text">优先级</span>
              <span class="label-text-alt">优先级越高的规则越先执行,默认为0</span>
            </label>
            <input type="number" v-model="deleteRule.priority" class="input input-bordered" />
          </div>

          <div class="form-control">
            <label class="label">
              <span class="label-text">单次删种数量</span>
              <span class="label-text-alt">单次删种任务的删除种子的数量,留空为单次只删除一个</span>
            </label>
            <input type="number" v-model="deleteRule.deleteNum" class="input input-bordered" />
          </div>

          <div class="form-control">
            <label class="label cursor-pointer">
              <span class="label-text">暂停种子</span>
              <span class="label-text-alt">默认为删除种子，启用该选项后用暂停种子替代</span>
              <input type="checkbox" v-model="deleteRule.pause" class="checkbox" />
            </label>
          </div>

          <div class="form-control">
            <label class="label cursor-pointer">
              <span class="label-text">仅删除种子</span>
              <span class="label-text-alt">仅删除种子，若勾选，删除种子时不删除文件</span>
              <input type="checkbox" v-model="deleteRule.onlyDeleteTorrent" class="checkbox" />
            </label>
          </div>

          <div class="form-control">
            <label class="label">
              <span class="label-text">限制下载速度</span>
              <span class="label-text-alt">单位为字节每秒 Byte/s,留空为不启用</span>
            </label>
            <input type="number" v-model="deleteRule.limitSpeed" class="input input-bordered" />
          </div>

          <div class="form-control">
            <label class="label">
              <span class="label-text">类型</span>
            </label>
            <select v-model="deleteRule.type" class="select select-bordered" required>
              <option value="normal">普通</option>
              <option value="javascript">JavaScript</option>
            </select>
          </div>

          <div v-if="deleteRule.type === 'normal'" class="form-control">
            <label class="label">
              <span class="label-text">限制条件</span>
              <span class="label-text-alt">关于各个条件的介绍，可以查看下方的说明</span>
            </label>
            <div class="overflow-x-auto">
              <table class="table table-zebra">
                <thead>
                  <tr>
                    <th>条件</th>
                    <th>比较类型</th>
                    <th>值</th>
                    <th>操作</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(condition, index) in deleteRule.conditions" :key="index">
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
                      <button class="btn btn-sm btn-error" @click="deleteRule.conditions.splice(index, 1)">
                        删除
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <button class="btn btn-primary mt-2" @click="deleteRule.conditions.push({ ...condition })">
              新增条件
            </button>
          </div>

          <div v-if="deleteRule.type === 'javascript'" class="form-control">
            <label class="label">
              <span class="label-text">自定义代码</span>
            </label>
            <textarea v-model="deleteRule.code" class="textarea textarea-bordered h-32" required></textarea>
          </div>

          <div class="flex gap-2 mt-6">
            <button type="submit" class="btn btn-primary">应用 | 完成</button>
            <button type="button" class="btn" @click="clearDeleteRule">清空</button>
          </div>
        </form>
      </div>
    </div>

    <div class="card bg-base-100 shadow-xl mt-8">
      <div class="card-body">
        <h2 class="card-title mb-4">说明</h2>
        <div class="space-y-2">
          <p><span class="font-bold">01. 分享率一:</span> 上传 / 选中文件大小 的结果</p>
          <p><span class="font-bold">02. 分享率二:</span> 上传 / 下载 的结果</p>
          <p><span class="font-bold">03. 分享率三:</span> 上传 / 种子总大小 的结果</p>
          <p><span class="font-bold">04. 站点域名:</span> 种子的 Tracker 地址的域名部分</p>
          <p><span class="font-bold">05. 各类时间:</span> 选项时间到当前时间的差值, 单位为 秒/s</p>
          <p><span class="font-bold">06. 各类大小:</span> 单位为 字节 / Byte, 可以使用 * 做乘法运算</p>
          <p><span class="font-bold">07. 各类速度:</span> 单位为 字节/s / Byte/s</p>
          <p><span class="font-bold">08. 种子状态:</span> 参照 qBittorrent 对种子状态的定义</p>
          <p class="ml-4">上传中: uploading, 下载中: downloading</p>
          <p class="ml-4">等待下载: stalledDL, 做种但无上传: stalledUP</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { onMounted, ref } from 'vue'

export default {
  setup() {
    const deleteRuleList = ref([])
    const deleteRule = ref({
      alias: '',
      fitTime: '',
      priority: 0,
      deleteNum: '',
      pause: false,
      onlyDeleteTorrent: false,
      limitSpeed: '',
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
      { key: 'ratio1', name: '分享率一' },
      { key: 'ratio2', name: '分享率二' },
      { key: 'ratio3', name: '分享率三' },
      { key: 'domain', name: '站点域名' },
      { key: 'time', name: '各类时间' },
      { key: 'size', name: '各类大小' },
      { key: 'speed', name: '各类速度' },
      { key: 'status', name: '种子状态' }
    ]

    const listDeleteRule = async () => {
      try {
        const res = await window.$api.rule.listDeleteRule()
        deleteRuleList.value = res.data
      } catch (e) {
        window.$toast.error(e.message)
      }
    }

    const modifyDeleteRule = async () => {
      try {
        await window.$api.rule.modifyDeleteRule(deleteRule.value)
        window.$toast.success('规则保存成功')
        listDeleteRule()
        clearDeleteRule()
      } catch (e) {
        window.$toast.error(e.message)
      }
    }

    const deleteDeleteRule = async (rule) => {
      try {
        await window.$api.rule.deleteDeleteRule(rule.id)
        window.$toast.success('规则删除成功')
        listDeleteRule()
      } catch (e) {
        window.$toast.error(e.message)
      }
    }

    const modifyClick = (rule) => {
      deleteRule.value = { ...rule }
    }

    const clearDeleteRule = () => {
      deleteRule.value = {
        alias: '',
        fitTime: '',
        priority: 0,
        deleteNum: '',
        pause: false,
        onlyDeleteTorrent: false,
        limitSpeed: '',
        type: 'normal',
        conditions: [],
        code: ''
      }
    }

    onMounted(() => {
      listDeleteRule()
    })

    return {
      deleteRuleList,
      deleteRule,
      condition,
      conditionKeys,
      modifyDeleteRule,
      deleteDeleteRule,
      modifyClick,
      clearDeleteRule
    }
  }
}
</script>

<style scoped>
.container {
  max-width: 1440px;
}
</style>