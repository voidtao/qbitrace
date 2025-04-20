import api from './api';
import App from './App.vue';
import moment from 'moment';
import { createApp, ref, defineComponent } from 'vue';
import { library } from '@fortawesome/fontawesome-svg-core';
import { fas } from '@fortawesome/free-solid-svg-icons';
import { fab } from '@fortawesome/free-brands-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { use } from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { PieChart, LineChart, BarChart } from 'echarts/charts';
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
  GraphicComponent,
  DataZoomComponent,
  ToolboxComponent
} from 'echarts/components';
import VChart from 'vue-echarts';
import 'zrender/lib/svg/svg';
import VueLazyLoad from 'vue-lazyload-next';
import md5 from 'md5-node';

import router from './routes';
import './registerServiceWorker';

library.add(fas);
library.add(fab);

use([
  CanvasRenderer,
  PieChart,
  LineChart,
  BarChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
  GraphicComponent,
  DataZoomComponent,
  ToolboxComponent
]);

const app = createApp(App);

app.use(VueLazyLoad, {
  loading: '/assets/images/loading.gif'
});

app.component('v-chart', VChart);

app.component('v-nodes', (_, { attrs }) => {
  return attrs.vnodes;
});

app.component('fa-icon', FontAwesomeIcon);

router.beforeEach((to) => {
  if (to.meta.title) {
    document.title = to.meta.title + ' :: qbitrace';
  }
});

app.use(router);

const message = () => {
  return {
    success: (msg) => {
      const toast = document.createElement('div');
      toast.className = 'toast toast-top toast-end';
      toast.innerHTML = `
        <div class="alert alert-success">
          <span>${msg}</span>
        </div>
      `;
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 3000);
    },
    error: (msg) => {
      const toast = document.createElement('div');
      toast.className = 'toast toast-top toast-end';
      toast.innerHTML = `
        <div class="alert alert-error">
          <span>${msg}</span>
        </div>
      `;
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 3000);
    }
  };
};

const notification = () => {
  return {
    open: ({ message: title, description, duration = 0 }) => {
      const modal = document.createElement('div');
      modal.className = 'modal modal-open';
      modal.innerHTML = `
        <div class="modal-box">
          <h3 class="font-bold text-lg">${title}</h3>
          <p class="py-4">${description}</p>
          <div class="modal-action">
            <button class="btn" onclick="this.closest('.modal').remove()">关闭</button>
          </div>
        </div>
      `;
      document.body.appendChild(modal);
      if (duration > 0) {
        setTimeout(() => modal.remove(), duration);
      }
    }
  };
};

const formatSize = (_size) => {
  const tag = _size < 0;
  const size = Math.abs(_size);
  if (size < 1024) {
    return (tag ? '-' : '') + `${size.toFixed(2)} Byte`;
  }
  if (size < 1024 * 1024) {
    return (tag ? '-' : '') + `${(size / 1024).toFixed(2)} KiB`;
  }
  if (size < 1024 * 1024 * 1024) {
    return (tag ? '-' : '') + `${(size / 1024 / 1024).toFixed(2)} MiB`;
  }
  if (size < 1024 * 1024 * 1024 * 1024) {
    return (tag ? '-' : '') + `${(size / 1024 / 1024 / 1024).toFixed(2)} GiB`;
  }
  if (size < 1024 * 1024 * 1024 * 1024 * 1024) {
    return (tag ? '-' : '') + `${(size / 1024 / 1024 / 1024 / 1024).toFixed(2)} TiB`;
  }
  if (size < 1024 * 1024 * 1024 * 1024 * 1024 * 1024) {
    return (tag ? '-' : '') + `${(size / 1024 / 1024 / 1024 / 1024 / 1024).toFixed(3)} PiB`;
  }
  return '0 Byte';
};

app.mixin({
  methods: {
    $goto: (a, b) => {
      b.push(a);
    },
    $api: api,
    $moment: moment,
    $message: message,
    $notification: notification,
    $defineComponent: defineComponent,
    $formatSize: formatSize,
    $ref: ref,
    $md5: md5
  }
});

app.mount('#app');