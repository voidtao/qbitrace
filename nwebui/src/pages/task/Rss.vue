<template>
  <div class="container mx-auto px-6 py-8">
    <h1 class="text-2xl font-bold mb-4 text-base-content">RSS 任务</h1>
    <div class="divider"></div>
    
    <div class="card bg-base-100 shadow-sm hover:shadow-md transition-all duration-300 mb-8">
      <div class="card-body">
        <div class="overflow-x-auto">
          <table class="table table-zebra w-full">
            <thead>
              <tr class="bg-base-200/50">
                <th class="text-base-content/70">ID</th>
                <th class="text-base-content/70">别名</th>
                <th class="text-base-content/70">状态</th>
                <th class="text-base-content/70">下载器</th>
                <th class="text-base-content/70">通知</th>
                <th class="text-base-content/70">操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="rss in rssList" 
                  :key="rss.id"
                  class="hover:bg-base-200/30 transition-colors duration-200">
                <td class="text-base-content/80">{{ rss.id }}</td>
                <td class="text-base-content/80 font-medium">{{ rss.alias }}</td>
                <td>
                  <div class="form-control">
                    <label class="label cursor-pointer justify-start">
                      <input 
                        type="checkbox" 
                        class="toggle toggle-primary toggle-sm" 
                        :checked="rss.enable"
                        @change="enableTask(rss)"
                      />
                    </label>
                  </div>
                </td>
                <td class="text-base-content/80">
                  <div class="flex flex-wrap gap-1">
                    <span v-for="downloader in downloaders.filter(item => rss.clientArr.indexOf(item.id) !== -1)"
                          :key="downloader.id"
                          class="badge badge-outline badge-primary">
                      {{ downloader.alias }}
                    </span>
                  </div>
                </td>
                <td>
                  <span class="badge badge-sm" 
                        :class="rss.pushNotify ? 'badge-success bg-success/20 text-success-content' : 'badge-error bg-error/20 text-error-content'">
                    {{ rss.pushNotify ? '启用' : '禁用' }}
                  </span>
                </td>
                <td>
                  <div class="flex gap-2">
                    <button class="btn btn-sm btn-primary btn-outline" 
                            @click="modifyClick(rss)">
                      <i class="fas fa-edit mr-1"></i>
                      编辑
                    </button>
                    <button class="btn btn-sm btn-secondary btn-outline" 
                            @click="cloneClick(rss)">
                      <i class="fas fa-copy mr-1"></i>
                      克隆
                    </button>
                    <div class="dropdown dropdown-end">
                      <label tabindex="0" 
                             class="btn btn-sm btn-error btn-outline">
                        <i class="fas fa-trash-alt mr-1"></i>
                        删除
                      </label>
                      <div tabindex="0" 
                           class="dropdown-content menu p-2 shadow-lg bg-base-100 rounded-lg w-52">
                        <div class="p-2 text-sm text-base-content/70 text-center">确认删除此任务？</div>
                        <button class="btn btn-sm btn-error w-full" 
                                @click="deleteRss(rss)">
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

    <div class="card bg-base-100 shadow-sm hover:shadow-md transition-all duration-300">
      <div class="card-body">
        <h2 class="card-title mb-6 text-base-content">
          <i class="fas fa-rss mr-2 text-primary"></i>
          新增 | 编辑 RSS 任务
        </h2>
        <form @submit.prevent="modifyRss" class="space-y-6">
          <!-- 基本信息 -->
          <div class="bg-base-200/50 rounded-lg p-4 space-y-4">
            <h3 class="font-medium text-base-content/80 mb-2">基本信息</h3>
            <div class="form-control">
              <label class="label">
                <span class="label-text text-base-content/80">任务别名</span>
              </label>
              <input 
                type="text" 
                v-model="rss.alias"
                class="input input-bordered w-full bg-base-100 transition-all duration-200 focus:ring-2 focus:ring-primary focus:ring-opacity-50"
                placeholder="给 RSS 任务取一个好记的名字"
                required
              />
              <span class="text-xs text-base-content/60 mt-2">设置一个易于识别的任务名称</span>
            </div>

            <div class="form-control bg-base-100 rounded-lg p-3">
              <div class="flex items-center justify-between">
                <div>
                  <span class="text-base-content/80 font-medium">启用任务</span>
                  <p class="text-xs text-base-content/60 mt-1">开启后将按照设定的规则自动执行RSS任务</p>
                </div>
                <input 
                  type="checkbox" 
                  v-model="rss.enable"
                  class="toggle toggle-primary"
                />
              </div>
            </div>
          </div>

          <!-- 下载器选择 -->
          <div class="bg-base-200/50 rounded-lg p-4">
            <h3 class="font-medium text-base-content/80 mb-4">下载器选择</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <label 
                v-for="downloader in downloaders" 
                :key="downloader.id"
                class="flex items-center p-3 bg-base-100 rounded-lg cursor-pointer hover:bg-primary hover:bg-opacity-5 transition-colors duration-200"
                :class="{ 'opacity-50': !downloader.enable && !rss.clientArr.includes(downloader.id) }"
              >
                <input 
                  type="checkbox" 
                  :disabled="!downloader.enable && !rss.clientArr.includes(downloader.id)"
                  :value="downloader.id"
                  v-model="rss.clientArr"
                  class="checkbox checkbox-primary mr-3"
                />
                <div class="flex flex-col">
                  <span class="text-base-content/80">{{ downloader.alias }}</span>
                  <span class="text-xs text-base-content/60" v-if="!downloader.enable && !rss.clientArr.includes(downloader.id)">
                    当前不可用
                  </span>
                </div>
              </label>
            </div>
            <span class="text-xs text-base-content/60 mt-4 block">选择用于此RSS任务的下载器</span>
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

          <!-- RSS URL列表 -->
          <div class="bg-base-200/50 rounded-lg p-4">
            <div class="flex items-center justify-between mb-4">
              <h3 class="font-medium text-base-content/80">RSS URL列表</h3>
              <button 
                type="button"
                class="btn btn-primary btn-sm btn-outline"
                @click="rss.rssUrls.push('')"
              >
                <i class="fas fa-plus mr-2"></i>
                添加URL
              </button>
            </div>
            
            <div class="space-y-3">
              <div v-for="(url, index) in rss.rssUrls" 
                   :key="index" 
                   class="flex gap-2 items-start bg-base-100 rounded-lg p-2 transition-all duration-200 hover:shadow-sm">
                <div class="flex-1">
                  <input 
                    type="text" 
                    v-model="rss.rssUrls[index]"
                    class="input input-bordered w-full bg-base-100 transition-all duration-200 focus:ring-2 focus:ring-primary focus:ring-opacity-50"
                    placeholder="输入RSS订阅链接"
                    required
                  />
                  <span class="text-xs text-base-content/60 mt-1 block">
                    URL {{ index + 1 }}
                  </span>
                </div>
                <button 
                  type="button"
                  class="btn btn-error btn-sm btn-outline"
                  @click="rss.rssUrls = rss.rssUrls.filter((_, i) => i !== index)"
                >
                  <i class="fas fa-trash-alt"></i>
                </button>
              </div>
            </div>
            
            <span class="text-xs text-base-content/60 mt-4 block">
              <i class="fas fa-info-circle mr-1"></i>
              添加多个RSS订阅源，系统将自动合并处理
            </span>
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

          <!-- 通知设置 -->
          <div class="bg-base-200/50 rounded-lg p-4">
            <h3 class="font-medium text-base-content/80 mb-4">通知设置</h3>
            
            <div class="form-control bg-base-100 rounded-lg p-3 mb-4">
              <div class="flex items-center justify-between">
                <div>
                  <span class="text-base-content/80 font-medium">推送通知</span>
                  <p class="text-xs text-base-content/60 mt-1">接收RSS任务执行的通知消息</p>
                </div>
                <input 
                  type="checkbox" 
                  v-model="rss.pushNotify"
                  class="toggle toggle-primary"
                />
              </div>
            </div>

            <div class="form-control" v-if="rss.pushNotify">
              <label class="label">
                <span class="label-text text-base-content/80">通知方式</span>
              </label>
              <select 
                v-model="rss.notify"
                class="select select-bordered w-full bg-base-100 transition-all duration-200 focus:ring-2 focus:ring-primary focus:ring-opacity-50"
                required
              >
                <option 
                  v-for="notification in notifications" 
                  :key="notification.id" 
                  :value="notification.id"
                  class="text-base-content/80"
                >
                  {{ notification.alias }}
                </option>
              </select>
              <span class="text-xs text-base-content/60 mt-2">选择接收通知的方式</span>
            </div>
          </div>

          <!-- 速度限制 -->
          <div class="bg-base-200/50 rounded-lg p-4">
            <h3 class="font-medium text-base-content/80 mb-4">速度限制</h3>
            
            <div class="form-control">
              <label class="label">
                <span class="label-text text-base-content/80">上传速度限制</span>
              </label>
              <div class="flex gap-2 items-center">
                <input 
                  type="number" 
                  v-model="rss.uploadLimit"
                  class="input input-bordered w-full bg-base-100 transition-all duration-200 focus:ring-2 focus:ring-primary focus:ring-opacity-50"
                  placeholder="输入速度限制值"
                  min="0"
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
              <span class="text-xs text-base-content/60 mt-2">设置为0表示不限速</span>
            </div>
          </div>

          <!-- 操作按钮 -->
          <div class="form-control mt-8">
            <div class="flex flex-col md:flex-row gap-4">
              <button 
                type="submit" 
                class="btn btn-primary flex-1"
              >
                <i class="fas fa-save mr-2"></i>
                保存设置
              </button>
              <button 
                type="button" 
                class="btn btn-ghost flex-1"
                @click="closeDialog"
              >
                <i class="fas fa-times mr-2"></i>
                取消
              </button>
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