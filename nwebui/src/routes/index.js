import { createRouter, createWebHistory } from 'vue-router';
import Index from '@/pages/Index.vue';
import Layout from '@/pages/Layout.vue';
import DashboardIndex from '@/pages/dashboard/Index.vue';
import BaseDownloader from '@/pages/base/Downloader.vue';
import BaseNotification from '@/pages/base/Notification.vue';
import MetricDownloader from '@/pages/metric/Downloader.vue';
import MetricAnalytics from '@/pages/metric/Analytics.vue'; // 新增导入
import RuleDelete from '@/pages/rule/Delete.vue';
import RuleRss from '@/pages/rule/Rss.vue';
import TaskRss from '@/pages/task/Rss.vue';
import TaskScript from '@/pages/task/Script.vue';
import ToolNetworkTest from '@/pages/tool/NetworkTest.vue';
import ToolHosts from '@/pages/tool/Hosts.vue';
import ToolProxy from '@/pages/tool/Proxy.vue';
import ToolClientLog from '@/pages/tool/ClientLog.vue';
import InfoInfo from '@/pages/info/Info.vue';
import InfoLog from '@/pages/info/Log.vue';
import SettingBase from '@/pages/setting/Base.vue';
import SettingStyle from '@/pages/setting/Style.vue';
import SettingSecurity from '@/pages/setting/Security.vue';
import SettingBackup from '@/pages/setting/Backup.vue';
import HistoryRss from '@/pages/history/Rss.vue';
import Login from '@/pages/user/Login.vue';

const createLayoutRoute = (path, component, title) => ({
  path,
  component: Layout,
  redirect: path,
  children: [
    {
      path: '',
      component,
      meta: { title }
    }
  ]
});

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

// 使用工厂函数创建路由
const metricDownloaderRoute = createLayoutRoute('metric/downloader', MetricDownloader, '下载器 - 数据监控');
const metricAnalyticsRoute = createLayoutRoute('metric/analytics', MetricAnalytics, '数据分析'); // 新增路由
const ruleDeleteRoute = createLayoutRoute('rule/delete', RuleDelete, '删种规则 - 规则组件');
const ruleRssRoute = createLayoutRoute('rule/rss', RuleRss, 'RSS 规则 - 规则组件');
const baseDownloaderRoute = createLayoutRoute('base/downloader', BaseDownloader, '下载器 - 基础组件');
const baseNotificationRoute = createLayoutRoute('base/notification', BaseNotification, '通知工具 - 基础组件');
const infoInfoRoute = createLayoutRoute('info/info', InfoInfo, '相关信息');
const infoLogRoute = createLayoutRoute('info/log', InfoLog, '系统日志');
const settingBaseRoute = createLayoutRoute('setting/base', SettingBase, '基础设置 - 系统设置');
const settingStyleRoute = createLayoutRoute('setting/style', SettingStyle, '主题设置 - 系统设置');
const settingSecurityRoute = createLayoutRoute('setting/security', SettingSecurity, '安全设置 - 系统设置');
const settingBackupRoute = createLayoutRoute('setting/backup', SettingBackup, '备份还原 - 系统设置');
const taskRssRoute = createLayoutRoute('task/rss', TaskRss, 'Rss 任务 - 任务配置');
const taskScriptRoute = createLayoutRoute('task/script', TaskScript, '定时脚本 - 任务配置');
const historyRssRoute = createLayoutRoute('history/rss', HistoryRss, 'RSS 历史 - 任务历史');
const toolNetworkTestRoute = createLayoutRoute('tool/networkTest', ToolNetworkTest, '网络测试 - 常用工具');
const toolHostsRoute = createLayoutRoute('tool/hosts', ToolHosts, '修改 HOSTS - 常用工具');
const toolProxyRoute = createLayoutRoute('tool/proxy', ToolProxy, 'HTTP 代理 - 常用工具');
const toolClientLogRoute = createLayoutRoute('tool/clientLog', ToolClientLog, '下载器日志 - 常用工具');

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
      infoInfoRoute,
      metricAnalyticsRoute // 新增路由
    ]
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

router.beforeEach(async (to, from, next) => {
  if (to.path === '/user/login') {
    next();
  } else {
    try {
      await router.app.$api().user.info();
      next();
    } catch (e) {
      if (e.message === '需要登录') {
        next('/user/login');
      } else {
        next();
      }
    }
  }
});

export default router;