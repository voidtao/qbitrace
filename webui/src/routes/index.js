import { createRouter, createWebHistory } from 'vue-router';

import Index from '@/pages/Index';

import Layout from '@/pages/Layout';

import DashboardIndex from '@/pages/dashboard/Index';

import BaseServer from '@/pages/base/Server';
import BaseDownloader from '@/pages/base/Downloader';
import BaseSite from '@/pages/base/Site';
import BaseNotification from '@/pages/base/Notification';

import MetricServer from '@/pages/metric/Server';
import MetricDownloader from '@/pages/metric/Downloader';
import MetricSite from '@/pages/metric/Site';

import RuleDelete from '@/pages/rule/Delete';
import RuleLink from '@/pages/rule/Link';
import RuleRss from '@/pages/rule/Rss';
import RuleSelect from '@/pages/rule/Select';

import TaskRss from '@/pages/task/Rss';
import TaskSubscribe from '@/pages/task/Subscribe';
import TaskLink from '@/pages/task/Link';
import TaskBulkLink from '@/pages/task/BulkLink';
import TaskWatchCategory from '@/pages/task/WatchCategory';
import TaskScript from '@/pages/task/Script';


import ToolMikanHistory from '@/pages/tool/MikanHistory';
import ToolNetworkTest from '@/pages/tool/NetworkTest';
import ToolMTeamLogin from '@/pages/tool/MTeamLogin';
import ToolHosts from '@/pages/tool/Hosts';
import ToolProxy from '@/pages/tool/Proxy';
import ToolShell from '@/pages/tool/Shell';
import ToolPathGenerator from '@/pages/tool/PathGenerator';
import ToolClientLog from '@/pages/tool/ClientLog';

import InfoInfo from '@/pages/info/Info';
import InfoLog from '@/pages/info/Log';

import SettingBase from '@/pages/setting/Base';
import SettingStyle from '@/pages/setting/Style';
import SettingSecurity from '@/pages/setting/Security';
import SettingInteraction from '@/pages/setting/Interaction';
import SettingMenu from '@/pages/setting/Menu';
import SettingBackup from '@/pages/setting/Backup';
import SettingCookieCloud from '@/pages/setting/CookieCloud';


import HistoryRss from '@/pages/history/Rss';
import HistorySubsribe from '@/pages/history/Subscribe';
import HistoryWatchCategory from '@/pages/history/WatchCategory';


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

const metric = {
  path: 'metric',
  component: Layout,
  redirect: '/metric/server',
  children: [
    {
      path: 'server',
      component: MetricServer,
      meta: {
        title: '服务器 - 数据监控'
      }
    }, {
      path: 'downloader',
      component: MetricDownloader,
      meta: {
        title: '下载器 - 数据监控'
      }
    }, {
      path: 'site',
      component: MetricSite,
      meta: {
        title: '站点 - 数据监控'
      }
    }
  ]
};

const rule = {
  path: 'rule',
  component: Layout,
  redirect: '/rule/delete',
  children: [
    {
      path: 'delete',
      component: RuleDelete,
      meta: {
        title: '删种规则 - 规则组件'
      }
    }, {
      path: 'rss',
      component: RuleRss,
      meta: {
        title: 'RSS 规则 - 规则组件'
      }
    }, {
      path: 'select',
      component: RuleSelect,
      meta: {
        title: '选种规则 - 规则组件'
      }
    }, {
      path: 'link',
      component: RuleLink,
      meta: {
        title: '链接规则 - 规则组件'
      }
    }
  ]
};

const base = {
  path: 'base',
  component: Layout,
  redirect: '/base/server',
  children: [
    {
      path: 'server',
      component: BaseServer,
      meta: {
        title: '服务器 - 基础组件'
      }
    }, {
      path: 'downloader',
      component: BaseDownloader,
      meta: {
        title: '下载器 - 基础组件'
      }
    }, {
      path: 'site',
      component: BaseSite,
      meta: {
        title: '站点 - 基础组件'
      }
    }, {
      path: 'notification',
      component: BaseNotification,
      meta: {
        title: '通知工具 - 基础组件'
      }
    }
  ]
};

