const otp = require('../libs/otp');

class UserMod {
  login (options) {
    if (options.username !== global.auth.username) {
      throw new Error('用户名错误');
    }
    if (options.password !== global.auth.password) {
      throw new Error('密码错误');
    }
    if (global.auth.otp && !otp.verify(global.auth.otp, options.otpPw)) {
      throw new Error('两步验证错误');
    }
    return options.username;
  };

  get (options) {
    const menu = [
      {
        title: '首页',
        path: '/index',
        icon: ['fas', 'house-user']
      }, {
        title: 'qbit数据',
        path: '/metric/downloader',
        icon: ['fas', 'chart-line'],
      }, {
        title: 'qbittorrent',
        path: '/base/downloader',
        icon: ['fas', 'download'],
      }, {
        title: '通知工具',
        path: '/base/notification',
        icon: ['fas', 'bell'],
      }, {
        title: 'RSS 规则',
        path: '/rule/rss',
        icon: ['fas', 'square-rss'],
      }, {
        title: 'RSS 任务',
        path: '/task/rss',
        icon: ['fas', 'list-check'],
      }, {
        title: '删种规则',
        path: '/rule/delete',
        icon: ['fas', 'ban'],
      }, {
        title: '定时脚本',
        path: '/task/script',
        icon: ['fas', 'clock'],
      }, {
        title: 'RSS 历史',
        path: '/history/rss',
        icon: ['fas', 'clock-rotate-left'],
      }, {
        title: '网络测试',
        path: '/tool/networkTest',
        icon: ['fas', 'toolbox'],
      }, {
        title: '修改 HOSTS',
        path: '/tool/hosts',
        icon: ['fas', 'route']
      }, {
        title: 'HTTP 代理',
        path: '/tool/proxy',
        icon: ['fas', 'globe']
      }, {
        title: '下载器日志',
        path: '/tool/clientLog',
        icon: ['fas', 'note-sticky']
      }, {
        title: '基础设置',
        path: '/setting/base',
        icon: ['fas', 'gears']
      }, {
        title: '主题设置',
        path: '/setting/style',
        icon: ['fas', 'wand-magic-sparkles']
      }, {
        title: '安全设置',
        path: '/setting/security',
        icon: ['fas', 'fingerprint']
      }, {
        title: '系统日志',
        path: '/info/log',
        icon: ['fas', 'note-sticky']
      }, {
        title: '备份还原',
        path: '/setting/backup',
        icon: ['fas', 'floppy-disk']
      }, {
        title: '相关信息',
        path: '/info/info',
        icon: ['fas', 'circle-info']
      }
    ];

    for (const m of menu) {
      if (global.menu[0] && global.menu.indexOf(m.path) !== -1) {
        m.hidden = true;
      }
      if (m.sub) {
        for (const mm of m.sub) {
          if (global.menu[0] && global.menu.indexOf(mm.path) !== -1) {
            mm.hidden = true;
          }
        }
      }
    }
    return { menu };
  };
}

module.exports = UserMod;
