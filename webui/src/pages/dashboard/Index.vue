<template>
  <div class="index">
    <a-row type="flex" justify="center" align="middle" style="min-height: 100%;">
      <a-col :span="isMobile() ? 24 : 24">
        <div style="margin: 24px auto; text-align: center; max-width: 1440px;">
          <div class="data-rect-1" style="background: #eff;">
            <div style="font-size: 14px; font-weight: bold;">
              <div>今日添加</div>
              <div>ACCEPT</div>
              <div style="margin: initial; font-size: 18px;">{{runInfo.addCountToday}}</div>
            </div>
          </div>
          <div class="data-rect-1" style="background: #eff;">
            <div style="font-size: 14px; font-weight: bold;">
              <div>今日拒绝</div>
              <div>REJECT</div>
              <div style="margin: initial; font-size: 18px;">{{runInfo.rejectCountToday}}</div>
            </div>
          </div>
        </div>
        <div style="margin: 24px auto; text-align: center; max-width: 1440px;">
          <div class="data-rect-1 highlight-2">
            <div style="font-size: 14px; font-weight: bold;">
              <div>累计上传</div>
              <div>UPLOAD</div>
              <div style="margin: initial; font-size: 18px;">{{$formatSize(runInfo.uploaded)}}</div>
            </div>
          </div>
          <div class="data-rect-1" style="background: #eff;">
            <div style="font-size: 14px; font-weight: bold;">
              <div>累计下载</div>
              <div>DOWNLOAD</div>
              <div style="margin: initial; font-size: 18px;">{{$formatSize(runInfo.downloaded)}}</div>
            </div>
          </div>
          <div class="data-rect-1" style="background: #eff;">
            <div style="font-size: 14px; font-weight: bold;">
              <div>累计添加</div>
              <div>ACCEPT</div>
              <div style="margin: initial; font-size: 18px;">{{runInfo.addCount}}</div>
            </div>
          </div>
          <div class="data-rect-1" style="background: #eff;">
            <div style="font-size: 14px; font-weight: bold;">
              <div>累计拒绝</div>
              <div>REJECT</div>
              <div style="margin: initial; font-size: 18px;">{{runInfo.rejectCount}}</div>
            </div>
          </div>
        </div>
        <div
          style="margin: 24px auto; text-align: center; max-width: 1440px;"
          v-if="runInfo.dashboardContent.filter(item => item === 'downloader')[0]"
          >
          <template v-for="(downloader, index ) in downloaders" :key="downloader.id">
            <div
              @click="gotoClient(`/proxy/client/${downloader.id}/`)"
              v-if="index === 0"
              class="data-rect-pointer data-rect-2 highlight-3"
              :style="downloaders.length === 1 ? `width: ${isMobile() ? '336px' : '688px'}` : ''">
              <div style="font-size: 14px; font-weight: bold; color: #fff; padding: 16px 16px;">
                <div>{{ downloader.alias }}</div>
                <div style="margin: initial; font-size: 12px;">累计数据: {{ $formatSize(downloader.allTimeUpload) }} ↑ / {{$formatSize(downloader.allTimeDownload)}} ↓</div>
                <div style="margin: initial; font-size: 16px;">{{ $formatSize(downloader.uploadSpeed) }}/s ↑ / {{$formatSize(downloader.downloadSpeed)}}/s ↓</div>
              </div>
            </div>
            <div
              @click="gotoClient(`/proxy/client/${downloader.id}/`)"
              v-if="index !== 0"
              class="data-rect-pointer data-rect-2"
              :style="(downloaders.length === index + 1 && downloaders.length % 2 === 1) ? `background: #eff; width: ${isMobile() ? '336px' : '688px'}` : 'background: #eff;'">
              <div style="font-size: 14px; font-weight: bold; padding: 16px 16px;">
                <div>{{ downloader.alias }}</div>
                <div style="margin: initial; font-size: 12px;">累计数据: {{ $formatSize(downloader.allTimeUpload) }} ↑ / {{$formatSize(downloader.allTimeDownload)}} ↓</div>
                <div style="margin: initial; font-size: 16px;">{{ $formatSize(downloader.uploadSpeed) }}/s ↑ / {{$formatSize(downloader.downloadSpeed)}}/s ↓</div>
              </div>
            </div>
          </template>
        </div>
      </a-col>
    </a-row>
  </div>
