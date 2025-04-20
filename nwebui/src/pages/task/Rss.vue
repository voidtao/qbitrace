<template>
  <div class="container mx-auto px-4 py-8 max-w-7xl">
    <h1 class="text-2xl font-bold mb-6">RSS 任务</h1>
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
                <th>下载器</th>
                <th>通知</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="rss in rssList" :key="rss.id">
                <td>{{ rss.id }}</td>
                <td>{{ rss.alias }}</td>
                <td>
                  <div class="form-control">
                    <label class="label cursor-pointer">
                      <input 
                        type="checkbox" 
                        class="toggle toggle-primary" 
                        :checked="rss.enable"
                        @change="enableTask(rss)"
                      />
                    </label>
                  </div>
                </td>
                <td>
                  {{ downloaders.filter(item => rss.clientArr.indexOf(item.id) !== -1).map(item => item.alias).join(' / ') }}
                </td>
                <td>
                  <span class="badge" :class="rss.pushNotify ? 'badge-success' : 'badge-error'">
                    {{ rss.pushNotify ? '启用' : '禁用' }}
                  </span>
                </td>
                <td>
                  <div class="flex gap-2">
                    <button class="btn btn-sm btn-primary" @click="modifyClick(rss)">编辑</button>
                    <button class="btn btn-sm btn-secondary" @click="cloneClick(rss)">克隆</button>
                    <div class="dropdown dropdown-end">
                      <label tabindex="0" class="btn btn-sm btn-error">删除</label>
                      <div tabindex="0" class="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52">
                        <button class="btn btn-sm btn-error" @click="deleteRss(rss)">确认删除</button>
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
        <h2 class="card-title mb-4">新增 | 编辑 RSS 任务</h2>
        <form @submit.prevent="modifyRss" class="space-y-4">
          <div class="form-control">
            <label class="label">
              <span class="label-text">别名</span>
            </label>
            <input 
              type="text" 
              v-model="rss.alias"
              class="input input-bordered"
              placeholder="给 RSS 任务取一个好记的名字"
              required
            />
          </div>

          <div class="form-control">
            <label class="label cursor-pointer">
              <span class="label-text">启用</span>
              <input 
                type="checkbox" 
                v-model="rss.enable"
                class="checkbox checkbox-primary"
              />
            </label>
          </div>

          <div class="form-control">
            <label class="label">
              <span class="label-text">下载器</span>
            </label>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-2">
              <label 
                v-for="downloader in downloaders" 
                :key="downloader.id"
                class="label cursor-pointer"
              >
                <span class="label-text">{{ downloader.alias }}</span>
                <input 
                  type="checkbox" 
                  :disabled="!downloader.enable && !rss.clientArr.includes(downloader.id)"
                  :value="downloader.id"
                  v-model="rss.clientArr"
                  class="checkbox checkbox-primary"
                />
              </label>
            </div>
          </div>

          <div class="form-control">
            <label class="label">
              <span class="label-text">排序规则</span>
            </label>
            <select 
              v-model="rss.clientSortBy"
              class="select select-bordered"
              required
            >
              <option value="leechingCount">下载种子数量</option>
              <option value="uploadSpeed">当前上传速度</option>
              <option value="downloadSpeed">当前下载速度</option>
              <option value="freeSpaceOnDisk">当前剩余空间</option>
            </select>
          </div>

          <div class="form-control">
            <label class="label">
              <span class="label-text">下载器最高上传速度</span>
            </label>
            <div class="flex gap-2">
              <input 
                type="number" 
                v-model="rss.maxClientUploadSpeed"
                class="input input-bordered flex-1"
                placeholder="留空或 0 不启用"
              />
              <select 
                v-model="rss.maxClientUploadSpeedUnit"
                class="select select-bordered w-32"
              >
                <option value="KiB">KiB/s</option>
                <option value="MiB">MiB/s</option>
                <option value="GiB">GiB/s</option>
              </select>
            </div>
          </div>

          <div class="form-control">
            <label class="label">
              <span class="label-text">下载器最高下载速度</span>
            </label>
            <div class="flex gap-2">
              <input 
                type="number" 
                v-model="rss.maxClientDownloadSpeed"
                class="input input-bordered flex-1"
                placeholder="留空或 0 不启用"
              />
              <select 
                v-model="rss.maxClientDownloadSpeedUnit"
                class="select select-bordered w-32"
              >
                <option value="KiB">KiB/s</option>
                <option value="MiB">MiB/s</option>
                <option value="GiB">GiB/s</option>
              </select>
            </div>
          </div>

          <div class="form-control">
            <label class="label">
              <span class="label-text">下载器下载任务上限</span>
            </label>
            <input 
              type="number" 
              v-model="rss.maxClientDownloadCount"
              class="input input-bordered"
              placeholder="留空或 0 不启用"
            />
          </div>

          <div class="form-control">
            <label class="label">
              <span class="label-text">RssUrl 列表</span>
            </label>
            <div class="space-y-2">
              <div v-for="(url, index) in rss.rssUrls" :key="index" class="flex gap-2">
                <input 
                  type="text" 
                  v-model="rss.rssUrls[index]"
                  class="input input-bordered flex-1"
                  required
                />
                <button 
                  type="button"
                  class="btn btn-error"
                  @click="rss.rssUrls = rss.rssUrls.filter((_, i) => i !== index)"
                >
                  删除
                </button>
              </div>
              <button 
                type="button"
                class="btn btn-primary"
                @click="rss.rssUrls.push('')"
              >
                新增
              </button>
            </div>
          </div>

          <div class="form-control">
            <label class="label cursor-pointer">
              <span class="label-text">抓取免费</span>
              <input 
                type="checkbox" 
                v-model="rss.scrapeFree"
                class="checkbox checkbox-primary"
              />
            </label>
          </div>

          <div class="form-control">
            <label class="label cursor-pointer">
              <span class="label-text">排除 HR</span>
              <input 
                type="checkbox" 
                v-model="rss.scrapeHr"
                class="checkbox checkbox-primary"
              />
            </label>
          </div>

          <div class="form-control" v-if="rss.scrapeHr || rss.scrapeFree">
            <label class="label">
              <span class="label-text">Cookie</span>
            </label>
            <input 
              type="text" 
              v-model="rss.cookie"
              class="input input-bordered"
              placeholder="Cookie, M-Team 为 api key"
              required
            />
          </div>

          <div class="form-control">
            <label class="label">
              <span class="label-text">Rss 周期</span>
            </label>
            <input 
              type="text" 
              v-model="rss.cron"
              class="input input-bordered"
              placeholder="Rss Cron 表达式, 默认为 1 分钟更新一次"
              required
            />
          </div>

          <div class="form-control">
            <label class="label cursor-pointer">
              <span class="label-text">推送通知</span>
              <input 
                type="checkbox" 
                v-model="rss.pushNotify"
                class="checkbox checkbox-primary"
              />
            </label>
          </div>

          <div class="form-control" v-if="rss.pushNotify">
            <label class="label">
              <span class="label-text">通知方式</span>
            </label>
            <select 
              v-model="rss.notify"
              class="select select-bordered"
              required
            >
              <option 
                v-for="notification in notifications" 
                :key="notification.id" 
                :value="notification.id"
              >
                {{ notification.alias }}
              </option>
            </select>
          </div>

          <div class="form-control">
            <label class="label">
              <span class="label-text">限制上传速度</span>
            </label>
            <div class="flex gap-2">
              <input 
                type="number" 
                v-model="rss.uploadLimit"
                class="input input-bordered flex-1"
                placeholder="0 为不限速"
                required
              />
              <select 
                v-model="rss.uploadLimitUnit"
                class="select select-bordered w-32"
              >
                <option value="KiB">KiB/s</option>
                <option value="MiB">MiB/s</option>
                <option value="GiB">GiB/s</option>
              </select>
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

