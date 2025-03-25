const moment = require('moment');
const logger = require('../logger');
const util = require('../util');
const path = require('path');

class Wechat {
  constructor (wechat) {
    this.corpid = wechat.corpid;
    this.corpsecret = wechat.corpsecret;
    this.agentid = wechat.agentid;
    this.alias = wechat.alias;
    this.accessToken = {
      token: '',
      refreshTime: 0
    };
    if (global.wechatProxy) {
      this.WechatUrl = global.wechatProxy;
    } else {
      this.WechatUrl = this.proxyKey ? 'https://dash.vertex-app.top/proxy/' + this.proxyKey + '/' : 'https://qyapi.weixin.qq.com/';
    }
  };

  async _refreshWeChatAccessToken () {
    const option = {
      url: `${this.WechatUrl}cgi-bin/gettoken?corpid=${this.corpid}&corpsecret=${this.corpsecret}`
    };
    const res = await util.requestPromise(option);
    const json = JSON.parse(res.body);
    if (json.errmsg !== 'ok') {
      logger.error(json);
      throw new Error('获取 WeChat Access Token 报错');
    }
    this.accessToken.refreshTime = moment().unix();
    this.accessToken.token = json.access_token;
  }

  async pushWeChat (text, desp, poster) {
    if (moment().unix() - this.accessToken.refreshTime > 3600) {
      await this._refreshWeChatAccessToken();
    }
    let _poster;
    _poster = _poster || poster || global.wechatCover || 'https://pic.lswl.in/images/2022/07/11/bf4eabf1afa841f4527db4d207d265c3.png';
    const body = {
      touser: '@all',
      msgtype: 'news',
      agentid: this.agentid,
      enable_id_trans: 0,
      enable_duplicate_check: 0,
      duplicate_check_interval: 1800
    };
    if (desp.indexOf('```') === -1) {
      body.news = {
        articles: [
          {
            title: text,
            description: desp,
            url: 'https://wiki.vertex-app.top',
            picurl: `https://image.vertex-app.top/api/image/cut/0.425/${path.basename(_poster)}/${encodeURIComponent(_poster)}`
          }
        ]
      };
    } else {
      body.msgtype = 'text';
      body.text = {
        content: text + '\n' + desp.replace(/\n?```\n?/g, '')
      };
    }
    const option = {
      url: `${this.WechatUrl}cgi-bin/message/send?access_token=${this.accessToken.token}`,
      method: 'POST',
      json: body
    };
    const res = await util.requestPromise(option);
    if (res.body.errcode !== 0) {
      logger.error('推送失败', this.alias, text, res.body);
    }
  };

  async pushWeChatSelector (title, desc, selectors, key) {
    if (moment().unix() - this.accessToken.refreshTime > 3600) {
      await this._refreshWeChatAccessToken();
    }
    const body = {
      touser: '@all',
      msgtype: 'template_card',
      agentid: this.agentid,
      enable_id_trans: 0,
      enable_duplicate_check: 0,
      duplicate_check_interval: 1800
    };
    body.template_card = {
      card_type: 'multiple_interaction',
      source: {
        icon_url: 'https://pic.lswl.in/images/2022/07/10/5ae104f82f39eb4059861393ef24d440.th.png',
        desc: 'qbitrace'
      },
      main_title: {
        title,
        desc
      },
      task_id: util.uuid.v4(),
      select_list: selectors,
      submit_button: {
        text: '提交',
        key: key
      }
    };
    const option = {
      url: `${this.WechatUrl}cgi-bin/message/send?access_token=${this.accessToken.token}`,
      method: 'POST',
      json: body
    };
    const res = await util.requestPromise(option);
    logger.debug(res.body);
    if (res.body.errcode !== 0) {
      logger.error('推送失败', this.alias, title, desc, selectors, key, res.body);
    }
  };

  async modifyWechatMenu () {
    if (moment().unix() - this.accessToken.refreshTime > 3600) {
      await this._refreshWeChatAccessToken();
    }
    const body = {
      button: [
        {
          type: 'click',
          name: '添加想看',
          key: 'select'
        },
        {
          type: 'click',
          name: '刷新剧集',
          key: 'selectRefreshMedia'
        }
      ]
    };
    const option = {
      url: `${this.WechatUrl}cgi-bin/menu/create?access_token=${this.accessToken.token}&agentid=${this.agentid}`,
      method: 'POST',
      json: body
    };
    const res = await util.requestPromise(option);
    if (res.body.errcode !== 0) {
      return logger.error('设定菜单失败\n', res.body);
    }
    logger.info('设定菜单成功');
  };

  async rssError (rss) {
    const text = 'Rss 失败 ' + moment().format('YYYY-MM-DD HH:mm:ss');
    const desp = `Rss 任务: ${rss.alias}` +
      '详细原因请前往 qbitrace 日志页面查看';
    await this.pushWeChat(text, desp);
  }

  async scrapeError (rss, torrent) {
    this.errorCount += 1;
    const text = '抓取失败 ' + moment().format('YYYY-MM-DD HH:mm:ss');
    const desp = `Rss 任务: ${rss.alias}\n` +
      `种子名称: ${torrent.name}\n` +
      `种子 hash: ${torrent.hash}\n` +
      '请确认 Rss 站点是否支持抓取免费或抓取 HR, 若确认无问题, 请前往 qbitrace 日志页面查看详细原因';
    await this.pushWeChat(text, desp);
  }

  async addTorrent (rss, client, torrent) {
    const text = '添加种子 ' + moment().format('YYYY-MM-DD HH:mm:ss');
    const desp = `Rss 任务: ${rss.alias}\n` +
      `下载器名: ${client.alias}\n` +
      `种子名称: ${torrent.name}\n` +
      `种子大小: ${util.formatSize(torrent.size)}\n` +
      `种子 hash: ${torrent.hash}`;
    await this.pushWeChat(text, desp);
  };

  async addTorrentError (rss, client, torrent) {
    const text = '添加种子失败 ' + moment().format('YYYY-MM-DD HH:mm:ss');
    const desp = `Rss 任务: ${rss.alias}\n` +
      `下载器名: ${client.alias}\n` +
      `种子名称: ${torrent.name}\n` +
      `种子大小: ${util.formatSize(torrent.size)}\n` +
      `种子 hash: ${torrent.hash}\n` +
      '详细原因请前往 qbitrace 日志页面查看';
    await this.pushWeChat(text, desp);
  };

  async rejectTorrent (rss, client = {}, torrent, note) {
    const text = '拒绝种子 ' + moment().format('YYYY-MM-DD HH:mm:ss');
    const desp = `Rss 任务: ${rss.alias}\n` +
      `下载器名: ${client.alias || '未定义'}\n` +
      `种子名称: ${torrent.name}\n` +
      `种子大小: ${util.formatSize(torrent.size)}\n` +
      `种子 hash: ${torrent.hash}\n` +
      note;
    await this.pushWeChat(text, desp);
  };

  async deleteTorrent (client, torrent, rule, deleteFile) {
    const text = '删除种子 ' + moment().format('YYYY-MM-DD HH:mm:ss');
    const desp = `下载器名: ${client.alias}\n` +
      `种子名称: ${torrent.name}\n` +
      `种子大小: ${util.formatSize(torrent.size)}\n` +
      `种子 hash: ${torrent.hash}\n` +
      `已完成量: ${util.formatSize(torrent.completed)}\n` +
      `种子状态: ${torrent.state}\n` +
      `添加时间: ${moment(torrent.addedTime * 1000).format('YYYY-MM-DD HH:mm:ss')}\n` +
      `删除时间: ${moment().format('YYYY-MM-DD HH:mm:ss')}\n` +
      `所属分类: ${torrent.category}\n` +
      `流量统计: ${util.formatSize(torrent.uploaded)} ↑ / ${util.formatSize(torrent.downloaded)} ↓\n` +
      `即时速度: ${util.formatSize(torrent.uploadSpeed)}/s ↑ / ${util.formatSize(torrent.downloadSpeed)}/s ↓\n` +
      `分享比率: ${(+torrent.ratio).toFixed(2)}\n` +
      `站点域名: ${torrent.tracker}\n` +
      `删除文件: ${deleteFile}\n` +
      `符合规则: ${rule.alias}\n`;
    await this.pushWeChat(text, desp);
  };

  async deleteTorrentError (client, torrent, rule) {
    this.errorCount += 1;
    const text = '删除种子失败 ' + moment().format('YYYY-MM-DD HH:mm:ss');
    const desp = `下载器名: ${client.alias}\n` +
      `种子名称: ${torrent.name}\n` +
      `种子大小: ${util.formatSize(torrent.size)}\n` +
      `种子 hash: ${torrent.hash}\n` +
      `已完成量: ${util.formatSize(torrent.completed)}\n` +
      `种子状态: ${torrent.completed.state}\n` +
      `所属分类: ${torrent.category}\n` +
      `流量统计: ${util.formatSize(torrent.uploaded)} ↑ / ${util.formatSize(torrent.downloaded)}\n` +
      `即时速度: ${util.formatSize(torrent.uploadSpeed)}/s ↑ / ${util.formatSize(torrent.downloadSpeed)}/s\n` +
      `分享比率: ${(+torrent.ratio).toFixed(2)}\n` +
      `站点域名: ${torrent.tracker}\n` +
      `符合规则: ${rule.alias}\n`;
    await this.pushWeChat(text, desp);
  };

  async reannounceTorrent (client, torrent) {
    const text = '重新汇报种子 ' + moment().format('YYYY-MM-DD HH:mm:ss');
    const desp = `下载器名: ${client.alias}\n` +
      `种子名称: ${torrent.name}\n` +
      `种子 hash: ${torrent.hash}`;
    await this.pushWeChat(text, desp);
  };

  async reannounceTorrentError (client, torrent) {
    const text = '重新汇报种子失败 ' + moment().format('YYYY-MM-DD HH:mm:ss');
    const desp = `下载器名: ${client.alias}\n` +
      `种子名称: ${torrent.name}\n` +
      `种子 hash: ${torrent.hash}`;
    await this.pushWeChat(text, desp);
  };

  async connectClient (client) {
    const text = '下载器已连接 ' + moment().format('YYYY-MM-DD HH:mm:ss');
    const desp = `下载器: ${client.alias}`;
    await this.pushWeChat(text, desp);
  }

  async clientLoginError (client, message) {
    this.errorCount += 1;
    const text = '下载器登录失败 ' + moment().format('YYYY-MM-DD HH:mm:ss');
    const desp = `下载器名: ${client.alias}\n` +
      `附加信息: ${message}`;
    await this.pushWeChat(text, desp);
  }

  async getMaindataError (client) {
    const text = '获取下载器信息失败 ' + moment().format('YYYY-MM-DD HH:mm:ss');
    const desp = `下载器名: ${client.alias}\n` +
      '详细原因请前往 qbitrace 日志页面查看';
    await this.pushWeChat(text, desp);
  }

  async spaceAlarm (client) {
    const text = '剩余空间警告 ' + moment().format('YYYY-MM-DD HH:mm:ss');
    const desp = `下载器名: ${client.alias}\n` +
      `剩余空间已不足${util.formatSize(client.maindata.freeSpaceOnDisk)}`;
    await this.pushWeChat(text, desp);
  }
};

module.exports = Wechat;