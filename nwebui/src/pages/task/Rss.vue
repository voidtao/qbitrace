<template>
  <div class="container mx-auto p-4">
    <h1 class="text-2xl font-bold mb-4">rss任务</h1>
    <div class="divider"></div>

    <!-- RSS任务列表 Card -->
    <div class="card bg-base-100 shadow-xs hover:shadow-md transition-all duration-300 mb-8">
      <div class="card-body">
        <h2 class="card-title mb-6 text-base-content">RSS任务列表</h2>
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
                <th class="text-base-content/70">状态</th>
                <th class="text-base-content/70">下载器</th>
                <th class="text-base-content/70">通知</th>
                <th class="text-base-content/70">操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="rss in sortedRssList"
                  :key="rss.id"
                  class="hover:bg-base-200/30 transition-colors duration-200">
                <td class="text-base-content/80">{{ rss.id }}</td>
                <td class="text-base-content/80 font-medium">{{ rss.alias }}</td>
                <td>
                  <div class="form-control">
                    <label class="label cursor-pointer justify-start">
                      <input
                        type="checkbox"
                        class="toggle toggle-primary toggle-md"
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
                      <fa-icon :icon="['fas', 'edit']" class="mr-1" />
                      编辑
                    </button>
                    <button class="btn btn-sm btn-secondary btn-outline"
                            @click="cloneClick(rss)">
                      <fa-icon :icon="['fas', 'copy']" class="mr-1" />
                      克隆
                    </button>
                    <div class="dropdown dropdown-end">
                      <label tabindex="0"
                             class="btn btn-sm btn-error btn-outline">
                        <fa-icon :icon="['fas', 'trash-alt']" class="mr-1" />
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

    <!-- 新增 | 编辑 RSS 任务 Card -->
    <div class="card bg-base-100 shadow-xs hover:shadow-md transition-all duration-300">
      <div class="card-body">
        <h2 class="card-title mb-6 text-base-content">
          <fa-icon :icon="['fas', 'rss']" class="mr-2 text-primary" />
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

          <!-- 下载器设置 -->
          <div class="bg-base-200/50 rounded-lg p-4 space-y-4">
            <h3 class="font-medium text-base-content/80 mb-2">下载器设置</h3>
            <div class="form-control">
              <label class="label">
                <span class="label-text text-base-content/80">排序规则</span>
              </label>
              <select
                v-model="rss.clientSortBy"
                class="select select-bordered w-full bg-base-100 transition-all duration-200 focus:ring-2 focus:ring-primary focus:ring-opacity-50"
                required
              >
                <option value="leechingCount">下载种子数量</option>
                <option value="uploadSpeed">当前上传速度</option>
                <option value="downloadSpeed">当前下载速度</option>
                <option value="freeSpaceOnDisk">当前剩余空间</option>
              </select>
              <span class="text-xs text-base-content/60 mt-2">选择下载器排序的优先级方式</span>
            </div>

            <div class="form-control">
              <label class="label">
                <span class="label-text text-base-content/80">下载器最高上传速度</span>
              </label>
              <div class="flex gap-2">
                <input
                  type="number"
                  v-model="rss.maxClientUploadSpeed"
                  class="input input-bordered flex-1 bg-base-100 transition-all duration-200 focus:ring-2 focus:ring-primary focus:ring-opacity-50"
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
              <span class="text-xs text-base-content/60 mt-2">设置下载器的最高上传速度限制</span>
            </div>

            <div class="form-control">
              <label class="label">
                <span class="label-text text-base-content/80">下载器最高下载速度</span>
              </label>
              <div class="flex gap-2">
                <input
                  type="number"
                  v-model="rss.maxClientDownloadSpeed"
                  class="input input-bordered flex-1 bg-base-100 transition-all duration-200 focus:ring-2 focus:ring-primary focus:ring-opacity-50"
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
              <span class="text-xs text-base-content/60 mt-2">设置下载器的最高下载速度限制</span>
            </div>

            <div class="form-control">
              <label class="label">
                <span class="label-text text-base-content/80">下载器下载任务上限</span>
              </label>
              <input
                type="number"
                v-model="rss.maxClientDownloadCount"
                class="input input-bordered w-full bg-base-100 transition-all duration-200 focus:ring-2 focus:ring-primary focus:ring-opacity-50"
                placeholder="留空或 0 不启用"
              />
              <span class="text-xs text-base-content/60 mt-2">设置下载器可同时进行的最大下载任务数</span>
            </div>
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
                <fa-icon :icon="['fas', 'plus']" class="mr-2" />
                添加URL
              </button>
            </div>

            <div class="space-y-3">
              <div v-for="(url, index) in rss.rssUrls"
                   :key="index"
                   class="flex gap-2 items-start bg-base-100 rounded-lg p-2 transition-all duration-200 hover:shadow-md">
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
                  <fa-icon :icon="['fas', 'trash-alt']" />
                </button>
              </div>
            </div>

            <span class="text-xs text-base-content/60 mt-4 block">
              <fa-icon :icon="['fas', 'info-circle']" class="mr-1" />
              添加多个RSS订阅源，系统将自动合并处理
            </span>
          </div>

          <!-- 抓取设置 -->
          <div class="bg-base-200/50 rounded-lg p-4 space-y-4">
            <h3 class="font-medium text-base-content/80 mb-2">抓取设置</h3>
            <div class="form-control bg-base-100 rounded-lg p-3">
              <div class="flex items-center justify-between">
                <div>
                  <span class="text-base-content/80 font-medium">抓取免费</span>
                  <p class="text-xs text-base-content/60 mt-1">启用后将抓取免费种子</p>
                </div>
                <input
                  type="checkbox"
                  v-model="rss.scrapeFree"
                  class="toggle toggle-primary"
                />
              </div>
            </div>

            <div class="form-control bg-base-100 rounded-lg p-3">
              <div class="flex items-center justify-between">
                <div>
                  <span class="text-base-content/80 font-medium">排除 HR</span>
                  <p class="text-xs text-base-content/60 mt-1">启用后将排除 HR 种子</p>
                </div>
                <input
                  type="checkbox"
                  v-model="rss.scrapeHr"
                  class="toggle toggle-primary"
                />
              </div>
            </div>

            <div class="form-control" v-if="rss.scrapeHr || rss.scrapeFree">
              <label class="label">
                <span class="label-text text-base-content/80">Cookie</span>
              </label>
              <input
                type="text"
                v-model="rss.cookie"
                class="input input-bordered w-full bg-base-100 transition-all duration-200 focus:ring-2 focus:ring-primary focus:ring-opacity-50"
                placeholder="Cookie, M-Team 为 api key"
                required
              />
              <span class="text-xs text-base-content/60 mt-2">用于抓取网站内容的身份验证</span>
            </div>

            <div class="form-control">
              <label class="label">
                <span class="label-text text-base-content/80">Rss 周期</span>
              </label>
              <input
                type="text"
                v-model="rss.cron"
                class="input input-bordered w-full bg-base-100 transition-all duration-200 focus:ring-2 focus:ring-primary focus:ring-opacity-50"
                placeholder="Rss Cron 表达式, 默认为 1 分钟更新一次"
                required
              />
              <span class="text-xs text-base-content/60 mt-2">使用 Cron 表达式定义 RSS 刷新周期</span>
            </div>
          </div>

          <!-- 种子添加选项 -->
          <div class="bg-base-200/50 rounded-lg p-4 space-y-4">
            <h3 class="font-medium text-base-content/80 mb-2">种子添加选项</h3>
            <div class="form-control">
              <label class="label">
                <span class="label-text text-base-content/80">保存路径</span>
              </label>
              <input
                type="text"
                v-model="rss.savePath"
                class="input input-bordered w-full bg-base-100 transition-all duration-200 focus:ring-2 focus:ring-primary focus:ring-opacity-50"
                placeholder="推送种子至下载器时的保存路径"
              />
              <span class="text-xs text-base-content/60 mt-2">留空则使用下载器默认路径</span>
            </div>
            <div class="form-control">
              <label class="label">
                <span class="label-text text-base-content/80">分类</span>
              </label>
              <input
                type="text"
                v-model="rss.category"
                class="input input-bordered w-full bg-base-100 transition-all duration-200 focus:ring-2 focus:ring-primary focus:ring-opacity-50"
                placeholder="推送种子至下载器时的分类"
              />
              <span class="text-xs text-base-content/60 mt-2">留空则使用下载器默认分类</span>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div class="form-control bg-base-100 rounded-lg p-3">
                <div class="flex items-center justify-between">
                  <div>
                    <span class="text-base-content/80 font-medium">添加时暂停</span>
                    <p class="text-xs text-base-content/60 mt-1">向下载器添加种子时暂停</p>
                  </div>
                  <input
                    type="checkbox"
                    v-model="rss.paused"
                    class="toggle toggle-primary"
                  />
                </div>
              </div>
              <div class="form-control bg-base-100 rounded-lg p-3">
                <div class="flex items-center justify-between">
                  <div>
                    <span class="text-base-content/80 font-medium">自动管理</span>
                    <p class="text-xs text-base-content/60 mt-1">启用种子的自动管理功能</p>
                  </div>
                  <input
                    type="checkbox"
                    v-model="rss.autoTMM"
                    class="toggle toggle-primary"
                  />
                </div>
              </div>
              <div class="form-control bg-base-100 rounded-lg p-3">
                <div class="flex items-center justify-between">
                  <div>
                    <span class="text-base-content/80 font-medium">跳过大小相同种子</span>
                    <p class="text-xs text-base-content/60 mt-1">跳过已存在相同大小的种子</p>
                  </div>
                  <input
                    type="checkbox"
                    v-model="rss.skipSameTorrent"
                    class="toggle toggle-primary"
                  />
                </div>
              </div>
              <div class="form-control bg-base-100 rounded-lg p-3">
                <div class="flex items-center justify-between">
                  <div>
                    <span class="text-base-content/80 font-medium">推送种子文件</span>
                    <p class="text-xs text-base-content/60 mt-1">默认推送下载链接</p>
                  </div>
                  <input
                    type="checkbox"
                    v-model="rss.pushTorrentFile"
                    class="toggle toggle-primary"
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- 自定义正则 -->
          <div class="bg-base-200/50 rounded-lg p-4 space-y-4" v-if="!rss.pushTorrentFile">
            <h3 class="font-medium text-base-content/80 mb-2">自定义正则替换 (推送链接时生效)</h3>
             <div class="form-control bg-base-100 rounded-lg p-3">
                <div class="flex items-center justify-between">
                  <div>
                    <span class="text-base-content/80 font-medium">启用自定义正则</span>
                    <p class="text-xs text-base-content/60 mt-1">对种子下载链接进行正则替换</p>
                  </div>
                  <input
                    type="checkbox"
                    v-model="rss.useCustomRegex"
                    class="toggle toggle-primary"
                  />
                </div>
              </div>
            <template v-if="rss.useCustomRegex">
              <div class="form-control">
                <label class="label">
                  <span class="label-text text-base-content/80">正则表达式</span>
                </label>
                <input
                  type="text"
                  v-model="rss.regexStr"
                  class="input input-bordered w-full bg-base-100 transition-all duration-200 focus:ring-2 focus:ring-primary focus:ring-opacity-50"
                  placeholder="格式: /pattern/flags"
                  required
                />
                <span class="text-xs text-base-content/60 mt-2">用于匹配种子下载链接的正则表达式</span>
              </div>
              <div class="form-control">
                <label class="label">
                  <span class="label-text text-base-content/80">替换为</span>
                </label>
                <input
                  type="text"
                  v-model="rss.replaceStr"
                  class="input input-bordered w-full bg-base-100 transition-all duration-200 focus:ring-2 focus:ring-primary focus:ring-opacity-50"
                  placeholder="替换匹配到的内容"
                  required
                />
                <span class="text-xs text-base-content/60 mt-2">用于替换匹配内容的字符串</span>
              </div>
            </template>
          </div>

          <!-- 高级设置 -->
          <div class="bg-base-200/50 rounded-lg p-4 space-y-4">
            <h3 class="font-medium text-base-content/80 mb-2">高级设置</h3>
            <div class="form-control">
              <label class="label">
                <span class="label-text text-base-content/80">每小时添加上限</span>
              </label>
              <input
                type="number"
                v-model="rss.addCountPerHour"
                class="input input-bordered w-full bg-base-100 transition-all duration-200 focus:ring-2 focus:ring-primary focus:ring-opacity-50"
                placeholder="留空为 20, 编辑或重启后重置"
              />
              <span class="text-xs text-base-content/60 mt-2">每小时向客户端推送种子数量上限</span>
            </div>
            <div class="form-control">
              <label class="label">
                <span class="label-text text-base-content/80">等待时间 (秒)</span>
              </label>
              <input
                type="number"
                v-model="rss.sleepTime"
                class="input input-bordered w-full bg-base-100 transition-all duration-200 focus:ring-2 focus:ring-primary focus:ring-opacity-50"
                placeholder="建议略小于 Rss 周期"
              />
              <span class="text-xs text-base-content/60 mt-2">若种子非免费, 将在发布后的一段时间内重复抓取免费状态</span>
            </div>
            <div class="form-control">
              <label class="label">
                <span class="label-text text-base-content/80">最长休眠时间 (秒)</span>
              </label>
              <input
                type="number"
                v-model="rss.maxSleepTime"
                class="input input-bordered w-full bg-base-100 transition-all duration-200 focus:ring-2 focus:ring-primary focus:ring-opacity-50"
                placeholder="建议为 3-5 倍 Rss 周期"
                required
              />
              <span class="text-xs text-base-content/60 mt-2">若上次成功 RSS 在 N 秒以前, 则本次拒绝所有种子</span>
            </div>
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
          <div class="bg-base-200/50 rounded-lg p-4 space-y-4">
            <h3 class="font-medium text-base-content/80 mb-2">速度限制 (添加种子时)</h3>
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
            <div class="form-control">
              <label class="label">
                <span class="label-text text-base-content/80">下载速度限制</span>
              </label>
              <div class="flex gap-2 items-center">
                <input
                  type="number"
                  v-model="rss.downloadLimit"
                  class="input input-bordered w-full bg-base-100 transition-all duration-200 focus:ring-2 focus:ring-primary focus:ring-opacity-50"
                  placeholder="输入速度限制值"
                  min="0"
                />
                <select
                  v-model="rss.downloadLimitUnit"
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

          <!-- 规则设置 -->
          <div class="bg-base-200/50 rounded-lg p-4 space-y-4">
            <h3 class="font-medium text-base-content/80 mb-2">规则设置</h3>
            <div class="form-control">
              <label class="label">
                <span class="label-text text-base-content/80">拒绝规则</span>
              </label>
              <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-2">
                <label
                  v-for="rule in rssRules"
                  :key="rule.id"
                  class="flex items-center gap-2 cursor-pointer p-2 bg-base-100 rounded hover:bg-opacity-5 transition-colors duration-200"
                >
                  <input
                    type="checkbox"
                    v-model="rss.rejectRules"
                    :value="rule.id"
                    class="checkbox checkbox-primary checkbox-sm"
                  />
                  <span class="text-sm text-base-content/80">{{ rule.alias }}</span>
                </label>
              </div>
              <span class="text-xs text-base-content/60 mt-2">种子状态符合其中一个时即触发拒绝种子操作</span>
            </div>
            <div class="form-control">
              <label class="label">
                <span class="label-text text-base-content/80">选择规则</span>
              </label>
              <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-2">
                <label
                  v-for="rule in rssRules"
                  :key="rule.id"
                  class="flex items-center gap-2 cursor-pointer p-2 bg-base-100 rounded hover:bg-opacity-5 transition-colors duration-200"
                >
                  <input
                    type="checkbox"
                    v-model="rss.acceptRules"
                    :value="rule.id"
                    class="checkbox checkbox-primary checkbox-sm"
                  />
                  <span class="text-sm text-base-content/80">{{ rule.alias }}</span>
                </label>
              </div>
              <span class="text-xs text-base-content/60 mt-2">种子状态符合其中一个时即触发添加种子操作</span>
            </div>
          </div>

          <!-- 操作按钮 -->
          <div class="form-control mt-8">
            <div class="flex flex-col md:flex-row gap-4">
              <button
                type="submit"
                class="btn btn-primary flex-1"
              >
                <fa-icon :icon="['fas', 'save']" class="mr-2" />
                保存设置
              </button>
              <button
                type="button"
                class="btn btn-secondary flex-1"
                @click="showDryrunModal"
                :disabled="!rss.rssUrls || rss.rssUrls.length === 0 || !rss.rssUrls[0]"
              >
                <fa-icon :icon="['fas', 'vial']" class="mr-2" />
                试运行
              </button>
              <button
                type="button"
                class="btn btn-ghost flex-1"
                @click="clearForm"
              >
                <fa-icon :icon="['fas', 'times']" class="mr-2" />
                清空表单
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  </div>

  <!-- 试运行 Modal -->
  <dialog id="dryrun_modal" class="modal" :class="{ 'modal-open': modalVisible }">
    <div class="modal-box w-11/12 max-w-5xl">
      <h3 class="font-bold text-lg mb-4">RSS 试运行结果</h3>
      <div class="alert alert-info mb-4">
        <fa-icon :icon="['fas', 'info-circle']" class="mr-1" />
        <span>
          注意事项: 试运行仅判断是否符合 RSS 规则，不检测种子免费或 HR 状态。
          <br>
          RSS 链接: {{ rss.rssUrls && rss.rssUrls.length > 0 ? rss.rssUrls[0] : '未设置' }}
        </span>
      </div>
      <div class="overflow-x-auto">
        <table class="table table-zebra w-full">
          <thead>
            <tr>
              <th>种子标题</th>
              <th>种子大小</th>
              <th>结果</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(result, index) in dryrunResult" :key="index">
              <td>{{ result.name }}</td>
              <td>{{ $formatSize(result.size) }}</td>
              <td>
                <span class="badge" :class="result.status === 'accept' ? 'badge-success' : (result.status === 'reject' ? 'badge-error' : 'badge-warning')">
                  {{ result.status === 'accept' ? '接受' : (result.status === 'reject' ? '拒绝' : '跳过') }}
                </span>
              </td>
            </tr>
            <tr v-if="dryrunResult.length === 0">
              <td colspan="3" class="text-center text-base-content/60">没有获取到种子或没有符合条件的种子</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="modal-action">
        <button class="btn" @click="closeDryrunModal">关闭</button>
      </div>
    </div>
    <form method="dialog" class="modal-backdrop">
      <button @click="closeDryrunModal">close</button>
    </form>
  </dialog>
