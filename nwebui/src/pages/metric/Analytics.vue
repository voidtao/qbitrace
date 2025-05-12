<template>
  <div class="container mx-auto p-4">
    <h1 class="text-2xl font-bold mb-4 text-base-content">下载器数据分析</h1>
    <div class="divider"></div>

    <!-- 筛选器 -->
    <div class="card bg-base-100 shadow-xl mb-6">
      <div class="card-body">
        <h2 class="card-title text-base-content">数据筛选</h2>
        
        <!-- Filter Row 1: Client Selection and Time Range Dropdown -->
        <div class="flex flex-col md:flex-row gap-4 mb-2 md:mb-4">
          <!-- Client Selection (approx 80%) -->
          <div class="form-control w-full md:w-4/5">
            <label class="label">
              <span class="label-text text-base-content">选择客户端</span>
            </label>
            <div class="border border-base-300 rounded-lg p-2">
              <div class="flex flex-wrap gap-x-4 gap-y-2">
                <label v-for="client in clients" :key="client.id" class="inline-flex items-center cursor-pointer">
                  <input type="checkbox" :value="client.id" v-model="filter.selectedClients" class="checkbox checkbox-primary checkbox-sm mr-1" />
                  <span class="label-text text-base-content text-sm">{{ client.name }}</span>
                </label>
              </div>
            </div>
          </div>

          <!-- Time Range Dropdown (approx 20%) -->
          <div class="form-control w-full md:w-1/5">
            <label class="label">
              <span class="label-text text-base-content">时间范围</span>
            </label>
            <select v-model="filter.timeRange" class="select select-bordered w-full">
              <option value="1h">1小时</option>
              <option value="24h">24小时</option>
              <option value="7d">7天</option>
              <option value="30d">30天</option>
              <option value="90d">90天</option>
              <option value="custom">自定义</option>
            </select>
          </div>
        </div>

        <!-- Filter Row 2: Custom Time Inputs (conditionally shown) -->
        <div v-if="filter.timeRange === 'custom'" class="form-control mb-4">
          <label class="label pt-0 md:pt-2">
            <span class="label-text text-base-content">自定义时间</span>
          </label>
          <div class="flex flex-col sm:flex-row items-center gap-2">
            <input type="datetime-local" v-model="filter.startDate" class="input input-bordered w-full sm:flex-1" />
            <span class="hidden sm:inline">至</span>
            <input type="datetime-local" v-model="filter.endDate" class="input input-bordered w-full sm:flex-1" />
          </div>
        </div>
        
        <div class="flex justify-end mt-4">
          <button @click="fetchData" class="btn btn-primary">
            <span v-if="loading" class="loading loading-spinner loading-sm"></span>
            刷新数据
          </button>
        </div>
      </div>
    </div>

    <!-- 总体数据概览 -->
    <div class="card bg-base-100 shadow-xl mb-6">
      <div class="card-body">
        <h2 class="card-title text-base-content">数据概览</h2>
        <div v-if="loading" class="flex justify-center p-4">
          <span class="loading loading-spinner loading-lg"></span>
        </div>
        <div v-else>
          <div class="overflow-x-auto">
            <table class="table table-zebra w-full">
              <thead>
                <tr>
                  <th class="text-base-content/70 cursor-pointer" @click="sortBy('alias')">
                    客户端
                    <fa-icon v-if="sortKey === 'alias'" :icon="['fas', sortOrder === 'asc' ? 'sort-up' : 'sort-down']" class="ml-1" />
                  </th>
                  <th class="text-base-content/70 cursor-pointer" @click="sortBy('avgUpSpeed')">
                    平均上传速度
                    <fa-icon v-if="sortKey === 'avgUpSpeed'" :icon="['fas', sortOrder === 'asc' ? 'sort-up' : 'sort-down']" class="ml-1" />
                  </th>
                  <th class="text-base-content/70 cursor-pointer" @click="sortBy('avgDlSpeed')">
                    平均下载速度
                    <fa-icon v-if="sortKey === 'avgDlSpeed'" :icon="['fas', sortOrder === 'asc' ? 'sort-up' : 'sort-down']" class="ml-1" />
                  </th>
                  <th class="text-base-content/70 cursor-pointer" @click="sortBy('maxUpSpeed')">
                    最大上传速度
                    <fa-icon v-if="sortKey === 'maxUpSpeed'" :icon="['fas', sortOrder === 'asc' ? 'sort-up' : 'sort-down']" class="ml-1" />
                  </th>
                  <th class="text-base-content/70 cursor-pointer" @click="sortBy('maxDlSpeed')">
                    最大下载速度
                    <fa-icon v-if="sortKey === 'maxDlSpeed'" :icon="['fas', sortOrder === 'asc' ? 'sort-up' : 'sort-down']" class="ml-1" />
                  </th>
                  <th class="text-base-content/70 cursor-pointer" @click="sortBy('uploadedDelta')">
                    上传总量
                    <fa-icon v-if="sortKey === 'uploadedDelta'" :icon="['fas', sortOrder === 'asc' ? 'sort-up' : 'sort-down']" class="ml-1" />
                  </th>
                  <th class="text-base-content/70 cursor-pointer" @click="sortBy('downloadedDelta')">
                    下载总量
                    <fa-icon v-if="sortKey === 'downloadedDelta'" :icon="['fas', sortOrder === 'asc' ? 'sort-up' : 'sort-down']" class="ml-1" />
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in sortedSummaryData" :key="item.clientId" class="hover:bg-base-200/30">
                  <td>{{ item.alias }}</td>
                  <td>{{ $formatSize(item.avgUpSpeed) }}/s</td>
                  <td>{{ $formatSize(item.avgDlSpeed) }}/s</td>
                  <td>{{ $formatSize(item.maxUpSpeed) }}/s</td>
                  <td>{{ $formatSize(item.maxDlSpeed) }}/s</td>
                  <td>{{ $formatSize(item.uploadedDelta) }}</td>
                  <td>{{ $formatSize(item.downloadedDelta) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- 速度变化图表 -->
    <div class="card bg-base-100 shadow-xl mb-6">
      <div class="card-body">
        <h2 class="card-title text-base-content">速度变化</h2>
        <div v-if="loading" class="flex justify-center p-4">
          <span class="loading loading-spinner loading-lg"></span>
        </div>
        <div v-else class="h-96">
          <canvas ref="speedChart"></canvas>
        </div>
      </div>
    </div>

    <!-- 上传下载数据量变化图表 -->
    <div class="card bg-base-100 shadow-xl mb-6">
      <div class="card-body">
        <h2 class="card-title text-base-content">数据流量变化</h2>
        <div v-if="loading" class="flex justify-center p-4">
          <span class="loading loading-spinner loading-lg"></span>
        </div>
        <div v-else class="h-96">
          <canvas ref="dataChart"></canvas>
        </div>
      </div>
    </div>

    <!-- 磁盘使用情况图表 -->
    <div class="card bg-base-100 shadow-xl mb-6">
      <div class="card-body">
        <h2 class="card-title text-base-content">磁盘使用情况</h2>
        <div v-if="loading" class="flex justify-center p-4">
          <span class="loading loading-spinner loading-lg"></span>
        </div>
        <div v-else class="h-96">
          <canvas ref="diskChart"></canvas>
        </div>
      </div>
    </div>

    <!-- 分享率变化图表 -->
    <div class="card bg-base-100 shadow-xl mb-6">
      <div class="card-body">
        <h2 class="card-title text-base-content">分享率变化</h2>
        <div v-if="loading" class="flex justify-center p-4">
          <span class="loading loading-spinner loading-lg"></span>
        </div>
        <div v-else class="h-96">
          <canvas ref="ratioChart"></canvas>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Chart from 'chart.js/auto';

export default {
  data() {
    return {
      loading: false,
      clients: [],
      historicalData: [],
      summaryData: [],
      filter: {
        selectedClients: [], // 客户端多选数组
        timeRange: '1h',    // 默认时间范围
        startDate: null,    // 自定义开始时间
        endDate: null       // 自定义结束时间
      },
      sortKey: 'uploadedDelta',
      sortOrder: 'desc',
      speedChart: null,
      dataChart: null,
      diskChart: null,
      ratioChart: null // 新增 ratioChart
    };
  },
  computed: {
    sortedSummaryData() {
      return [...this.summaryData].sort((a, b) => {
        let modifier = 1;
        if (this.sortOrder === 'desc') modifier = -1;

        const valA = a[this.sortKey];
        const valB = b[this.sortKey];

        // 处理空值和不同类型
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
    },
    queryParams() {
      const params = {};
      
      // 处理客户端选择
      if (this.filter.selectedClients.length > 0) {
        params.clientIds = this.filter.selectedClients;
      }

      // 处理时间范围
      if (this.filter.timeRange === 'custom') {
        if (this.filter.startDate && this.filter.endDate) {
          params.startTime = Math.floor(new Date(this.filter.startDate).getTime() / 1000);
          params.endTime = Math.floor(new Date(this.filter.endDate).getTime() / 1000);
        }
      } else {
        params.timeRange = this.filter.timeRange;
      }

      return params;
    }
  },
  methods: {
    sortBy(key) {
      if (this.sortKey === key) {
        this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
      } else {
        this.sortKey = key;
        this.sortOrder = 'desc';
      }
    },
    async fetchClients() {
      try {
        const res = await this.$api().analytics.getClients();
        if (res.success) {
          this.clients = res.data;
        } else {
          await this.$message().error(res.message || '获取客户端列表失败');
        }
      } catch (e) {
        await this.$message().error(e.message);
      }
    },
    async fetchData() {
      try {
        this.loading = true;
        this.destroyCharts(); // 先销毁旧图表，防止DOM未更新时引用旧的canvas

        // 检查并设置默认时间范围
        if (this.filter.timeRange === 'custom' && (!this.filter.startDate || !this.filter.endDate)) {
          const now = new Date();
          const yesterday = new Date(now);
          yesterday.setDate(yesterday.getDate() - 1);
          
          this.filter.endDate = now.toISOString().slice(0, 16);
          this.filter.startDate = yesterday.toISOString().slice(0, 16);
        }

        // 获取摘要数据
        const summaryRes = await this.$api().analytics.getSummary(this.queryParams);
        if (summaryRes.success) {
          this.summaryData = summaryRes.data;
        } else {
          await this.$message().error(summaryRes.message || '获取摘要数据失败');
        }
        
        // 获取历史数据
        const historyRes = await this.$api().analytics.getHistoricalData(this.queryParams);
        if (historyRes.success) {
          this.historicalData = historyRes.data;
          // 不在此处立即渲染，等待 loading 状态改变和 DOM 更新
        } else {
          this.historicalData = []; // 清空数据以防使用旧数据渲染
          await this.$message().error(historyRes.message || '获取历史数据失败');
        }
      } catch (e) {
        this.historicalData = []; // 清空数据
        await this.$message().error(e.message);
      } finally {
        this.loading = false;
        this.$nextTick(() => {
          if (this.historicalData && this.historicalData.length > 0) {
            this.renderCharts();
          } else {
            this.destroyCharts(); // 确保在没有数据时也清空图表
          }
        });
      }
    },
    formatTimestamp(timestamp) {
      const date = new Date(timestamp * 1000);
      return date.toLocaleString('zh-CN', { 
        month: '2-digit', 
        day: '2-digit', 
        hour: '2-digit', 
        minute: '2-digit'
      });
    },
    generateRandomColor(index) {
      const predefinedColors = [
        '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
        '#FF9F40', '#C9CBCF', '#7FD13B', '#EA5545', '#F46A9B',
        '#EF9B20', '#27AEEF', '#87BC45', '#B33DC6', '#E60049'
      ];
      
      return index < predefinedColors.length ? predefinedColors[index] : `hsl(${Math.random() * 360}, 70%, 60%)`;
    },
    destroyCharts() {
      if (this.speedChart) {
        this.speedChart.destroy();
        this.speedChart = null;
      }
      if (this.dataChart) {
        this.dataChart.destroy();
        this.dataChart = null;
      }
      if (this.diskChart) {
        this.diskChart.destroy();
        this.diskChart = null;
      }
      if (this.ratioChart) { // 新增销毁 ratioChart
        this.ratioChart.destroy();
        this.ratioChart = null;
      }
    },
    renderCharts() {
      this.destroyCharts(); // 确保在重新渲染前销毁现有图表实例
      
      // 按客户端分组数据
      const groupedData = {};
      const clientMap = {};
      
      this.clients.forEach(client => {
        clientMap[client.id] = client.name;
      });
      
      this.historicalData.forEach(item => {
        if (!groupedData[item.clientid]) {
          groupedData[item.clientid] = [];
        }
        groupedData[item.clientid].push(item);
      });
      
      // 速度变化图表
      this.renderSpeedChart(groupedData, clientMap);
      
      // 上传下载数据量变化图表
      this.renderDataChart(groupedData, clientMap);
      
      // 磁盘使用情况图表
      this.renderDiskChart(groupedData, clientMap);
      
      // 分享率变化图表
      this.renderRatioChart(groupedData, clientMap);
    },
    renderSpeedChart(groupedData, clientMap) {
      if (!this.$refs.speedChart) {
        // console.warn('speedChart ref not found, possibly due to loading state.');
        return;
      }

      const datasets = [];
      const labels = [];
      let colorIndex = 0;
      
      // 找出所有时间戳并排序
      const allTimestamps = new Set();
      Object.values(groupedData).forEach(dataArray => {
        dataArray.forEach(item => {
          allTimestamps.add(item.time);
        });
      });
      
      const sortedTimestamps = Array.from(allTimestamps).sort((a, b) => a - b);
      sortedTimestamps.forEach(timestamp => {
        labels.push(this.formatTimestamp(timestamp));
      });
      
      // 为每个客户端创建上传和下载数据集
      Object.entries(groupedData).forEach(([clientId, dataArray]) => {
        const clientName = clientMap[clientId] || clientId;
        const uploadColor = this.generateRandomColor(colorIndex++);
        const downloadColor = this.generateRandomColor(colorIndex++);
        
        // 上传速度数据集
        const uploadData = new Array(labels.length).fill(null);
        dataArray.forEach(item => {
          const index = sortedTimestamps.indexOf(item.time);
          if (index !== -1) {
            uploadData[index] = item.upspeed;
          }
        });
        
        // 下载速度数据集
        const downloadData = new Array(labels.length).fill(null);
        dataArray.forEach(item => {
          const index = sortedTimestamps.indexOf(item.time);
          if (index !== -1) {
            downloadData[index] = item.dlspeed;
          }
        });
        
        datasets.push({
          label: `${clientName} (上传)`,
          data: uploadData,
          borderColor: uploadColor,
          backgroundColor: `${uploadColor}33`,
          tension: 0.4,
          pointRadius: 1
        });
        
        datasets.push({
          label: `${clientName} (下载)`,
          data: downloadData,
          borderColor: downloadColor,
          backgroundColor: `${downloadColor}33`,
          tension: 0.4,
          pointRadius: 1
        });
      });
      
      // 创建图表
      const ctx = this.$refs.speedChart.getContext('2d');
      this.speedChart = new Chart(ctx, {
        type: 'line',
        data: {
          labels,
          datasets
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            x: {
              ticks: {
                color: getComputedStyle(document.documentElement).getPropertyValue('--color-base-content'),
                maxRotation: 45,
                minRotation: 45
              },
              grid: {
                color: getComputedStyle(document.documentElement).getPropertyValue('--color-base-300')
              }
            },
            y: {
              ticks: {
                color: getComputedStyle(document.documentElement).getPropertyValue('--color-base-content'),
                callback: (value) => this.$formatSize(value) + '/s'
              },
              grid: {
                color: getComputedStyle(document.documentElement).getPropertyValue('--color-base-300')
              }
            }
          },
          plugins: {
            tooltip: {
              callbacks: {
                label: (context) => {
                  return `${context.dataset.label}: ${this.$formatSize(context.raw)}/s`;
                }
              }
            },
            legend: {
              labels: {
                color: getComputedStyle(document.documentElement).getPropertyValue('--color-base-content')
              }
            }
          }
        }
      });
    },
    renderDataChart(groupedData, clientMap) {
      if (!this.$refs.dataChart) {
        // console.warn('dataChart ref not found, possibly due to loading state.');
        return;
      }

      const datasets = [];
      const labels = [];
      let colorIndex = 0;
      
      // 找出所有时间戳并排序
      const allTimestamps = new Set();
      Object.values(groupedData).forEach(dataArray => {
        dataArray.forEach(item => {
          if (item.uploaded !== null && item.downloaded !== null) {
            allTimestamps.add(item.time);
          }
        });
      });
      
      const sortedTimestamps = Array.from(allTimestamps).sort((a, b) => a - b);
      sortedTimestamps.forEach(timestamp => {
        labels.push(this.formatTimestamp(timestamp));
      });
      
      // 为每个客户端创建上传和下载数据集
      Object.entries(groupedData).forEach(([clientId, dataArray]) => {
        const clientName = clientMap[clientId] || clientId;
        const uploadColor = this.generateRandomColor(colorIndex++);
        const downloadColor = this.generateRandomColor(colorIndex++);
        
        const filteredData = dataArray.filter(item => item.uploaded !== null && item.downloaded !== null);
        if (filteredData.length < 2) return; // 需要至少两个数据点才能显示
        
        // 上传数据集
        const uploadData = new Array(labels.length).fill(null);
        filteredData.forEach(item => {
          const index = sortedTimestamps.indexOf(item.time);
          if (index !== -1) {
            uploadData[index] = item.uploaded;
          }
        });
        
        // 下载数据集
        const downloadData = new Array(labels.length).fill(null);
        filteredData.forEach(item => {
          const index = sortedTimestamps.indexOf(item.time);
          if (index !== -1) {
            downloadData[index] = item.downloaded;
          }
        });
        
        datasets.push({
          label: `${clientName} (上传总量)`,
          data: uploadData,
          borderColor: uploadColor,
          backgroundColor: `${uploadColor}33`,
          tension: 0.4,
          pointRadius: 1
        });
        
        datasets.push({
          label: `${clientName} (下载总量)`,
          data: downloadData,
          borderColor: downloadColor,
          backgroundColor: `${downloadColor}33`,
          tension: 0.4,
          pointRadius: 1
        });
      });
      
      // 创建图表
      const ctx = this.$refs.dataChart.getContext('2d');
      this.dataChart = new Chart(ctx, {
        type: 'line',
        data: {
          labels,
          datasets
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            x: {
              ticks: {
                color: getComputedStyle(document.documentElement).getPropertyValue('--color-base-content'),
                maxRotation: 45,
                minRotation: 45
              },
              grid: {
                color: getComputedStyle(document.documentElement).getPropertyValue('--color-base-300')
              }
            },
            y: {
              ticks: {
                color: getComputedStyle(document.documentElement).getPropertyValue('--color-base-content'),
                callback: (value) => this.$formatSize(value)
              },
              grid: {
                color: getComputedStyle(document.documentElement).getPropertyValue('--color-base-300')
              }
            }
          },
          plugins: {
            tooltip: {
              callbacks: {
                label: (context) => {
                  return `${context.dataset.label}: ${this.$formatSize(context.raw)}`;
                }
              }
            },
            legend: {
              labels: {
                color: getComputedStyle(document.documentElement).getPropertyValue('--color-base-content')
              }
            }
          }
        }
      });
    },
    renderDiskChart(groupedData, clientMap) {
      if (!this.$refs.diskChart) {
        // console.warn('diskChart ref not found, possibly due to loading state.');
        return;
      }

      const datasets = [];
      const labels = [];
      let colorIndex = 0;
      
      // 找出所有时间戳并排序
      const allTimestamps = new Set();
      Object.values(groupedData).forEach(dataArray => {
        dataArray.forEach(item => {
          if (item.usedspace !== null && item.freespace !== null) {
            allTimestamps.add(item.time);
          }
        });
      });
      
      const sortedTimestamps = Array.from(allTimestamps).sort((a, b) => a - b);
      sortedTimestamps.forEach(timestamp => {
        labels.push(this.formatTimestamp(timestamp));
      });
      
      // 为每个客户端创建使用空间和剩余空间数据集
      Object.entries(groupedData).forEach(([clientId, dataArray]) => {
        const clientName = clientMap[clientId] || clientId;
        const usedColor = this.generateRandomColor(colorIndex++);
        const freeColor = this.generateRandomColor(colorIndex++);
        
        const filteredData = dataArray.filter(item => item.usedspace !== null && item.freespace !== null);
        if (filteredData.length === 0) return;
        
        // 使用空间数据集
        const usedData = new Array(labels.length).fill(null);
        filteredData.forEach(item => {
          const index = sortedTimestamps.indexOf(item.time);
          if (index !== -1) {
            usedData[index] = item.usedspace;
          }
        });
        
        // 剩余空间数据集
        const freeData = new Array(labels.length).fill(null);
        filteredData.forEach(item => {
          const index = sortedTimestamps.indexOf(item.time);
          if (index !== -1) {
            freeData[index] = item.freespace;
          }
        });
        
        datasets.push({
          label: `${clientName} (已用空间)`,
          data: usedData,
          borderColor: usedColor,
          backgroundColor: `${usedColor}33`,
          tension: 0.4,
          pointRadius: 1
        });
        
        datasets.push({
          label: `${clientName} (剩余空间)`,
          data: freeData,
          borderColor: freeColor,
          backgroundColor: `${freeColor}33`,
          tension: 0.4,
          pointRadius: 1
        });
      });
      
      // 创建图表
      const ctx = this.$refs.diskChart.getContext('2d');
      this.diskChart = new Chart(ctx, {
        type: 'line',
        data: {
          labels,
          datasets
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            x: {
              ticks: {
                color: getComputedStyle(document.documentElement).getPropertyValue('--color-base-content'),
                maxRotation: 45,
                minRotation: 45
              },
              grid: {
                color: getComputedStyle(document.documentElement).getPropertyValue('--color-base-300')
              }
            },
            y: {
              ticks: {
                color: getComputedStyle(document.documentElement).getPropertyValue('--color-base-content'),
                callback: (value) => this.$formatSize(value)
              },
              grid: {
                color: getComputedStyle(document.documentElement).getPropertyValue('--color-base-300')
              }
            }
          },
          plugins: {
            tooltip: {
              callbacks: {
                label: (context) => {
                  return `${context.dataset.label}: ${this.$formatSize(context.raw)}`;
                }
              }
            },
            legend: {
              labels: {
                color: getComputedStyle(document.documentElement).getPropertyValue('--color-base-content')
              }
            }
          }
        }
      });
    },
    renderRatioChart(groupedData, clientMap) {
      if (!this.$refs.ratioChart) {
        // console.warn('ratioChart ref not found, possibly due to loading state.');
        return;
      }

      const datasets = [];
      const labels = [];
      let colorIndex = 0;

      const allTimestamps = new Set();
      Object.values(groupedData).forEach(dataArray => {
        dataArray.forEach(item => {
          if (item.uploaded !== null && item.downloaded !== null) {
            allTimestamps.add(item.time);
          }
        });
      });

      const sortedTimestamps = Array.from(allTimestamps).sort((a, b) => a - b);
      sortedTimestamps.forEach(timestamp => {
        labels.push(this.formatTimestamp(timestamp));
      });

      Object.entries(groupedData).forEach(([clientId, dataArray]) => {
        const clientName = clientMap[clientId] || clientId;
        const ratioColor = this.generateRandomColor(colorIndex++);

        const filteredData = dataArray.filter(item => item.uploaded !== null && item.downloaded !== null);
        if (filteredData.length === 0) return;

        const ratioData = new Array(labels.length).fill(null);
        filteredData.forEach(item => {
          const index = sortedTimestamps.indexOf(item.time);
          if (index !== -1) {
            if (item.downloaded > 0) {
              ratioData[index] = item.uploaded / item.downloaded;
            } else if (item.uploaded > 0 && item.downloaded === 0) {
              ratioData[index] = null; // Or a very high number, or handle as per preference. Null avoids skewing.
            } else {
              ratioData[index] = 0; // 0/0 case or x/0 where x is also 0.
            }
          }
        });
        
        // Only add dataset if there's actual data to show
        if (ratioData.some(d => d !== null)) {
            datasets.push({
              label: `${clientName} (分享率)`,
              data: ratioData,
              borderColor: ratioColor,
              backgroundColor: `${ratioColor}33`,
              tension: 0.4,
              pointRadius: 1,
              spanGaps: true // Connect lines over null points if desired
            });
        }
      });
      
      if (datasets.length === 0 && labels.length === 0) {
        // console.warn('No data to render for ratio chart.');
        return;
      }

      const ctx = this.$refs.ratioChart.getContext('2d');
      this.ratioChart = new Chart(ctx, {
        type: 'line',
        data: {
          labels,
          datasets
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            x: {
              ticks: {
                color: getComputedStyle(document.documentElement).getPropertyValue('--color-base-content'),
                maxRotation: 45,
                minRotation: 45
              },
              grid: {
                color: getComputedStyle(document.documentElement).getPropertyValue('--color-base-300')
              }
            },
            y: {
              ticks: {
                color: getComputedStyle(document.documentElement).getPropertyValue('--color-base-content'),
                callback: (value) => {
                  if (value === null || value === undefined) return '';
                  return Number(value).toFixed(2); // Format ratio to 2 decimal places
                }
              },
              grid: {
                color: getComputedStyle(document.documentElement).getPropertyValue('--color-base-300')
              },
              beginAtZero: true
            }
          },
          plugins: {
            tooltip: {
              callbacks: {
                label: (context) => {
                  if (context.raw === null || context.raw === undefined) return `${context.dataset.label}: N/A`;
                  return `${context.dataset.label}: ${Number(context.raw).toFixed(2)}`;
                }
              }
            },
            legend: {
              labels: {
                color: getComputedStyle(document.documentElement).getPropertyValue('--color-base-content')
              }
            }
          }
        }
      });
    }
  },  async mounted() {
    await this.fetchClients();
    await this.fetchData();
  },
  beforeUnmount() {
    this.destroyCharts();
  }
};
</script>

<style scoped>
.container {
  max-width: 1440px;
}
.card-body {
  padding: 1.25rem;
}
.h-32 {
  height: 8rem; /* 128px */
}
.overflow-y-auto {
  overflow-y: auto;
}
.checkbox-sm {
  height: 1rem; /* 16px */
  width: 1rem; /* 16px */
}
.label-text.text-sm {
  font-size: 0.875rem; /* 14px */
}
</style>