const info = {
  path: 'info',
  component: Layout,
  redirect: '/info/log',
  children: [
    {
      path: 'info',
      component: InfoInfo,
      meta: {
        title: '相关信息'
      }
    }, {
      path: 'log',
      component: InfoLog,
      meta: {
        title: '系统日志'
      }
    }
  ]
};

const setting = {
  path: 'setting',
  component: Layout,
  redirect: '/setting/base',
  children: [
    {
      path: 'base',
      component: SettingBase,
      meta: {
        title: '基础设置 - 系统设置'
      }
    }, {
      path: 'style',
      component: SettingStyle,
      meta: {
        title: '主题设置 - 系统设置'
      }
    }, {
      path: 'security',
      component: SettingSecurity,
      meta: {
        title: '安全设置 - 系统设置'
      }
    }, {
      path: 'interaction',
      component: SettingInteraction,
      meta: {
        title: '交互设置 - 系统设置'
      }
    }, {
      path: 'menu',
      component: SettingMenu,
      meta: {
        title: '菜单设置 - 系统设置'
      }
    }, {
      path: 'cc',
      component: SettingCookieCloud,
      meta: {
        title: 'CookieCloud - 系统设置'
      }
    }, {
      path: 'backup',
      component: SettingBackup,
      meta: {
        title: '备份还原 - 系统设置'
      }
    }
  ]
};

const task = {
  path: 'task',
  component: Layout,
  redirect: '/task/rss',
  children: [
    {
      path: 'rss',
      component: TaskRss,
      meta: {
        title: 'Rss 任务 - 任务配置'
      }
    }, {
      path: 'script',
      component: TaskScript,
      meta: {
        title: '定时脚本 - 任务配置'
      }
    }
  ]
};

const history = {
  path: 'history',
  component: Layout,
  redirect: '/history/rss',
  children: [
    {
      path: 'rss',
      component: HistoryRss,
      meta: {
        title: 'RSS 历史 - 任务历史'
      }
    }, {
      path: 'subscribe',
      component: HistorySubsribe,
      meta: {
        title: '订阅历史 - 任务历史'
      }
    }, {
      path: 'watchCategory',
      component: HistoryWatchCategory,
      meta: {
        title: '监控分类历史 - 任务历史'
      }
    }
  ]
};

const tool = {
  path: 'tool',
  component: Layout,
  redirect: '/tool/networkTest',
  children: [
    {
      path: 'mikanHistory',
      component: ToolMikanHistory,
      meta: {
        title: '蜜柑番剧历史 - 常用工具'
      }
    }, {
      path: 'networkTest',
      component: ToolNetworkTest,
      meta: {
        title: '网络测试 - 常用工具'
      }
    }, {
      path: 'mteamLogin',
      component: ToolMTeamLogin,
      meta: {
        title: 'MTEAM 登录 - 常用工具'
      }
    }, {
      path: 'hosts',
      component: ToolHosts,
      meta: {
        title: '修改 HOSTS - 常用工具'
      }
    }, {
      path: 'proxy',
      component: ToolProxy,
      meta: {
        title: 'HTTP 代理 - 常用工具'
      }
    }, {
      path: 'pathGenerator',
      component: ToolPathGenerator,
      meta: {
        title: '路径生成器 - 常用工具'
      }
    }, {
      path: 'shell/:id',
      component: ToolShell,
      meta: {
        title: 'Shell - 常用工具'
      }
    }, {
      path: 'clientLog',
      component: ToolClientLog,
      meta: {
        title: '下载器日志 - 常用工具'
      }
    }
  ]
};


const routes = [{
  path: '/',
  component: Index,
  redirect: '/index',
  children: [
    user,
    index,
    metric,
    rule,
    base,
    task,
    tool,
    info,
    setting,
    history
  ]
}];

export default createRouter({
  history: createWebHistory(),
  routes
});