</template>
<script>
export default {
  data () {
    return {
      speedChart: {
        grid: {
          left: 0,
          right: 0,
          top: 0,
          bottom: 0,
          z: 0
        },
        xAxis: {
          type: 'category',
          show: false,
          boundaryGap: false,
          data: []
        },
        yAxis: {
          type: 'value',
          show: false
        },
        series: [
          {
            data: [],
            type: 'line',
            symbol: 'none',
            smooth: true,
            areaStyle: {
              opacity: 0.2,
              color: '#BEC23F'
            },
            lineStyle: {
              opacity: 0,
              color: '#BEC23F'
            }
          }, {
            data: [],
            type: 'line',
            symbol: 'none',
            smooth: true,
            areaStyle: {
              opacity: 0,
              color: '#C46243'
            },
            lineStyle: {
              opacity: 0,
              color: '#C46243'
            }
          }
        ]
      },
      runInfo: {
        dashboardContent: []
      },
      downloaders: [],
      loading: true
    };
  },
  methods: {
    isMobile () {
      if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
        return true;
      } else {
        return false;
      }
    },
    async getRunInfo () {
      try {
        const res = await this.$api().setting.getRunInfo();
        this.runInfo = res.data;
        for (const error of this.runInfo.errors.reverse()) {
          await this.$notification().error({
            message: '存在错误信息, 请检查日志',
            description: error.map(item => {
              if (typeof item === 'object') {
                return item.message || item.code || item.description;
              }
              return item;
            }).join(', '),
            duration: 0
          });
        }
      } catch (e) {
        await this.$message().error(e.message);
      }
    },
    async listDownloader () {
      try {
        const res = await this.$api().downloader.listMainInfo();
        this.downloaders = res.data
          .sort((a, b) => a.alias.localeCompare(b.alias))
          .map(item => ({
            ...item,
            speedChart: JSON.parse(JSON.stringify(this.speedChart))
          }));
      } catch (e) {
        await this.$message().error(e.message);
      }
    },
    async listDownloaderInfo () {
      try {
        const res = await this.$api().downloader.listMainInfo();
        for (const downloader of this.downloaders) {
          const upload = res.data.filter(item => item.id === downloader.id)[0]?.uploadSpeed || 0;
          const download = res.data.filter(item => item.id === downloader.id)[0]?.downloadSpeed || 0;
          downloader.uploadSpeed = upload;
          downloader.downloadSpeed = download;
        }
      } catch (e) {
        await this.$message().error(e.message);
      }
    },
    async gotoClient (url) {
      window.open(url);
    }
  },
  async mounted () {
    await this.getRunInfo();
    const downloader = !!this.runInfo.dashboardContent.filter(item => item === 'downloader')[0];
    if (downloader) {
      this.listDownloader();
      this.listDownloaderInfo();
    }
    this.interval = setInterval(() => {
      if (downloader) {
        this.listDownloaderInfo();
      }
    }, 3000);
  },
  beforeUnmount () {
    clearInterval(this.interval);
  }
};
</script>
<style scoped>
.index {
  width: min(calc(100vw - 40px), 960px);
  margin: 0 auto;
  height: 100%;
}

.highlight-1 {
  background: #4b5cc4;
}

.highlight-2 {
  background: lightpink;
}

.highlight-3 {
  background: #3A8FB7;
}

.highlight-4 {
  background: #00896C;
}

.data-rect-1 {
  text-align: left;
  vertical-align: top;
  width: 160px;
  height: 104px;
  transition: all 0.5s;
  padding: 16px 16px;
  color: #555;
  display: inline-block;
  margin: 8px;
  border-radius: 8px;
}

.data-rect-2 {
  text-align: left;
  vertical-align: top;
  width: 336px;
  height: 104px;
  transition: all 0.5s;
  color: #555;
  position: relative;
  display: inline-block;
  margin: 8px;
  border-radius: 8px;
}

.data-rect-pointer {
  cursor: pointer;
}

.torrent-chart {
  height: 320px;
  color: #000
}

</style>