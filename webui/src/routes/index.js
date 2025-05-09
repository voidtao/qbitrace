import { createRouter, createWebHistory } from 'vue-router';
import Index from '@/pages/Index';
import Layout from '@/pages/Layout';
import DashboardIndex from '@/pages/dashboard/Index';
import BaseDownloader from '@/pages/base/Downloader';
import BaseNotification from '@/pages/base/Notification';
import MetricDownloader from '@/pages/metric/Downloader';
import RuleDelete from '@/pages/rule/Delete';
import RuleRss from '@/pages/rule/Rss';
import TaskRss from '@/pages/task/Rss';
import TaskScript from '@/pages/task/Script';
import ToolNetworkTest from '@/pages/tool/NetworkTest';
import ToolHosts from '@/pages/tool/Hosts';
import ToolProxy from '@/pages/tool/Proxy';
import ToolClientLog from '@/pages/tool/ClientLog';
import InfoInfo from '@/pages/info/Info';
import InfoLog from '@/pages/info/Log';
import SettingBase from '@/pages/setting/Base';
import SettingStyle from '@/pages/setting/Style';
import SettingSecurity from '@/pages/setting/Security';
import SettingBackup from '@/pages/setting/Backup';
import HistoryRss from '@/pages/history/Rss';
import Login from '@/pages/user/Login';

const user = {
  path: 'user',
  component: Index,
  children: [
    {
      path: 'login',
      component: Login,
      meta: {
        title: '用户登录'
      }
    }
  ]
};

const index = {
  path: 'index',
  component: Layout,
  redirect: '/index',
  children: [
    {
      path: '',
      component: DashboardIndex,
      meta: {
        title: '首页'
      }
    }
  ]
};

const metricDownloaderRoute = {
  path: 'metric/downloader',
  component: Layout,
  redirect: 'metric/downloader',
  children: [
    {
      path: '',
      component: MetricDownloader,
      meta: {
        title: '下载器 - 数据监控'
      }
    }
  ]
};

const ruleDeleteRoute = {
  path: 'rule/delete',
  component: Layout,
  redirect: 'rule/delete',
  children: [
    {
      path: '',
      component: RuleDelete,
      meta: {
        title: '删种规则 - 规则组件'
      }
    }
  ]
};

const ruleRssRoute = {
  path: 'rule/rss',
  component: Layout,
  redirect: 'rule/rss',
  children: [
    {
      path: '',
      component: RuleRss,
      meta: {
        title: 'RSS 规则 - 规则组件'
      }
    }
  ]
};


const baseDownloaderRoute = {
  path: 'base/downloader',
  component: Layout,
  redirect: 'base/downloader',
  children: [
    {
      path: '',
      component: BaseDownloader,
      meta: {
        title: '下载器 - 基础组件'
      }
    }
  ]
};

const baseNotificationRoute = {
  path: 'base/notification',
  component: Layout,
  redirect: 'base/notification',
  children: [
    {
      path: '',
      component: BaseNotification,
      meta: {
        title: '通知工具 - 基础组件'
      }
    }
  ]
};

const infoInfoRoute = {
  path: 'info/info',
  component: Layout,
  redirect: 'info/info',
  children: [
    {
      path: '',
      component: InfoInfo,
      meta: {
        title: '相关信息'
      }
    }
  ]
};

const infoLogRoute = {
  path: 'info/log',
  component: Layout,
  redirect: 'info/log',
  children: [
    {
      path: '',
      component: InfoLog,
      meta: {
        title: '系统日志'
      }
    }
  ]
};

const settingBaseRoute = {
  path: 'setting/base',
  component: Layout,
  redirect: 'setting/base',
  children: [
    {
      path: '',
      component: SettingBase,
      meta: {
        title: '基础设置 - 系统设置'
      }
    }
  ]
};

const settingStyleRoute = {
  path: 'setting/style',
  component: Layout,
  redirect: 'setting/style',
  children: [
    {
      path: '',
      component: SettingStyle,
      meta: {
        title: '主题设置 - 系统设置'
      }
    }
  ]
};

const settingSecurityRoute = {
  path: 'setting/security',
  component: Layout,
  redirect: 'setting/security',
  children: [
    {
      path: '',
      component: SettingSecurity,
      meta: {
        title: '安全设置 - 系统设置'
      }
    }
  ]
};

const settingBackupRoute = {
  path: 'setting/backup',
  component: Layout,
  redirect: 'setting/backup',
  children: [
    {
      path: '',
      component: SettingBackup,
      meta: {
        title: '备份还原 - 系统设置'
      }
    }
  ]
};

const taskRssRoute = {
  path: 'task/rss',
  component: Layout,
  redirect: 'task/rss',
  children: [
    {
      path: '',
      component: TaskRss,
      meta: {
        title: 'Rss 任务 - 任务配置'
      }
    }
  ]
};

const taskScriptRoute = {
  path: 'task/script',
  component: Layout,
  redirect: 'task/script',
  children: [
    {
      path: '',
      component: TaskScript,
      meta: {
        title: '定时脚本 - 任务配置'
      }
    }
  ]
};

const historyRssRoute = {
  path: 'history/rss',
  component: Layout,
  redirect: 'history/rss',
  children: [
    {
      path: '',
      component: HistoryRss,
      meta: {
        title: 'RSS 历史 - 任务历史'
      }
    }
  ]
};

const toolNetworkTestRoute = {
  path: 'tool/networkTest',
  component: Layout,
  redirect: 'tool/networkTest',
  children: [
    {
      path: '',
      component: ToolNetworkTest,
      meta: {
        title: '网络测试 - 常用工具'
      }
    }
  ]
};

const toolHostsRoute = {
  path: 'tool/hosts',
  component: Layout,
  redirect: 'tool/hosts',
  children: [
    {
      path: '',
      component: ToolHosts,
      meta: {
        title: '修改 HOSTS - 常用工具'
      }
    }
  ]
};

const toolProxyRoute = {
  path: 'tool/proxy',
  component: Layout,
  redirect: 'tool/proxy',
  children: [
    {
      path: '',
      component: ToolProxy,
      meta: {
        title: 'HTTP 代理 - 常用工具'
      }
    }
  ]
};

const toolClientLogRoute = {
  path: 'tool/clientLog',
  component: Layout,
  redirect: 'tool/clientLog',
  children: [
    {
      path: '',
      component: ToolClientLog,
      meta: {
        title: '下载器日志 - 常用工具'
      }
    }
  ]
};

const routes = [
  {
    path: '/',
    component: Index,
    redirect: '/index',
    children: [
      user,
      index,
      metricDownloaderRoute,
      baseDownloaderRoute,
      baseNotificationRoute,
      ruleRssRoute,
      taskRssRoute,
      ruleDeleteRoute,
      taskScriptRoute,
      historyRssRoute,
      toolNetworkTestRoute,
      toolHostsRoute,
      toolProxyRoute,
      toolClientLogRoute,
      settingBaseRoute,
      settingStyleRoute,
      settingSecurityRoute,
      infoLogRoute,
      settingBackupRoute,
      infoInfoRoute
    ]
  }
];

export default createRouter({
  history: createWebHistory(),
  routes
});
