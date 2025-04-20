<template>
  <div class="container mx-auto px-4 py-8 max-w-7xl">
    <h1 class="text-2xl font-bold mb-6">定时脚本</h1>
    <div class="divider"></div>
    
    <div class="card bg-base-100 shadow-xl mb-8">
      <div class="card-body">
        <div class="overflow-x-auto">
          <table class="table table-zebra">
            <thead>
              <tr>
                <th>ID</th>
                <th>别名</th>
                <th>状态</th>
                <th>周期</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="script in scripts" :key="script.id">
                <td>{{ script.id }}</td>
                <td>{{ script.alias }}</td>
                <td>
                  <span class="badge" :class="script.enable ? 'badge-success' : 'badge-error'">
                    {{ script.enable ? '启用' : '禁用' }}
                  </span>
                </td>
                <td>{{ script.cron }}</td>
                <td>
                  <div class="flex gap-2">
                    <button class="btn btn-sm btn-primary" @click="modifyClick(script)">编辑</button>
                    <div class="dropdown dropdown-end">
                      <label tabindex="0" class="btn btn-sm btn-error">删除</label>
                      <div tabindex="0" class="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52">
                        <button class="btn btn-sm btn-error" @click="deleteScript(script)">确认删除</button>
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

    <div class="card bg-base-100 shadow-xl">
      <div class="card-body">
        <h2 class="card-title mb-4">新增 | 编辑定时脚本</h2>
        <form @submit.prevent="modifyScript" class="space-y-4">
          <div class="form-control">
            <label class="label">
              <span class="label-text">别名</span>
            </label>
            <input 
              type="text" 
              v-model="script.alias"
              class="input input-bordered"
              placeholder="给定时脚本取一个好记的名字"
              required
            />
          </div>

          <div class="form-control">
            <label class="label cursor-pointer">
              <span class="label-text">启用</span>
              <input 
                type="checkbox" 
                v-model="script.enable"
                class="checkbox checkbox-primary"
              />
            </label>
          </div>

          <div class="form-control">
            <label class="label">
              <span class="label-text">执行周期</span>
            </label>
            <input 
              type="text" 
              v-model="script.cron"
              class="input input-bordered"
              placeholder="脚本的执行周期, 默认 * * * * * 一分钟执行一次"
              required
            />
          </div>

          <div class="form-control">
            <label class="label">
              <span class="label-text">代码</span>
            </label>
            <textarea 
              v-model="script.script"
              class="textarea textarea-bordered h-48"
              placeholder="输入脚本代码"
              required
            ></textarea>
          </div>

          <div class="form-control mt-6">
            <div class="flex gap-2">
              <button type="submit" class="btn btn-primary">保存</button>
              <button type="button" class="btn btn-secondary" @click="run">立即执行一次</button>
              <button type="button" class="btn btn-ghost" @click="clearScript">清空</button>
            </div>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useToast } from 'vue-toastification'

const toast = useToast()
const scripts = ref([])
const script = ref({
  alias: '',
  enable: true,
  cron: '* * * * *',
  script: 'logger.info(\'qbitrace IS THE BEST!\')'
})

const getScripts = async () => {
  try {
    const response = await fetch('/api/task/script')
    const data = await response.json()
    scripts.value = data
  } catch (error) {
    toast.error(error.message)
  }
}

const modifyClick = (record) => {
  script.value = { ...record }
}

const deleteScript = async (record) => {
  try {
    const response = await fetch(`/api/task/script/${record.id}`, {
      method: 'DELETE'
    })
    if (!response.ok) throw new Error('删除失败')
    toast.success('删除成功')
    await getScripts()
  } catch (error) {
    toast.error(error.message)
  }
}

const modifyScript = async () => {
  try {
    const response = await fetch('/api/task/script', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(script.value)
    })
    if (!response.ok) throw new Error('保存失败')
    toast.success('保存成功')
    await getScripts()
    clearScript()
  } catch (error) {
    toast.error(error.message)
  }
}

const run = async () => {
  try {
    const response = await fetch('/api/task/script/run', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(script.value)
    })
    if (!response.ok) throw new Error('执行失败')
    toast.success('执行成功，请查看日志')
    await getScripts()
  } catch (error) {
    toast.error(error.message)
  }
}

const clearScript = () => {
  script.value = {
    alias: '',
    enable: true,
    cron: '* * * * *',
    script: 'logger.info(\'qbitrace IS THE BEST!\')'
  }
}

onMounted(() => {
  getScripts()
  clearScript()
})
</script>

<style scoped>
.container {
  max-width: 1440px;
}
</style>