</template>

<script>
export default {
  data() {
    const dryrunColumns = [
      {
        title: '种子标题',
        dataIndex: 'name',
        width: 144
      }, {
        title: '种子大小',
        dataIndex: 'size',
        width: 14
      }, {
        title: '结果',
        dataIndex: 'status',
        width: 28
      }
    ];
    return {
      dryrunColumns,
      modalVisible: false,
      rssList: [],
      downloaders: [],
      notifications: [],
      rssRules: [],
      rss: {},
      defaultRss: {
        clientArr: [],
        enable: false,
        clientSortBy: 'leechingCount',
        maxClientUploadSpeed: '',
        maxClientUploadSpeedUnit: 'MiB',
        maxClientDownloadSpeed: '',
        maxClientDownloadSpeedUnit: 'MiB',
        maxClientDownloadCount: '',
        scrapeFree: false,
        scrapeHr: false,
        cookie: '',
        onlyReseed: false,
        maxSleepTime: 600,
        skipSameTorrent: true,
        pushTorrentFile: true,
        cron: '* * * * *',
        addCountPerHour: '',
        pushNotify: false,
        notify: '',
        uploadLimit: 0,
        uploadLimitUnit: 'MiB',
        downloadLimit: 0,
        downloadLimitUnit: 'MiB',
        savePath: '',
        category: '',
        paused: false,
        autoTMM: false,
        sleepTime: '',
        useCustomRegex: false,
        regexStr: '',
        replaceStr: '',
        acceptRules: [],
        rejectRules: [],
        reseedClients: [],
        rssUrls: ['']
      },
      dryrunResult: [],
      sortKey: 'alias', // Default sort key
      sortOrder: 'asc' // Default sort order
    };
  },
  computed: {
    sortedRssList() {
      return [...this.rssList].sort((a, b) => {
        const modifier = this.sortOrder === 'desc' ? -1 : 1;
        const valA = a[this.sortKey];
        const valB = b[this.sortKey];

        // Handle numeric and string comparisons with a single approach
        if (typeof valA === 'number' && typeof valB === 'number') {
          return (valA - valB) * modifier;
        } else {
          return String(valA).toLowerCase().localeCompare(String(valB).toLowerCase()) * modifier;
        }
      });
    }
  },
  methods: {
    async listRss() {
      try {
        const res = await this.$api().rss.list();
        this.rssList = res.data;
      } catch (e) {
        this.$message().error(e.message);
      }
    },
    async listNotification() {
      try {
        const res = await this.$api().notification.list();
        this.notifications = res.data.sort((a, b) => a.alias.localeCompare(b.alias));
      } catch (e) {
        this.$message().error(e.message);
      }
    },
    async listRssRule() {
      try {
        const res = await this.$api().rssRule.list();
        this.rssRules = res.data.sort((a, b) => a.alias.localeCompare(b.alias));
      } catch (e) {
        this.$message().error(e.message);
      }
    },
    async listDownloader() {
      try {
        const res = await this.$api().downloader.list();
        this.downloaders = res.data.sort((a, b) => a.alias.localeCompare(b.alias));
      } catch (e) {
        this.$message().error(e.message);
      }
    },
    async modifyRss() {
      try {
        await this.$api().rss.modify({ ...this.rss });
        this.$message().success((this.rss.id ? '编辑' : '新增') + '成功, 列表正在刷新...');
        setTimeout(() => this.listRss(), 1000);
        this.clearRss();
      } catch (e) {
        this.$message().error(e.message);
      }
    },
    async dryrun() {
      try {
        const res = await this.$api().rss.dryrun({ ...this.rss });
        this.dryrunResult = res.data;
        this.modalVisible = true;
      } catch (e) {
        this.$message().error(e.message);
      }
    },
    async enableTask(record) {
      try {
        // Create a modified record with toggled enable status
        const updatedRecord = { 
          ...record, 
          enable: !record.enable 
        };
        await this.$api().rss.modify(updatedRecord);
        this.$message().success('修改成功, 列表正在刷新...');
        setTimeout(() => this.listRss(), 1000);
      } catch (e) {
        this.$message().error(e.message);
      }
    },
    modifyClick(row) {
      this.rss = { ...row };
    },
    cloneClick(row) {
      this.rss = JSON.parse(JSON.stringify(row));
      this.rss.id = null;
      this.rss.alias = this.rss.alias + '-克隆';
    },
    async deleteRss(row) {
      try {
        await this.$api().rss.delete(row.id);
        this.$message().success('删除成功, 列表正在刷新...');
        await this.listRss();
      } catch (e) {
        this.$message().error(e.message);
      }
    },
    clearRss() {
      this.rss = {
        ...this.defaultRss,
        acceptRules: [],
        clientArr: [],
        rejectRules: [],
        reseedClients: [],
        rssUrls: ['']
      };
    },
    showDryrunModal() {
      this.dryrunResult = [];
      this.dryrun();
    },
    closeDryrunModal() {
      this.modalVisible = false;
    },
    clearForm() {
      this.clearRss();
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
    this.clearRss();
    this.listNotification();
    this.listDownloader();
    this.listRssRule();
    await this.listRss();
  }
};
</script>

<style scoped>
.container {
  max-width: 1440px;
}
/* Ensure modal background click closes it */
.modal-backdrop {
  background-color: rgba(0, 0, 0, 0.5);
}
</style>