<script setup>
import { ref, onMounted } from 'vue'
import { useToast } from 'vue-toastification'

const toast = useToast()
const rssList = ref([])
const downloaders = ref([])
const notifications = ref([])
const rss = ref({
  alias: '',
  enable: true,
  clientArr: [],
  clientSortBy: 'leechingCount',
  maxClientUploadSpeed: '',
  maxClientUploadSpeedUnit: 'MiB',
  maxClientDownloadSpeed: '',
  maxClientDownloadSpeedUnit: 'MiB',
  maxClientDownloadCount: '',
  rssUrls: [''],
  scrapeFree: false,
  scrapeHr: false,
  cookie: '',
  cron: '* * * * *',
  pushNotify: false,
  notify: '',
  uploadLimit: 0,
  uploadLimitUnit: 'MiB'
})

const getRssList = async () => {
  try {
    const response = await fetch('/api/task/rss')
    const data = await response.json()
    rssList.value = data
  } catch (error) {
    toast.error(error.message)
  }
}

const getDownloaders = async () => {
  try {
    const response = await fetch('/api/downloader')
    const data = await response.json()
    downloaders.value = data
  } catch (error) {
    toast.error(error.message)
  }
}

const getNotifications = async () => {
  try {
    const response = await fetch('/api/notification')
    const data = await response.json()
    notifications.value = data
  } catch (error) {
    toast.error(error.message)
  }
}

const enableTask = async (record) => {
  try {
    const response = await fetch(`/api/task/rss/${record.id}/enable`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ enable: !record.enable })
    })
    if (!response.ok) throw new Error('操作失败')
    await getRssList()
  } catch (error) {
    toast.error(error.message)
  }
}

const modifyClick = (record) => {
  rss.value = { ...record }
}

const cloneClick = (record) => {
  rss.value = { ...record, id: undefined }
}

const deleteRss = async (record) => {
  try {
    const response = await fetch(`/api/task/rss/${record.id}`, {
      method: 'DELETE'
    })
    if (!response.ok) throw new Error('删除失败')
    toast.success('删除成功')
    await getRssList()
  } catch (error) {
    toast.error(error.message)
  }
}

const modifyRss = async () => {
  try {
    const response = await fetch('/api/task/rss', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(rss.value)
    })
    if (!response.ok) throw new Error('保存失败')
    toast.success('保存成功')
    await getRssList()
    rss.value = {
      alias: '',
      enable: true,
      clientArr: [],
      clientSortBy: 'leechingCount',
      maxClientUploadSpeed: '',
      maxClientUploadSpeedUnit: 'MiB',
      maxClientDownloadSpeed: '',
      maxClientDownloadSpeedUnit: 'MiB',
      maxClientDownloadCount: '',
      rssUrls: [''],
      scrapeFree: false,
      scrapeHr: false,
      cookie: '',
      cron: '* * * * *',
      pushNotify: false,
      notify: '',
      uploadLimit: 0,
      uploadLimitUnit: 'MiB'
    }
  } catch (error) {
    toast.error(error.message)
  }
}

onMounted(() => {
  getRssList()
  getDownloaders()
  getNotifications()
})
</script>

<style scoped>
.container {
  max-width: 1440px;
}
</style>